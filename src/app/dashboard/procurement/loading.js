export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="skeleton skeleton-card" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton skeleton-card" style={{ height: '112px' }} />
        ))}
      </div>
      <div className="skeleton skeleton-card" style={{ height: '256px' }} />
    </div>
  );
}
