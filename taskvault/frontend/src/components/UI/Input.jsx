export default function Input({ label, icon: Icon, error, right, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-bold text-textPrimary">{label}</span>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />}
        <input className={'w-full rounded-xl border border-border bg-surface px-4 py-3 text-textPrimary outline-none transition-all placeholder:text-textMuted focus:border-accent focus:ring-4 focus:ring-indigo-500/10 ' + (Icon ? 'pl-10 ' : '') + (right ? 'pr-12 ' : '') + className} {...props} />
        {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}
