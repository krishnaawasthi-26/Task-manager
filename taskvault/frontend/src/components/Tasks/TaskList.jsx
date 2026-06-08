import { ClipboardList, Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import SkeletonCard from '../UI/SkeletonCard';
import Button from '../UI/Button';

export default function TaskList({ tasks, isLoading, onCreate, onEdit, onDelete }) {
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}</div>;
  }
  if (!tasks.length) {
    return (
      <div className="glass grid min-h-[320px] place-items-center rounded-2xl p-8 text-center">
        <div>
          <ClipboardList className="mx-auto mb-4 text-accent" size={64} />
          <h3 className="font-display text-2xl font-bold">No tasks yet</h3>
          <p className="mt-2 text-textMuted">Create your first task and organize it with categories.</p>
          <Button onClick={onCreate} className="mt-5"><Plus size={18} /> Create Task</Button>
        </div>
      </div>
    );
  }
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />)}</div>;
}
