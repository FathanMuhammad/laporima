import React, { useState, useEffect } from 'react';
import { loadStore, saveStore, updateSingleTicket } from './services/sheets';
import { USERS, isOffice, isField } from './data/constants';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CheckSquare, 
  PlusCircle, 
  Share2, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings,
  Menu
} from 'lucide-react';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await loadStore();
      setStore(data);
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStore().then(data => setStore(data));
    
    // Auto-refresh from Google Sheets every 30 seconds
    const interval = setInterval(async () => {
      try {
        const data = await loadStore();
        setStore(data);
      } catch (e) {
        console.warn('Auto-refresh failed:', e);
      }
    }, 30000);

    // Also refresh when user returns to the tab
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const data = await loadStore();
          setStore(data);
        } catch (e) {
          console.warn('Visibility refresh failed:', e);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  const update = (mutator) => {
    const n = JSON.parse(JSON.stringify(store));
    mutator(n);

    // Compare old state and new state to find modified tickets
    // This allows us to sync individual rows to Google Sheets
    const modifiedTickets = n.tickets.filter(newT => {
      const oldT = store.tickets.find(x => x.id === newT.id);
      return !oldT || JSON.stringify(newT) !== JSON.stringify(oldT);
    });

    setStore(n);
    modifiedTickets.forEach(t => updateSingleTicket(t));
  };

  const setUser = (id) => update(s => { s.currentUserId = id; });
  const resetData = () => { localStorage.removeItem('laporima_v2'); window.location.reload(); };

  const openTicket = (id) => { setSelectedTicketId(id); setPage('detail'); };
  const goBack = () => { setSelectedTicketId(null); setPage('aduan'); };

  // Pages by role (RBAC)
  const allPages = [
    { id: 'dashboard', label: 'Dashboard', roles: ['*'], icon: <LayoutDashboard size={18} /> },
    { id: 'aduan', label: 'Daftar Aduan', roles: ['*'], icon: <ClipboardList size={18} /> },
    { id: 'tugas', label: 'Tugas Saya', roles: ['pic', 'pj_kecamatan', 'lo_dinas', 'admin_kantor'], icon: <CheckSquare size={18} /> },
    { id: 'baru', label: 'Tiket Baru', roles: ['admin_kantor', 'pic', 'pj_kecamatan', 'lo_dinas'], icon: <PlusCircle size={18} /> },
    { id: 'sosmed', label: 'Antrian Sosmed', roles: ['sosmed', 'admin_kantor', 'owner', 'super_admin'], icon: <Share2 size={18} /> },
    { id: 'pigura', label: 'Antrian Pigura', roles: ['pigura', 'admin_kantor', 'owner', 'super_admin'], icon: <ImageIcon size={18} /> },
    { id: 'bot', label: 'Bot WA Simulator', roles: ['admin_kantor', 'owner', 'super_admin'], icon: <MessageSquare size={18} /> },
    { id: 'pengaturan', label: 'Pengaturan', roles: ['super_admin', 'admin_kantor', 'owner'], icon: <Settings size={18} /> },
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
                <span className={`${page === p.id ? 'text-rose-600' : 'text-slate-400'}`}>{p.icon}</span>{p.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-slate-200 text-xs text-slate-500">
            <div className="font-medium">{currentUser.label}</div>
            <div>Tier: {isOffice(currentUser.peran) ? 'Office (Full Akses)' : isField(currentUser.peran) ? 'Field (Operasional)' : 'Khusus'}</div>
          </div>
        </aside>

        {/* Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-stretch py-2 pb-5 px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] justify-around">
          {(() => {
            const limitMobile = visiblePages.length > 5;
            const mobilePages = limitMobile ? visiblePages.slice(0, 4) : visiblePages;
            const isDrawerPageActive = limitMobile && visiblePages.slice(4).some(p => p.id === page);

            return (
              <>
                {mobilePages.map(p => (
                  <button key={p.id} onClick={() => { setPage(p.id); setSelectedTicketId(null); setShowMobileMenu(false); }}
                    className={`flex-1 min-w-[64px] max-w-[80px] flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${page === p.id ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                    <div className={`p-1.5 rounded-lg ${page === p.id ? 'text-rose-600 bg-rose-50' : 'text-slate-400'}`}>
                      {p.icon ? React.cloneElement(p.icon, { size: 22 }) : null}
                    </div>
                    <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{p.label}</span>
                  </button>
                ))}

                {limitMobile && (
                  <button 
                    onClick={() => setShowMobileMenu(prev => !prev)}
                    className={`flex-1 min-w-[64px] max-w-[80px] flex flex-col items-center justify-center py-1 rounded-xl transition active:scale-95 ${isDrawerPageActive ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}
                  >
                    <div className={`p-1.5 rounded-lg ${isDrawerPageActive ? 'text-rose-600 bg-rose-50' : 'text-slate-400'}`}>
                      <Menu size={22} />
                    </div>
                    <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Lainnya</span>
                  </button>
                )}
              </>
            );
          })()}
        </div>

        {/* Mobile slide-up drawer menu for role-based extra pages */}
        {showMobileMenu && visiblePages.length > 5 && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={() => setShowMobileMenu(false)}>
            <div className="bg-white rounded-t-2xl w-full max-w-md p-5 pb-8 space-y-4 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">Menu Lainnya</h3>
                <button onClick={() => setShowMobileMenu(false)} className="text-slate-400 hover:text-slate-600 p-1 text-sm">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2">
                {visiblePages.slice(4).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPage(p.id);
                      setSelectedTicketId(null);
                      setShowMobileMenu(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition active:scale-95 ${
                      page === p.id 
                        ? 'border-rose-200 bg-rose-50 text-rose-700 font-semibold' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mb-1.5 ${page === p.id ? 'text-rose-600 bg-rose-50' : 'text-slate-500'}`}>
                      {p.icon ? React.cloneElement(p.icon, { size: 24 }) : null}
                    </div>
                    <span className="text-xs text-center font-medium leading-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden overflow-y-auto">
          {page === 'dashboard' && <Dashboard store={store} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'aduan' && (
            <DaftarAduan
              key={currentUser.id}
              store={store}
              update={update}
              currentUser={currentUser}
              openTicket={openTicket}
              refresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}
          {page === 'tugas' && <TugasSaya store={store} currentUser={currentUser} openTicket={openTicket} />}
          {page === 'baru' && <FormBaru key={currentUser.id} store={store} update={update} currentUser={currentUser} onCreated={openTicket} />}
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
