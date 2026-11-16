import { create } from 'zustand';

type ActiveTab = 'jd-agent' | 'editor' | 'versions';
type RightView = 'preview-ats' | 'preview-executive' | 'latex';
type EditorSection = 'header' | 'summary' | 'experience' | 'skills' | 'edu-certs';

interface SettingsStore {
  activeTab: ActiveTab;
  rightView: RightView;
  editorSection: EditorSection;
  toast: string | null;

  setActiveTab: (tab: ActiveTab) => void;
  setRightView: (view: RightView) => void;
  setEditorSection: (section: EditorSection) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  activeTab: 'jd-agent',
  rightView: 'preview-executive',
  editorSection: 'summary',
  toast: null,

  setActiveTab: (activeTab) => set({ activeTab }),
  setRightView: (rightView) => set({ rightView }),
  setEditorSection: (editorSection) => set({ editorSection }),

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), 3200);
  },
  clearToast: () => set({ toast: null }),
}));
