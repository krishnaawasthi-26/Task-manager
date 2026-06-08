import { useState } from 'react';
import { icons } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const presets = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#A855F7'];
const iconNames = ['tag', 'briefcase', 'home', 'heart-pulse', 'wallet', 'graduation-cap', 'zap', 'calendar', 'book-open', 'target', 'rocket', 'code', 'dumbbell', 'music', 'plane', 'shopping-bag', 'coffee', 'sparkles', 'folder', 'star'];

export default function CategoryModal({ initial, isAdmin, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    color: initial?.color || '#6366F1',
    icon: initial?.icon || 'tag',
    isGlobal: initial?.is_global ?? initial?.isGlobal ?? false
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? 'Edit Category' : 'New Category'} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button form="category-form" type="submit" isLoading={saving}>Save</Button></>}>
      <form id="category-form" onSubmit={submit} className="space-y-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label className="block">
          <span className="mb-2 block text-sm font-bold">Description</span>
          <textarea maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-24 w-full rounded-xl border border-border bg-surface p-3 outline-none focus:border-accent" />
          <span className="text-xs text-textMuted">{form.description.length}/500</span>
        </label>
        <div>
          <span className="mb-2 block text-sm font-bold">Color</span>
          <div className="mb-3 flex flex-wrap gap-2">{presets.map((color) => <button key={color} type="button" onClick={() => setForm({ ...form, color })} className="h-8 w-8 rounded-full border-2" style={{ backgroundColor: color, borderColor: form.color === color ? '#fff' : color }} />)}</div>
          <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} pattern="^#[0-9A-Fa-f]{6}$" />
        </div>
        <div>
          <span className="mb-2 block text-sm font-bold">Icon</span>
          <div className="grid grid-cols-10 gap-2">{iconNames.map((name) => {
            const Icon = icons[name.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('')] || icons.Tag;
            return <button key={name} type="button" onClick={() => setForm({ ...form, icon: name })} className={'grid h-9 place-items-center rounded-lg border ' + (form.icon === name ? 'border-accent bg-indigo-500/20' : 'border-border bg-surface')} title={name}><Icon size={16} /></button>;
          })}</div>
        </div>
        {isAdmin && <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={form.isGlobal} onChange={(e) => setForm({ ...form, isGlobal: e.target.checked })} /> Global category</label>}
      </form>
    </Modal>
  );
}
