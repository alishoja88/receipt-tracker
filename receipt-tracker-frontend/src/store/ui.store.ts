import { create } from 'zustand';

interface UiStore {
  // Upload state
  isUploading: boolean;
  uploadProgress: number;

  // UI state
  sidebarOpen: boolean;
  selectedReceiptId: string | null;
  profileDrawerOpen: boolean;

  // Actions
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedReceiptId: (id: string | null) => void;
  resetUploadState: () => void;
  toggleProfileDrawer: () => void;
  setProfileDrawerOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>(set => ({
  // Initial state
  isUploading: false,
  uploadProgress: 0,
  sidebarOpen: false,
  selectedReceiptId: null,
  profileDrawerOpen: false,

  // Actions
  setIsUploading: isUploading => set({ isUploading }),
  setUploadProgress: progress => set({ uploadProgress: progress }),
  setSidebarOpen: open => set({ sidebarOpen: open }),
  setSelectedReceiptId: id => set({ selectedReceiptId: id }),
  resetUploadState: () => set({ isUploading: false, uploadProgress: 0 }),
  toggleProfileDrawer: () => set(state => ({ profileDrawerOpen: !state.profileDrawerOpen })),
  setProfileDrawerOpen: open => set({ profileDrawerOpen: open }),
}));
