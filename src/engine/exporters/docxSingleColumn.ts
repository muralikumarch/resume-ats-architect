/**
 * ATS-safe single-column DOCX exporter (raw OOXML).
 * No tables, no text boxes, no columns — maximum ATS parser compatibility.
 * Uses the same zipBuilder infrastructure as docxTwoColumn.ts.
 */

import type { ResumeData } from '../../types/resume';
import { createZipBlob, escapeXml } from './zipBuilder';

// ── OOXML paragraph builders ──────────────────────────────────────────────────

const NS = `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"`;

function run(text: string, rPr = ''): string {
  return `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

function bold(): string { return '<w:b/><w:bCs/>'; }
function italic(): string { return '<w:i/><w:iCs/>'; }
function fontSize(half: number): string { return `<w:sz w:val="${half}"/><w:szCs w:val="${half}"/>`; }
function color(hex: string): string { return `<w:color w:val="${hex}"/>`; }
function fontFamily(name: string): string { return `<w:rFonts w:ascii="${name}" w:hAnsi="${name}" w:cs="${name}"/>`; }

function centerAlign(): string { return '<w:jc w:val="center"/>'; }
function spacing(before: number, after: number): string {
  return `<w:spacing w:before="${before}" w:after="${after}"/>`;
}
function indent(left: number): string { return `<w:ind w:left="${left}"/>`;  }

function dividerPara(): string {
  // Horizontal rule under section heading via paragraph border
  return `<w:pPr>
    <w:pBdr>
      <w:bottom w:val="single" w:sz="6" w:space="1" w:color="334155"/>
    </w:pBdr>
    ${spacing(240, 80)}
  </w:pPr>`;
}

function headingPara(title: string): string {
  return `<w:p>
    ${dividerPara()}
    ${run(escapeXml(title.toUpperCase()), bold() + fontSize(22) + fontFamily('Arial') + color('1E293B'))}
  </w:p>`;
}

function bodyPara(text: string, options: { bold?: boolean; italic?: boolean; size?: number; col?: string } = {}): string {
  const rPr = [
    options.bold ? bold() : '',
    options.italic ? italic() : '',
    fontSize(options.size ?? 20),
    fontFamily('Arial'),
    options.col ? color(options.col) : '',
  ].join('');
  return `<w:p>
    <w:pPr>${spacing(0, 80)}</w:pPr>
    ${run(text, rPr)}
  </w:p>`;
}

function bulletPara(text: string): string {
  return `<w:p>
    <w:pPr>
      <w:numPr>
        <w:ilvl w:val="0"/>
        <w:numId w:val="1"/>
      </w:numPr>
      ${spacing(0, 60)}
      ${indent(360)}
    </w:pPr>
    ${run(text, fontSize(20) + fontFamily('Arial'))}
  </w:p>`;
}

function emptyPara(): string {
  return `<w:p><w:pPr>${spacing(0, 60)}</w:pPr></w:p>`;
}

function multiRunPara(runs: Array<{ text: string; rPr?: string }>, pPrExtra = ''): string {
  const pPrContent = `${spacing(0, 80)}${pPrExtra}`;
  const inner = runs.map(r => run(r.text, r.rPr ?? '')).join('');
  return `<w:p><w:pPr>${pPrContent}</w:pPr>${inner}</w:p>`;
}

// ── numbering XML (for bullet lists) ─────────────────────────────────────────

const NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="360" w:hanging="180"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/>
      </w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
</w:numbering>`;

// ── document body builder ─────────────────────────────────────────────────────

function buildBody(resume: ResumeData): string {
  const parts: string[] = [];

  // ── HEADER ────────────────────────────────────────────────────────────
  parts.push(`<w:p>
    <w:pPr>${centerAlign()}${spacing(0, 80)}</w:pPr>
    ${run(resume.header.name, bold() + fontSize(32) + fontFamily('Arial') + color('0F172A'))}
  </w:p>`);

  parts.push(`<w:p>
    <w:pPr>${centerAlign()}${spacing(0, 60)}</w:pPr>
    ${run(resume.header.title, italic() + fontSize(20) + fontFamily('Arial') + color('475569'))}
  </w:p>`);

  const contactParts = [
    resume.header.email,
    resume.header.phone,
    resume.header.location,
    resume.header.linkedin,
  ].filter(Boolean);

  parts.push(`<w:p>
    <w:pPr>${centerAlign()}${spacing(0, 160)}</w:pPr>
    ${contactParts.map((p, i) =>
      run(p + (i < contactParts.length - 1 ? '  |  ' : ''), fontSize(18) + fontFamily('Arial'))
    ).join('')}
  </w:p>`);

  // ── SUMMARY ───────────────────────────────────────────────────────────
  if (resume.summary) {
    parts.push(headingPara('Professional Summary'));
    parts.push(bodyPara(resume.summary));
    parts.push(emptyPara());
  }

  // ── EXPERIENCE ────────────────────────────────────────────────────────
  if (resume.experience.length > 0) {
    parts.push(headingPara('Professional Experience'));

    for (const exp of resume.experience) {
      parts.push(multiRunPara([
        { text: exp.company, rPr: bold() + fontSize(22) + fontFamily('Arial') },
        { text: `  —  ${exp.period}`, rPr: fontSize(20) + fontFamily('Arial') + color('475569') },
      ], spacing(120, 40)));

      parts.push(multiRunPara([
        { text: exp.role, rPr: italic() + fontSize(20) + fontFamily('Arial') + color('334155') },
        ...(exp.location ? [{ text: `  ·  ${exp.location}`, rPr: fontSize(20) + fontFamily('Arial') + color('94A3B8') }] : []),
      ], spacing(0, 60)));

      for (const bullet of exp.bullets) {
        parts.push(bulletPara(bullet));
      }

      if (exp.skillsUsed?.length) {
        parts.push(multiRunPara([
          { text: 'Technologies: ', rPr: bold() + fontSize(18) + fontFamily('Arial') },
          { text: exp.skillsUsed.join(', '), rPr: italic() + fontSize(18) + fontFamily('Arial') },
        ]));
      }
    }
    parts.push(emptyPara());
  }

  // ── EDUCATION ─────────────────────────────────────────────────────────
  if (resume.education.length > 0) {
    parts.push(headingPara('Education'));

    for (const edu of resume.education) {
      parts.push(bodyPara(edu.school, { bold: true, size: 22 }));
      parts.push(multiRunPara([
        { text: edu.degree, rPr: italic() + fontSize(20) + fontFamily('Arial') },
        { text: `  ·  ${edu.year}`, rPr: fontSize(18) + fontFamily('Arial') + color('94A3B8') },
      ]));
    }
    parts.push(emptyPara());
  }

  // ── SKILLS ────────────────────────────────────────────────────────────
  if (resume.skillGroups.length > 0) {
    parts.push(headingPara('Technical Skills'));

    for (const sg of resume.skillGroups) {
      parts.push(multiRunPara([
        { text: `${sg.category}: `, rPr: bold() + fontSize(20) + fontFamily('Arial') },
        { text: sg.lines.join(', '), rPr: fontSize(20) + fontFamily('Arial') },
      ]));
    }
    parts.push(emptyPara());
  }

  // ── CERTIFICATIONS ────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    parts.push(headingPara('Certifications'));
    for (const cert of resume.certifications) {
      parts.push(bulletPara(cert));
    }
  }

  return parts.join('\n');
}

// ── OOXML file content builders ───────────────────────────────────────────────

function buildDocumentXml(resume: ResumeData): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${NS}
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${buildBody(resume)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="1080" w:bottom="720" w:left="1080"
               w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/numbering.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/settings.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`;

const WORD_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering"
    Target="numbering.xml"/>
  <Relationship Id="rId2"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings"
    Target="settings.xml"/>
</Relationships>`;

const SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings ${NS}>
  <w:defaultTabStop w:val="720"/>
  <w:compat/>
</w:settings>`;

// ── public export ─────────────────────────────────────────────────────────────

export function buildAtsSingleColumnDocx(resume: ResumeData): Blob {
  return createZipBlob({
    '[Content_Types].xml': CONTENT_TYPES_XML,
    '_rels/.rels': RELS_XML,
    'word/document.xml': buildDocumentXml(resume),
    'word/_rels/document.xml.rels': WORD_RELS_XML,
    'word/numbering.xml': NUMBERING_XML,
    'word/settings.xml': SETTINGS_XML,
  });
}
