import { Loader2 } from 'lucide-react';

export default function Button({ children, variant = 'primary', isLoading = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-elevated text-textPrimary border border-border hover:border-accent',
    ghost: 'bg-transparent text-textMuted hover:text-textPrimary hover:bg-elevated',
    danger: 'bg-danger text-white hover:bg-red-500'
  };
  return (
    <button className={'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ' + variants[variant] + ' ' + className} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}
