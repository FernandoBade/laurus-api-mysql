import type { ApiResponse } from "@/shared/types/api";
import { apiPost } from "@/shared/lib/api/client";
import type { FeedbackPayload, FeedbackResponse } from "./types";

const buildFeedbackFormData = (payload: FeedbackPayload) => {
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

export const sendFeedback = (
  payload: FeedbackPayload
): Promise<ApiResponse<FeedbackResponse>> =>
  apiPost<FeedbackResponse>("/feedback", buildFeedbackFormData(payload));
