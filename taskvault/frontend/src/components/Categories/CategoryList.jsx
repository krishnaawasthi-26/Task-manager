import { Edit, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesApi } from '../../api/categoriesApi';
import { iconFor } from '../../utils/helpers';
import Button from '../UI/Button';

export default function CategoryList({ categories, onCreate, onEdit, reload }) {
  const remove = async (category) => {
    try {
      await categoriesApi.remove(category.id);
      toast.success('Category deleted');
      reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete category');
    }
  };
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold">Categories</h2>
        <Button onClick={onCreate}><Plus size={18} /> New Category</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const Icon = iconFor(category.icon);
          return (
            <article key={category.id} className="glass card-hover overflow-hidden rounded-2xl">
              <div className="h-1" style={{ backgroundColor: category.color }} />
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Icon style={{ color: category.color }} />
                  {category.is_global || category.isGlobal ? <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-xs font-bold text-indigo-300">Global</span> : null}
                </div>
                <h3 className="font-display text-xl font-bold">{category.name}</h3>
                <p title={category.description} className="line-clamp-2 mt-2 text-sm text-textMuted">{category.description || 'No description provided'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-elevated px-3 py-1 text-xs font-bold text-textMuted">{category.task_count ?? category.taskCount ?? 0} tasks</span>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(category)} className="rounded-lg p-2 hover:bg-elevated"><Edit size={16} /></button>
                    <button onClick={() => remove(category)} className="rounded-lg p-2 text-danger hover:bg-red-500/10" title="Delete category"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
