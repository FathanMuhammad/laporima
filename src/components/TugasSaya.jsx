import React from 'react';
import { USERS, STATUS_COLORS, PRIORITAS_COLORS, fmtTanggal } from '../data/constants';

function TugasSaya({ store, currentUser, openTicket }) {
  const tickets = store.tickets.filter(t => {
    if (currentUser.peran === 'pic') return t.assignee === currentUser.id || (t.kecamatan === currentUser.kecamatan && !['Selesai','Ditutup'].includes(t.status));
    if (currentUser.peran === 'pj_kecamatan') return t.kecamatan === currentUser.kecamatan && !['Selesai','Ditutup'].includes(t.status);
    if (currentUser.peran === 'koordinator' || currentUser.peran === 'admin_kantor') return ['Baru','Triase'].includes(t.status);
    if (currentUser.peran === 'lo_dinas') return t.status === 'Diteruskan ke Dinas';
    return false;
  });
  
  const desc = {
    pic: `Tiket aktif di area ${currentUser.kecamatan}`,
    pj_kecamatan: `Tiket aktif di Kecamatan ${currentUser.kecamatan} yang Anda awasi`,
    koordinator: 'Tiket yang menunggu triase atau penugasan',
    admin_kantor: 'Tiket yang menunggu triase atau penugasan',
    lo_dinas: 'Tiket yang sudah diteruskan ke OPD untuk follow-up',
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tugas Saya</h1>
        <p className="text-slate-600 text-sm">{desc[currentUser.peran]}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {tickets.length === 0 && <div className="p-8 text-center text-slate-500">Tidak ada tugas aktif saat ini. 🎉</div>}
        {tickets.map(t => (
          <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left p-4 hover:bg-slate-50 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-mono text-slate-500">{t.nomor}</span>
                <span className={`pill ${STATUS_COLORS[t.status]}`}>{t.status}</span>
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
    </div>
  );
}

export default TugasSaya;
