import { Bell, ChevronsUpDown, FoldVertical, Search } from 'lucide-react';
import React from 'react';

interface TopHeaderProps {
  subtitle: string;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onOpenSearch?: () => void;
  unreadNotifications?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  subtitle,
  onExpandAll,
  onCollapseAll,
  onOpenSearch,
  unreadNotifications = true,
}) => {
  return (
    <header className="h-11 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
          <Terminal className="w-3.5 h-3.5 text-slate-700" />
          <span className="font-bold">DESPACHO / SERVICIOS &amp; EXPEDIENTES</span>
        </div> */}
        <span className="text-xs text-slate-400 font-mono hidden md:inline" id="topNavSubtitle">
          {subtitle}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          id="btn-expand-all"
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors cursor-pointer"
          onClick={onExpandAll}
          title="Expandir todas las secciones"
        >
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>Expandir todo</span>
        </button>
        <button
          id="btn-collapse-all"
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors cursor-pointer"
          onClick={onCollapseAll}
          title="Colapsar todas las secciones"
        >
          <FoldVertical className="w-3.5 h-3.5 text-slate-500" />
          <span>Colapsar todo</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          id="btn-header-search"
          aria-label="Buscar"
          className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          onClick={onOpenSearch}
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          id="btn-header-notifications"
          aria-label="Notificaciones"
          className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};
