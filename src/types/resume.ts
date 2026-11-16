// Core Resume Data Types — JSON Resume compliant with enhancements

export interface ResumeHeader {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  linkedinUrl: string;
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  period: string; // legacy display string e.g. "July 2025 -- July 2026"
  bullets: string[];
  skillsUsed: string[];
}

export interface ResumeSkillGroup {
  id: string;
  category: string;
  lines: string[];
  keywords: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface ResumeMeta {
  version: string;
  lastModified: string;
  schemaVersion: '1.0';
}

export interface ResumeData {
  meta: ResumeMeta;
  header: ResumeHeader;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skillGroups: ResumeSkillGroup[];
  certifications: string[];
}

export interface SavedVersion {
  id: string;
  name: string;
  targetCompany: string;
  updatedAt: string;
  score: number;
  data: ResumeData;
}

// ── Multi-Profile ─────────────────────────────────────────────────────────────

/** Career persona (e.g. "Frontend Engineer", "Data Engineer"). */
export interface Profile {
  id: string;
  /** Display name shown in the switcher. */
  name: string;
  /** Emoji avatar for quick visual identification. */
  emoji: string;
  /** Target role or tagline shown as subtitle. */
  targetRole: string;
  createdAt: string;
  updatedAt: string;
  /** Full resume snapshot for this persona. */
  resume: ResumeData;
  /** JD-tailored versions saved under this profile. */
  savedVersions: SavedVersion[];
}
