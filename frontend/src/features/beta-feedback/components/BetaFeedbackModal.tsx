/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/modal";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import FileInput from "@/components/form/input/FileInput";
import Label from "@/components/form/Label";
import { useAuthSession } from "@/features/auth/context";
import { useUser } from "@/features/users/hooks";
import { useSendBetaFeedback } from "../hooks";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/pjpeg",
  "image/x-png",
]);
const AUDIO_METER_FACTORS = [0.2, 0.35, 0.5, 0.7, 1, 0.7, 0.5, 0.35];

const getAudioExtension = (mimeType: string) => {
  const normalized = mimeType.toLowerCase();
  if (normalized.includes("webm")) {
    return "webm";
  }
  if (normalized.includes("ogg")) {
    return "ogg";
  }
  if (normalized.includes("mp4")) {
    return "mp4";
  }
  if (normalized.includes("mpeg")) {
    return "mpeg";
  }
  return "webm";
};

type BetaFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function BetaFeedbackModal({
  isOpen,
  onClose,
}: BetaFeedbackModalProps) {
  const { t } = useTranslation(["resource-layout", "resource-common"]);
  const { userId } = useAuthSession();
  const { data: userResponse } = useUser(userId);
  const user = userResponse?.data;
  const sendFeedbackMutation = useSendBetaFeedback();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);
  const audioMeterRafRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const mountedRef = useRef(true);

  const supportsAudioRecording = useMemo(
    () =>
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      typeof MediaRecorder !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia),
    []
  );

  const stopAudioMeter = useCallback(() => {
    if (audioMeterRafRef.current !== null) {
      cancelAnimationFrame(audioMeterRafRef.current);
      audioMeterRafRef.current = null;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (audioGainRef.current) {
      audioGainRef.current.disconnect();
      audioGainRef.current = null;
    }

    analyserRef.current = null;

    if (audioContextRef.current) {
      const context = audioContextRef.current;
      audioContextRef.current = null;
      void context.close().catch(() => undefined);
    }

    if (mountedRef.current) {
      setAudioLevel(0);
    }
  }, []);

  const startAudioMeter = useCallback(
    (stream: MediaStream) => {
      if (typeof window === "undefined") {
        return;
      }

      const AudioContextCtor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextCtor) {
        return;
      }

      stopAudioMeter();

      const context = new AudioContextCtor();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      const gain = context.createGain();
      gain.gain.value = 0;
      analyser.connect(gain);
      gain.connect(context.destination);

      audioContextRef.current = context;
      analyserRef.current = analyser;
      audioSourceRef.current = source;
      audioGainRef.current = gain;

      const buffer = new Uint8Array(analyser.fftSize);

      const updateLevel = () => {
        if (!analyserRef.current) {
          return;
        }

        analyserRef.current.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let index = 0; index < buffer.length; index += 1) {
          const normalized = (buffer[index] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / buffer.length);
        const normalizedLevel = Math.min(1, rms * 2.5);

        if (mountedRef.current) {
          setAudioLevel(normalizedLevel);
        }

        audioMeterRafRef.current = requestAnimationFrame(updateLevel);
      };

      void context.resume();
      audioMeterRafRef.current = requestAnimationFrame(updateLevel);
    },
    [stopAudioMeter]
  );

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    stopAudioMeter();
  }, [stopAudioMeter]);

  const clearAudio = useCallback(() => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioPreviewUrl(null);
    setAudioFile(null);
    setAudioError(null);
  }, [audioPreviewUrl]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImageError(null);
    setImageInputKey((prev) => prev + 1);
  }, []);

  const resetForm = useCallback(
    (keepSuccess = false) => {
      setTitle("");
      setMessage("");
      setFormError(null);
      setImageError(null);
      setAudioError(null);
      if (!keepSuccess) {
        setSuccess(false);
      }
      clearImage();
      clearAudio();
    },
    [clearImage, clearAudio]
  );

  useEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
      if (stopTimeoutRef.current !== null) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  const stopRecording = useCallback(
    (discard = false) => {
      const recorder = recorderRef.current;
      if (stopTimeoutRef.current !== null) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      discardRecordingRef.current = discard;

      if (!recorder || recorder.state === "inactive") {
        setIsRecording(false);
        stopStream();
        return;
      }

      recorder.stop();

      stopTimeoutRef.current = setTimeout(() => {
        stopTimeoutRef.current = null;
        if (!mountedRef.current) {
          return;
        }
        setIsRecording(false);
        stopStream();
      }, 1000);
    },
    [stopStream]
  );

  const handleStartRecording = async () => {
    if (!supportsAudioRecording || isRecording) {
      if (!supportsAudioRecording) {
        setAudioError(t("resource.layout.betaFeedback.hints.audioUnsupported"));
      }
      return;
    }
    if (stopTimeoutRef.current !== null) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setAudioError(null);
    setSuccess(false);
    clearAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      audioChunksRef.current = [];
      discardRecordingRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstart = () => {
        if (stopTimeoutRef.current !== null) {
          clearTimeout(stopTimeoutRef.current);
          stopTimeoutRef.current = null;
        }
        if (!mountedRef.current) {
          return;
        }
        setIsRecording(true);
      };

      recorder.onerror = () => {
        if (!mountedRef.current) {
          return;
        }
        if (stopTimeoutRef.current !== null) {
          clearTimeout(stopTimeoutRef.current);
          stopTimeoutRef.current = null;
        }
        setAudioError(t("resource.layout.betaFeedback.errors.audioFailed"));
        setIsRecording(false);
        stopStream();
      };

      recorder.onstop = () => {
        if (stopTimeoutRef.current !== null) {
          clearTimeout(stopTimeoutRef.current);
          stopTimeoutRef.current = null;
        }
        const shouldDiscard = discardRecordingRef.current;
        discardRecordingRef.current = false;
        stopStream();

        if (!mountedRef.current) {
          return;
        }

        setIsRecording(false);
        if (shouldDiscard) {
          audioChunksRef.current = [];
          return;
        }

        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        if (!chunks.length) {
          return;
        }

        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size > MAX_AUDIO_BYTES) {
          setAudioError(t("resource.layout.betaFeedback.errors.audioTooLarge"));
          return;
        }

        const extension = getAudioExtension(mimeType);
        const file = new File([blob], `beta-feedback.${extension}`, {
          type: mimeType,
        });
        const previewUrl = URL.createObjectURL(blob);
        setAudioFile(file);
        setAudioPreviewUrl(previewUrl);
      };

      startAudioMeter(stream);
      recorder.start();
    } catch {
      setAudioError(t("resource.layout.betaFeedback.errors.audioPermission"));
    }
  };

  const handleStopRecording = () => {
    stopRecording(false);
  };

  const handleRemoveRecording = () => {
    if (isRecording) {
      stopRecording(true);
    }
    clearAudio();
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording(true);
    }
    resetForm();
    onClose();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageError(t("resource.layout.betaFeedback.errors.imageInvalid"));
      setImageFile(null);
      setImageInputKey((prev) => prev + 1);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(t("resource.layout.betaFeedback.errors.imageTooLarge"));
      setImageFile(null);
      setImageInputKey((prev) => prev + 1);
      return;
    }

    setImageError(null);
    setImageFile(file);
    setSuccess(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(false);

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!userId || !user?.email) {
      setFormError(t("resource.layout.betaFeedback.errors.missingUser"));
      return;
    }

    if (!trimmedTitle) {
      setFormError(t("resource.layout.betaFeedback.errors.titleRequired"));
      return;
    }

    if (!trimmedMessage) {
      setFormError(t("resource.layout.betaFeedback.errors.messageRequired"));
      return;
    }

    try {
      await sendFeedbackMutation.mutateAsync({
        title: trimmedTitle,
        message: trimmedMessage,
        subject: t("resource.layout.betaFeedback.email.subject"),
        userId,
        userEmail: user.email,
        image: imageFile ?? undefined,
        audio: audioFile ?? undefined,
      });
      resetForm(true);
      setSuccess(true);
    } catch {
      setFormError(t("resource.layout.betaFeedback.errors.sendFailed"));
    }
  };

  const submitDisabled = sendFeedbackMutation.isPending || isRecording;

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[720px] m-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("resource.layout.betaFeedback.modal.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("resource.layout.betaFeedback.modal.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {formError && (
            <Alert
              variant="error"
              title={t("resource.layout.betaFeedback.errors.title")}
              message={formError}
            />
          )}
          {success && (
            <Alert
              variant="success"
              title={t("resource.layout.betaFeedback.success.title")}
              message={t("resource.layout.betaFeedback.success.message")}
            />
          )}

          <div>
            <Label>
              {t("resource.layout.betaFeedback.fields.title")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <Input
              value={title}
              placeholder={t("resource.layout.betaFeedback.placeholders.title")}
              onChange={(event) => {
                setTitle(event.target.value);
                setFormError(null);
                setSuccess(false);
              }}
            />
          </div>

          <div>
            <Label>
              {t("resource.layout.betaFeedback.fields.message")}{" "}
              <span className="text-error-500">*</span>
            </Label>
            <TextArea
              rows={5}
              value={message}
              placeholder={t("resource.layout.betaFeedback.placeholders.message")}
              onChange={(value) => {
                setMessage(value);
                setFormError(null);
                setSuccess(false);
              }}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>{t("resource.layout.betaFeedback.fields.image")}</Label>
              <FileInput
                key={`image-${imageInputKey}`}
                accept="image/png,image/jpeg"
                onChange={handleImageChange}
                disabled={sendFeedbackMutation.isPending}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("resource.layout.betaFeedback.hints.image")}
              </p>
              {imageError && (
                <p className="mt-1 text-xs text-error-500">{imageError}</p>
              )}
              {imageFile && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{imageFile.name}</span>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={clearImage}
                    disabled={sendFeedbackMutation.isPending}
                  >
                    {t("resource.layout.betaFeedback.actions.imageRemove")}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label>{t("resource.layout.betaFeedback.fields.audio")}</Label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {supportsAudioRecording
                  ? t("resource.layout.betaFeedback.hints.audio")
                  : t("resource.layout.betaFeedback.hints.audioUnsupported")}
              </p>
              {supportsAudioRecording && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    disabled={sendFeedbackMutation.isPending}
                  >
                    {isRecording
                      ? t("resource.layout.betaFeedback.actions.recordStop")
                      : t("resource.layout.betaFeedback.actions.recordStart")}
                  </Button>
                  {audioFile && !isRecording && (
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={handleRemoveRecording}
                      disabled={sendFeedbackMutation.isPending}
                    >
                      {t("resource.layout.betaFeedback.actions.recordRemove")}
                    </Button>
                  )}
                  {isRecording && (
                    <div className="flex items-center gap-2 text-xs font-medium text-error-500">
                      <span>
                        {t("resource.layout.betaFeedback.status.recording")}
                      </span>
                      <div className="flex items-end gap-1" aria-hidden="true">
                        {AUDIO_METER_FACTORS.map((factor, index) => {
                          const height = Math.max(
                            6,
                            Math.round(6 + audioLevel * factor * 22)
                          );
                          return (
                            <span
                              key={`audio-meter-${index}`}
                              className="w-1 rounded-full bg-error-500 transition-[height] duration-150 ease-out"
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {audioPreviewUrl && !isRecording && (
                <audio
                  controls
                  className="mt-3 w-full"
                  src={audioPreviewUrl}
                />
              )}
              {audioError && (
                <p className="mt-1 text-xs text-error-500">{audioError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              {t("resource.common.actions.cancel")}
            </Button>
            <Button size="sm" type="submit" disabled={submitDisabled}>
              {sendFeedbackMutation.isPending
                ? t("resource.layout.betaFeedback.actions.sending")
                : t("resource.layout.betaFeedback.actions.submit")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>,
    document.body
  );
}
