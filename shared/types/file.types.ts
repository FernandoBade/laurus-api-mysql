/** @summary Binary payload content for uploads. */
export type BinaryContent = Uint8Array;

/** @summary File upload payload in memory. */
export interface FileUpload {
    name: string;
    contentType: string;
    content: BinaryContent;
    size?: number;
}
