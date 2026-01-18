import { useMutation } from "@tanstack/react-query";
import { sendFeedback } from "./api";
import type { FeedbackPayload } from "./types";

export const useSendFeedback = () =>
  useMutation({
    mutationFn: (payload: FeedbackPayload) => sendFeedback(payload),
  });
