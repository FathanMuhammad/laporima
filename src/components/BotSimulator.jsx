import React, { useState, useEffect, useRef } from 'react';
import { USERS, KATEGORI, fmtTanggal, fmtTanggalJam } from '../data/constants';
import { parseWaMessage } from '../utils/botParser';

function BotSimulator({ store, update, currentUser, openTicket }) {
  const [sendAs, setSendAs] = useState('budi');
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  const messages = store.botMessages || [];
  const senderUsers = USERS.filter(u => ['pic','pj_kecamatan','koordinator','admin_kantor','lo_dinas'].includes(u.peran));
  const sender = USERS.find(u => u.id === sendAs);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const examples = [
    '#LAPOR PJU mati 3 titik di Duri Kepa RT 04, sudah 2 hari',
    '#LAPOR Sampah menumpuk di TPS Slipi, bau menyengat',
    '#LAPOR Banjir di RT 02 Joglo, sudah 30 cm air masuk rumah',
    '#LAPOR KTP tertahan di kelurahan Kemanggisan, sudah 3 minggu',
    '#STATUS LI-2026-0001',
    'menu',
  ];

  const clearLog = () => {
    if (!confirm('Hapus semua riwayat percakapan bot?')) return;
    update(s => { s.botMessages = []; });
  };

  const send = () => {
    if (!draft.trim()) return;
    const body = draft;
    const now = new Date().toISOString();
    update(s => {
      if (!s.botMessages) s.botMessages = [];
      const senderUser = USERS.find(u => u.id === sendAs);
      
      s.botMessages.push({
        id:`m-${Date.now()}-in`, ts: now, from:'pic',
        userId: senderUser.id, userNomor: senderUser.nomor_wa, userName: senderUser.nama,
        userLabel: senderUser.label, body,
      });

      const parsed = parseWaMessage(body, senderUser);
      let replyBody = '';
      let ticketCreated = null;

      if (parsed.type === 'intake') {
        const counter = s.counter;
        const nowDate = new Date();
        const kat = KATEGORI.find(k => k.id === parsed.kategori);
        const slaTarget = new Date(nowDate); slaTarget.setDate(nowDate.getDate() + kat.sla);
        const assignee = senderUser.peran === 'pic' ? senderUser.id : null;
        const newTiket = {
          id: `t${counter.toString().padStart(4,'0')}`,
          nomor: `LI-2026-${counter.toString().padStart(4,'0')}`,
          judul: parsed.judul, deskripsi: parsed.deskripsi,
          kategori: parsed.kategori,
          kecamatan: parsed.kecamatan, kelurahan: parsed.kelurahan,
          alamat: '', pelapor: { nama: senderUser.nama + ' (via Bot WA)', hp: senderUser.nomor_wa },
          kanal: 'Bot WA', status: assignee ? 'Verifikasi Lapangan' : 'Triase', prioritas: parsed.prioritas,
          flag_pigura: false, koordinat: null,
          tanggal_masuk: nowDate.toISOString(), sla_target: slaTarget.toISOString(),
          tanggal_selesai: null, assignee, pencatat: senderUser.id,
          timeline: [{
            id:`a-${counter}-1`, tipe:'create', user:senderUser.id,
            desc:`Aduan tercatat otomatis via Bot WA dari ${senderUser.nomor_wa}`, ts: nowDate.toISOString()
          }],
          poinList: [], sosmed:null, pigura:null, lampiran: [],
        };
        s.tickets.unshift(newTiket);
        s.counter += 1;
        ticketCreated = newTiket;
        replyBody = `✅ Aduan tercatat sebagai ${newTiket.nomor}\n\n📝 ${newTiket.judul}\n📍 ${newTiket.kelurahan}, ${newTiket.kecamatan}\n🏷️ Kategori: ${kat.nama}\n⚡ Prioritas: ${newTiket.prioritas}\n📊 Status: ${newTiket.status}\n📅 SLA: ${kat.sla} hari kerja\n\n${assignee ? 'Otomatis di-assign ke Anda sebagai PIC area. Silakan check-in di lokasi untuk dapat 5 poin.' : 'Akan di-triase Koordinator dalam waktu dekat.'}`;
      } else if (parsed.type === 'status_query') {
        const t = s.tickets.find(x => x.nomor === parsed.ticketNomor);
        if (t) {
          const lastAction = (t.timeline||[]).slice(-1)[0];
          replyBody = `📋 ${t.nomor}\n${t.judul}\n\n📍 ${t.kelurahan}, ${t.kecamatan}\n📊 Status: ${t.status}\n👤 Assignee: ${t.assignee ? USERS.find(u=>u.id===t.assignee)?.nama : 'Belum di-assign'}\n📅 SLA: ${fmtTanggal(t.sla_target)}\n🕒 Update terakhir: ${lastAction ? fmtTanggal(lastAction.ts) : '-'}`;
        } else {
          replyBody = `❌ Nomor tiket ${parsed.ticketNomor} tidak ditemukan dalam sistem.`;
        }
      } else if (parsed.type === 'update') {
        const t = s.tickets.find(x => x.nomor === parsed.ticketNomor);
        if (!t) {
          replyBody = `❌ Nomor tiket ${parsed.ticketNomor} tidak ditemukan.`;
        } else {
          t.timeline.push({ id:`a-${Date.now()}`, tipe:'note', user:senderUser.id, desc:`Update via Bot WA: ${parsed.note.substring(0,150)}`, ts:new Date().toISOString() });
          if (parsed.isSelesai) {
            t.status = 'Selesai'; t.tanggal_selesai = new Date().toISOString();
            replyBody = `✅ Status ${t.nomor} diubah menjadi Selesai.\n\nKonfirmasi otomatis akan dikirim ke pelapor.`;
          } else {
            replyBody = `📝 Catatan tercatat di tiket ${t.nomor}.`;
          }
        }
      } else if (parsed.type === 'menu') {
        replyBody = `🤖 LaporIma Bot — Panduan\n\nFormat pesan yang dikenali:\n\n📝 #LAPOR [judul aduan]\n   Contoh: #LAPOR Lampu PJU mati di Duri Kepa RT 04\n   Bot deteksi kategori & lokasi otomatis.\n\n📋 #STATUS LI-2026-XXXX\n   Cek status tiket.\n\n🔄 #UPDATE LI-2026-XXXX selesai\n   Update status tiket.\n\nNomor Anda terdaftar atas nama: ${senderUser.nama} (${senderUser.label}).`;
      } else {
        replyBody = `🤖 Pesan tidak dikenali.\n\nMohon awali dengan #LAPOR untuk aduan baru, #STATUS untuk cek tiket, atau ketik "menu" untuk panduan.`;
      }

      s.botMessages.push({
        id:`m-${Date.now()}-out`, ts: new Date().toISOString(), from:'bot',
        body: replyBody, ticketId: ticketCreated?.id, ticketNomor: ticketCreated?.nomor,
      });
    });
    setDraft('');
  };

  const botTickets = store.tickets.filter(t => t.kanal === 'Bot WA');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">🤖 Bot WA Simulator</h1>
        <p className="text-slate-600 text-sm">
          Simulasi cara Bot WA menerima pesan dari tim lapangan dan otomatis membuat tiket.
          Nomor bot: <span className="font-mono font-semibold">0811-8055-155</span>
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <div className="text-sm font-semibold text-amber-800 mb-2">💡 Coba contoh pesan (klik untuk pakai):</div>
        <div className="flex flex-wrap gap-2">
          {examples.map((e, i) => (
            <button key={i} onClick={() => setDraft(e)} className="text-xs px-2.5 py-1 bg-white rounded-lg border border-amber-300 hover:bg-amber-100 text-left max-w-xs truncate">
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-emerald-50 rounded-xl border border-emerald-200 overflow-hidden flex flex-col" style={{minHeight:520}}>
          <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <div className="font-semibold">LaporIma Bot</div>
                <div className="text-xs opacity-80">0811-8055-155 · Online · {messages.length} pesan</div>
              </div>
            </div>
            <button onClick={clearLog} className="text-xs px-2 py-1 bg-emerald-800 hover:bg-emerald-900 rounded">Clear Log</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{maxHeight:440}}>
            {messages.length === 0 && (
              <div className="text-center text-slate-500 italic mt-12 text-sm">
                Belum ada pesan. Coba klik salah satu contoh di atas, lalu Send.
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === 'bot' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${m.from === 'bot' ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200'}`}>
                  {m.from === 'pic' && (
                    <div className="text-xs font-semibold mb-1 text-emerald-700">
                      {m.userName} <span className="font-normal text-slate-500">· {m.userLabel} · </span><span className="font-mono">{m.userNomor}</span>
                    </div>
                  )}
                  <div className={`whitespace-pre-wrap text-sm ${m.from === 'bot' ? 'text-white' : 'text-slate-800'}`}>{m.body}</div>
                  {m.ticketNomor && (
                    <button onClick={() => openTicket(m.ticketId)} className="mt-1.5 text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-0.5">
                      Lihat tiket {m.ticketNomor} ↗
                    </button>
                  )}
                  <div className={`text-[10px] mt-1 opacity-70 ${m.from === 'bot' ? 'text-white' : 'text-slate-500'}`}>
                    {fmtTanggalJam(m.ts)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600">Kirim sebagai:</span>
              <select value={sendAs} onChange={e => setSendAs(e.target.value)} className="text-xs px-2 py-1 border border-slate-200 rounded">
                {senderUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.nama} — {u.label} ({u.nomor_wa})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <textarea value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && (e.ctrlKey||e.metaKey)) send();}} placeholder="Ketik pesan WA seperti tim lapangan biasa... (Ctrl+Enter untuk kirim)" rows={2} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" />
              <button onClick={send} disabled={!draft.trim()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-medium self-stretch">Send</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold mb-2 text-sm">📊 Bot Statistik</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-emerald-50 rounded">
                <div className="text-xs text-slate-600">Total pesan</div>
                <div className="text-2xl font-bold text-emerald-700">{messages.length}</div>
              </div>
              <div className="p-2 bg-rose-50 rounded">
                <div className="text-xs text-slate-600">Tiket via Bot</div>
                <div className="text-2xl font-bold text-rose-700">{botTickets.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold mb-2 text-sm">📞 Mapping Nomor HP</h3>
            <div className="space-y-1 text-xs max-h-56 overflow-y-auto">
              {senderUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
                  <span className="font-mono text-slate-600 text-[10px]">{u.nomor_wa}</span>
                  <span className="font-medium text-right">{u.nama}<br/><span className="text-slate-500 font-normal">{u.label}</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold mb-2 text-sm">📝 Format Pesan</h3>
            <div className="space-y-2 text-xs">
              <div>
                <div className="font-mono bg-emerald-50 text-emerald-800 p-1.5 rounded text-[11px]">#LAPOR [aduan]</div>
                <div className="text-slate-600 mt-0.5">Catat aduan baru. Bot ekstrak kategori, kelurahan, prioritas dari teks.</div>
              </div>
              <div>
                <div className="font-mono bg-sky-50 text-sky-800 p-1.5 rounded text-[11px]">#STATUS LI-2026-XXXX</div>
                <div className="text-slate-600 mt-0.5">Cek status tiket tertentu.</div>
              </div>
              <div>
                <div className="font-mono bg-amber-50 text-amber-800 p-1.5 rounded text-[11px]">#UPDATE LI-2026-XXXX selesai</div>
                <div className="text-slate-600 mt-0.5">Update status tiket (selesai/catatan).</div>
              </div>
              <div>
                <div className="font-mono bg-slate-50 text-slate-700 p-1.5 rounded text-[11px]">menu</div>
                <div className="text-slate-600 mt-0.5">Tampilkan panduan format.</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <div className="font-semibold mb-1">ℹ️ Catatan Implementasi Produksi</div>
            <p>Di sistem produksi, bot ini berjalan di server (Node.js) terhubung ke <strong>WA Gateway</strong> (Fonnte / Wablas / Meta Official). Saat tim lapangan kirim pesan WA, gateway forward via webhook ke sistem, parse, auto-create tiket, dan reply otomatis.</p>
            <p className="mt-1">Estimasi biaya: Rp 200rb–800rb/bulan tergantung pilihan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BotSimulator;
