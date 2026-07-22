import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

let toastId = 0;
let addToastFn = null;

export function showToast(message, type = 'success') {
  if (addToastFn) addToastFn(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => { addToastFn = addToast; return () => { addToastFn = null; }; }, [addToast]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm text-sm font-medium animate-in slide-in-from-right-2 ${
            type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {type === 'success'
            ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
            : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
          }
          <span className="flex-1">{message}</span>
          <button onClick={() => remove(id)} className="p-0.5 hover:opacity-60 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}