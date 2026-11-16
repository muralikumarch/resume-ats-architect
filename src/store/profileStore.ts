/**
 * profileStore — Multi-profile Zustand store (persisted).
 *
 * Profiles are independent career personas (e.g. "Full Stack Engineer",
 * "Data Engineer"). Each profile has its own ResumeData and savedVersions.
 *
 * Switching profiles syncs the active profile's data into resumeStore so all
 * existing components continue to work without modification.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, ResumeData, SavedVersion } from '../types/resume';
import { INITIAL_RESUME } from '../data/initialResume';

// ── seed data ─────────────────────────────────────────────────────────────────

function makeTimestamp(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const MASTER_PROFILE: Profile = {
  id: 'profile-master',
  name: 'Solution Architect',
  emoji: '🏛️',
  targetRole: 'Solution Architect / Technical Lead',
  createdAt: makeTimestamp(),
  updatedAt: makeTimestamp(),
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
};

// ── store shape ───────────────────────────────────────────────────────────────

export interface ProfileStore {
  profiles: Profile[];
  activeProfileId: string;

  // ── selectors (derived, not persisted) ─────────────────────────────────
  getActiveProfile: () => Profile;

  // ── CRUD ────────────────────────────────────────────────────────────────
  /**
   * Create a new profile.
   * @param name    Display name
   * @param emoji   Emoji avatar
   * @param targetRole  Tagline / target role string
   * @param baseResume  Optional resume to clone from (defaults to blank template)
   */
  createProfile: (
    name: string,
    emoji: string,
    targetRole: string,
    baseResume?: ResumeData,
  ) => string; // returns new profile id

  /** Delete a profile. Cannot delete the last profile. */
  deleteProfile: (id: string) => void;

  /** Rename / re-emoji a profile. */
  updateProfileMeta: (id: string, name: string, emoji: string, targetRole: string) => void;

  /**
   * Switch the active profile.
   * Returns the new active profile so the caller can sync resumeStore.
   */
  switchProfile: (id: string) => Profile;

  /**
   * Persist the current resumeStore state back into the active profile.
   * Call this whenever resumeStore.resume or savedVersions change.
   */
  saveActiveProfileData: (resume: ResumeData, savedVersions: SavedVersion[]) => void;
}

// ── blank resume template ─────────────────────────────────────────────────────

export function blankResume(): ResumeData {
  return {
    meta: {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      schemaVersion: '1.0',
    },
    header: {
      name: 'Your Name',
      title: 'Your Target Role',
      location: 'City, Country',
      phone: '+1 (555) 000-0000',
      email: 'you@example.com',
      linkedin: 'yourhandle',
      linkedinUrl: 'https://linkedin.com/in/yourhandle',
    },
    summary:
      'Write a compelling 3-4 sentence professional summary here, tailored to your target role.',
    experience: [],
    education: [],
    skillGroups: [],
    certifications: [],
  };
}

// ── store ─────────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profiles: [MASTER_PROFILE],
      activeProfileId: MASTER_PROFILE.id,

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId) ?? profiles[0];
      },

      createProfile: (name, emoji, targetRole, baseResume) => {
        const id = `profile-${Date.now()}`;
        const newProfile: Profile = {
          id,
          name,
          emoji,
          targetRole,
          createdAt: makeTimestamp(),
          updatedAt: makeTimestamp(),
          resume: baseResume
            ? JSON.parse(JSON.stringify(baseResume)) as ResumeData
            : blankResume(),
          savedVersions: [],
        };
        set((state) => ({ profiles: [...state.profiles, newProfile] }));
        return id;
      },

      deleteProfile: (id) => {
        const { profiles, activeProfileId } = get();
        if (profiles.length <= 1) return; // cannot delete last profile
        const filtered = profiles.filter((p) => p.id !== id);
        const newActiveId =
          activeProfileId === id ? filtered[0].id : activeProfileId;
        set({ profiles: filtered, activeProfileId: newActiveId });
      },

      updateProfileMeta: (id, name, emoji, targetRole) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id
              ? { ...p, name, emoji, targetRole, updatedAt: makeTimestamp() }
              : p,
          ),
        }));
      },

      switchProfile: (id) => {
        set({ activeProfileId: id });
        const profile = get().profiles.find((p) => p.id === id)!;
        return profile;
      },

      saveActiveProfileData: (resume, savedVersions) => {
        const { activeProfileId } = get();
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === activeProfileId
              ? {
                  ...p,
                  resume: JSON.parse(JSON.stringify(resume)) as ResumeData,
                  savedVersions: JSON.parse(JSON.stringify(savedVersions)) as SavedVersion[],
                  updatedAt: makeTimestamp(),
                }
              : p,
          ),
        }));
      },
    }),
    {
      name: 'resume-ats-profiles',
      partialize: (state) => ({
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
      }),
    },
  ),
);

