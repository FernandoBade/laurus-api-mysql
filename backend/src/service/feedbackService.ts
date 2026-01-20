import { sendFeedbackEmail, type FeedbackAttachmentInput } from '../utils/email/feedbackEmail';
import { ResourceKey as Resource } from '../../../shared/i18n/resource.keys';
import type { LanguageCode } from '../../../shared/i18n/resourceTypes';
import type { SendFeedbackOutput } from '../../../shared/domains/feedback/feedback.types';

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
    ): Promise<{ success: true; data: SendFeedbackOutput } | { success: false; error: Resource }> {
        const result = await sendFeedbackEmail(payload);
        if (!result.success) {
            return { success: false, error: Resource.FEEDBACK_SEND_FAILED };
        }

        return { success: true, data: { sent: true } };
    }
}
