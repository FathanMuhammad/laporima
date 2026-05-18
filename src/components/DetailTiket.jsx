import React from 'react';
import { USERS, KATEGORI, STATUS, STATUS_COLORS, PRIORITAS_COLORS, fmtTanggal, fmtTanggalJam, canSeeSosmed, canSeePigura, DINAS_LIST } from '../data/constants';

function DetailTiket({ store, update, ticketId, currentUser, goBack }) {
  const t = store.tickets.find(x => x.id === ticketId);
  if (!t) return <div>Tiket tidak ditemukan. <button onClick={goBack} className="text-rose-600 underline">Kembali</button></div>;
  const kat = KATEGORI.find(k => k.id === t.kategori) || { nama: 'Tidak Diketahui' };
  const overSla = !['SELESAI'].includes(t.status) && new Date(t.sla_target) < new Date();

  const updateStatus = (newStatus, desc) => {
    update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      tt.status = newStatus;
      if (!tt.timeline) tt.timeline = [];
      tt.timeline.push({ id:`a-${Date.now()}`, tipe:'status_change', user:currentUser.id, desc:`${newStatus} — ${desc||''}`, ts:new Date().toISOString(), status:newStatus });
      if (newStatus === 'SELESAI') tt.tanggal_selesai = new Date().toISOString();
    });
  };

  const assignTo = (dinasName) => {
    update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      tt.assignee = dinasName;
      if (!tt.timeline) tt.timeline = [];
      tt.timeline.push({ id:`a-${Date.now()}`, tipe:'assign', user:currentUser.id, desc:`Diteruskan ke Dinas: ${dinasName}`, ts:new Date().toISOString() });
    });
  };

  const checkIn = () => {
    const finalize = (lat, lng) => {
      update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      tt.koordinat = { lat, lng };
      if (!tt.timeline) tt.timeline = [];
      tt.timeline.push({ id:`a-${Date.now()}`, tipe:'checkin', user:currentUser.id, desc:`Check-in GPS di lokasi (${lat.toFixed(5)}, ${lng.toFixed(5)})`, ts:new Date().toISOString() });
    });
    alert('Check-in GPS berhasil.');
  };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(-6.17 + Math.random()*0.05, 106.78 + Math.random()*0.06)
      );
    } else {
      finalize(-6.17 + Math.random()*0.05, 106.78 + Math.random()*0.06);
    }
  };

  const onUploadFoto = (e, jenis) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update(s => {
        const tt = s.tickets.find(x => x.id === ticketId);
        if (!tt.lampiran) tt.lampiran = [];
        if (!tt.timeline) tt.timeline = [];
        tt.lampiran.push({ id:`l-${Date.now()}`, jenis, nama:file.name, dataUrl:reader.result, uploadedBy:currentUser.id, ts:new Date().toISOString() });
        tt.timeline.push({ id:`a-${Date.now()}`, tipe:'lampiran', user:currentUser.id, desc:`Foto ${jenis} diunggah: ${file.name}`, ts:new Date().toISOString() });
      });
    };
    reader.readAsDataURL(file);
  };

  const tutupTiket = () => {
    update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      tt.status = 'Ditutup';
      if (!tt.timeline) tt.timeline = [];
      tt.timeline.push({ id:`a-${Date.now()}`, tipe:'status_change', user:currentUser.id, desc:'Tiket ditutup, pelapor sudah dinotifikasi', ts:new Date().toISOString() });
    });
    alert('Tiket ditutup. Notifikasi (simulasi) terkirim ke pelapor.');
  };

  const tandaiPigura = () => {
    update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      tt.flag_pigura = !tt.flag_pigura;
      if (tt.flag_pigura && !tt.pigura) {
        tt.pigura = { status:'disetujui', vendor:'', biaya:0, tanggal_pesan:null, tanggal_terima_vendor:null, tanggal_serah:null };
      }
      if (!tt.timeline) tt.timeline = [];
      tt.timeline.push({ id:`a-${Date.now()}`, tipe:'note', user:currentUser.id, desc: tt.flag_pigura ? 'Ditandai untuk dibuatkan pigura' : 'Tanda pigura dibatalkan', ts:new Date().toISOString() });
    });
  };

  const eskalasiSosmed = () => {
    update(s => {
      const tt = s.tickets.find(x => x.id === ticketId);
      if (!tt.sosmed) {
        tt.sosmed = { status:'draft', platform:[], caption:'', link:null, ts:new Date().toISOString() };
        if (!tt.timeline) tt.timeline = [];
        tt.timeline.push({ id:`a-${Date.now()}`, tipe:'note', user:currentUser.id, desc:'Masuk antrian dokumentasi sosmed', ts:new Date().toISOString() });
      }
    });
  };

  const canEdit = ['koordinator','pic','pj_kecamatan','admin_kantor','lo_dinas','super_admin'].includes(currentUser.peran);
  const sosmedVisible = canSeeSosmed(currentUser.peran);

  return (
    <div className="space-y-4">
      <div>
        <button onClick={goBack} className="text-rose-600 hover:underline text-sm mb-2">← Kembali ke Daftar</button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-mono text-slate-500">{t.nomor}</span>
              <span className={`pill ${STATUS_COLORS[t.status]}`}>{t.status}</span>
              <span className={`pill ${PRIORITAS_COLORS[t.prioritas]}`}>{t.prioritas}</span>
              {overSla && <span className="pill bg-rose-600 text-white">Lewat SLA</span>}
              {t.flag_pigura && <span className="pill bg-violet-100 text-violet-700">🖼️ Pigura</span>}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{t.judul}</h1>
            <div className="text-sm text-slate-600">{kat.nama} · {t.kecamatan} · {t.kelurahan}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && ['koordinator','admin_kantor','pj_kecamatan'].includes(currentUser.peran) && (
              <select onChange={e => assignTo(e.target.value)} value="" className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                <option value="" disabled>Tugaskan ke Dinas...</option>
                {DINAS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            
            {canEdit && (
              <select 
                value={t.status || ''}
                onChange={e => updateStatus(e.target.value, 'Diubah via detail')}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium bg-slate-50"
              >
                <option value="" disabled>Ubah Status...</option>
                {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {(currentUser.peran === 'pic' || currentUser.peran === 'pj_kecamatan') && (
              <button onClick={checkIn} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm">📍 Check-in GPS</button>
            )}
            {['koordinator','admin_kantor','owner'].includes(currentUser.peran) && (
              <button onClick={tandaiPigura} className={`px-3 py-1.5 ${t.flag_pigura?'bg-violet-100 text-violet-700':'bg-violet-600 hover:bg-violet-700 text-white'} rounded-lg text-sm`}>
                🖼️ {t.flag_pigura ? 'Pigura: Ya' : 'Tandai Pigura'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Deskripsi Aduan</h3>
            <p className="text-slate-700 text-sm">{t.deskripsi}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500 text-xs">Pelapor</span><div className="font-medium">{t.pelapor.nama}</div><div className="text-xs text-slate-500">{t.pelapor.hp}</div></div>
              <div><span className="text-slate-500 text-xs">Alamat</span><div className="font-medium">{t.alamat || '—'}{t.rt && ` RT ${t.rt}`}{t.rw && ` RW ${t.rw}`}</div></div>
              <div><span className="text-slate-500 text-xs">Kanal</span><div className="font-medium">{t.kanal}</div></div>
              <div><span className="text-slate-500 text-xs">Tanggal Masuk</span><div className="font-medium">{fmtTanggal(t.tanggal_masuk)}</div></div>
              <div><span className="text-slate-500 text-xs">SLA Target</span><div className="font-medium">{fmtTanggal(t.sla_target)}</div></div>
              <div><span className="text-slate-500 text-xs">Assignee</span><div className="font-medium">{t.assignee ? (USERS.find(u=>u.id===t.assignee)?.nama || t.assignee) : '—'}</div></div>
            </div>
            {t.koordinat && (
              <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs flex items-center gap-2">
                <span>📍</span>
                <a href={`https://maps.google.com/?q=${t.koordinat.lat},${t.koordinat.lng}`} target="_blank" rel="noreferrer" className="text-rose-600 hover:underline">
                  {t.koordinat.lat.toFixed(5)}, {t.koordinat.lng.toFixed(5)}
                </a>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">Foto & Lampiran</h3>
              {canEdit && (
                <div className="flex gap-2 text-xs">
                  <label className="cursor-pointer px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded">
                    📷 Foto Before
                    <input type="file" accept="image/*" capture="environment" onChange={(e)=>onUploadFoto(e,'before')} className="hidden" />
                  </label>
                  <label className="cursor-pointer px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded">
                    📷 Foto After
                    <input type="file" accept="image/*" capture="environment" onChange={(e)=>onUploadFoto(e,'after')} className="hidden" />
                  </label>
                </div>
              )}
            </div>
            {!(t.lampiran && t.lampiran.length > 0) ? (
              <div className="text-sm text-slate-500 italic">Belum ada foto. Klik tombol di atas untuk upload.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {t.lampiran.map(l => (
                  <div key={l.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <img src={l.dataUrl} alt={l.jenis} className="w-full h-32 object-cover" />
                    <div className="p-1.5 text-xs flex items-center justify-between bg-slate-50">
                      <span className="capitalize font-medium">{l.jenis}</span>
                      <span className="text-slate-500">{fmtTanggal(l.ts)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3">Riwayat Aksi</h3>
            <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
              {(t.timeline || []).slice().reverse().map(a => {
                const u = USERS.find(x => x.id === a.user);
                return (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[22px] top-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white"></span>
                    <div className="text-sm text-slate-800">{a.desc}</div>
                    <div className="text-xs text-slate-500">{u?.nama || a.user} · {fmtTanggalJam(a.ts)}</div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          {(() => {
            const sosmedData = t.sosmed || (t.status === 'SURAT MASUK' ? { status:'draft', platform:[], caption:'', link:null } : null);
            return sosmedVisible && (t.status === 'SELESAI' || t.status === 'SURAT MASUK' || t.sosmed) && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">📱 Dokumentasi Sosmed</h3>
                {!sosmedData ? (
                  ['koordinator','sosmed','admin_kantor','owner'].includes(currentUser.peran) ? (
                    <button onClick={eskalasiSosmed} className="w-full py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">Tambahkan ke Antrian Sosmed</button>
                  ) : (
                    <div className="text-xs text-slate-500 italic">Belum masuk antrian sosmed.</div>
                  )
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div><span className="text-slate-500">Status: </span><span className="font-medium uppercase">{sosmedData.status}</span></div>
                    {sosmedData.platform?.length > 0 && <div><span className="text-slate-500">Platform: </span>{sosmedData.platform.join(', ')}</div>}
                    {sosmedData.link && <div><a href={sosmedData.link} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline">Lihat postingan ↗</a></div>}
                  </div>
                )}
              </div>
            );
          })()}

          {canSeePigura(currentUser.peran) && t.flag_pigura && t.pigura && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">🖼️ Pigura</h3>
              <div className="space-y-1.5 text-xs">
                <div><span className="text-slate-500">Status: </span><span className="font-medium uppercase">{t.pigura.status}</span></div>
                {t.pigura.vendor && <div><span className="text-slate-500">Vendor: </span>{t.pigura.vendor}</div>}
                {t.pigura.biaya > 0 && <div><span className="text-slate-500">Biaya: </span>Rp {t.pigura.biaya.toLocaleString('id-ID')}</div>}
                {t.pigura.tanggal_pesan && <div><span className="text-slate-500">Pesan: </span>{fmtTanggal(t.pigura.tanggal_pesan)}</div>}
                {t.pigura.tanggal_serah && <div><span className="text-slate-500">Diserahkan: </span>{fmtTanggal(t.pigura.tanggal_serah)}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailTiket;
