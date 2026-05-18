import React from 'react';
import { fmtTanggal } from '../data/constants';

function AntrianPigura({ store, update, currentUser, openTicket }) {
  const queue = store.tickets.filter(t => t.flag_pigura && t.pigura);
  const groups = {
    disetujui:queue.filter(t=>t.pigura.status==='disetujui'),
    dipesan:  queue.filter(t=>t.pigura.status==='dipesan'),
    diterima: queue.filter(t=>t.pigura.status==='diterima'),
    diserahkan:queue.filter(t=>t.pigura.status==='diserahkan'),
  };

  const advance = (id) => {
    update(s => {
      const t = s.tickets.find(x => x.id === id);
      const flow = ['disetujui','dipesan','diterima','diserahkan'];
      const idx = flow.indexOf(t.pigura.status);
      if (idx < flow.length - 1) {
        const next = flow[idx+1];
        t.pigura.status = next;
        if (next === 'dipesan') { t.pigura.tanggal_pesan = new Date().toISOString(); t.pigura.vendor = t.pigura.vendor || 'Pigura Jakbar Mandiri'; t.pigura.biaya = 75000; }
        if (next === 'diterima') t.pigura.tanggal_terima_vendor = new Date().toISOString();
        if (next === 'diserahkan') t.pigura.tanggal_serah = new Date().toISOString();
        t.timeline.push({ id:`a-${Date.now()}`, tipe:'note', user:currentUser.id, desc:`Pigura: ${next}`, ts:new Date().toISOString() });
      }
    });
  };

  const Col = ({title, items, badge, actLabel}) => (
    <div>
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">{title} <span className={`pill ${badge}`}>{items.length}</span></h3>
      {items.length === 0 && <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg border border-dashed border-slate-200">Kosong</div>}
      {items.map(t => (
        <div key={t.id} className="bg-white rounded-lg border border-slate-200 p-3 mb-2">
          <button onClick={()=>openTicket(t.id)} className="text-xs font-mono text-violet-600 hover:underline">{t.nomor}</button>
          <div className="font-medium text-sm">{t.judul}</div>
          <div className="text-xs text-slate-500 mb-1">{t.pelapor.nama} · {t.kelurahan}</div>
          {t.pigura.tanggal_pesan && <div className="text-xs text-slate-600">📦 Pesan: {fmtTanggal(t.pigura.tanggal_pesan)}</div>}
          {t.pigura.tanggal_serah && <div className="text-xs text-emerald-600">✅ Diserahkan: {fmtTanggal(t.pigura.tanggal_serah)}</div>}
          {currentUser.peran === 'pigura' && actLabel && (
            <button onClick={() => advance(t.id)} className="mt-2 w-full py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs">{actLabel}</button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Antrian Pigura</h1>
        <p className="text-slate-600 text-sm">Tracking pembuatan dan serah-terima pigura ke warga</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Col title="Disetujui"   items={groups.disetujui}  badge="bg-slate-100 text-slate-600"  actLabel="→ Pesan ke Vendor" />
        <Col title="Dipesan"     items={groups.dipesan}    badge="bg-amber-100 text-amber-700"  actLabel="→ Tandai Diterima" />
        <Col title="Diterima"    items={groups.diterima}   badge="bg-sky-100 text-sky-700"      actLabel="→ Serahkan ke Warga" />
        <Col title="Diserahkan"  items={groups.diserahkan} badge="bg-emerald-100 text-emerald-700" />
      </div>
    </div>
  );
}

export default AntrianPigura;
