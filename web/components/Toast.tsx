"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastVariant = "pending" | "success" | "error";

type ToastInput = {
  title: string;
  description?: string;
  variant: ToastVariant;
  href?: string;
  linkLabel?: string;
  durationMs?: number;
};

type ToastItem = ToastInput & { id: number };

type ToastContextValue = {
  showToast: (toast: ToastInput) => number;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  pending: "border-base-sky/30 bg-white",
  success: "border-base-mint/30 bg-white",
  error: "border-base-pink/30 bg-white",
};

const VARIANT_DOT: Record<ToastVariant, string> = {
  pending: "bg-base-sky animate-pulse",
  success: "bg-base-mint",
  error: "bg-base-pink",
};

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  pending: 0,
  success: 8000,
  error: 8000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = idRef.current++;
      setToasts((current) => [...current, { ...toast, id }]);

      const duration = toast.durationMs ?? DEFAULT_DURATION[toast.variant];
      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex flex-col items-center gap-3 px-5 sm:items-end sm:px-8">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 shadow-card ${VARIANT_STYLES[toast.variant]}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${VARIANT_DOT[toast.variant]}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-slate-500">{toast.description}</p>
          )}
          {toast.href && (
            <a
              href={toast.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block text-xs font-semibold text-base-blue hover:underline"
            >
              {toast.linkLabel ?? "View on Basescan"}
            </a>
          )}
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 text-slate-400 transition hover:text-slate-600"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
