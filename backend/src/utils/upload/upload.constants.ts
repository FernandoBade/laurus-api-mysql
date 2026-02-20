/**
 * @summary Upload validation constants used by backend routes and controllers.
 */
export const UploadValidation = {
    MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024,
    FILE_SIZE_EXPECTED: 'file size <= 2MB',
    FILE_SIZE_EXCEEDED: 'exceeds limit',
    AVATAR_FILE_EXPECTED: 'avatar file',
    FEEDBACK_ATTACHMENT_EXPECTED: 'feedback attachment',
    AVATAR_IMAGE_MIME_EXPECTED: 'image/jpeg, image/png',
    FEEDBACK_IMAGE_MIME_EXPECTED: 'image/png or image/jpeg',
    FEEDBACK_AUDIO_MIME_EXPECTED: 'audio/webm, audio/ogg, audio/mpeg, audio/mp4',
} as const;
