import React, { useState } from 'react';
import { KATEGORI, KECAMATAN, KELURAHAN_BY_KEC, STATUS, DINAS_LIST } from '../data/constants';
import { inferKategori } from '../services/sheets';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function FormBaru({ store, update, currentUser, onCreated }) {
  const [form, setForm] = useState({
    nama: '',
    telp: '',
    suratMasuk: '',
    bantuan: '',
    alamat: '',
    rt: '',
    rw: '',
    kecamatan: currentUser.kecamatan || 'Kebon Jeruk',
    kelurahan: '',
    dinas: '',
    status: 'SURAT MASUK',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const kelOptions = KELURAHAN_BY_KEC[form.kecamatan] || [];

  const submit = (e) => {
    e.preventDefault();
    if (!form.nama || !form.bantuan || !form.suratMasuk) {
      alert('Mohon lengkapi kolom bertanda bintang (*): Nama Pelapor, Bantuan, dan Surat Masuk.');
      return;
    }

    update(s => {
      const counter = s.counter;
      const now = new Date();
      
      const inferredKategori = inferKategori(form.bantuan);
      const kat = KATEGORI.find(k => k.id === inferredKategori) || { sla: 14 };
      const slaTarget = new Date(now); 
      slaTarget.setDate(now.getDate() + kat.sla);

      const t = {
        id: `t${counter}`,
        nomor: `LI-${counter}`,
        judul: form.bantuan,
        deskripsi: form.suratMasuk,
        kategori: inferredKategori,
        kecamatan: form.kecamatan,
        kelurahan: form.kelurahan || kelOptions[0] || '',
        alamat: form.alamat,
        rt: form.rt,
        rw: form.rw,
        pelapor: { nama: form.nama, hp: form.telp },
        kanal: 'Formulir',
        status: form.status,
        prioritas: 'Sedang',
        flag_pigura: false,
        koordinat: null,
        tanggal_masuk: now.toISOString(),
        sla_target: slaTarget.toISOString(),
        tanggal_selesai: form.status === 'SELESAI' ? now.toISOString() : null,
        assignee: form.dinas || null,
        pencatat: currentUser.id,
        timeline: [{ 
          id: `a-${Date.now()}`, 
          tipe: 'create', 
          user: currentUser.id, 
          desc: `Aduan baru dicatat: ${form.bantuan}`, 
          ts: now.toISOString() 
        }],
        poinList: [],
        sosmed: null,
        pigura: null,
        lampiran: [],
      };

      s.tickets.unshift(t);
      s.counter += 1;
      setTimeout(() => onCreated(t.id), 100);
    });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Buat Aduan Baru</h1>
        <p className="text-slate-600 text-sm">Catat data aduan sesuai kolom database Excel/Google Sheets.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="NAMA PELAPOR *">
            <input 
              type="text" 
              value={form.nama} 
              onChange={e => set('nama', e.target.value)} 
              placeholder="Nama lengkap pelapor/warga"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
            />
          </Field>
          <Field label="NO. TELP / WHATSAPP">
            <input 
              type="text" 
              value={form.telp} 
              onChange={e => set('telp', e.target.value)} 
              placeholder="Mis. 0812XXXXXXXX"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="BANTUAN (JUDUL ADUAN) *">
            <input 
              type="text" 
              value={form.bantuan} 
              onChange={e => set('bantuan', e.target.value)} 
              placeholder="Mis. Pengerukan Saluran, Kursi Roda"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
            />
          </Field>
          <Field label="STATUS ADUAN">
            <select 
              value={form.status} 
              onChange={e => set('status', e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition-colors"
            >
              <option value="">- Kosongkan -</option>
              {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="SURAT MASUK (DESKRIPSI ADUAN) *">
          <textarea 
            rows={3} 
            value={form.suratMasuk} 
            onChange={e => set('suratMasuk', e.target.value)} 
            placeholder="Ketik surat masuk atau deskripsi lengkap laporan warga..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
          />
        </Field>

        <div className="border-t border-slate-100 my-4 pt-4 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Lokasi & Alamat</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="ALAMAT DETAIL">
              <input 
                type="text" 
                value={form.alamat} 
                onChange={e => set('alamat', e.target.value)} 
                placeholder="Nama jalan / patokan"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
              />
            </Field>
            <Field label="RT">
              <input 
                type="text" 
                value={form.rt} 
                onChange={e => set('rt', e.target.value)} 
                placeholder="RT (Angka)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
              />
            </Field>
            <Field label="RW">
              <input 
                type="text" 
                value={form.rw} 
                onChange={e => set('rw', e.target.value)} 
                placeholder="RW (Angka)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors" 
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="KECAMATAN">
              <select 
                value={form.kecamatan} 
                onChange={e => { set('kecamatan', e.target.value); set('kelurahan', ''); }} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition-colors"
              >
                {KECAMATAN.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="KELURAHAN">
              <select 
                value={form.kelurahan} 
                onChange={e => set('kelurahan', e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition-colors"
              >
                <option value="">Pilih kelurahan...</option>
                {kelOptions.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="border-t border-slate-100 my-4 pt-4">
          <Field label="DINAS">
            <select 
              value={form.dinas} 
              onChange={e => set('dinas', e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition-colors"
            >
              <option value="">Pilih Dinas...</option>
              {DINAS_LIST.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button 
            type="submit" 
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-rose-600/10 hover:shadow-rose-600/20 active:scale-[0.98] transition"
          >
            Simpan Aduan Baru
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormBaru;
