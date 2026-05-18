export const KECAMATAN = ['Kebon Jeruk','Grogol Petamburan','Tamansari','Kembangan','Palmerah'];

export const KELURAHAN_BY_KEC = {
  'Kebon Jeruk':       ['Kebon Jeruk','Duri Kepa','Kedoya Utara','Kedoya Selatan','Sukabumi Utara','Sukabumi Selatan','Kelapa Dua'],
  'Grogol Petamburan': ['Grogol','Tomang','Jelambar','Jelambar Baru','Wijaya Kusuma','Tanjung Duren Utara','Tanjung Duren Selatan'],
  'Tamansari':         ['Pinangsia','Glodok','Keagungan','Krukut','Maphar','Tangki','Mangga Besar','Taman Sari'],
  'Kembangan':         ['Kembangan Utara','Kembangan Selatan','Joglo','Srengseng','Meruya Utara','Meruya Selatan'],
  'Palmerah':          ['Palmerah','Slipi','Kemanggisan','Jatipulo','Kota Bambu Utara','Kota Bambu Selatan'],
};

export const KATEGORI = [
  { id:'inf_jalan', nama:'Infrastruktur · Jalan',     sla:14, multiplier:1.0 },
  { id:'inf_pju',   nama:'Infrastruktur · PJU',       sla:7,  multiplier:1.0 },
  { id:'inf_dren',  nama:'Infrastruktur · Drainase',  sla:14, multiplier:1.0 },
  { id:'lng_smph',  nama:'Lingkungan · Sampah',       sla:7,  multiplier:1.0 },
  { id:'lng_banj',  nama:'Lingkungan · Banjir',       sla:3,  multiplier:1.5 },
  { id:'adm_ktp',   nama:'Adminduk · KTP/KK',         sla:7,  multiplier:1.0 },
  { id:'pend_kjp',  nama:'Pendidikan · KJP/PPDB',     sla:14, multiplier:1.0 },
  { id:'kes_bpjs',  nama:'Kesehatan · BPJS/Puskesmas',sla:7,  multiplier:1.2 },
  { id:'sos_bsn',   nama:'Sosial · Bansos',           sla:14, multiplier:1.0 },
  { id:'lain',      nama:'Lain-lain',                 sla:14, multiplier:1.0 },
];


export const STATUS = ['Baru','Triase','Verifikasi Lapangan','Diteruskan ke Dinas','Selesai','Ditutup'];

export const STATUS_COLORS = {
  'Baru': 'bg-slate-100 text-slate-700',
  'Triase': 'bg-blue-100 text-blue-700',
  'Verifikasi Lapangan': 'bg-amber-100 text-amber-700',
  'Diteruskan ke Dinas': 'bg-orange-100 text-orange-700',
  'Selesai': 'bg-emerald-100 text-emerald-700',
  'Ditutup': 'bg-slate-300 text-slate-800',
};

export const PRIORITAS = ['Rendah','Sedang','Tinggi','Kritis'];

export const PRIORITAS_COLORS = {
  'Rendah':'bg-slate-100 text-slate-600',
  'Sedang':'bg-sky-100 text-sky-700',
  'Tinggi':'bg-orange-100 text-orange-700',
  'Kritis':'bg-rose-100 text-rose-700',
};

