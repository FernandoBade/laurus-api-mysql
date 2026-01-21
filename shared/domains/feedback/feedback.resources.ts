import type { SendFeedbackInput, SendFeedbackOutput } from './feedback.types';
import { FeedbackErrorCode } from './feedback.enums';

/** @summary Resource definition for sending feedback. */
export const sendFeedbackResource = {
    input: {} as SendFeedbackInput,
    output: {} as SendFeedbackOutput,
    errors: {} as FeedbackErrorCode,
};