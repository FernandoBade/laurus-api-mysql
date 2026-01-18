export type FeedbackPayload = {
  title: string;
  message: string;
  subject: string;
  userId: number;
  userEmail: string;
  image?: File | null;
  audio?: File | null;
};

export type FeedbackResponse = {
  sent: boolean;
};
