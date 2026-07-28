import { generateSampleData } from '../data/sampleData';

// REPLACE THIS with your actual Google Apps Script Web App URL after deployment
const GAS_URL = import.meta.env.VITE_GAS_URL || '';

const KEY = 'laporima_v2';

// ----------------------------------------------------
// MAPPERS
// ----------------------------------------------------

export function inferKategori(bantuanText) {
  if (!bantuanText) return 'lain';
  const lower = bantuanText.toLowerCase();

  const map = {
    'inf_jalan': ['aspal', 'beton', 'jalan', 'speedbump', 'polisi tidur', 'pju', 'lampu jalan', 'tiang listrik'],
    'inf_dren': ['saluran', 'u-ditch', 'drainase', 'selokan', 'waduk', 'lumpur', 'sampah', 'sheet pile', 'air bersih', 'pam jaya', 'penurapan', 'pengerukan'],
    'lng_smph': ['sampah', 'gerobak sampah', 'kontainer sampah', 'fogging', 'pohon', 'penopingan'],
    'kes_bpjs': ['kursi roda', 'tongkat', 'alat bantu dengar', 'kacamata', 'pampers', 'susu anak', 'oksigen', 'stunting', 'bpjs', 'vitamin', 'kesehatan', 'rumah sakit', 'meninggal', 'kematian'],
    'sos_bsn': ['air minum', 'aqua', 'pemakaman', 'ambulance', 'jenazah', 'kebakaran', 'pangan', 'sembako', 'ijazah', 'kjp', 'akta', 'kia', 'renovasi', 'bedah rumah', 'panti'],
    'lain': ['speaker', 'tenis meja', 'olahraga', 'musik', 'hadroh', 'rebana', 'kursi plastik', 'karpet']
  };

  for (const [katId, kws] of Object.entries(map)) {
    if (kws.some(kw => lower.includes(kw))) {
      return katId;
    }
  }
  return 'lain';
}

function mapRowToTicket(row) {
  let extra = {};
  if (row.EXTRA_DATA) {
    try {
      extra = JSON.parse(row.EXTRA_DATA);
    } catch (e) {
      console.warn("Could not parse EXTRA_DATA for ticket", row.NO);
    }
  }

  // Format status
  let status = row.STATUS ? row.STATUS.toUpperCase() : '';

  // Special rule from prompt: if "meninggal" or "kematian" is present, it's categorized as Air Mineral (Sosial)
  const bantuanText = row.BANTUAN || '';
  let finalKategori = inferKategori(bantuanText);
  if (bantuanText.toLowerCase().includes('meninggal') || bantuanText.toLowerCase().includes('kematian')) {
    finalKategori = 'sos_bsn';
  }

  return {
    id: `t${row.NO}`,
    nomor: `LI-${row.NO}`,
    judul: row.BANTUAN || row['SURAT MASUK'] || 'Aduan Tanpa Judul',
    deskripsi: row['SURAT MASUK'] || '',
    kategori: finalKategori,
    kecamatan: row.KECAMATAN || '',
    kelurahan: row.KELURAHAN || '',
    alamat: row.ALAMAT || '',
    rt: row.RT || '',
    rw: row.RW || '',
    pelapor: {
      nama: row.NAMA || 'Anonim',
      hp: row.TELP || ''
    },
    kanal: 'Google Sheet',
    status: status,
    prioritas: 'Sedang',
    flag_pigura: extra.flag_pigura || false,
    koordinat: extra.koordinat || null,
    tanggal_masuk: extra.tanggal_masuk || new Date().toISOString(),
    sla_target: extra.sla_target || new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    tanggal_selesai: status === 'SELESAI' ? (extra.tanggal_selesai || new Date().toISOString()) : null,
    assignee: row.DINAS || extra.assignee || null,
    pencatat: extra.pencatat || 'admin',
    timeline: extra.timeline || [],
    poinList: extra.poinList || [],
    sosmed: extra.sosmed || null,
    pigura: extra.pigura || null,
    lampiran: extra.lampiran || []
  };
}

function mapTicketToRow(ticket) {
  const rowNo = ticket.id.replace('t', ''); // Assuming id is 't123'

  const extra = {
    flag_pigura: ticket.flag_pigura,
    koordinat: ticket.koordinat,
    tanggal_masuk: ticket.tanggal_masuk,
    sla_target: ticket.sla_target,
    tanggal_selesai: ticket.tanggal_selesai,
    assignee: ticket.assignee, // The UI allows assigning PICs, which we store in EXTRA
    pencatat: ticket.pencatat,
    timeline: ticket.timeline,
    poinList: ticket.poinList,
    sosmed: ticket.sosmed,
    pigura: ticket.pigura,
    lampiran: ticket.lampiran
  };

  return {
    NO: rowNo,
    NAMA: ticket.pelapor.nama,
    'SURAT MASUK': ticket.deskripsi,
    ALAMAT: ticket.alamat,
    RT: ticket.rt || '',
    RW: ticket.rw || '',
    KELURAHAN: ticket.kelurahan,
    KECAMATAN: ticket.kecamatan,
    TELP: ticket.pelapor.hp,
    BANTUAN: ticket.judul,
    DINAS: ticket.assignee || '', 
    STATUS: ticket.status.toUpperCase(),
    EXTRA_DATA: JSON.stringify(extra)
  };
}

// ----------------------------------------------------
// SERVICES
// ----------------------------------------------------

export const loadStore = async () => {
  if (GAS_URL) {
    try {
      // Add cache-busting timestamp to prevent Google Apps Script from returning cached data
      const cacheBuster = `t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;
      const separator = GAS_URL.includes('?') ? '&' : '?';
      
      // Removed custom headers (Cache-Control, Pragma) because they trigger 
      // CORS preflight (OPTIONS) requests which Google Apps Script blocks.
      // The cacheBuster URL parameter is enough to prevent caching.
      const response = await fetch(`${GAS_URL}${separator}action=get&${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      let tickets = (data.tickets || []).map(mapRowToTicket);
      
      // Sort so newest (highest NO) is first
      tickets = tickets.sort((a, b) => {
        const numA = parseInt(a.id.replace('t', ''), 10) || 0;
        const numB = parseInt(b.id.replace('t', ''), 10) || 0;
        return numB - numA;
      });

      let maxNo = 0;
      tickets.forEach(t => {
        const no = parseInt(t.id.replace('t', ''), 10);
        if (!isNaN(no) && no > maxNo) {
          maxNo = no;
        }
      });

      return {
        tickets: tickets,
        counter: maxNo + 1,
        currentUserId: data.currentUserId || 'ima',
        botMessages: data.botMessages || []
      };
    } catch (e) {
      console.error('Failed to load from Google Sheets:', e);
      return getLocalStore();
    }
  } else {
    return getLocalStore();
  }
};

export const updateSingleTicket = async (ticket) => {
  if (GAS_URL) {
    try {
      const rowData = mapTicketToRow(ticket);
      const response = await fetch(`${GAS_URL}`, {
        method: 'POST',
        redirect: 'follow', // GAS redirects POST requests
        body: JSON.stringify({ action: 'update', ticket: rowData }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        console.error('Server returned error:', result.error);
      } else {
        console.log(`Successfully synced ticket ${ticket.id} to Google Sheets`);
      }
    } catch (e) {
      console.error('Failed to update ticket to Google Sheets:', e);
    }
  }
};

export const saveStore = async (store) => {
  // Always save to localStorage as a local cache/backup
  setLocalStore(store);
};

function getLocalStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || generateSampleData();
  } catch {
    return generateSampleData();
  }
}

function setLocalStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}
