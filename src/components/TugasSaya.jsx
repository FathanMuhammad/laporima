import React, { useState } from 'react';
import { USERS, STATUS_COLORS, PRIORITAS_COLORS, fmtTanggal } from '../data/constants';

function TugasSaya({ store, currentUser, openTicket }) {
  const tickets = store.tickets.filter(t => {
    if (currentUser.peran === 'pic') return t.assignee === currentUser.id || (t.kecamatan === currentUser.kecamatan && t.status !== 'SELESAI');
    if (currentUser.peran === 'pj_kecamatan') return t.kecamatan === currentUser.kecamatan && t.status !== 'SELESAI';
    if (currentUser.peran === 'admin_kantor') return ['SURAT MASUK', 'DISURVEY', ''].includes(t.status);
    if (currentUser.peran === 'lo_dinas') return t.status === 'PENGERJAAN';
    return false;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const paginatedTickets = tickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }
    return pages.filter((p, i, arr) => p !== '...' || arr[i-1] !== '...');
  };
  
  const desc = {
    pic: `Tiket aktif di area ${currentUser.kecamatan}`,
    pj_kecamatan: `Tiket aktif di Kecamatan ${currentUser.kecamatan} yang Anda awasi`,
    admin_kantor: 'Tiket yang menunggu triase atau penugasan',
    lo_dinas: 'Tiket yang sudah diteruskan ke OPD untuk follow-up',
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tugas Saya</h1>
        <p className="text-slate-600 text-sm">{desc[currentUser.peran]}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {paginatedTickets.length === 0 && <div className="p-8 text-center text-slate-500">Tidak ada tugas aktif saat ini. 🎉</div>}
          {paginatedTickets.map(t => (
            <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left p-4 hover:bg-slate-50 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-slate-500">{t.nomor}</span>
                  <span className={`pill ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-500'}`}>{t.status || 'KOSONG'}</span>
                  <span className={`pill ${PRIORITAS_COLORS[t.prioritas]}`}>{t.prioritas}</span>
                  {t.assignee && <span className="pill bg-slate-100 text-slate-600">→ {USERS.find(u=>u.id===t.assignee)?.nama}</span>}
                </div>
                <div className="font-medium text-slate-800">{t.judul}</div>
                <div className="text-xs text-slate-500">{t.kecamatan} · {t.kelurahan} · {fmtTanggal(t.tanggal_masuk)}</div>
              </div>
              <div className="text-slate-400">›</div>
            </button>
          ))}
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

export default TugasSaya;
