/**
 * ProfileManager — full CRUD panel rendered as a tab in EditorTabs.
 *
 * Features:
 * - View all profiles with metadata (emoji, name, role, updatedAt, version count)
 * - Create new profile (blank or clone from active)
 * - Rename / re-emoji any profile via inline edit
 * - Switch to a profile
 * - Delete a profile (with confirmation)
 */

import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Check, X, Copy,
  BookmarkCheck, Calendar, ChevronRight, Users,
} from 'lucide-react';
import { useProfileStore, blankResume } from '../../store/profileStore';
import { useResumeStore } from '../../store/resumeStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { Profile } from '../../types/resume';

// ── Emoji picker (small inline set) ──────────────────────────────────────────

const EMOJI_OPTIONS = [
  '🏛️','💼','🚀','🧑‍💻','⚙️','📊','🤖','🌐','🔬','🏗️',
  '💡','🎯','📱','☁️','🛡️','🧠','🎓','🏆','🌟','🔧',
];

// ── Create / Edit form ────────────────────────────────────────────────────────

interface ProfileFormProps {
  initial?: { name: string; emoji: string; targetRole: string };
  onSave: (name: string, emoji: string, targetRole: string) => void;
  onCancel: () => void;
  cloneMode?: boolean;
}

function ProfileForm({ initial, onSave, onCancel, cloneMode }: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '💼');
  const [targetRole, setTargetRole] = useState(initial?.targetRole ?? '');
  const [showEmoji, setShowEmoji] = useState(false);

  const valid = name.trim().length > 0;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">
        {cloneMode ? '📋 Clone Profile' : initial ? '✏️ Edit Profile' : '➕ New Profile'}
      </h3>

      {/* Emoji + Name row */}
      <div className="flex gap-2">
        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmoji((v) => !v)}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-xl flex items-center justify-center transition"
            title="Pick emoji"
          >
            {emoji}
          </button>
          {showEmoji && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-slate-900 border border-slate-700
                            rounded-xl p-2 grid grid-cols-5 gap-1 shadow-xl w-44">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => { setEmoji(e); setShowEmoji(false); }}
                  className={`text-xl rounded p-1 hover:bg-slate-700 transition ${emoji === e ? 'bg-blue-600/40' : ''}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Profile name  (e.g. Frontend Engineer)"
          className="flex-1 bg-slate-700 text-slate-100 placeholder:text-slate-500
                     rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
      </div>

      {/* Target role */}
      <input
        type="text"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
        placeholder="Target role / tagline  (e.g. Senior React Developer)"
        className="w-full bg-slate-700 text-slate-100 placeholder:text-slate-500
                   rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-blue-500
                   focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      />

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          disabled={!valid}
          onClick={() => onSave(name.trim(), emoji, targetRole.trim())}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500
                     disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition"
        >
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600
                     text-slate-300 text-xs transition"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Profile card ──────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  onSwitch: () => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}

function ProfileCard({ profile, isActive, onSwitch, onEdit, onClone, onDelete }: ProfileCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isActive
          ? 'border-blue-500/60 bg-blue-600/10 ring-1 ring-blue-500/20'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Emoji avatar */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
            isActive ? 'bg-blue-600/20' : 'bg-slate-700'
          }`}
        >
          {profile.emoji}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white truncate">{profile.name}</h3>
            {isActive && (
              <span className="shrink-0 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">{profile.targetRole || 'No target role set'}</p>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3" />
              {profile.savedVersions.length} version{profile.savedVersions.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Updated {profile.updatedAt}
            </span>
          </div>
        </div>

        {/* Switch button */}
        {!isActive && (
          <button
            onClick={onSwitch}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg
                       bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
          >
            Switch <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Action bar */}
      <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center gap-2">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600
                     text-slate-300 text-xs transition"
        >
          <Pencil className="w-3 h-3" /> Rename
        </button>
        <button
          onClick={onClone}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600
                     text-slate-300 text-xs transition"
        >
          <Copy className="w-3 h-3" /> Clone
        </button>

        {/* Delete with confirmation */}
        {confirmDelete ? (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-rose-400">Delete?</span>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs transition"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-0.5 rounded bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs transition"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-700/50 hover:bg-rose-900/40
                       text-slate-500 hover:text-rose-400 text-xs transition"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main ProfileManager component ─────────────────────────────────────────────

export function ProfileManager() {
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const createProfile = useProfileStore((s) => s.createProfile);
  const deleteProfile = useProfileStore((s) => s.deleteProfile);
  const updateProfileMeta = useProfileStore((s) => s.updateProfileMeta);
  const switchProfile = useProfileStore((s) => s.switchProfile);
  const saveActiveProfileData = useProfileStore((s) => s.saveActiveProfileData);

  const resume = useResumeStore((s) => s.resume);
  const savedVersions = useResumeStore((s) => s.savedVersions);
  const setResume = useResumeStore((s) => s.setResume);
  const setSavedVersions = useResumeStore((s) => s.setSavedVersions);
  const showToast = useSettingsStore((s) => s.showToast);

  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cloneSourceId, setCloneSourceId] = useState<string | null>(null);

  // ── handlers ───────────────────────────────────────────────────────────

  function handleSwitch(id: string) {
    // Save current work
    saveActiveProfileData(resume, savedVersions);
    // Load incoming
    const incoming = switchProfile(id);
    setResume(incoming.resume);
    setSavedVersions(incoming.savedVersions);
    showToast(`Switched to "${incoming.name}" profile`);
  }

  function handleCreate(name: string, emoji: string, targetRole: string) {
    const id = createProfile(name, emoji, targetRole);
    setShowCreateForm(false);
    showToast(`Created profile "${name}"`);
    // Auto-switch to new profile
    saveActiveProfileData(resume, savedVersions);
    const incoming = switchProfile(id);
    setResume(incoming.resume);
    setSavedVersions(incoming.savedVersions);
  }

  function handleClone(name: string, emoji: string, targetRole: string) {
    const source = profiles.find((p) => p.id === cloneSourceId);
    if (!source) return;
    // If cloning active profile, include live resume state
    const baseResume =
      cloneSourceId === activeProfileId ? resume : source.resume;
    const id = createProfile(name, emoji, targetRole, baseResume);
    setCloneSourceId(null);
    showToast(`Cloned profile "${name}"`);
    // Auto-switch to clone
    saveActiveProfileData(resume, savedVersions);
    const incoming = switchProfile(id);
    setResume(incoming.resume);
    setSavedVersions(incoming.savedVersions);
  }

  function handleUpdate(id: string, name: string, emoji: string, targetRole: string) {
    updateProfileMeta(id, name, emoji, targetRole);
    setEditingId(null);
    showToast('Profile updated');
  }

  function handleDelete(id: string) {
    if (profiles.length <= 1) {
      showToast('Cannot delete the only profile');
      return;
    }
    const isActive = id === activeProfileId;
    deleteProfile(id);
    if (isActive) {
      // deleteProfile already updated activeProfileId — sync resumeStore
      const remaining = useProfileStore.getState();
      const next = remaining.profiles.find((p) => p.id === remaining.activeProfileId)!;
      setResume(next.resume);
      setSavedVersions(next.savedVersions);
    }
    showToast('Profile deleted');
  }

  // ── render ─────────────────────────────────────────────────────────────

  const editingProfile = editingId ? profiles.find((p) => p.id === editingId) : null;
  const cloneSourceProfile = cloneSourceId ? profiles.find((p) => p.id === cloneSourceId) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">My Profiles</h2>
          <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
            {profiles.length}
          </span>
        </div>
        {!showCreateForm && !cloneSourceId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500
                       text-white text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Profile
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <ProfileForm
          onSave={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Clone form */}
      {cloneSourceId && cloneSourceProfile && (
        <ProfileForm
          cloneMode
          initial={{
            name: `${cloneSourceProfile.name} (Clone)`,
            emoji: cloneSourceProfile.emoji,
            targetRole: cloneSourceProfile.targetRole,
          }}
          onSave={handleClone}
          onCancel={() => setCloneSourceId(null)}
        />
      )}

      {/* Profile cards */}
      <div className="space-y-3">
        {profiles.map((profile) =>
          editingId === profile.id && editingProfile ? (
            <ProfileForm
              key={profile.id}
              initial={{
                name: editingProfile.name,
                emoji: editingProfile.emoji,
                targetRole: editingProfile.targetRole,
              }}
              onSave={(n, e, r) => handleUpdate(profile.id, n, e, r)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeProfileId}
              onSwitch={() => handleSwitch(profile.id)}
              onEdit={() => { setShowCreateForm(false); setCloneSourceId(null); setEditingId(profile.id); }}
              onClone={() => { setShowCreateForm(false); setEditingId(null); setCloneSourceId(profile.id); }}
              onDelete={() => handleDelete(profile.id)}
            />
          ),
        )}
      </div>

      {/* Tip */}
      <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-300">💡 Tip:</strong> Each profile holds a completely independent resume and JD-tailored versions.
        Use profiles for different career tracks — e.g. <em>"Full Stack"</em> vs <em>"Data Engineer"</em> vs <em>"Architect"</em>.
      </div>
    </div>
  );
}

