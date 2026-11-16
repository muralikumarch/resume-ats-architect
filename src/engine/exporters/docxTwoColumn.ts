import type { ResumeData } from '../../types/resume';
import { createZipBlob, escapeXml } from './zipBuilder';

// ─── Canvas icon renderer ────────────────────────────────────────────────────
function renderDocxIconPng(type: string): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#142850';
  ctx.strokeStyle = '#142850';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'user') {
    ctx.beginPath(); ctx.arc(32, 18, 11, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(12, 56); ctx.quadraticCurveTo(12, 34, 32, 34);
    ctx.quadraticCurveTo(52, 34, 52, 56); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.moveTo(29, 36); ctx.lineTo(35, 36); ctx.lineTo(34, 52);
    ctx.lineTo(32, 55); ctx.lineTo(30, 52); ctx.closePath(); ctx.fill();
  } else if (type === 'briefcase') {
    ctx.strokeRect(22, 10, 20, 10); ctx.fillRect(8, 20, 48, 34);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(8, 34, 48, 3); ctx.fillRect(27, 31, 10, 8);
  } else if (type === 'graduation') {
    ctx.beginPath(); ctx.moveTo(4, 24); ctx.lineTo(32, 10); ctx.lineTo(60, 24);
    ctx.lineTo(32, 38); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(16, 32); ctx.lineTo(16, 48);
    ctx.quadraticCurveTo(32, 56, 48, 48); ctx.lineTo(48, 32); ctx.fill();
    ctx.beginPath(); ctx.moveTo(56, 26); ctx.lineTo(56, 46); ctx.stroke();
  } else if (type === 'cogs') {
    ctx.beginPath(); ctx.arc(32, 32, 14, 0, Math.PI * 2); ctx.fill();
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      ctx.lineWidth = 8; ctx.beginPath();
      ctx.moveTo(32 + Math.cos(ang) * 12, 32 + Math.sin(ang) * 12);
      ctx.lineTo(32 + Math.cos(ang) * 24, 32 + Math.sin(ang) * 24); ctx.stroke();
    }
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(32, 32, 7, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'award') {
    ctx.beginPath(); ctx.arc(32, 24, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(32, 24, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#142850';
    ctx.beginPath(); ctx.moveTo(22, 38); ctx.lineTo(16, 58); ctx.lineTo(26, 52);
    ctx.lineTo(30, 58); ctx.lineTo(32, 40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(42, 38); ctx.lineTo(48, 58); ctx.lineTo(38, 52);
    ctx.lineTo(34, 58); ctx.lineTo(32, 40); ctx.closePath(); ctx.fill();
  } else if (type === 'pin') {
    ctx.beginPath(); ctx.arc(32, 24, 16, Math.PI, 0, false);
    ctx.quadraticCurveTo(48, 42, 32, 58); ctx.quadraticCurveTo(16, 42, 16, 24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(32, 24, 6, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'phone') {
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(16, 14); ctx.lineTo(24, 24);
    ctx.quadraticCurveTo(28, 36, 40, 40); ctx.lineTo(50, 48); ctx.stroke();
  } else if (type === 'mail') {
    ctx.fillRect(8, 16, 48, 32); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(8, 16); ctx.lineTo(32, 34); ctx.lineTo(56, 16); ctx.stroke();
  } else if (type === 'linkedin') {
    ctx.fillRect(8, 8, 48, 48); ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif'; ctx.fillText('in', 16, 45);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function inlineIconDrawingXml(rId: string, idNum: number, sizeEmu = 104000): string {
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${sizeEmu}" cy="${sizeEmu}"/><wp:docPr id="${idNum}" name="Icon${idNum}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${idNum}" name="Icon${idNum}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${sizeEmu}" cy="${sizeEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
}

// ─── Main DOCX builder ───────────────────────────────────────────────────────
export function buildDocxFromResume(resume: ResumeData): Blob {
  const iconTypes = ['user','briefcase','graduation','cogs','award','pin','phone','mail','linkedin'];
  const mediaFiles: Record<string, Uint8Array> = {};
  iconTypes.forEach((t) => { mediaFiles[`word/media/${t}.png`] = renderDocxIconPng(t); });

  const h = resume.header;
  let docPrId = 10;
  const nextId = () => ++docPrId;

  const fontRun = (sz: number, bold = false, italic = false, color = '323232') =>
    `<w:rPr><w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans" w:cs="Noto Sans"/>${bold ? '<w:b/>' : ''}${italic ? '<w:i/>' : ''}<w:color w:val="${color}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;

  const sectionHeaderXml = (rId: string, title: string) => `
    <w:p>
      <w:pPr><w:spacing w:before="80" w:after="30" w:line="240" w:lineRule="auto"/>
        <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="142850"/></w:pBdr>
      </w:pPr>
      ${inlineIconDrawingXml(rId, nextId(), 108000)}
      <w:r><w:rPr><w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans" w:cs="Noto Sans"/>
        <w:b/><w:color w:val="142850"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>
        <w:t xml:space="preserve">  ${escapeXml(title.toUpperCase())}</w:t></w:r>
    </w:p>`;

  const jobsXml = resume.experience.map((job) => {
    const bulletsXml = job.bullets.map((b) => `
      <w:p>
        <w:pPr><w:spacing w:before="15" w:after="15" w:line="235" w:lineRule="auto"/>
          <w:ind w:left="170" w:hanging="110"/><w:jc w:val="both"/></w:pPr>
        <w:r>${fontRun(15)}<w:t xml:space="preserve">•  ${escapeXml(b)}</w:t></w:r>
      </w:p>`).join('');

    return `
      <w:p><w:pPr><w:spacing w:before="65" w:after="10" w:line="235" w:lineRule="auto"/>
        <w:tabs><w:tab w:val="right" w:pos="7420"/></w:tabs></w:pPr>
        <w:r>${fontRun(18, true, false, '323232')}<w:t>${escapeXml(job.role)}</w:t></w:r>
        <w:r><w:tab/></w:r>
        <w:r>${fontRun(16, true, false, '323232')}<w:t>${escapeXml(job.period)}</w:t></w:r>
      </w:p>
      <w:p><w:pPr><w:spacing w:before="0" w:after="20" w:line="230" w:lineRule="auto"/>
        <w:tabs><w:tab w:val="right" w:pos="7420"/></w:tabs></w:pPr>
        <w:r>${fontRun(15, true, false, '323232')}<w:t>${escapeXml(job.company)}</w:t></w:r>
        <w:r><w:tab/></w:r>
        <w:r>${fontRun(15, false, true, '323232')}<w:t>${escapeXml(job.location)}</w:t></w:r>
      </w:p>
      ${bulletsXml}`;
  }).join('');

  const eduXml = resume.education.map((ed) => `
    <w:p><w:pPr><w:spacing w:before="35" w:after="10" w:line="230" w:lineRule="auto"/></w:pPr>
      <w:r>${fontRun(15, true)}<w:t>${escapeXml(ed.degree)}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:spacing w:before="0" w:after="30" w:line="230" w:lineRule="auto"/></w:pPr>
      <w:r>${fontRun(15)}<w:t>${escapeXml(ed.school)}</w:t></w:r>
    </w:p>`).join('');

  const skillsXml = resume.skillGroups.map((sg) => {
    const linesXml = sg.lines.map((line) => `
      <w:p><w:pPr><w:spacing w:before="0" w:after="12" w:line="230" w:lineRule="auto"/></w:pPr>
        <w:r>${fontRun(14)}<w:t>${escapeXml(line)}</w:t></w:r>
      </w:p>`).join('');
    return `
      <w:p><w:pPr><w:spacing w:before="45" w:after="10" w:line="230" w:lineRule="auto"/></w:pPr>
        <w:r>${fontRun(16, true)}<w:t>${escapeXml(sg.category)}</w:t></w:r>
      </w:p>${linesXml}`;
  }).join('');

  const certsXml = resume.certifications.map((c) => `
    <w:p><w:pPr><w:spacing w:before="10" w:after="10" w:line="225" w:lineRule="auto"/>
      <w:ind w:left="140" w:hanging="100"/></w:pPr>
      <w:r>${fontRun(14)}<w:t xml:space="preserve">•  ${escapeXml(c)}</w:t></w:r>
    </w:p>`).join('');

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="30" w:line="240" w:lineRule="auto"/></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Noto Sans" w:hAnsi="Noto Sans" w:cs="Noto Sans"/>
        <w:b/><w:color w:val="142850"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr>
        <w:t>${escapeXml(h.name)}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="50" w:line="240" w:lineRule="auto"/></w:pPr>
      <w:r>${fontRun(20, true, false, '323232')}<w:t>${escapeXml(h.title)}</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="80" w:line="240" w:lineRule="auto"/></w:pPr>
      ${inlineIconDrawingXml('rIdPin', nextId(), 90000)}
      <w:r>${fontRun(16)}<w:t xml:space="preserve"> ${escapeXml(h.location)}   |   </w:t></w:r>
      ${inlineIconDrawingXml('rIdPhone', nextId(), 90000)}
      <w:r>${fontRun(16)}<w:t xml:space="preserve"> ${escapeXml(h.phone)}   |   </w:t></w:r>
      ${inlineIconDrawingXml('rIdMail', nextId(), 90000)}
      <w:r>${fontRun(16)}<w:t xml:space="preserve"> ${escapeXml(h.email)}   |   </w:t></w:r>
      ${inlineIconDrawingXml('rIdLinkedin', nextId(), 90000)}
      <w:hyperlink r:id="rIdLinkUrl">
        <w:r>${fontRun(16, false, false, '000000')}<w:t xml:space="preserve"> ${escapeXml(h.linkedin)}</w:t></w:r>
      </w:hyperlink>
    </w:p>
    <!-- TWO-COLUMN TABLE -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="10660" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/>
          <w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="7420"/><w:gridCol w:w="340"/><w:gridCol w:w="2900"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="7420" w:type="dxa"/></w:tcPr>
          ${sectionHeaderXml('rIdUser', 'Professional Summary')}
          <w:p><w:pPr><w:spacing w:before="20" w:after="40" w:line="235" w:lineRule="auto"/>
            <w:jc w:val="both"/></w:pPr>
            <w:r>${fontRun(15)}<w:t>${escapeXml(resume.summary)}</w:t></w:r>
          </w:p>
          ${sectionHeaderXml('rIdBriefcase', 'Professional Experience')}
          ${jobsXml}
        </w:tc>
        <w:tc><w:tcPr><w:tcW w:w="340" w:type="dxa"/></w:tcPr><w:p/></w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="2900" w:type="dxa"/></w:tcPr>
          ${sectionHeaderXml('rIdGrad', 'Education')}
          ${eduXml}
          ${sectionHeaderXml('rIdCogs', 'Skills & Technologies')}
          ${skillsXml}
          ${sectionHeaderXml('rIdAward', 'Certifications')}
          ${certsXml}
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="624" w:right="624" w:bottom="624" w:left="624" w:header="0" w:footer="0" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdUser" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/user.png"/>
  <Relationship Id="rIdBriefcase" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/briefcase.png"/>
  <Relationship Id="rIdGrad" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/graduation.png"/>
  <Relationship Id="rIdCogs" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/cogs.png"/>
  <Relationship Id="rIdAward" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/award.png"/>
  <Relationship Id="rIdPin" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/pin.png"/>
  <Relationship Id="rIdPhone" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/phone.png"/>
  <Relationship Id="rIdMail" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/mail.png"/>
  <Relationship Id="rIdLinkedin" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/linkedin.png"/>
  <Relationship Id="rIdLinkUrl" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(h.linkedinUrl)}" TargetMode="External"/>
</Relationships>`;

  return createZipBlob({
    '[Content_Types].xml': contentTypesXml,
    '_rels/.rels': rootRelsXml,
    'word/document.xml': documentXml,
    'word/_rels/document.xml.rels': docRelsXml,
    ...mediaFiles,
  });
}

