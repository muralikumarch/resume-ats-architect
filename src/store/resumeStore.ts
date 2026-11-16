import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData, SavedVersion } from '../types/resume';
import { INITIAL_RESUME } from '../data/initialResume';

interface ResumeStore {
  resume: ResumeData;
  savedVersions: SavedVersion[];
  newVersionName: string;

  setResume: (resume: ResumeData) => void;
  setSavedVersions: (versions: SavedVersion[]) => void;
  updateHeader: (header: Partial<ResumeData['header']>) => void;
  updateSummary: (summary: string) => void;
  updateExperience: (experience: ResumeData['experience']) => void;
  updateSkillGroups: (skillGroups: ResumeData['skillGroups']) => void;
  updateEducation: (education: ResumeData['education']) => void;
  updateCertifications: (certifications: string[]) => void;
  resetToInitial: () => void;

  saveVersion: (name: string, score: number, company: string) => void;
  loadVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  setNewVersionName: (name: string) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      resume: INITIAL_RESUME,
      savedVersions: [
        {
          id: 'v-master',
          name: 'Master Baseline (Original)',
          targetCompany: 'General / All Domains',
          updatedAt: 'Oct 26, 2026',
          score: 92,
          data: INITIAL_RESUME,
        },
      ],
      newVersionName: '',

      setResume: (resume) => set({ resume }),

      updateHeader: (headerPatch) =>
        set((state) => ({
          resume: { ...state.resume, header: { ...state.resume.header, ...headerPatch } },
        })),

      updateSummary: (summary) =>
        set((state) => ({ resume: { ...state.resume, summary } })),

      updateExperience: (experience) =>
        set((state) => ({ resume: { ...state.resume, experience } })),

      updateSkillGroups: (skillGroups) =>
        set((state) => ({ resume: { ...state.resume, skillGroups } })),

      updateEducation: (education) =>
        set((state) => ({ resume: { ...state.resume, education } })),

      updateCertifications: (certifications) =>
        set((state) => ({ resume: { ...state.resume, certifications } })),

      resetToInitial: () => set({ resume: INITIAL_RESUME }),

      saveVersion: (name, score, company) => {
        const { resume, savedVersions } = get();
        const newVer: SavedVersion = {
          id: `v-${Date.now()}`,
          name,
          targetCompany: company || 'Custom Target',
          updatedAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          score,
          data: JSON.parse(JSON.stringify(resume)),
        };
        set({ savedVersions: [newVer, ...savedVersions], newVersionName: '' });
      },

      loadVersion: (id) => {
        const { savedVersions } = get();
        const ver = savedVersions.find((v) => v.id === id);
        if (ver) set({ resume: JSON.parse(JSON.stringify(ver.data)) });
      },

      deleteVersion: (id) => {
        set((state) => ({
          savedVersions: state.savedVersions.filter((v) => v.id !== id),
        }));
      },

      setNewVersionName: (name) => set({ newVersionName: name }),
    }),
    {
      name: 'resume-ats-storage',
      partialize: (state) => ({
        resume: state.resume,
        savedVersions: state.savedVersions,
      }),
    }
  )
);
