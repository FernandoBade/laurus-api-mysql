import type { SendFeedbackInput, SendFeedbackOutput } from './feedback.types';
import { FeedbackErrorCode } from './feedback.enums';

export const sendFeedbackResource = {
    input: {} as SendFeedbackInput,
    output: {} as SendFeedbackOutput,
    errors: {} as FeedbackErrorCode,
};
