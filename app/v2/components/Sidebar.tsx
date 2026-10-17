import { Activity, Inbox, Route, Settings } from 'lucide-react';
import React from 'react';

interface SidebarProps {
  activeTab: string;
  onSelectNav: (nav: 'inbox' | 'all-services' | 'settings') => void;
  inboxCount?: number;
  servicesCount?: number;
  domainsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectNav,
  inboxCount = 12,
  servicesCount = 5,
  domainsCount = 2,
}) => {
  const isInboxActive = activeTab === 'inbox';
  const isServicesActive = activeTab === 'all-services';
  const isSettingsActive = activeTab === 'settings';

  return (
    <aside className="w-60 bg-white border-r border-slate-200 z-40 flex flex-col justify-between py-4 px-3 flex-shrink-0 h-full select-none">
      <div className="flex flex-col gap-5">
        {/* Brand Logo */}
        <div className="h-10 flex items-center px-2 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs">
            <Route className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-[14px] font-bold tracking-tight text-slate-900 block leading-tight">
              OVERSITE
            </span>
            <span className="font-mono text-[10px] text-slate-400 block leading-none mt-0.5">
              Overhaul
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5" id="sidebarNav">
          <button
            id="sidebar-btn-inbox"
            onClick={() => onSelectNav('inbox')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
              isInboxActive
                ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Inbox className={`w-4 h-4 ${isInboxActive ? 'text-slate-900' : 'text-slate-500'}`} />
            <span>Bandeja Correos</span>
            <span className="ml-auto bg-slate-100 text-slate-600 text-[11px] font-mono px-1.5 py-0.2 rounded-full font-medium">
              {inboxCount}
            </span>
          </button>

          <button
            id="sidebar-btn-services"
            onClick={() => onSelectNav('all-services')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
              isServicesActive
                ? 'bg-emerald-50 text-emerald-950 font-bold shadow-2xs border border-emerald-200/80'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Servicios (Todos)</span>
            <span className="ml-auto bg-emerald-100 text-emerald-800 text-[11px] font-mono px-1.5 py-0.2 rounded-full font-bold border border-emerald-200">
              {servicesCount}
            </span>
          </button>

          <button
            id="sidebar-btn-settings"
            onClick={() => onSelectNav('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
              isSettingsActive
                ? 'bg-blue-50 text-blue-950 font-bold shadow-2xs border border-blue-200/80'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Configuración</span>
            <span className={`ml-auto text-[11px] font-mono px-1.5 py-0.2 rounded-full font-bold border ${
              isSettingsActive
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {domainsCount}
            </span>
          </button>
        </nav>
      </div>

      {/* User / System badge */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="px-2 py-1.5 rounded-lg bg-slate-50 flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">
              Online
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">v2.4.1</span>
        </div>
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            OP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">Operador Central</p>
            <p className="text-[10px] text-slate-400 font-mono">ID: #9941</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
