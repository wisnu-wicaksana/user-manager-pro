import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group">
      <div className="mb-4 md:mb-0">
        <h3 className="font-black text-gray-800 dark:text-gray-100 text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {user.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium break-all">{user.email || 'No email available'}</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-tighter mt-1">
          {user.company?.name || 'Staff'}
        </p>
      </div>

      <div className="flex shrink-0">
        <Link 
          to={`/users/${user.id}`}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none text-center"
        >
          Lihat Profil
        </Link>
      </div>
    </div>
  );
};

export default UserCard;
