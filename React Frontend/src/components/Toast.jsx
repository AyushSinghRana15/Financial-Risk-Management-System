import { createContext, useContext, useState, useCallback } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons = {
    success: <FaCheckCircle className="text-green-400" />,
    error: <FaExclamationTriangle className="text-red-400" />,
    info: <FaInfoCircle className="text-blue-400" />,
  };

  const bgColors = {
    success: "border-green-500/30 bg-green-50 dark:bg-green-900/20",
    error: "border-red-500/30 bg-red-50 dark:bg-red-900/20",
    info: "border-blue-500/30 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm text-sm font-medium animate-slide-up ${bgColors[toast.type]}`}
          >
            <span className="text-lg flex-shrink-0">{icons[toast.type]}</span>
            <span className="text-slate-700 dark:text-slate-200">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
