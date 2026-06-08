import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading' }) {
  return <div className="flex min-h-[240px] items-center justify-center gap-3 text-textMuted"><Loader2 className="animate-spin" />{label}</div>;
}
