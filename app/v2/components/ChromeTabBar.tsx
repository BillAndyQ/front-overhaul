import { Activity, FilePlus2, FileText, Inbox, Mail, Settings, X } from 'lucide-react';
import React from 'react';
import { TabItem } from '../types';

interface ChromeTabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  activeStatusText: string;
}

export const ChromeTabBar: React.FC<ChromeTabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  activeStatusText,
}) => {


  // Si la letra tiene más de 10 caracteres, se debe truncar y mostrar "..." al final. Esto es para mantener la barra de pestañas limpia y evitar que los nombres largos ocupen demasiado espacio.
  const truncateLabel = (label: string, maxLength: number) => {
    if (label.length > maxLength) {
      return label.substring(0, maxLength) + '...';
    }
    return label;
  };

  return (
    <div className="bg-slate-200/90 border-b border-slate-300 pt-1 px-3 flex items-center justify-between flex-shrink-0 select-none">
      <div className="flex items-center gap-1 overflow-x-auto" id="chromeTabsBar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center text-nowrap gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all border-x border-t cursor-pointer ${
                isActive
                  ? 'chrome-tab-active bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/70 border-transparent'
              }`}
            >
              {tab.type === 'inbox' && (
                <>
                  <Inbox className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="font-semibold text-nowrap">{truncateLabel(tab.label, 10)}</span>
                  {tab.badge !== undefined && (
                    <span className="bg-slate-300 text-nowrap text-slate-700 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </>
              )}

              {tab.type === 'all-services' && (
                <>
                  <Activity className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="font-semibold text-nowrap">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="bg-emerald-100 text-nowrap text-emerald-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border border-emerald-200 ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </>
              )}

              {tab.type === 'email-dossier' && (
                <>
                  <Mail className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-mono text-slate-800 font-semibold truncate max-w-[100px]">
                    {tab.refCode}
                  </span>
                  <span className="text-slate-500 text-[11px] truncate max-w-[120px]">
                    {tab.sublabel}
                  </span>
                </>
              )}

              {tab.type === 'service-dossier' && (
                <>
                  <FileText className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-mono text-slate-900 font-bold truncate max-w-[160px]">
                    {tab.refCode}
                  </span>
                  <span className="text-slate-600 text-[11px] truncate max-w-[140px]">
                    {tab.sublabel}
                  </span>
                </>
              )}

              {tab.type === 'service-create' && (
                <>
                  <FilePlus2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-nowrap">{tab.label}</span>
                </>
              )}

              {tab.type === 'settings' && (
                <>
                  <Settings className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                  <span className="font-semibold text-nowrap">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border border-blue-200 ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </>
              )}

              {tab.closable && (
                <button
                  type="button"
                  aria-label={`Cerrar pestaña ${tab.label}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-700 ml-1 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  title="Cerrar pestaña"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado en pestaña */}
      {/* <div className="flex items-center gap-2 pb-0.5 text-[11px] font-mono text-slate-500 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span id="activeTabStatusLabel">{activeStatusText}</span>
      </div> */}
    </div>
  );
};
