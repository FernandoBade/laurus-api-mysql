import type { ApiResponse } from "@/shared/types/api";
import { apiPost } from "@/shared/lib/api/client";
import type { BetaFeedbackPayload, BetaFeedbackResponse } from "./types";

const buildFeedbackFormData = (payload: BetaFeedbackPayload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("message", payload.message);
  formData.append("subject", payload.subject);
  formData.append("userId", String(payload.userId));
  formData.append("userEmail", payload.userEmail);
  if (payload.image) {
    formData.append("image", payload.image);
  }
  if (payload.audio) {
    formData.append("audio", payload.audio);
  }
  return formData;
};

export const sendBetaFeedback = (
  payload: BetaFeedbackPayload
): Promise<ApiResponse<BetaFeedbackResponse>> =>
  apiPost<BetaFeedbackResponse>("/feedback", buildFeedbackFormData(payload));
