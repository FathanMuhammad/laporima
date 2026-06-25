import React, { useState } from 'react';
import { USERS, isOffice } from '../data/constants';

function UserSwitcher({ currentUserId, setUser }) {
  const [open, setOpen] = useState(false);
  const cu = USERS.find(u => u.id === currentUserId) || USERS[0];
  const grouped = {
    'Office (Dashboard Penuh)':   USERS.filter(u => isOffice(u.peran)),
    'PJ Kecamatan (Field Only)':  USERS.filter(u => u.peran === 'pj_kecamatan'),
    'Tim Lapangan (Field Only)':  USERS.filter(u => u.peran === 'pic'),
    'Spesialisasi':               USERS.filter(u => ['lo_dinas','pigura','super_admin'].includes(u.peran)),
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${cu.color}`}>
          {cu.nama.split(' ').map(s=>s[0]).slice(0,2).join('')}
        </span>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-slate-800">{cu.nama}</div>
          <div className="text-xs text-slate-500">{cu.label}</div>
        </div>
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-30 max-h-[80vh] overflow-y-auto">
          {Object.entries(grouped).map(([groupName, users]) => (
            <div key={groupName}>
              <div className="px-3 py-1.5 text-xs text-slate-500 uppercase tracking-wide bg-slate-50">{groupName}</div>
              {users.map(u => (
                <button key={u.id} onClick={() => { setUser(u.id); setOpen(false); }}
                  className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-50 ${currentUserId === u.id ? 'bg-rose-50' : ''}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${u.color}`}>
                    {u.nama.split(' ').map(s=>s[0]).slice(0,2).join('')}
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-800">{u.nama}</div>
                    <div className="text-xs text-slate-500">{u.label}</div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserSwitcher;
