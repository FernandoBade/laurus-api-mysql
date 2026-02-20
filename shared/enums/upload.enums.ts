/**
 * @summary MIME types accepted in upload flows shared across frontend and backend.
 */
export enum UploadMimeType {
    IMAGE_JPEG = "image/jpeg",
    IMAGE_PNG = "image/png",
    IMAGE_JPG = "image/jpg",
    IMAGE_PJPEG = "image/pjpeg",
    IMAGE_X_PNG = "image/x-png",
    AUDIO_WEBM = "audio/webm",
    AUDIO_OGG = "audio/ogg",
    AUDIO_MPEG = "audio/mpeg",
    AUDIO_MP4 = "audio/mp4",
}

/**
 * @summary File extensions accepted in upload flows shared across frontend and backend.
 */
export enum UploadFileExtension {
    PNG = "png",
    JPG = "jpg",
}

/**
 * @summary MIME types accepted for image uploads.
 */
export const ALLOWED_IMAGE_MIME_TYPES = new Set<string>([
    UploadMimeType.IMAGE_JPEG,
    UploadMimeType.IMAGE_PNG,
    UploadMimeType.IMAGE_JPG,
    UploadMimeType.IMAGE_PJPEG,
    UploadMimeType.IMAGE_X_PNG,
]);

/**
 * @summary MIME types accepted for audio uploads.
 */
export const ALLOWED_AUDIO_MIME_TYPES = new Set<string>([
    UploadMimeType.AUDIO_WEBM,
    UploadMimeType.AUDIO_OGG,
    UploadMimeType.AUDIO_MPEG,
    UploadMimeType.AUDIO_MP4,
]);

/**
 * @summary MIME types normalized to PNG extension in avatar upload flow.
 */
export const PNG_MIME_TYPES = new Set<string>([
    UploadMimeType.IMAGE_PNG,
    UploadMimeType.IMAGE_X_PNG,
]);

/**
 * @summary Multer error codes handled by upload middleware.
 */
export enum MulterErrorCode {
    LIMIT_FILE_SIZE = "LIMIT_FILE_SIZE",
}
