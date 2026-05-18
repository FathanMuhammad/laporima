import React from 'react';
import { USERS, KECAMATAN, KELURAHAN_BY_KEC } from '../data/constants';

function Pengaturan({ store, currentUser }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-600 text-sm">Master data sistem (read-only di prototype)</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-2">Tim Pengguna ({USERS.length} demo · 92 di produksi)</h3>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {USERS.map(u => (
              <div key={u.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                <span>{u.nama}</span>
                <span className={`pill ${u.color}`}>{u.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-2">Lapisan Akses (RBAC)</h3>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-emerald-50 rounded">
              <div className="font-semibold text-emerald-700">Office Tier — Dashboard Penuh</div>
              <div className="text-xs text-slate-600">Owner · Koordinator · Admin Kantor · Tim Medsos · Super Admin</div>
              <div className="text-xs text-slate-500 mt-1">Akses ke seluruh modul: aduan, poin, sosmed, pigura, pengaturan</div>
            </div>
            <div className="p-2 bg-indigo-50 rounded">
              <div className="font-semibold text-indigo-700">Field Tier — Operasional Lapangan</div>
              <div className="text-xs text-slate-600">PJ Kecamatan · PIC · LO Dinas</div>
              <div className="text-xs text-slate-500 mt-1">Tidak melihat dashboard sosmed/pigura. PJ & PIC dibatasi ke kecamatan-nya.</div>
            </div>
            <div className="p-2 bg-violet-50 rounded">
              <div className="font-semibold text-violet-700">Spesialisasi</div>
              <div className="text-xs text-slate-600">Tim Logistik / Pigura</div>
              <div className="text-xs text-slate-500 mt-1">Akses utama ke modul pigura, tidak ke sosmed.</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-2">Wilayah Dapil 10 (Jakarta Barat)</h3>
          <div className="space-y-2 text-sm">
            {KECAMATAN.map(k => (
              <details key={k} className="p-2 bg-slate-50 rounded">
                <summary className="font-medium flex items-center justify-between"><span>{k}</span><span className="text-xs text-slate-500">{KELURAHAN_BY_KEC[k].length} kelurahan</span></summary>
                <div className="mt-1 text-xs text-slate-600">{KELURAHAN_BY_KEC[k].join(', ')}</div>
              </details>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold mb-2">Konfigurasi Sistem</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Brand</span><span className="font-medium">LaporIma</span></div>
            <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Nomor WA Resmi</span><span className="font-mono">0811-8055-155</span></div>
            <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Nominal Insentif</span><span>Rp 7.000 / poin</span></div>
            <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Periode Rekap</span><span>Bulanan</span></div>
            <div className="flex justify-between p-2 bg-slate-50 rounded"><span>Format Nomor Tiket</span><span className="font-mono">LI-2026-XXXX</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pengaturan;
