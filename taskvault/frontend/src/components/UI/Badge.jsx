const variants = {
  slate: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
  accent: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-300 border-red-500/20'
};

export default function Badge({ children, variant = 'slate', className = '' }) {
  return <span className={'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ' + variants[variant] + ' ' + className}>{children}</span>;
}
