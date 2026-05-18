import { KATEGORI, STATUS } from '../data/constants';

// This will generate sample data if no Google Sheet URL is set yet
export function generateSampleData() {
  const now = new Date();
  const seed = [
    ['Lampu PJU mati 3 titik di RT 04','inf_pju','Kebon Jeruk','Duri Kepa','WA','Selesai',-45,'Tinggi'],
    ['Jalan berlubang depan SDN 02 Tomang','inf_jalan','Grogol Petamburan','Tomang','PIC','Diteruskan ke Dinas',-30,'Sedang'],
    ['Sampah menumpuk di TPS Slipi','lng_smph','Palmerah','Slipi','WA','Verifikasi Lapangan',-2,'Sedang'],
    ['Saluran air mampet, banjir saat hujan','inf_dren','Tamansari','Krukut','WA','Diteruskan ke Dinas',-12,'Tinggi']
  ];

  const picByKec = {
    'Kebon Jeruk':'budi',
    'Grogol Petamburan':'andi',
    'Tamansari':'wati',
    'Kembangan':'tono',
    'Palmerah':'yuli',
  };

  const tickets = seed.map((s, i) => {
    const [judul, kategori, kec, kel, kanal, status, dayOffset, prio] = s;
    const created = new Date(now); created.setDate(now.getDate() + dayOffset);
    const kat = KATEGORI.find(k=>k.id===kategori);
    const slaTarget = new Date(created); slaTarget.setDate(created.getDate() + kat.sla);
    const assignee = (status !== 'Baru' && status !== 'Triase') ? picByKec[kec] : null;

    return {
      id: `t${(i+1).toString().padStart(4,'0')}`,
      nomor: `LI-2026-${(i+1).toString().padStart(4,'0')}`,
      judul, kategori, deskripsi: `${judul}. Aduan dari warga ${kel} memerlukan tindak lanjut.`,
      kecamatan: kec, kelurahan: kel,
      alamat: `Jl. ${kel} Raya, RT 01/RW 01`,
      pelapor: { nama: 'Warga', hp: '08123456789' },
      kanal, status, prioritas: prio,
      flag_pigura: false, koordinat: null,
      tanggal_masuk: created.toISOString(),
      sla_target: slaTarget.toISOString(),
      tanggal_selesai: (status === 'Selesai' || status === 'Ditutup') ? new Date().toISOString() : null,
      assignee, pencatat: 'rina',
      timeline: [], poinList: [], sosmed: null, pigura: null, lampiran: [],
    };
  });

  return { tickets, currentUserId: 'koor', counter: tickets.length + 1 };
}
