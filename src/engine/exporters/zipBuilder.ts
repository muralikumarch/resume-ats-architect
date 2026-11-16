// CRC32 + OOXML ZIP builder — shared by all DOCX exporters

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function crc32Bytes(uint8: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < uint8.length; i++) {
    crc = CRC32_TABLE[(crc ^ uint8[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createZipBlob(
  filesMap: Record<string, string | Uint8Array>,
  mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
): Blob {
  const encoder = new TextEncoder();

  interface ZipEntry {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    localOffset: number;
  }

  const entries: ZipEntry[] = Object.entries(filesMap).map(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const dataBytes = content instanceof Uint8Array ? content : encoder.encode(content);
    const crc = crc32Bytes(dataBytes);
    return { nameBytes, dataBytes, crc, localOffset: 0 };
  });

  let localTotal = 0;
  let centralTotal = 0;
  entries.forEach((e) => {
    localTotal += 30 + e.nameBytes.length + e.dataBytes.length;
    centralTotal += 46 + e.nameBytes.length;
  });

  const totalSize = localTotal + centralTotal + 22;
  const buf = new Uint8Array(totalSize);
  const view = new DataView(buf.buffer);

  let offset = 0;
  entries.forEach((e) => {
    e.localOffset = offset;
    view.setUint32(offset, 0x04034b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 0x0800, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint32(offset + 14, e.crc, true);
    view.setUint32(offset + 18, e.dataBytes.length, true);
    view.setUint32(offset + 22, e.dataBytes.length, true);
    view.setUint16(offset + 26, e.nameBytes.length, true);
    view.setUint16(offset + 28, 0, true);
    buf.set(e.nameBytes, offset + 30);
    buf.set(e.dataBytes, offset + 30 + e.nameBytes.length);
    offset += 30 + e.nameBytes.length + e.dataBytes.length;
  });

  const centralDirOffset = offset;
  entries.forEach((e) => {
    view.setUint32(offset, 0x02014b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 20, true);
    view.setUint16(offset + 8, 0x0800, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint16(offset + 14, 0, true);
    view.setUint32(offset + 16, e.crc, true);
    view.setUint32(offset + 20, e.dataBytes.length, true);
    view.setUint32(offset + 24, e.dataBytes.length, true);
    view.setUint16(offset + 28, e.nameBytes.length, true);
    view.setUint16(offset + 30, 0, true);
    view.setUint16(offset + 32, 0, true);
    view.setUint16(offset + 34, 0, true);
    view.setUint16(offset + 36, 0, true);
    view.setUint32(offset + 38, 0, true);
    view.setUint32(offset + 42, e.localOffset, true);
    buf.set(e.nameBytes, offset + 46);
    offset += 46 + e.nameBytes.length;
  });

  const centralDirSize = offset - centralDirOffset;
  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 4, 0, true);
  view.setUint16(offset + 6, 0, true);
  view.setUint16(offset + 8, entries.length, true);
  view.setUint16(offset + 10, entries.length, true);
  view.setUint32(offset + 12, centralDirSize, true);
  view.setUint32(offset + 16, centralDirOffset, true);
  view.setUint16(offset + 20, 0, true);

  return new Blob([buf], { type: mimeType });
}

export function escapeXml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

