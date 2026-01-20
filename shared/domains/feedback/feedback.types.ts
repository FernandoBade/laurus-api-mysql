import type { FileUpload } from '../../types/file.types';

export type FeedbackTitle = string;
export type FeedbackMessage = string;

export interface SendFeedbackInput {
    title: FeedbackTitle;
    message: FeedbackMessage;
    attachments?: FileUpload[];
}

export interface SendFeedbackOutput {
    sent: true;
}
