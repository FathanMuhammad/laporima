import React, { useState } from 'react';
import { KATEGORI, KECAMATAN, KELURAHAN_BY_KEC, PRIORITAS } from '../data/constants';

function Field({label, children}) {
  return <label className="block">
    <span className="text-xs font-medium text-slate-700 mb-1 block">{label}</span>
    {children}
  </label>;
}

function FormBaru({ store, update, currentUser, onCreated }) {
  const [form, setForm] = useState({
    judul:'', deskripsi:'', kategori:'inf_jalan',
    kecamatan: currentUser.kecamatan || 'Kebon Jeruk',
    kelurahan:'',
    alamat:'', pelaporNama:'', pelaporHp:'',
    kanal: currentUser.peran === 'pic' ? 'PIC' : 'WA',
    prioritas:'Sedang',
  });
  
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const kelOptions = KELURAHAN_BY_KEC[form.kecamatan] || [];

  const submit = (e) => {
    e.preventDefault();
    if (!form.judul || !form.deskripsi || !form.pelaporNama) {
      alert('Mohon lengkapi: Judul, Deskripsi, dan Nama Pelapor.');
      return;
    }
    update(s => {
      const counter = s.counter;
      const now = new Date();
      const kat = KATEGORI.find(k=>k.id===form.kategori);
      const slaTarget = new Date(now); slaTarget.setDate(now.getDate()+kat.sla);
      const t = {
        id: `t${counter.toString().padStart(4,'0')}`,
        nomor: `LI-2026-${counter.toString().padStart(4,'0')}`,
        judul: form.judul, deskripsi: form.deskripsi,
        kategori: form.kategori,
        kecamatan: form.kecamatan, kelurahan: form.kelurahan || kelOptions[0],
        alamat: form.alamat,
        pelapor: { nama: form.pelaporNama, hp: form.pelaporHp },
        kanal: form.kanal, status:'Baru', prioritas: form.prioritas,
        flag_pigura:false, koordinat: null,
        tanggal_masuk: now.toISOString(),
        sla_target: slaTarget.toISOString(),
        tanggal_selesai:null, assignee:null, pencatat: currentUser.id,
        timeline: [{ id:`a-${counter}-1`, tipe:'create', user:currentUser.id, desc:`Aduan dicatat dari kanal ${form.kanal}`, ts: now.toISOString() }],
        poinList: [], sosmed:null, pigura:null, lampiran: [],
      };
      s.tickets.unshift(t);
      s.counter += 1;
      setTimeout(() => onCreated(t.id), 100);
    });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tiket Aduan Baru</h1>
        <p className="text-slate-600 text-sm">Catat aduan ke sistem. Nomor tiket dihasilkan otomatis (LI-2026-XXXX).</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Judul Aduan *">
            <input type="text" value={form.judul} onChange={e=>set('judul',e.target.value)} placeholder="Mis. Lampu PJU mati di RT 04"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
          </Field>
          <Field label="Kanal Aduan">
            <select value={form.kanal} onChange={e=>set('kanal',e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option value="WA">WhatsApp 0811-8055-155</option>
              <option value="PIC">Langsung ke PIC di lapangan</option>
              <option value="Reses">Reses / Pertemuan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </Field>
        </div>

        <Field label="Deskripsi *">
          <textarea rows={3} value={form.deskripsi} onChange={e=>set('deskripsi',e.target.value)} placeholder="Jelaskan kondisi aduan..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Kategori">
            <select value={form.kategori} onChange={e=>set('kategori',e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              {KATEGORI.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </Field>
          <Field label="Prioritas">
            <select value={form.prioritas} onChange={e=>set('prioritas',e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              {PRIORITAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="SLA Target">
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              {KATEGORI.find(k=>k.id===form.kategori)?.sla} hari kerja
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Kecamatan">
            <select value={form.kecamatan} onChange={e=>{set('kecamatan',e.target.value); set('kelurahan','');}} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              {KECAMATAN.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Kelurahan">
            <select value={form.kelurahan} onChange={e=>set('kelurahan',e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option value="">Pilih kelurahan...</option>
              {kelOptions.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Alamat Detail">
          <input type="text" value={form.alamat} onChange={e=>set('alamat',e.target.value)} placeholder="RT/RW, jalan, patokan..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </Field>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-slate-800 mb-2">Data Pelapor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nama Pelapor *">
              <input type="text" value={form.pelaporNama} onChange={e=>set('pelaporNama',e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </Field>
            <Field label="No. HP / WhatsApp">
              <input type="text" value={form.pelaporHp} onChange={e=>set('pelaporHp',e.target.value)} placeholder="0812..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium">
            Catat Aduan & Generate Tiket
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormBaru;
