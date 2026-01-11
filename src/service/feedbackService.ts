import { sendFeedbackEmail, type FeedbackAttachmentInput } from '../utils/email/feedbackEmail';
import { Resource } from '../utils/resources/resource';
import type { LanguageCode } from '../utils/resources/resourceTypes';

type FeedbackInput = {
    userId: number;
    userEmail: string;
    title: string;
    message: string;
    language?: LanguageCode;
    attachments?: FeedbackAttachmentInput[];
};

export class FeedbackService {
    async sendFeedback(
        payload: FeedbackInput
    ): Promise<{ success: true; data: { sent: true } } | { success: false; error: Resource }> {
        const result = await sendFeedbackEmail(payload);
        if (!result.success) {
            return { success: false, error: Resource.FEEDBACK_SEND_FAILED };
        }

        return { success: true, data: { sent: true } };
    }
}
