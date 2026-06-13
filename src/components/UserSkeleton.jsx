const UserSkeleton = () => {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="space-y-3 flex-grow">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      </div>
    </div>
  );
};

export default UserSkeleton;
