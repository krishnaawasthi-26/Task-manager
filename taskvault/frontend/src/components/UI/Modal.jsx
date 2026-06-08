import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <section className="glass w-full max-w-xl rounded-2xl shadow-2xl animate-slideUp">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-textMuted hover:bg-elevated hover:text-textPrimary"><X size={20} /></button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-border p-5">{footer}</footer>}
      </section>
    </div>
  );
}
