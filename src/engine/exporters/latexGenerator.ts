import type { ResumeData } from '../../types/resume';

export function escapeLatex(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function generateLatexCode(resume: ResumeData): string {
  const h = resume.header;

  const jobsLatex = resume.experience
    .map((exp) => {
      const items = exp.bullets
        .map((b) => `    \\item ${escapeLatex(b)}`)
        .join('\n');
      return `\\job{${escapeLatex(exp.role)}}{${escapeLatex(exp.period)}}{${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}\n\\begin{itemize}\n${items}\n\\end{itemize}`;
    })
    .join('\n\n');

  const eduLatex = resume.education
    .map(
      (ed, i) =>
        `${i > 0 ? '\\vspace{2pt}\n' : ''}{\\scriptsize\\addtolength{\\baselineskip}{1pt}\n\\textbf{${escapeLatex(ed.degree)}} \\\\\n${escapeLatex(ed.school)}\\par}`
    )
    .join('\n\n');

  const skillsLatex = resume.skillGroups
    .map((sg) => {
      const isLongLine =
        sg.category === 'Cloud Architecture' || sg.category === 'Leadership & Management';
      const spacing = isLongLine ? '1.25pt' : '1pt';
      const joinedLines = sg.lines.map((l) => escapeLatex(l)).join(' \\\\\n');
      return `\\vspace{4pt}\n\\textbf{${escapeLatex(sg.category)}} \\\\\n{\\raggedright\\scriptsize\\addtolength{\\baselineskip}{${spacing}} ${joinedLines}\\par}`;
    })
    .join('\n\n');

  const certsLatex = resume.certifications
    .map((c) => `    \\item ${escapeLatex(c)}`)
    .join('\n');

  return `\\documentclass[10pt,a4paper]{article}

% --- UNIVERSAL PREAMBLE BLOCK ---
\\usepackage[left=1.1cm,right=1.1cm,top=1.1cm,bottom=1.1cm]{geometry}
\\usepackage{fontspec}

\\usepackage[english, bidi=basic, provide=*]{babel}
\\babelprovide[import, onchar=ids fonts]{english}

% Set default/Latin font to Noto Sans (Sans Serif)
\\babelfont{rm}{Noto Sans}
\\babelfont{sf}{Noto Sans}

\\usepackage{xcolor}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{paracol}
\\usepackage{etoolbox}
\\usepackage{setspace}
\\usepackage{hyperref}
\\usepackage{fontawesome5}

% --- COLORS ---
\\definecolor{headerblue}{RGB}{20, 40, 80}
\\definecolor{accentblue}{RGB}{0, 114, 206}
\\definecolor{textgray}{RGB}{50, 50, 50}
\\definecolor{bulletcolor}{RGB}{50, 50, 50}

% --- HYPERREF ---
\\hypersetup{
    colorlinks=true,
    linkcolor=black,
    urlcolor=black,
}

% --- FORMATTING ---
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlength{\\columnsep}{0.6cm}
\\setstretch{1.02}

% Custom Section Header
\\titleformat{\\section}
  {\\small\\bfseries\\color{headerblue}\\uppercase}
  {}
  {0em}
  {}
  [\\titlerule]
\\titlespacing*{\\section}{0pt}{6pt}{2pt}

% Custom Job Command
\\newcommand{\\job}[4]{
    \\vspace{4pt}
    \\noindent
    {\\small\\bfseries\\color{textgray} #1} \\hfill {\\footnotesize\\bfseries #2} \\\\[1pt]
    {\\scriptsize\\textbf{\\color{textgray} #3}} \\hfill {\\scriptsize\\itshape #4}
    \\vspace{1pt}
}

% Global List Settings
\\setlist[itemize]{leftmargin=3mm, nosep, topsep=1pt, itemsep=1pt, before={\\addtolength{\\baselineskip}{1pt}}, label={\\scriptsize\\color{bulletcolor}\\textbullet}}

\\begin{document}

% --- HEADER ---
\\begin{center}
    {\\huge\\bfseries\\color{headerblue} ${escapeLatex(h.name)}} \\\\[3pt]
    {\\normalsize\\textbf{\\color{textgray} ${escapeLatex(h.title)}}} \\\\[6pt]
    \\footnotesize
    \\faMapMarker* ${escapeLatex(h.location)}\\enskip\\textbar\\enskip%
    \\faPhone* ${escapeLatex(h.phone)}\\enskip\\textbar\\enskip%
    \\faEnvelope\\ ${escapeLatex(h.email)}\\enskip\\textbar\\enskip%
    \\faLinkedin\\ \\href{${h.linkedinUrl}}{${escapeLatex(h.linkedin)}}
\\end{center}

\\vspace{-10pt}

% --- LAYOUT START ---
\\columnratio{0.72}
\\begin{paracol}{2}
\\tolerance=1
\\emergencystretch=\\maxdimen
\\hyphenpenalty=10000
\\hbadness=10000

% =====================
% LEFT COLUMN (MAIN)
% =====================
\\section*{\\faUserTie\\enskip Professional Summary}
\\scriptsize
\\vspace{2pt}
{\\addtolength{\\baselineskip}{1pt}
${escapeLatex(resume.summary)}\\par}

\\vspace{-3pt}

\\section*{\\faBriefcase\\enskip Professional Experience}
\\scriptsize
\\vspace{-2pt}
${jobsLatex}

\\switchcolumn

% =====================
% RIGHT COLUMN (SIDEBAR)
% =====================
\\section*{\\faGraduationCap\\enskip Education}
\\vspace{4pt}
${eduLatex}

\\section*{\\faCogs\\enskip Skills \\& Technologies}
${skillsLatex}

\\section*{\\faAward\\enskip Certifications}
\\vspace{5pt}
\\scriptsize
\\begin{itemize}[leftmargin=2.5mm, nosep, itemsep=0pt]
${certsLatex}
\\end{itemize}

\\end{paracol}

\\end{document}`;
}

