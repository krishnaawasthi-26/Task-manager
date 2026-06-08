import { Calendar, Check, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Badge from '../UI/Badge';
import CategoryBadge from '../Categories/CategoryBadge';
import { formatDate, isOverdue, priorityColor, statusLabel } from '../../utils/helpers';

export default function TaskCard({ task, onEdit, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const overdue = isOverdue(task.due_date || task.dueDate, task.status);
  return (
    <article className="glass card-hover rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge variant={priorityColor(task.priority)}>{task.priority}</Badge>
        <CategoryBadge category={task.category} />
      </div>
      <h3 className="line-clamp-2 font-display text-xl font-bold">{task.title}</h3>
      <p className="line-clamp-3 mt-2 min-h-[64px] text-sm text-textMuted">{task.description || 'No description provided.'}</p>
      <div className="mt-4 flex items-center justify-between">
        <Badge variant={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'warning' : 'slate'}>{task.status === 'DONE' && <Check size={13} />}{statusLabel(task.status)}</Badge>
        <span className={'flex items-center gap-1 text-xs font-bold ' + (overdue ? 'text-danger' : 'text-textMuted')}><Calendar size={14} /> {overdue ? 'Overdue ' : ''}{formatDate(task.due_date || task.dueDate)}</span>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-textMuted">Created {formatDate(task.created_at || task.createdAt)}</span>
        {confirm ? (
          <div className="flex items-center gap-2 text-sm">
            <span>Sure?</span>
            <button onClick={() => onDelete(task.id)} className="font-bold text-danger">Yes</button>
            <button onClick={() => setConfirm(false)} className="font-bold text-textMuted">No</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => onEdit(task)} className="rounded-lg p-2 hover:bg-elevated"><Edit size={16} /></button>
            <button onClick={() => setConfirm(true)} className="rounded-lg p-2 text-danger hover:bg-red-500/10"><Trash2 size={16} /></button>
          </div>
        )}
      </div>
    </article>
  );
}
