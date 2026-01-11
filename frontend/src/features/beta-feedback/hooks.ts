import { useMutation } from "@tanstack/react-query";
import { sendBetaFeedback } from "./api";
import type { BetaFeedbackPayload } from "./types";

export const useSendBetaFeedback = () =>
  useMutation({
    mutationFn: (payload: BetaFeedbackPayload) => sendBetaFeedback(payload),
  });
