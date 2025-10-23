import { create } from "zustand";

interface AttachmentStore {
  filenameToFileMap: Record<string, File>;
  filenameToPathMap: Record<string, string>;
  filenameToUrlMap: Record<string, string>;
  setAttachments: (files: File[]) => void;
  addAttachment: (file: File) => void;
  removeAttachment: (filename: string) => void;
  updateAttachmentPath: (filename: string, path: string) => void;
  updateAttachmentUrl: (filename: string, url: string) => void;
}

export const useAttachmentStore = create<AttachmentStore>((set) => ({
  filenameToFileMap: {},
  filenameToUrlMap: {},
  filenameToPathMap: {},

  setAttachments: (files: File[]) =>
    set((state) => ({
      filenameToFileMap: files.reduce(
        (acc, file) => ({
          ...acc,
          [file.name]: file,
        }),
        {},
      ),
      filenameToPathMap: files.reduce(
        (acc, file) => ({
          ...acc,
          [file.name]: `${Date.now()}.${file.name}`,
        }),
        {},
      ),
      filenameToUrlMap: {},
    })),

  addAttachment: (file) =>
    set((state) => ({
      filenameToFileMap: {
        ...state.filenameToFileMap,
        [file.name]: file,
      },
      filenameToPathMap: {
        ...state.filenameToPathMap,
        [file.name]: `${Date.now()}.${file.name}`,
      },
    })),

  removeAttachment: (filename) =>
    set((state) => {
      const { [filename]: _, ...remainingFiles } = state.filenameToFileMap;
      const { [filename]: __, ...remainingUrls } = state.filenameToUrlMap;
      return {
        filenameToFileMap: remainingFiles,
        filenameToUrlMap: remainingUrls,
      };
    }),

  updateAttachmentPath: (filename, path) =>
    set((state) => ({
      filenameToPathMap: {
        ...state.filenameToPathMap,
        [filename]: path,
      },
    })),

  updateAttachmentUrl: (filename, url) =>
    set((state) => ({
      filenameToUrlMap: {
        ...state.filenameToUrlMap,
        [filename]: url,
      },
    })),
}));
