import { AttachmentType } from "@/lib/drizzle/drizzle-schema";
import { create } from "zustand";

export interface InputAttachment {
  type: AttachmentType;
  figObject: Record<string, any>;
  imageFile: File;
}

export interface InputAttachmentStore {
  inputAttachmentMap: Record<string, InputAttachment>;
  setInputAttachment: (key: string, attachment: InputAttachment) => void;
  getInputAttachment: (key: string) => InputAttachment;
  setInputAttachments: (keys: string[], attachments: InputAttachment[]) => void;
  getInputAttachments: () => InputAttachment[];
  removeInputAttachment: (key: string) => void;
  removeObjectById: (id: string) => void;
  clearInputAttachments: () => void;
}

export const useInputAttachmentStore = create<InputAttachmentStore>(
  (set, get) => ({
    inputAttachmentMap: {},
    setInputAttachment: (key: string, attachment: InputAttachment) =>
      set({
        inputAttachmentMap: { ...get().inputAttachmentMap, [key]: attachment },
      }),
    getInputAttachment: (key: string) => get().inputAttachmentMap[key],
    setInputAttachments: (keys: string[], attachments: InputAttachment[]) =>
      set({
        inputAttachmentMap: keys.reduce(
          (acc, key, index) => ({ ...acc, [key]: attachments[index] }),
          get().inputAttachmentMap,
        ),
      }),
    getInputAttachments: () => Object.values(get().inputAttachmentMap),
    removeInputAttachment: (key: string) =>
      set({
        inputAttachmentMap: Object.fromEntries(
          Object.entries(get().inputAttachmentMap).filter(([k]) => k !== key),
        ),
      }),
    removeObjectById: (id: string) =>
      set((state) => {
        const updatedMap = { ...state.inputAttachmentMap };
        
        // Iterate through all attachments
        Object.entries(updatedMap).forEach(([key, attachment]) => {
          const figObject = attachment.figObject;
          
          // Check if the group itself has the id
          if (figObject?.id === id) {
            // If the group itself matches, remove the rect at index 1 (the border rect)
            if (figObject?.objects && Array.isArray(figObject.objects) && figObject.objects.length > 1) {
              const updatedObjects = [
                figObject.objects[0], // Keep the base image
                ...figObject.objects.slice(2), // Keep everything after the rect at index 1
              ];
              
              updatedMap[key] = {
                ...attachment,
                figObject: {
                  ...figObject,
                  objects: updatedObjects,
                },
              };
            }
            return;
          }

          console.log(figObject);
          
          // Check if figObject has objects array (it's a Group)
          if (figObject?.objects && Array.isArray(figObject.objects)) {
            // Filter out objects with matching id
            const filteredObjects = figObject.objects.filter(
              (obj: any) => obj.id !== id
            );

            console.log(filteredObjects);
            
            // Only update if we actually removed something
            if (filteredObjects.length !== figObject.objects.length) {
              updatedMap[key] = {
                ...attachment,
                figObject: {
                  ...figObject,
                  objects: filteredObjects,
                },
              };
            }
          }
        });
        
        return { inputAttachmentMap: updatedMap };
      }),
    clearInputAttachments: () => set({ inputAttachmentMap: {} }),
  }),
);
