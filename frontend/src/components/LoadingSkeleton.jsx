// Loading skeleton with placeholder shapes that match the final layout so the
// page does not jump when real data loads. Only visible while `loading` is true.
const LoadingSkeleton = ({ variant = 'chart', count = 3, loading = true }) => {
  if (!loading) return null;

  if (variant === 'card') {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4"
        data-testid="skeleton-cards"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-6 border rounded-lg shadow-sm bg-white flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-300 rounded" />
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className="w-full border rounded-lg bg-white p-6 animate-pulse"
        data-testid="skeleton-table"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded mb-3 last:mb-0" />
        ))}
      </div>
    );
  }

  // chart (default)
  return (
    <div
      className="w-full h-96 p-6 border rounded-lg shadow-sm bg-white animate-pulse"
      data-testid="skeleton-chart"
    >
      <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
      <div className="h-[70%] w-full bg-gray-100 rounded" />
    </div>
  );
};

export default LoadingSkeleton;
