import { BarChart3, ChartNoAxesColumnIncreasing, LogOut, Tags, Users, ClipboardList } from 'lucide-react';
import { initials, avatarColor } from '../../utils/helpers';
import Button from '../UI/Button';

const items = [
  { id: 'tasks', label: 'My Tasks', icon: ClipboardList },
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'users', label: 'Users', icon: Users, admin: true },
  { id: 'stats', label: 'Admin Stats', icon: ChartNoAxesColumnIncreasing, admin: true }
];

export default function Sidebar({ active, onChange, user, logout }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-surface/95 p-4 lg:flex lg:flex-col">
      <div className="mb-8 font-display text-2xl font-extrabold">TaskVault</div>
      <nav className="flex-1 space-y-1">
        {items.filter((item) => !item.admin || user?.role === 'ADMIN').map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => onChange(item.id)} className={'flex w-full items-center gap-3 rounded-xl border-l-4 px-3 py-3 text-left font-bold transition-all ' + (active === item.id ? 'border-accent bg-indigo-500/15 text-textPrimary' : 'border-transparent text-textMuted hover:bg-elevated hover:text-textPrimary')}>
              <Icon size={18} /> {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-border pt-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full font-bold text-white" style={{ backgroundColor: avatarColor(user?.name) }}>{initials(user?.name)}</div>
          <div className="min-w-0">
            <div className="truncate font-bold">{user?.name}</div>
            <div className="text-xs text-textMuted">{user?.role}</div>
          </div>
        </div>
        <Button variant="secondary" onClick={logout} className="w-full"><LogOut size={16} /> Logout</Button>
      </div>
    </aside>
  );
}
