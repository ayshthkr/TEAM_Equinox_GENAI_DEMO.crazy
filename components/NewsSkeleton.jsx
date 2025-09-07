


export default function NewsSkeleton({ count = 6 }) {
  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl bg-blue-200/20 h-64 w-full"
        />
      ))}
    </div>
  );
}
