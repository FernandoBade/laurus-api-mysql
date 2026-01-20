export type BinaryContent = Uint8Array;

export interface FileUpload {
    name: string;
    contentType: string;
    content: BinaryContent;
    size?: number;
}
