import React, { useState, useEffect } from 'react';
import { KECAMATAN, STATUS, STATUS_COLORS, fmtTanggal } from '../data/constants';

function DaftarAduan({ store, update, currentUser, openTicket, refresh, isRefreshing }) {
  const defaultKec = (currentUser.peran === 'pic' || currentUser.peran === 'pj_kecamatan') ? currentUser.kecamatan : '';
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterKec, setFilterKec] = useState(defaultKec);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setFilterKec(defaultKec);
    setCurrentPage(1);
  }, [currentUser, defaultKec]);
  const itemsPerPage = 100;

  const filtered = store.tickets.filter(t => {
    if (search && !`${t.judul} ${t.deskripsi} ${t.nomor} ${t.pelapor.nama}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterKategori && t.kategori !== filterKategori) return false;
    if (filterKec && t.kecamatan !== filterKec) return false;
    return true;
  }).sort((a, b) => {
    const noA = parseInt(a.nomor.split('-')[1] || 0);
    const noB = parseInt(b.nomor.split('-')[1] || 0);
    return noB - noA;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTickets = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }
    return pages.filter((p, i, arr) => p !== '...' || arr[i - 1] !== '...');
  };

  const lockKecamatan = (currentUser.peran === 'pic' || currentUser.peran === 'pj_kecamatan');

  const handleStatusChange = (e, ticketId) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      tt.status = newStatus;
      const desc = newStatus ? `Status diubah menjadi ${newStatus}` : 'Status dikosongkan';
      tt.timeline.push({ id: `a-${Date.now()}`, tipe: 'status_change', user: currentUser.id, desc, ts: new Date().toISOString(), status: newStatus });
      if (newStatus === 'SELESAI') {
        tt.tanggal_selesai = new Date().toISOString();
      } else {
        tt.tanggal_selesai = null;
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Daftar Aduan</h1>
        <div className="flex items-center gap-2">
          {refresh && (
            <button
              onClick={refresh}
              disabled={isRefreshing}
              title="Refresh data dari Google Sheets"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition text-xs font-semibold disabled:opacity-60"
            >
              {isRefreshing ? 'Memuat...' : 'Refresh'}
            </button>
          )}
          <span className="text-sm text-slate-500">{filtered.length} dari {store.tickets.length} tiket</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="text" placeholder="Cari nomor / judul / pelapor..." value={search} onChange={e => setSearch(e.target.value)}
          className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
          <option value="">Semua Status</option>
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterKec} onChange={e => setFilterKec(e.target.value)} disabled={lockKecamatan} title={lockKecamatan ? `Anda hanya melihat ${currentUser.kecamatan}` : ''} className="px-3 py-2 border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
          <option value="">Semua Kecamatan</option>
          {KECAMATAN.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-xs uppercase font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
          <div className="col-span-1">Nomor</div>
          <div className="col-span-2">Nama</div>
          <div className="col-span-3">Judul</div>
          <div className="col-span-2">Lokasi</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Tanggal</div>
        </div>
        <div className={`divide-y divide-slate-100 transition-all duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none scale-[0.99] blur-[0.5px]' : 'opacity-100 scale-100'}`}>
          {paginatedTickets.length === 0 && <div className="p-8 text-center text-slate-500">Tidak ada tiket yang cocok dengan filter.</div>}
          {paginatedTickets.map(t => {
            const overSla = t.status !== 'SELESAI' && new Date(t.sla_target) < new Date();
            return (
              <div key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 hover:bg-slate-50 items-center cursor-pointer">
                <div className="md:col-span-1 text-xs font-mono text-slate-500">{t.nomor}</div>
                <div className="md:col-span-2 font-medium text-slate-800 truncate">{t.pelapor.nama}</div>
                <div className="md:col-span-3">
                  <div className="font-medium text-slate-800 line-clamp-1">{t.judul}</div>
                  <div className="text-xs text-slate-500">{t.kanal}</div>
                </div>
                <div className="md:col-span-2 text-sm text-slate-600">{t.kecamatan}<br /><span className="text-xs text-slate-500">{t.kelurahan}</span></div>
                <div className="md:col-span-2 flex flex-col gap-1 items-start">
                  <span className={`pill ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-500'}`}>{t.status || 'KOSONG'}</span>
                  <select
                    value={t.status || ''}
                    onChange={(e) => handleStatusChange(e, t.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 text-xs px-2 py-1 border border-slate-200 rounded bg-white text-slate-700 font-medium"
                  >
                    <option value="" disabled hidden>Ubah...</option>
                    <option value="">- Kosongkan -</option>
                    {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {overSla && <span className="pill bg-rose-600 text-white mt-1">Lewat SLA</span>}
                </div>
                <div className="md:col-span-2 text-xs text-slate-500">{fmtTanggal(t.tanggal_masuk)}</div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Menampilkan halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                ‹
              </button>
              {generatePageNumbers().map((p, i) => (
                p === '...' ? <span key={i} className="px-2 text-slate-400">...</span> :
                  <button
                    key={i}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded border text-sm transition-colors ${currentPage === p ? 'bg-rose-600 text-white border-rose-600 font-semibold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DaftarAduan;
