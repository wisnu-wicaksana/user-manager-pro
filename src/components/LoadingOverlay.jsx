import { motion, AnimatePresence } from "framer-motion";

const LoadingOverlay = ({ isOpen, message = "Sedang memproses..." }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-md transition-all"
        >
          <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-800 dark:text-white font-black tracking-tight">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
