/**
 * ProfileSwitcher — compact dropdown shown in AppHeader.
 * Lets the user switch between profiles or jump to the full manager.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Users } from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';
import { useResumeStore } from '../../store/resumeStore';
import { useSettingsStore } from '../../store/settingsStore';

export function ProfileSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const switchProfile = useProfileStore((s) => s.switchProfile);
  const saveActiveProfileData = useProfileStore((s) => s.saveActiveProfileData);

  const resume = useResumeStore((s) => s.resume);
  const savedVersions = useResumeStore((s) => s.savedVersions);
  const setResume = useResumeStore((s) => s.setResume);
  const setSavedVersions = useResumeStore((s) => s.setSavedVersions);
  const showToast = useSettingsStore((s) => s.showToast);
  const setActiveTab = useSettingsStore((s) => s.setActiveTab);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  function handleSwitch(id: string) {
    if (id === activeProfileId) { setOpen(false); return; }

    // 1. Persist current work into outgoing profile
    saveActiveProfileData(resume, savedVersions);

    // 2. Switch and load incoming profile
    const incoming = switchProfile(id);
    setResume(incoming.resume);
    setSavedVersions(incoming.savedVersions);

    setOpen(false);
    showToast(`Switched to "${incoming.name}" profile`);
  }

  function handleOpenManager() {
    setOpen(false);
    setActiveTab('profiles');
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700
                   border border-slate-700 text-sm font-medium text-slate-200 transition select-none"
        title="Switch profile"
      >
        <span className="text-base leading-none">{activeProfile.emoji}</span>
        <span className="max-w-[120px] truncate hidden sm:block">{activeProfile.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700
                        rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Profile list */}
          <div className="max-h-60 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSwitch(profile.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                  profile.id === activeProfileId
                    ? 'bg-blue-600/20 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl shrink-0">{profile.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.name}</p>
                  <p className="text-xs text-slate-400 truncate">{profile.targetRole}</p>
                </div>
                {profile.id === activeProfileId && (
                  <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Footer actions */}
          <div className="border-t border-slate-800 p-2 flex gap-2">
            <button
              onClick={handleOpenManager}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                         bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
            >
              <Users className="w-3.5 h-3.5" /> Manage Profiles
            </button>
            <button
              onClick={handleOpenManager}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                         bg-blue-600/20 hover:bg-blue-600/40 text-xs text-blue-300 transition"
            >
              <Plus className="w-3.5 h-3.5" /> New Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

