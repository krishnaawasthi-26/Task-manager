import { useState } from 'react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const today = new Date().toISOString().slice(0, 10);

export default function TaskModal({ initial, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    categoryId: initial?.category?.id || '',
    status: initial?.status || 'TODO',
    priority: initial?.priority || 'MEDIUM',
    dueDate: initial?.due_date || initial?.dueDate || ''
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, categoryId: form.categoryId || null, dueDate: form.dueDate || null });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? 'Edit Task' : 'New Task'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button form="task-form" type="submit" isLoading={saving}>{initial ? 'Update Task' : 'Save Task'}</Button></>}>
      <form id="task-form" onSubmit={submit} className="space-y-4">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} minLength={3} maxLength={255} required />
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Description</span>
          <textarea rows={5} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-border bg-surface p-3 outline-none focus:border-accent" />
          <span className="text-xs text-textMuted">{form.description.length}/5000</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Category</span>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded-xl border border-border bg-surface p-3 outline-none focus:border-accent">
            <option value="">Uncategorized</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name} - {category.description}</option>)}
          </select>
        </label>
        <div>
          <span className="mb-2 block text-sm font-bold">Status</span>
          <div className="grid grid-cols-3 gap-2">{['TODO', 'IN_PROGRESS', 'DONE'].map((status) => <button type="button" key={status} onClick={() => setForm({ ...form, status })} className={'rounded-xl border p-3 text-sm font-bold ' + (form.status === status ? 'border-accent bg-indigo-500/20' : 'border-border bg-surface')}>{status.replace('_', ' ')}</button>)}</div>
        </div>
        <div>
          <span className="mb-2 block text-sm font-bold">Priority</span>
          <div className="grid grid-cols-3 gap-2">{['LOW', 'MEDIUM', 'HIGH'].map((priority) => <button type="button" key={priority} onClick={() => setForm({ ...form, priority })} className={'rounded-xl border p-3 text-sm font-bold ' + (form.priority === priority ? 'border-accent bg-indigo-500/20' : 'border-border bg-surface')}>{priority}</button>)}</div>
        </div>
        <Input label="Due Date" type="date" min={today} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
      </form>
    </Modal>
  );
}
