import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastItem } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      id="toastContainer"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 pointer-events-auto ${
              isSuccess
                ? 'bg-emerald-900 text-white border border-emerald-700'
                : isWarning
                ? 'bg-amber-900 text-white border border-amber-700'
                : 'bg-slate-900 text-white border border-slate-700'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {isWarning && <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {!isSuccess && !isWarning && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="ml-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
