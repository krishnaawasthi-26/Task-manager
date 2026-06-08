export default function StatsCard({ label, value, icon: Icon, tone = 'accent' }) {
  return (
    <article className="glass card-hover rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-bold text-textMuted">{label}</span>
        {Icon && <Icon className={'text-' + tone} size={20} />}
      </div>
      <strong className="font-display text-3xl">{value}</strong>
    </article>
  );
}
