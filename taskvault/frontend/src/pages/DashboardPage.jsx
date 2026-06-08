import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, ClipboardList, Plus, Search } from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { tasksApi } from '../api/tasksApi';
import Sidebar from '../components/Layout/Sidebar';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import StatsCard from '../components/UI/StatsCard';
import TaskList from '../components/Tasks/TaskList';
import TaskModal from '../components/Tasks/TaskModal';
import CategoryList from '../components/Categories/CategoryList';
import CategoryModal from '../components/Categories/CategoryModal';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useTasks } from '../hooks/useTasks';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('tasks');
  const [params, setParams] = useState({ page: 0, size: 9, sortBy: 'createdAt', sortDir: 'desc' });
  const [taskModal, setTaskModal] = useState(null);
  const [categoryModal, setCategoryModal] = useState(null);
  const [stats, setStats] = useState(null);
  const { tasks, meta, isLoading, reload } = useTasks(params);
  const { categories, reload: reloadCategories } = useCategories({ size: 100 });

  useEffect(() => {
    if (tab === 'stats' || tab === 'overview') {
      tasksApi.stats().then(setStats).catch(() => {});
    }
  }, [tab]);

  const counts = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((task) => task.status === 'TODO').length,
    progress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    done: tasks.filter((task) => task.status === 'DONE').length
  }), [tasks]);

  const saveTask = async (payload) => {
    try {
      if (taskModal?.id) await tasksApi.update(taskModal.id, payload);
      else await tasksApi.create(payload);
      toast.success(taskModal?.id ? 'Task updated' : 'Task created');
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksApi.remove(id);
      toast.success('Task deleted');
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete task');
    }
  };

  const saveCategory = async (payload) => {
    try {
      if (categoryModal?.id) await categoriesApi.update(categoryModal.id, payload);
      else await categoriesApi.create(payload);
      toast.success(categoryModal?.id ? 'Category updated' : 'Category created');
      reloadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save category');
    }
  };

  const renderStats = () => {
    const data = stats || {};
    return (
      <section className="space-y-6">
        <h2 className="font-display text-3xl font-bold">{tab === 'stats' ? 'Admin Stats' : 'Overview'}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard label="Total Users" value={data.total_users ?? data.totalUsers ?? 0} icon={ClipboardList} />
          <StatsCard label="Active Users" value={data.active_users ?? data.activeUsers ?? 0} icon={CheckCircle} />
          <StatsCard label="Total Tasks" value={data.total_tasks ?? data.totalTasks ?? 0} icon={ClipboardList} />
          <StatsCard label="Completion Rate" value={(data.tasks_by_status?.done || data.tasksByStatus?.done || 0) + '/' + (data.total_tasks ?? data.totalTasks ?? 0)} icon={Clock} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {['tasks_by_status', 'tasks_by_priority'].map((key) => {
            const map = data[key] || data[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] || {};
            return <article key={key} className="glass rounded-2xl p-5"><h3 className="mb-4 font-display text-xl font-bold">{key.replaceAll('_', ' ')}</h3>{Object.entries(map).map(([name, value]) => <div key={name} className="mb-3"><div className="mb-1 flex justify-between text-sm"><span>{name}</span><span>{value}</span></div><div className="h-2 rounded bg-border"><div className="h-2 rounded bg-accent" style={{ width: Math.min(100, Number(value) * 20 + 8) + '%' }} /></div></div>)}</article>;
          })}
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen">
      <Sidebar active={tab} onChange={setTab} user={user} logout={logout} />
      <section className="p-4 lg:ml-60 lg:p-8">
        {tab === 'tasks' && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div><h1 className="font-display text-4xl font-bold">My Tasks</h1><span className="mt-2 inline-block rounded-full bg-indigo-500/15 px-3 py-1 text-sm font-bold text-indigo-300">{meta.totalElements ?? tasks.length} tasks</span></div>
              <Button onClick={() => setTaskModal({})}><Plus size={18} /> New Task</Button>
            </div>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <StatsCard label="Total" value={counts.total} icon={ClipboardList} />
              <StatsCard label="Todo" value={counts.todo} icon={Clock} />
              <StatsCard label="In Progress" value={counts.progress} icon={Clock} />
              <StatsCard label="Done" value={counts.done} icon={CheckCircle} />
            </div>
            <div className="glass mb-6 grid gap-3 rounded-2xl p-4 md:grid-cols-5">
              <Input icon={Search} placeholder="Search title and description" onChange={(e) => setParams({ ...params, search: e.target.value })} />
              <select onChange={(e) => setParams({ ...params, status: e.target.value || undefined })} className="rounded-xl border border-border bg-surface px-3 py-3"><option value="">All Status</option><option value="TODO">Todo</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select>
              <select onChange={(e) => setParams({ ...params, priority: e.target.value || undefined })} className="rounded-xl border border-border bg-surface px-3 py-3"><option value="">All Priority</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
              <select onChange={(e) => setParams({ ...params, categoryId: e.target.value || undefined })} className="rounded-xl border border-border bg-surface px-3 py-3"><option value="">All Categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select onChange={(e) => setParams({ ...params, sortBy: e.target.value })} className="rounded-xl border border-border bg-surface px-3 py-3"><option value="createdAt">Newest</option><option value="dueDate">Due Date</option><option value="title">A-Z</option><option value="priority">Priority</option></select>
            </div>
            <TaskList tasks={tasks} isLoading={isLoading} onCreate={() => setTaskModal({})} onEdit={setTaskModal} onDelete={deleteTask} />
            <div className="mt-6 flex items-center justify-between text-sm text-textMuted"><span>Showing {tasks.length} of {meta.totalElements ?? tasks.length}</span><div className="flex gap-2"><Button variant="secondary" disabled={params.page === 0} onClick={() => setParams({ ...params, page: Math.max(0, params.page - 1) })}>Prev</Button><Button variant="secondary" onClick={() => setParams({ ...params, page: params.page + 1 })}>Next</Button></div></div>
          </>
        )}
        {tab === 'categories' && <CategoryList categories={categories} onCreate={() => setCategoryModal({})} onEdit={setCategoryModal} reload={reloadCategories} />}
        {(tab === 'overview' || tab === 'stats') && renderStats()}
        {tab === 'users' && <iframe title="Admin users" src="/admin" className="h-[80vh] w-full rounded-2xl border border-border" />}
      </section>
      {taskModal && <TaskModal initial={taskModal.id ? taskModal : null} categories={categories} onClose={() => setTaskModal(null)} onSave={saveTask} />}
      {categoryModal && <CategoryModal initial={categoryModal.id ? categoryModal : null} isAdmin={user?.role === 'ADMIN'} onClose={() => setCategoryModal(null)} onSave={saveCategory} />}
    </main>
  );
}
