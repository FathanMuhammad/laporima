import React from 'react';
import { fmtTanggal } from '../data/constants';

function AntrianSosmed({ store, update, currentUser, openTicket }) {
  const queue = store.tickets
    .filter(t => t.status === 'SURAT MASUK' || t.sosmed)
    .map(t => {
      if (!t.sosmed) {
        return {
          ...t,
          sosmed: {
            status: 'draft',
            platform: [],
            caption: '',
            link: null,
            ts: t.tanggal_masuk
          }
        };
      }
      return t;
    });

  const draft = queue.filter(t => t.sosmed.status === 'draft');
  const review = queue.filter(t => t.sosmed.status === 'review');
  const posted = queue.filter(t => t.sosmed.status === 'posted');

  const submitDraft = (ticketId, fields) => {
    update(s => {
      const t = s.tickets.find(x => x.id === ticketId);
      if (!t.sosmed) {
        t.sosmed = { status: 'draft', platform: [], caption: '', link: null, ts: new Date().toISOString() };
      }
      Object.assign(t.sosmed, fields, { status:'review' });
      if (!t.timeline) t.timeline = [];
      t.timeline.push({ id:`a-${Date.now()}`, tipe:'note', user:currentUser.id, desc:'Submit konten sosmed untuk approval', ts:new Date().toISOString() });
    });
  };

  const approve = (ticketId) => {
    update(s => {
      const t = s.tickets.find(x => x.id === ticketId);
      if (!t.sosmed) {
        t.sosmed = { status: 'draft', platform: [], caption: '', link: null, ts: new Date().toISOString() };
      }
      t.sosmed.status = 'posted';
      t.sosmed.approver = currentUser.id;
      t.sosmed.link = t.sosmed.link || `https://instagram.com/p/${Math.random().toString(36).substr(2,9)}`;
      if (!t.timeline) t.timeline = [];
      t.timeline.push({ id:`a-${Date.now()}`, tipe:'note', user:currentUser.id, desc:'Approve & posting konten sosmed', ts:new Date().toISOString() });
    });
  };

  const Card = ({t, action}) => (
    <div className="bg-white rounded-lg border border-slate-200 p-3 mb-2">
      <div className="flex items-center justify-between mb-1">
        <button onClick={()=>openTicket(t.id)} className="text-xs font-mono text-pink-600 hover:underline">{t.nomor}</button>
        <span className="text-xs text-slate-500">{fmtTanggal(t.tanggal_selesai || t.tanggal_masuk)}</span>
      </div>
      <div className="font-medium text-sm">{t.judul}</div>
      <div className="text-xs text-slate-500 mb-2">{t.kecamatan} · {t.kelurahan}</div>
      {t.sosmed.caption && <div className="text-xs bg-slate-50 p-2 rounded mb-2">{t.sosmed.caption}</div>}
      {t.sosmed.platform?.length > 0 && <div className="flex gap-1 mb-2">{t.sosmed.platform.map(p => <span key={p} className="pill bg-pink-100 text-pink-700">{p}</span>)}</div>}
      {t.sosmed.link && <a href={t.sosmed.link} target="_blank" rel="noreferrer" className="text-xs text-pink-600 hover:underline">Lihat post ↗</a>}
      {action}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Antrian Media Sosial</h1>
        <p className="text-slate-600 text-sm">Konten dokumentasi pasca-penyelesaian aduan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">📝 Draft <span className="pill bg-slate-100 text-slate-600">{draft.length}</span></h3>
          {draft.length === 0 && <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-dashed border-slate-200">Tidak ada draft.</div>}
          {draft.map(t => <Card key={t.id} t={t} action={
            currentUser.peran === 'sosmed' && (
              <button onClick={() => {
                const cap = prompt('Tulis caption:', `Aduan dari warga ${t.kelurahan} berhasil ditindaklanjuti. ${t.judul}. #Dapil10Jakbar #LaporIma`);
                if (cap) submitDraft(t.id, { caption: cap, platform:['IG','FB'] });
              }} className="mt-2 w-full py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs">Submit untuk Approval</button>
            )
          } />)}
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">⏳ Menunggu Approval <span className="pill bg-amber-100 text-amber-700">{review.length}</span></h3>
          {review.length === 0 && <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-dashed border-slate-200">Tidak ada yang menunggu.</div>}
          {review.map(t => <Card key={t.id} t={t} action={
            ['admin_kantor','owner'].includes(currentUser.peran) && (
              <div className="flex gap-1 mt-2">
                <button onClick={() => approve(t.id)} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs">✓ Approve & Posting</button>
              </div>
            )
          } />)}
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">✅ Posted <span className="pill bg-emerald-100 text-emerald-700">{posted.length}</span></h3>
          {posted.length === 0 && <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-dashed border-slate-200">Belum ada post.</div>}
          {posted.map(t => <Card key={t.id} t={t} />)}
        </div>
      </div>
    </div>
  );
}

export default AntrianSosmed;
