import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const UserCard = ({ user }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group"
    >
      <div className="flex items-center gap-5 mb-4 md:mb-0">
        {/* Avatar */}
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-blue-50 dark:bg-gray-700 shrink-0 border-2 border-white dark:border-gray-800 shadow-sm">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-black text-blue-600 dark:text-blue-400">
              {user.name.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-black text-gray-800 dark:text-gray-100 text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium break-all">{user.email || 'No email available'}</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-1">
            {user.company?.name || 'Staff'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0">
        <Link 
          to={`/users/${user.id}`}
          className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none text-center active:scale-95"
        >
          Lihat Profil
        </Link>
      </div>
    </motion.div>
  );
};

export default UserCard;
