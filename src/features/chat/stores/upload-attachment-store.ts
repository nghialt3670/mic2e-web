import { create } from "zustand";

type UploadAttachmentType = "fabric-image-group" | "image";

interface UploadInfo {
  path: string;
  url: string;
  error?: string;
}

interface ImageInfo {
  dataUrl: string;
  width: number;
  height: number;
}

interface UploadAttachment {
  type: UploadAttachmentType;
  file: File;
  originalName: string;
  uploadInfo?: UploadInfo;
  imageInfo?: ImageInfo;
}

interface UploadAttachmentStore {
  files: File[];
  filenameToAttachmentMap: Record<string, UploadAttachment>;
  setFiles: (files: File[]) => void;
  removeFile: (filename: string) => void;
  clearFiles: () => void;
  setAttachments: (attachments: UploadAttachment[]) => void;
  getAttachments: () => UploadAttachment[];
  clearAttachments: () => void;
  setAttachment: (attachment: UploadAttachment) => void;
  getAttachment: (filename: string) => UploadAttachment | undefined;
  removeAttachment: (filename: string) => void;
  updateAttachmentUploadInfo: (
    filename: string,
    uploadInfo: UploadInfo,
  ) => void;
  updateAttachmentImageInfo: (filename: string, imageInfo: ImageInfo) => void;
  isAllUploaded: () => boolean;
}

export const useUploadAttachmentStore = create<UploadAttachmentStore>(
  (set, get) => ({
    files: [],
    filenameToAttachmentMap: {},
    setFiles: (files: File[]) => set({ files }),
    removeFile: (filename: string) =>
      set((state) => ({
        files: state.files.filter((file) => file.name !== filename),
      })),
    clearFiles: () => set({ files: [] }),
    setAttachments: (attachments: UploadAttachment[]) =>
      set({
        filenameToAttachmentMap: attachments.reduce(
          (acc, attachment) => ({
            ...acc,
            [attachment.originalName]: attachment,
          }),
          {},
        ),
      }),
    getAttachments: () => Object.values(get().filenameToAttachmentMap),
    clearAttachments: () => set({ filenameToAttachmentMap: {} }),
    setAttachment: (attachment: UploadAttachment) =>
      set((state) => ({
        filenameToAttachmentMap: {
          ...state.filenameToAttachmentMap,
          [attachment.originalName]: attachment,
        },
      })),
    getAttachment: (filename: string) =>
      get().filenameToAttachmentMap[filename],
    removeAttachment: (filename: string) =>
      set((state) => ({
        filenameToAttachmentMap: Object.fromEntries(
          Object.entries(state.filenameToAttachmentMap).filter(
            ([key]) => key !== filename,
          ),
        ),
      })),
    updateAttachmentUploadInfo: (filename: string, uploadInfo: UploadInfo) =>
      set((state) => ({
        filenameToAttachmentMap: {
          ...state.filenameToAttachmentMap,
          [filename]: {
            ...state.filenameToAttachmentMap[filename],
            uploadInfo,
          },
        },
      })),
    updateAttachmentImageInfo: (filename: string, imageInfo: ImageInfo) =>
      set((state) => ({
        filenameToAttachmentMap: {
          ...state.filenameToAttachmentMap,
          [filename]: { ...state.filenameToAttachmentMap[filename], imageInfo },
        },
      })),
    isAllUploaded: () =>
      Object.keys(get().filenameToAttachmentMap).every(
        (filename) =>
          get().filenameToAttachmentMap[filename]?.uploadInfo !== undefined &&
          get().filenameToAttachmentMap[filename]?.uploadInfo?.error ===
            undefined,
      ),
  }),
);
