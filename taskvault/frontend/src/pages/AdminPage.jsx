import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import { avatarColor, initials, formatDate } from '../utils/helpers';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const response = await api.get('/users', { params: { search, size: 20 } });
    setUsers(response.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (user) => {
    await api.patch('/users/' + user.id + '/role', { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
    toast.success('Role updated');
    load();
  };

  const toggleStatus = async (user) => {
    await api.patch('/users/' + user.id + '/status', { isActive: !user.is_active });
    toast.success('Status updated');
    load();
  };

  return (
    <main className="min-h-screen p-6 lg:ml-60">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold">Admin Users</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Search users" className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-accent" />
      </div>
      <div className="glass overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[860px] text-left">
          <thead className="text-sm uppercase text-textMuted"><tr><th className="p-4">User</th><th>Email</th><th>Role</th><th>Status</th><th>Tasks</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.id} className="border-t border-border">
            <td className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full font-bold text-white" style={{ backgroundColor: avatarColor(user.name) }}>{initials(user.name)}</div>{user.name}</div></td>
            <td>{user.email}</td>
            <td><Badge variant={user.role === 'ADMIN' ? 'accent' : 'slate'}>{user.role}</Badge></td>
            <td><span className={user.is_active ? 'text-success' : 'text-danger'}>{user.is_active ? '● Active' : '● Inactive'}</span></td>
            <td>{user.task_count ?? user.taskCount ?? 0}</td>
            <td>{formatDate(user.created_at || user.createdAt)}</td>
            <td><div className="flex gap-2"><Button variant="secondary" onClick={() => changeRole(user)}>Change Role</Button><Button variant="secondary" onClick={() => toggleStatus(user)}>Toggle Status</Button></div></td>
          </tr>)}</tbody>
        </table>
      </div>
    </main>
  );
}
