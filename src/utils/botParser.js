import { KELURAHAN_BY_KEC } from '../data/constants';

export function parseWaMessage(body, sender) {
  const text = body.trim();
  const lower = text.toLowerCase();

  // STATUS query
  const statusMatch = text.match(/(?:#status|\/status|status)\s+(LI-\d{4}-\d{4})/i);
  if (statusMatch) {
    return { type:'status_query', ticketNomor: statusMatch[1].toUpperCase() };
  }

  // UPDATE
  if (/^(#update|\/update|update)\s+LI-\d{4}-\d{4}/i.test(text)) {
    const ticketMatch = text.match(/LI-\d{4}-\d{4}/i);
    const isSelesai = /\b(selesai|done|beres|tuntas|kelar)\b/i.test(text);
    return { type:'update', ticketNomor: ticketMatch?.[0].toUpperCase(), isSelesai, note: text };
  }

  // INTAKE (lapor)
  if (/^(#lapor|\/lapor|lapor[:\s])/i.test(text)) {
    const content = text.replace(/^(#lapor|\/lapor|lapor[:\s])\s*/i, '').trim();

    // Detect kelurahan / kecamatan
    let kelurahan = null, kecamatan = sender?.kecamatan || null;
    for (const kec of Object.keys(KELURAHAN_BY_KEC)) {
      for (const kel of KELURAHAN_BY_KEC[kec]) {
        if (lower.includes(kel.toLowerCase())) { kelurahan = kel; kecamatan = kec; break; }
      }
      if (kelurahan) break;
    }
    if (!kelurahan && kecamatan) {
      kelurahan = KELURAHAN_BY_KEC[kecamatan][0];
    }
    if (!kecamatan) { kecamatan = 'Kebon Jeruk'; kelurahan = KELURAHAN_BY_KEC[kecamatan][0]; }

    // Detect kategori by keywords
    const keywordMap = {
      'inf_pju':   ['lampu','pju','penerangan','lampu jalan'],
      'inf_jalan': ['jalan','aspal','bolong','lubang','trotoar','jembatan'],
      'inf_dren':  ['drainase','got','saluran','gorong'],
      'lng_smph':  ['sampah','tps','kebersihan'],
      'lng_banj':  ['banjir','genangan','air masuk','rob'],
      'adm_ktp':   ['ktp','kk','adminduk','akta','dukcapil'],
      'pend_kjp':  ['kjp','ppdb','sekolah','pendidikan'],
      'kes_bpjs':  ['bpjs','puskesmas','rumah sakit','kesehatan','jkn'],
      'sos_bsn':   ['bansos','bantuan sosial','sembako'],
    };
    let kategori = 'lain';
    for (const [katId, kws] of Object.entries(keywordMap)) {
      if (kws.some(kw => lower.includes(kw))) { kategori = katId; break; }
    }

    // Prioritas heuristic
    let prioritas = 'Sedang';
    if (/\b(banjir|darurat|kritis|urgent|bahaya|mendesak|roboh)\b/i.test(text)) prioritas = 'Tinggi';
    if (/\b(banjir besar|kritis sekali|bencana)\b/i.test(text)) prioritas = 'Kritis';

    const lines = content.split('\n').filter(Boolean);
    const judul = (lines[0] || content).substring(0, 80);

    return { type:'intake', judul, deskripsi: content, kategori, kecamatan, kelurahan, prioritas };
  }

  // MENU / HELP
  if (/^(menu|help|bantuan|panduan|\?)$/i.test(text)) return { type:'menu' };

  return { type:'unknown' };
}
