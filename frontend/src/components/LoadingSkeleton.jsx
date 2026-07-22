// Loading skeleton with placeholder shapes that match the final layout so the
// page does not jump when real data loads. Only visible while `loading` is true.
const LoadingSkeleton = ({ variant = 'chart', count = 3, loading = true }) => {
  if (!loading) return null;

  if (variant === 'card') {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4"
        data-testid="skeleton-cards"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl bg-white p-4 animate-pulse"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <div className="w-7 h-7 rounded-lg bg-gray-200" />
            </div>
            <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-20 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div
        className="w-full border border-gray-200 rounded-lg bg-white p-6 animate-pulse"
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
      className="w-full border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden animate-pulse"
      data-testid="skeleton-chart"
    >
      <div className="bg-gray-200 h-11" />
      <div className="p-6">
        <div className="h-[70%] w-full bg-gray-100 rounded" />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
