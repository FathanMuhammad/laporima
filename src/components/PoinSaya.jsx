import React from 'react';
import { USERS, ATURAN_POIN } from '../data/constants';

function PoinSaya({ store, update, currentUser }) {
  const allPoin = [];
  store.tickets.forEach(t => {
    t.poinList.forEach(p => allPoin.push({ ...p, ticketId: t.id, ticketNomor: t.nomor, ticketJudul: t.judul, ticketKecamatan: t.kecamatan }));
  });

  const isLeaderView = ['owner','koordinator','admin_kantor','super_admin'].includes(currentUser.peran);
  const isPJView = currentUser.peran === 'pj_kecamatan';

  let filteredPoin = allPoin;
  let scopeLabel = 'Anda';
  if (isLeaderView) { scopeLabel = 'Seluruh tim'; }
  else if (isPJView) { filteredPoin = allPoin.filter(p => p.ticketKecamatan === currentUser.kecamatan); scopeLabel = `Tim Kecamatan ${currentUser.kecamatan}`; }
  else { filteredPoin = allPoin.filter(p => p.user === currentUser.id); }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyByUser = {};
  filteredPoin.filter(p => new Date(p.ts) >= startOfMonth).forEach(p => {
    if (!monthlyByUser[p.user]) monthlyByUser[p.user] = { total:0, approved:0, pending:0, count:0 };
    monthlyByUser[p.user].total += p.poin;
    monthlyByUser[p.user][p.status] = (monthlyByUser[p.user][p.status]||0) + p.poin;
    monthlyByUser[p.user].count += 1;
  });
  const RUPIAH_PER_POIN = 7000;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Poin & Insentif</h1>
        <p className="text-slate-600 text-sm">{scopeLabel} · Bulan {now.toLocaleDateString('id-ID',{month:'long',year:'numeric'})} · 1 poin = Rp {RUPIAH_PER_POIN.toLocaleString('id-ID')}</p>
      </div>

      {!isLeaderView && !isPJView && (
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-xl p-5">
          <div className="text-sm opacity-90">Total Poin Bulan Ini</div>
          <div className="text-5xl font-bold mt-1">{monthlyByUser[currentUser.id]?.total || 0}</div>
          <div className="text-sm opacity-90 mt-2">≈ Rp {((monthlyByUser[currentUser.id]?.total || 0) * RUPIAH_PER_POIN).toLocaleString('id-ID')}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 rounded p-2"><div className="opacity-80">Approved</div><div className="text-lg font-bold">{monthlyByUser[currentUser.id]?.approved || 0}</div></div>
            <div className="bg-white/10 rounded p-2"><div className="opacity-80">Pending</div><div className="text-lg font-bold">{monthlyByUser[currentUser.id]?.pending || 0}</div></div>
          </div>
        </div>
      )}

      {(isLeaderView || isPJView) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold">Leaderboard Bulan Ini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr><th className="text-left px-4 py-2">#</th><th className="text-left px-4 py-2">Nama</th><th className="text-right px-4 py-2">Tiket</th><th className="text-right px-4 py-2">Approved</th><th className="text-right px-4 py-2">Pending</th><th className="text-right px-4 py-2">Total</th><th className="text-right px-4 py-2">Insentif</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(monthlyByUser).map(([uid, m]) => USERS.find(u=>u.id===uid) && [uid, m]).filter(Boolean).sort((a,b) => b[1].total - a[1].total).map(([uid, m], i) => {
                  const u = USERS.find(u => u.id === uid);
                  return (
                    <tr key={uid}>
                      <td className="px-4 py-2 text-slate-500">{i+1}</td>
                      <td className="px-4 py-2"><div className="font-medium">{u.nama}</div><div className="text-xs text-slate-500">{u.label}</div></td>
                      <td className="px-4 py-2 text-right">{m.count}</td>
                      <td className="px-4 py-2 text-right text-emerald-600">{m.approved||0}</td>
                      <td className="px-4 py-2 text-right text-amber-600">{m.pending||0}</td>
                      <td className="px-4 py-2 text-right font-bold">{m.total}</td>
                      <td className="px-4 py-2 text-right">Rp {(m.total * RUPIAH_PER_POIN).toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
                {Object.keys(monthlyByUser).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Belum ada poin tercatat bulan ini.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold">Riwayat Poin</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredPoin.length === 0 && <div className="p-8 text-center text-slate-500">Belum ada riwayat poin.</div>}
          {filteredPoin.slice().sort((a,b) => new Date(b.ts) - new Date(a.ts)).slice(0,40).map((p, i) => {
            const aturan = ATURAN_POIN.find(a => a.kode === p.kode);
            const u = USERS.find(x => x.id === p.user);
            return (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{aturan?.label}</div>
                  <div className="text-xs text-slate-500">{p.ticketNomor} · {p.ticketJudul} · {u?.nama}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`pill ${p.status==='approved'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                  <span className="font-bold text-rose-600">+{p.poin}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold mb-2">Aturan Poin</h3>
        <div className="space-y-1.5 text-sm">
          {ATURAN_POIN.map(a => (
            <div key={a.kode} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span>{a.label}</span>
              <span className="font-bold text-rose-600">+{a.poin}</span>
            </div>
          ))}
          <div className="text-xs text-slate-500 mt-2">Multiplier kategori: Banjir 1.5x · Kesehatan 1.2x · lainnya 1.0x</div>
        </div>
      </div>
    </div>
  );
}

export default PoinSaya;