export const USERS = [
  // Office tier
  { id:'ima',   nama:'Ima Mahdiah',  peran:'owner',         label:'Owner · DPRD',          color:'bg-rose-100 text-rose-700',     nomor_wa:'08118055155' },
  { id:'koor',  nama:'Mbak Lia',     peran:'koordinator',   label:'Koordinator Tim',       color:'bg-sky-100 text-sky-700',       nomor_wa:'08123456001' },
  { id:'rina',  nama:'Rina',         peran:'admin_kantor',  label:'Admin Kantor',          color:'bg-emerald-100 text-emerald-700', nomor_wa:'08123456002' },
  { id:'sari',  nama:'Sari',         peran:'sosmed',        label:'Tim Media Sosial',      color:'bg-pink-100 text-pink-700',     nomor_wa:'08123456003' },

  // Field tier — PJ Kecamatan
  { id:'pjkj',  nama:'Pak Hadi',     peran:'pj_kecamatan',  label:'PJ · Kebon Jeruk',          color:'bg-indigo-100 text-indigo-700', kecamatan:'Kebon Jeruk',         nomor_wa:'081234560011' },
  { id:'pjgp',  nama:'Bu Sinta',     peran:'pj_kecamatan',  label:'PJ · Grogol Petamburan',    color:'bg-indigo-100 text-indigo-700', kecamatan:'Grogol Petamburan',   nomor_wa:'081234560012' },
  { id:'pjts',  nama:'Pak Eko',      peran:'pj_kecamatan',  label:'PJ · Tamansari',            color:'bg-indigo-100 text-indigo-700', kecamatan:'Tamansari',           nomor_wa:'081234560013' },
  { id:'pjkb',  nama:'Bu Lina',      peran:'pj_kecamatan',  label:'PJ · Kembangan',            color:'bg-indigo-100 text-indigo-700', kecamatan:'Kembangan',           nomor_wa:'081234560014' },
  { id:'pjpl',  nama:'Pak Asep',     peran:'pj_kecamatan',  label:'PJ · Palmerah',             color:'bg-indigo-100 text-indigo-700', kecamatan:'Palmerah',            nomor_wa:'081234560015' },

  // Field tier — Tim Lapangan / PIC
  { id:'budi',  nama:'Pak Budi',     peran:'pic',           label:'PIC · Kebon Jeruk',         color:'bg-amber-100 text-amber-700',   kecamatan:'Kebon Jeruk',         nomor_wa:'081234567101' },
  { id:'andi',  nama:'Andi',         peran:'pic',           label:'PIC · Grogol Petamburan',   color:'bg-amber-100 text-amber-700',   kecamatan:'Grogol Petamburan',   nomor_wa:'081234567102' },
  { id:'wati',  nama:'Wati',         peran:'pic',           label:'PIC · Tamansari',           color:'bg-amber-100 text-amber-700',   kecamatan:'Tamansari',           nomor_wa:'081234567103' },
  { id:'tono',  nama:'Tono',         peran:'pic',           label:'PIC · Kembangan',           color:'bg-amber-100 text-amber-700',   kecamatan:'Kembangan',           nomor_wa:'081234567104' },
  { id:'yuli',  nama:'Yuli',         peran:'pic',           label:'PIC · Palmerah',            color:'bg-amber-100 text-amber-700',   kecamatan:'Palmerah',            nomor_wa:'081234567105' },

  // Specialized roles
  { id:'joko',  nama:'Joko',         peran:'lo_dinas',      label:'LO Dinas',              color:'bg-orange-100 text-orange-700',  nomor_wa:'08123456201' },
  { id:'bagus', nama:'Bagus',        peran:'pigura',        label:'Tim Logistik / Pigura', color:'bg-violet-100 text-violet-700',  nomor_wa:'08123456202' },
  { id:'admin', nama:'Super Admin',  peran:'super_admin',   label:'Super Admin (Teknis)',  color:'bg-slate-200 text-slate-700',    nomor_wa:'08123456999' },
];

export const OFFICE_TIER  = ['owner','koordinator','admin_kantor','sosmed','super_admin'];
export const FIELD_TIER   = ['pic','pj_kecamatan','lo_dinas'];
export const PIGURA_TIER  = ['pigura'];

export const isOffice = (peran) => OFFICE_TIER.includes(peran);
export const isField  = (peran) => FIELD_TIER.includes(peran);
export const canSeeSosmed  = (peran) => ['owner','koordinator','admin_kantor','sosmed','super_admin'].includes(peran);
export const canSeePigura  = (peran) => ['owner','koordinator','admin_kantor','pigura','super_admin'].includes(peran);

export const fmtTanggal = (d) => new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
export const fmtTanggalJam = (d) => new Date(d).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
