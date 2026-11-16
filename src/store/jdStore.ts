import { create } from 'zustand';
import { PRESET_JDS } from '../data/presetJds';

interface JdStore {
  jdInput: string;
  jdRoleTitle: string;
  jdCompany: string;
  highlightMatches: boolean;

  setJdInput: (jd: string) => void;
  setJdRoleTitle: (title: string) => void;
  setJdCompany: (company: string) => void;
  setHighlightMatches: (v: boolean) => void;
  loadPreset: (id: string) => void;
  clearJd: () => void;
}

export const useJdStore = create<JdStore>((set) => ({
  jdInput: PRESET_JDS[0].text,
  jdRoleTitle: PRESET_JDS[0].targetRole,
  jdCompany: PRESET_JDS[0].company,
  highlightMatches: true,

  setJdInput: (jdInput) => set({ jdInput }),
  setJdRoleTitle: (jdRoleTitle) => set({ jdRoleTitle }),
  setJdCompany: (jdCompany) => set({ jdCompany }),
  setHighlightMatches: (highlightMatches) => set({ highlightMatches }),

  loadPreset: (id) => {
    const preset = PRESET_JDS.find((p) => p.id === id);
    if (preset) {
      set({
        jdInput: preset.text,
        jdRoleTitle: preset.targetRole,
        jdCompany: preset.company,
      });
    }
  },

  clearJd: () => set({ jdInput: '', jdRoleTitle: '', jdCompany: '' }),
}));
