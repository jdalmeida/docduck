import { create } from "zustand";

type CoverImageStore = {
  url?: string;
  documentId?: string;
  isOpen: boolean;
  onOpen: (documentId: string, url?: string) => void;
  onClose: () => void;
  onReplace: (url: string) => void;
};

export const useCoverImage = create<CoverImageStore>((set) => ({
  url: undefined,
  documentId: undefined,
  isOpen: false,
  onOpen: (documentId, url) => set({ isOpen: true, documentId, url }),
  onClose: () => set({ isOpen: false, url: undefined, documentId: undefined }),
  onReplace: (url: string) => set((state) => ({ ...state, url })),
})); 