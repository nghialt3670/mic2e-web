import { create } from "zustand";

type UploadAttachmentType = "fabric-image-group" | "image";

interface ReadInfo {
  dataUrl: string;
  width: number;
  height: number;
}

interface UploadInfo {
  path: string;
  url: string;
  error?: string;
}

interface ThumbnailInfo {
  path: string;
  url: string;
  width: number;
  height: number;
  error?: string;
}

interface UploadAttachment {
  type: UploadAttachmentType;
  file: File;
  originalFile: File;
  readInfo?: ReadInfo;
  uploadInfo?: UploadInfo;
  thumbnailInfo?: ThumbnailInfo;
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
  updateAttachmentReadInfo: (filename: string, readInfo: ReadInfo) => void;
  updateAttachmentUploadInfo: (
    filename: string,
    uploadInfo: UploadInfo,
  ) => void;
  updateAttachmentThumbnailInfo: (
    filename: string,
    thumbnailInfo: ThumbnailInfo,
  ) => void;
  isAllRead: () => boolean;
  isAllUploaded: () => boolean;
  isAllThumbnailed: () => boolean;
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
            [attachment.originalFile.name]: attachment,
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
          [attachment.originalFile.name]: attachment,
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
    updateAttachmentReadInfo: (filename: string, readInfo: ReadInfo) =>
      set((state) => ({
        filenameToAttachmentMap: {
          ...state.filenameToAttachmentMap,
          [filename]: { ...state.filenameToAttachmentMap[filename], readInfo },
        },
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
    updateAttachmentThumbnailInfo: (
      filename: string,
      thumbnailInfo: ThumbnailInfo,
    ) =>
      set((state) => ({
        filenameToAttachmentMap: {
          ...state.filenameToAttachmentMap,
          [filename]: {
            ...state.filenameToAttachmentMap[filename],
            thumbnailInfo,
          },
        },
      })),
    isAllRead: () =>
      Object.keys(get().filenameToAttachmentMap).every(
        (filename) =>
          get().filenameToAttachmentMap[filename]?.readInfo !== undefined,
      ),
    isAllUploaded: () =>
      Object.keys(get().filenameToAttachmentMap).every(
        (filename) =>
          get().filenameToAttachmentMap[filename]?.uploadInfo !== undefined &&
          get().filenameToAttachmentMap[filename]?.uploadInfo?.error ===
            undefined,
      ),
    isAllThumbnailed: () =>
      Object.keys(get().filenameToAttachmentMap).every(
        (filename) =>
          get().filenameToAttachmentMap[filename]?.thumbnailInfo !== undefined,
      ),
  }),
);
