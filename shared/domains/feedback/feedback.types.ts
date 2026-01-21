import type { FileUpload } from '../../types/file.types';

/** @summary Feedback title string. */
export type FeedbackTitle = string;

/** @summary Feedback message string. */
export type FeedbackMessage = string;

/** @summary Input payload for sending feedback. */
export interface SendFeedbackInput {
    title: FeedbackTitle;
    message: FeedbackMessage;
    attachments?: FileUpload[];
}

/** @summary Output payload for sending feedback. */
export interface SendFeedbackOutput {
    sent: true;
}