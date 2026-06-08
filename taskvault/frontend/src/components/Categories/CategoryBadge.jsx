import { iconFor } from '../../utils/helpers';

export default function CategoryBadge({ category }) {
  if (!category) return <span className="rounded-full border border-border px-2.5 py-1 text-xs font-bold text-textMuted">Uncategorized</span>;
  const Icon = iconFor(category.icon);
  return (
    <span title={category.description || category.name} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-bold" style={{ color: category.color }}>
      <Icon size={13} /> {category.name}
    </span>
  );
}
