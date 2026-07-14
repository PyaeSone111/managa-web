import { useEffect } from 'react';

/**
 * Success / error modal for admin feedback (replaces window.alert).
 */
export default function StatusModal({
  open,
  type = 'success',
  title,
  message,
  confirmLabel = 'OK',
  onClose,
}) {
  const isSuccess = type === 'success';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-torrefacto-roast/45 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-stone-lion/20 bg-bonaire shadow-2xl shadow-torrefacto-roast/20 overflow-hidden animate-[statusModalIn_0.2s_ease-out]">
        <div
          className={`h-1.5 w-full ${isSuccess ? 'bg-emerald-500' : 'bg-indiana-clay'}`}
        />
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                isSuccess
                  ? 'bg-emerald-500/15 text-emerald-600'
                  : 'bg-indiana-clay/15 text-indiana-clay'
              }`}
            >
              {isSuccess ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3
                id="status-modal-title"
                className="text-lg font-semibold text-torrefacto-roast leading-snug"
              >
                {title || (isSuccess ? 'Success' : 'Something went wrong')}
              </h3>
              {message ? (
                <p className="mt-2 text-sm text-stone-lion leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bonaire ${
                isSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                  : 'bg-indiana-clay hover:bg-indiana-clay/90 focus:ring-indiana-clay'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes statusModalIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
