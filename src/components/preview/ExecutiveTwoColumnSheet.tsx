import { MapPin, Phone, Mail, Linkedin, User, Briefcase, GraduationCap, Settings, Award } from 'lucide-react';
import type { ResumeData } from '../../types/resume';

interface ExecutiveTwoColumnSheetProps {
  resume: ResumeData;
  renderHighlightedText: (text: string) => React.ReactNode;
}

export default function ExecutiveTwoColumnSheet({ resume, renderHighlightedText }: ExecutiveTwoColumnSheetProps) {
  const { header, summary, experience, education, skillGroups, certifications } = resume;

  return (
    <div
      className="w-full max-w-[850px] bg-white text-[#323232] shadow-2xl rounded-sm p-6 sm:p-8 print:shadow-none print:max-w-none print:p-0"
      style={{ fontFamily: '"Noto Sans", "Inter", system-ui, sans-serif', lineHeight: 1.28 }}>

      {/* HEADER */}
      <div className="text-center pb-2">
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight" style={{ color: 'rgb(20, 40, 80)' }}>
          {header.name}
        </h1>
        <div className="text-sm sm:text-[14.5px] font-bold mt-0.5" style={{ color: 'rgb(50, 50, 50)' }}>
          {renderHighlightedText(header.title)}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-[#323232] mt-1.5">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-[#142850]" />{header.location}</span>
          <span>|</span>
          <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-[#142850]" />{header.phone}</span>
          <span>|</span>
          <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-[#142850]" />{header.email}</span>
          <span>|</span>
          <a href={header.linkedinUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 hover:underline text-black font-medium">
            <Linkedin className="w-3 h-3 text-[#142850]" />{header.linkedin}
          </a>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-1">
        {/* LEFT COL — 72% */}
        <div className="md:col-span-8 space-y-2.5">
          <SectionHeading icon={<User className="w-3.5 h-3.5 shrink-0" />} title="Professional Summary" />
          <p className="text-[10.5px] text-justify leading-[1.35] text-[#323232]">
            {renderHighlightedText(summary)}
          </p>

          <SectionHeading icon={<Briefcase className="w-3.5 h-3.5 shrink-0" />} title="Professional Experience" />
          <div className="space-y-2.5">
            {experience.map((job) => (
              <div key={job.id} className="space-y-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11.5px] font-bold" style={{ color: 'rgb(50,50,50)' }}>{renderHighlightedText(job.role)}</span>
                  <span className="text-[10.5px] font-bold text-[#323232] shrink-0">{job.period}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-bold" style={{ color: 'rgb(50,50,50)' }}>{job.company}</span>
                  <span className="text-[10px] italic text-[#323232] shrink-0">{job.location}</span>
                </div>
                <ul className="list-disc pl-3.5 space-y-0.5 pt-0.5">
                  {job.bullets.map((b, i) => (
                    <li key={i} className="text-[10px] text-justify leading-[1.32] text-[#323232]">
                      {renderHighlightedText(b)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COL — 28% */}
        <div className="md:col-span-4 space-y-2.5">
          <SectionHeading icon={<GraduationCap className="w-3.5 h-3.5 shrink-0" />} title="Education" />
          <div className="space-y-1.5">
            {education.map((ed) => (
              <div key={ed.id} className="text-[10px] leading-[1.3]">
                <div className="font-bold text-[#323232]">{ed.degree}</div>
                <div className="text-[#323232]">{ed.school}</div>
                {ed.year && <div className="text-[#323232] opacity-70">{ed.year}</div>}
              </div>
            ))}
          </div>

          <SectionHeading icon={<Settings className="w-3.5 h-3.5 shrink-0" />} title="Skills & Technologies" />
          <div className="space-y-1.5">
            {skillGroups.map((sg) => (
              <div key={sg.id} className="leading-[1.28]">
                <div className="text-[10.5px] font-bold text-[#323232]">{sg.category}</div>
                <div className="text-[9.8px] text-[#323232] space-y-0.5">
                  {sg.lines.map((line, idx) => <div key={idx}>{renderHighlightedText(line)}</div>)}
                </div>
              </div>
            ))}
          </div>

          <SectionHeading icon={<Award className="w-3.5 h-3.5 shrink-0" />} title="Certifications" />
          <ul className="list-disc pl-3.5 space-y-0.5">
            {certifications.map((cert, idx) => (
              <li key={idx} className="text-[9.8px] leading-[1.25] text-[#323232]">
                {renderHighlightedText(cert)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase border-b pb-0.5 mb-1"
      style={{ color: 'rgb(20, 40, 80)', borderColor: 'rgb(20, 40, 80)' }}>
      {icon}
      <span>{title}</span>
    </div>
  );
}
