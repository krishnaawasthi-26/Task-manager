export default function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="skeleton mb-4 h-5 w-24 rounded" />
      <div className="skeleton mb-3 h-7 w-3/4 rounded" />
      <div className="skeleton mb-2 h-4 w-full rounded" />
      <div className="skeleton mb-5 h-4 w-2/3 rounded" />
      <div className="skeleton h-9 w-full rounded" />
    </div>
  );
}
