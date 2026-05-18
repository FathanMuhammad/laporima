import React, { useState } from 'react';
import { KECAMATAN, STATUS, STATUS_COLORS, fmtTanggal } from '../data/constants';

function DaftarAduan({ store, currentUser, openTicket }) {
  const defaultKec = (currentUser.peran === 'pic' || currentUser.peran === 'pj_kecamatan') ? currentUser.kecamatan : '';
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterKec, setFilterKec] = useState(defaultKec);

  const filtered = store.tickets.filter(t => {
    if (search && !`${t.judul} ${t.deskripsi} ${t.nomor} ${t.pelapor.nama}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterKategori && t.kategori !== filterKategori) return false;
    if (filterKec && t.kecamatan !== filterKec) return false;
    return true;
  }).sort((a,b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk));

  const lockKecamatan = (currentUser.peran === 'pic' || currentUser.peran === 'pj_kecamatan');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Aduan</h1>
        <span className="text-sm text-slate-500">{filtered.length} dari {store.tickets.length} tiket</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="text" placeholder="Cari nomor / judul / pelapor..." value={search} onChange={e=>setSearch(e.target.value)}
          className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="">Semua Status</option>
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterKec} onChange={e=>setFilterKec(e.target.value)} disabled={lockKecamatan} title={lockKecamatan ? `Anda hanya melihat ${currentUser.kecamatan}` : ''} className="px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
          <option value="">Semua Kecamatan</option>
          {KECAMATAN.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs uppercase font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
          <div className="col-span-2">Nomor</div>
          <div className="col-span-4">Judul</div>
          <div className="col-span-2">Lokasi</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Tanggal</div>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 && <div className="p-8 text-center text-slate-500">Tidak ada tiket yang cocok dengan filter.</div>}
          {filtered.map(t => {
            const overSla = !['Selesai','Ditutup'].includes(t.status) && new Date(t.sla_target) < new Date();
            return (
              <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 hover:bg-slate-50 items-center">
                <div className="md:col-span-2 text-xs font-mono text-slate-500">{t.nomor}</div>
                <div className="md:col-span-4">
                  <div className="font-medium text-slate-800">{t.judul}</div>
                  <div className="text-xs text-slate-500">{t.pelapor.nama} · {t.kanal}</div>
                </div>
                <div className="md:col-span-2 text-sm text-slate-600">{t.kecamatan}<br/><span className="text-xs text-slate-500">{t.kelurahan}</span></div>
                <div className="md:col-span-2 flex flex-wrap gap-1">
                  <span className={`pill ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  {overSla && <span className="pill bg-rose-600 text-white">Lewat SLA</span>}
                </div>
                <div className="md:col-span-2 text-xs text-slate-500">{fmtTanggal(t.tanggal_masuk)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DaftarAduan;
