import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { KECAMATAN, KATEGORI, STATUS, STATUS_COLORS, PRIORITAS_COLORS, fmtTanggal, isOffice, canSeeSosmed, canSeePigura } from '../data/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Kpi({ label, value, sub, accent }) {
  const colorMap = {
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    pink: 'border-pink-200 bg-pink-50 text-pink-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[accent]}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      <div className="text-xs opacity-70 mt-1">{sub}</div>
    </div>
  );
}

function Dashboard({ store, currentUser, openTicket }) {
  const tickets = store.tickets;
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  let scoped = tickets;
  let scopeLabel = '';
  if (currentUser.peran === 'pj_kecamatan') {
    scoped = tickets.filter(t => t.kecamatan === currentUser.kecamatan);
    scopeLabel = ` · Kecamatan ${currentUser.kecamatan}`;
  } else if (currentUser.peran === 'pic') {
    scoped = tickets.filter(t => t.kecamatan === currentUser.kecamatan);
    scopeLabel = ` · Area ${currentUser.kecamatan}`;
  } else if (currentUser.peran === 'lo_dinas') {
    scoped = tickets.filter(t => t.status === 'Diteruskan ke Dinas' || (t.timeline || []).some(a => a.user === 'joko'));
    scopeLabel = ' · Tiket OPD';
  }

  const masukBulanIni = scoped.filter(t => new Date(t.tanggal_masuk) >= startOfMonth).length;
  const aktif = scoped.filter(t => t.status !== 'SELESAI').length;
  const selesai = scoped.filter(t => t.status === 'SELESAI').length;

  const sosmedTickets = scoped.map(t => {
    if (!t.sosmed && t.status === 'SURAT MASUK') {
      return { ...t, sosmed: { status: 'draft' } };
    }
    return t;
  }).filter(t => t.sosmed);

  const sosmedPosted = sosmedTickets.filter(t => t.sosmed.status === 'posted').length;
  const sosmedAntri = sosmedTickets.filter(t => ['draft', 'review'].includes(t.sosmed.status)).length;
  const piguraTotal = scoped.filter(t => t.flag_pigura).length;
  const piguraSerah = scoped.filter(t => t.pigura && t.pigura.status === 'diserahkan').length;

  const byKategori = KATEGORI.map(k => ({
    nama: k.nama, count: scoped.filter(t => t.kategori === k.id).length
  })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

  const byKecamatan = KECAMATAN.map(k => ({
    nama: k, count: scoped.filter(t => t.kecamatan === k).length,
    selesai: scoped.filter(t => t.kecamatan === k && t.status === 'SELESAI').length,
  }));

  const recent = [...scoped].sort((a, b) => {
    const noA = parseInt(a.nomor.split('-')[1] || 0);
    const noB = parseInt(b.nomor.split('-')[1] || 0);
    return noB - noA;
  }).slice(0, 6);

  const showSosmedKPI = canSeeSosmed(currentUser.peran);
  const showPiguraKPI = canSeePigura(currentUser.peran);

  const totalKpis = 3 + (showSosmedKPI ? 1 : 0) + (showPiguraKPI ? 1 : 0);
  const gridColsClass = totalKpis === 3 ? 'md:grid-cols-3' : totalKpis === 4 ? 'md:grid-cols-4' : 'md:grid-cols-5';

  const stats = STATUS.map(s => scoped.filter(t => t.status === s).length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard{scopeLabel}</h1>
        <p className="text-slate-600 text-sm">
          {isOffice(currentUser.peran) ? 'Ringkasan keseluruhan operasional · ' : 'Data laporan lapangan · '}
          {fmtTanggal(today)}
        </p>
        {!canSeeSosmed(currentUser.peran) && (
          <div className="mt-2 text-xs px-3 py-2 bg-slate-100 text-slate-600 rounded-lg inline-block">
            ℹ️ Anda berada di tier <strong>Field</strong> — dashboard hanya menampilkan data operasional lapangan. Modul Media Sosial dan Pigura tidak tersedia.
          </div>
        )}
      </div>

      <div className={`grid grid-cols-2 ${gridColsClass} gap-3`}>
        <Kpi label="Masuk" value={masukBulanIni} accent="rose" sub="aduan baru" />
        <Kpi label="Sedang Ditangani" value={aktif} accent="amber" sub="dalam progres" />
        <Kpi label="Sudah Selesai" value={selesai} accent="emerald" sub="semua waktu" />
        {showSosmedKPI && <Kpi label="Konten Posted" value={sosmedPosted} accent="pink" sub={`${sosmedAntri} antri`} />}
        {showPiguraKPI && <Kpi label="Pigura Selesai" value={piguraSerah} accent="violet" sub={`${piguraTotal} total`} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-2 text-slate-800">Distribusi Status</h3>
          <div style={{ height: 240 }}>
            <Doughnut
              data={{ labels: STATUS, datasets: [{ data: stats, backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#fb923c', '#10b981', '#475569'] }] }}
              options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-2 text-slate-800">Per Kategori</h3>
          <div style={{ height: 240 }}>
            <Bar
              data={{
                labels: byKategori.map(x => x.nama.replace('Infrastruktur · ', '').replace('Lingkungan · ', '').replace('Kesehatan · ', '').replace('Pendidikan · ', '').replace('Adminduk · ', '').replace('Sosial · ', '')),
                datasets: [{ data: byKategori.map(x => x.count), backgroundColor: '#dc2626', borderRadius: 6 }]
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, indexAxis: 'y' }}
            />
          </div>
        </div>
        {currentUser.peran !== 'pic' && currentUser.peran !== 'pj_kecamatan' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold mb-2 text-slate-800">Sebaran Kecamatan</h3>
            <div style={{ height: 240 }}>
              <Bar
                data={{
                  labels: byKecamatan.map(x => x.nama),
                  datasets: [
                    { label: 'Aktif', data: byKecamatan.map(x => x.count - x.selesai), backgroundColor: '#fb923c' },
                    { label: 'Selesai', data: byKecamatan.map(x => x.selesai), backgroundColor: '#10b981' },
                  ]
                }}
                options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Aduan Terbaru{scopeLabel}</h3>
          <span className="text-xs text-slate-500">{recent.length} dari {scoped.length} tiket</span>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.map(t => (
            <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">{t.nomor}</span>
                  <span className={`pill ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  <span className={`pill ${PRIORITAS_COLORS[t.prioritas]}`}>{t.prioritas}</span>
                </div>
                <div className="font-medium text-slate-800 truncate">{t.judul}</div>
                <div className="text-xs text-slate-500">{t.kecamatan} · {t.kelurahan} · {fmtTanggal(t.tanggal_masuk)}</div>
              </div>
              <div className="text-slate-400">›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
