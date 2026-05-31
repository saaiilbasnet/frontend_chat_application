const SidebarSkeleton = () => {
  const skeletonContacts = Array(7).fill(null);

  return (
    <aside className="h-full w-16 lg:w-64 border-r border-base-300/60 flex flex-col bg-base-100">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-300/60">
        <div className="skeleton h-3 w-20 rounded-full hidden lg:block mb-3" />
        <div className="skeleton h-4 w-28 rounded-full hidden lg:block" />
      </div>

      {/* Skeleton contacts */}
      <div className="overflow-y-auto flex-1 py-2">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full px-3 py-2.5 flex items-center gap-3">
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="skeleton size-9 rounded-full" />
            </div>
            <div className="hidden lg:block flex-1 space-y-1.5">
              <div className="skeleton h-3 w-28 rounded-full" />
              <div className="skeleton h-2.5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
