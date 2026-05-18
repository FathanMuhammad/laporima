import React, { useState, useEffect } from 'react';
import { loadStore, saveStore, updateSingleTicket } from './services/sheets';
import { USERS, isOffice, isField } from './data/constants';

import UserSwitcher from './components/UserSwitcher';
import Dashboard from './components/Dashboard';
import DaftarAduan from './components/DaftarAduan';
import TugasSaya from './components/TugasSaya';
import FormBaru from './components/FormBaru';
import DetailTiket from './components/DetailTiket';
import AntrianSosmed from './components/AntrianSosmed';
import AntrianPigura from './components/AntrianPigura';
import BotSimulator from './components/BotSimulator';
import Pengaturan from './components/Pengaturan';

function App() {
  const [store, setStore] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadStore().then(data => setStore(data));
  }, []);

  useEffect(() => {
    if (store) saveStore(store);
  }, [store]);

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center font-bold text-2xl shadow-lg mb-4 animate-pulse">
          LI
        </div>
        <div className="font-bold text-2xl text-slate-800 tracking-tight">LaporIma</div>
        <div className="text-sm text-slate-500 mt-2">Memuat data...</div>
      </div>
    );
  }

  const currentUser = USERS.find(u => u.id === store.currentUserId) || USERS[0];

  const update = (mutator) => setStore(s => {
    const n = JSON.parse(JSON.stringify(s));
    mutator(n);

    // Compare old state and new state to find modified tickets
    // This allows us to sync individual rows to Google Sheets
    const modifiedTickets = n.tickets.filter(newT => {
      const oldT = s.tickets.find(x => x.id === newT.id);
      return JSON.stringify(newT) !== JSON.stringify(oldT);
    });

    modifiedTickets.forEach(t => updateSingleTicket(t));

    return n;
  });

  const setUser = (id) => update(s => { s.currentUserId = id; });
  const resetData = () => { localStorage.removeItem('laporima_v2'); window.location.reload(); };

  const openTicket = (id) => { setSelectedTicketId(id); setPage('detail'); };
  const goBack = () => { setSelectedTicketId(null); setPage('aduan'); };

  // Pages by role (RBAC)
  const allPages = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['*'] },
    { id: 'aduan', label: 'Daftar Aduan', icon: '📋', roles: ['*'] },
    { id: 'tugas', label: 'Tugas Saya', icon: '✅', roles: ['pic', 'pj_kecamatan', 'koordinator', 'lo_dinas', 'admin_kantor'] },
    { id: 'baru', label: 'Tiket Baru', icon: '➕', roles: ['admin_kantor', 'pic', 'pj_kecamatan', 'koordinator', 'lo_dinas'] },
    { id: 'sosmed', label: 'Antrian Sosmed', icon: '📱', roles: ['sosmed', 'koordinator', 'admin_kantor', 'owner', 'super_admin'] },
    { id: 'pigura', label: 'Antrian Pigura', icon: '🖼️', roles: ['pigura', 'koordinator', 'admin_kantor', 'owner', 'super_admin'] },
    { id: 'bot', label: 'Bot WA Simulator', icon: '🤖', roles: ['admin_kantor', 'koordinator', 'owner', 'super_admin'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️', roles: ['super_admin', 'koordinator', 'admin_kantor', 'owner'] },
  ];
  const visiblePages = allPages.filter(p => p.roles.includes('*') || p.roles.includes(currentUser.peran));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center font-bold">LI</div>
          <div>
            <div className="font-semibold text-slate-800">LaporIma</div>
            <div className="text-xs text-slate-500">Tim Ima Mahdiah · DPRD DKI Jakarta · Dapil 10 (Jakbar)</div>
          </div>
        </div>
        <UserSwitcher currentUserId={store.currentUserId} setUser={setUser} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="bg-white border-r border-slate-200 w-56 hidden md:flex flex-col justify-between overflow-y-auto">
          <nav className="p-3 space-y-1">
            {visiblePages.map(p => (
              <button key={p.id} onClick={() => { setPage(p.id); setSelectedTicketId(null); }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition ${page === p.id ? 'bg-rose-50 text-rose-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-200 text-xs text-slate-500">
            <div className="font-medium">{currentUser.label}</div>
            <div>Tier: {isOffice(currentUser.peran) ? 'Office (Full Akses)' : isField(currentUser.peran) ? 'Field (Operasional)' : 'Khusus'}</div>
          </div>
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex overflow-x-auto">
          {visiblePages.slice(0, 5).map(p => (
            <button key={p.id} onClick={() => { setPage(p.id); setSelectedTicketId(null); }}
              className={`flex-1 min-w-fit px-3 py-2 text-xs flex flex-col items-center gap-0.5 ${page === p.id ? 'text-rose-700' : 'text-slate-600'}`}>
              <span className="text-lg">{p.icon}</span>{p.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden overflow-y-auto">
          {page === 'dashboard' && <Dashboard store={store} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'aduan' && <DaftarAduan store={store} update={update} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'tugas' && <TugasSaya store={store} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'baru' && <FormBaru store={store} update={update} currentUser={currentUser} onCreated={openTicket} />}
          {page === 'detail' && <DetailTiket store={store} update={update} ticketId={selectedTicketId} currentUser={currentUser} goBack={goBack} />}
          {page === 'sosmed' && <AntrianSosmed store={store} update={update} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'pigura' && <AntrianPigura store={store} update={update} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'bot' && <BotSimulator store={store} update={update} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'pengaturan' && <Pengaturan store={store} currentUser={currentUser} />}
        </main>
      </div>

      {showHelp && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold">Panduan Prototype</h3>
            <button onClick={() => setShowHelp(false)}>❌</button>
          </div>
          <div className="p-4 text-sm space-y-2">
            <p>1. Ganti user di pojok kanan atas untuk melihat view berbeda.</p>
            <p>2. Gunakan Bot WA Simulator untuk simulasi lapor warga.</p>
            <p>3. PIC Lapangan dapat 'Check-in GPS' pada tiket.</p>
            <p>4. Data tersimpan di localStorage browser.</p>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default App;
