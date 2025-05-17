import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { SendHorizonal, Sparkles } from 'lucide-react';

const ChatInput = forwardRef(function ChatInput({ onSend, isLoading, value, onChange, onKeyDown, disabled }, ref) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !isLoading && !disabled) {
      onSend(value.trim());
    }
  };

  // Paw print icon component for input
  const PawPrint = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-indigo-400 dark:text-indigo-500 opacity-70 mr-2"
    >
      <path d="M12,8.5A1.5,1.5,0,1,1,13.5,7,1.5,1.5,0,0,1,12,8.5Zm-3.5-1A1.5,1.5,0,1,0,7,6,1.5,1.5,0,0,0,8.5,7.5Zm7,0A1.5,1.5,0,1,0,17,6,1.5,1.5,0,0,0,15.5,7.5ZM12,15a4,4,0,0,0-4-4,1.5,1.5,0,1,0,0,3,1,1,0,0,1,1,1,1.5,1.5,0,0,0,3,0Zm5-4a1.5,1.5,0,1,0,0,3,1,1,0,0,1,1,1,1.5,1.5,0,0,0,3,0A4,4,0,0,0,17,11Z" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Loading indicator - positioned above the input for better visibility */}
      {isLoading && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center">
          <motion.div
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full shadow-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="mr-2">Zcanic 正在打字喵...</span>
            <motion.div
              className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
            <PawPrint />
          </div>
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder="和 zcanic 说点什么喵..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500/50 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
            disabled={isLoading || disabled}
          />
          {value && value.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
            </motion.div>
          )}
        </div>
        <motion.button
          type="submit"
          disabled={isLoading || !value || !value.trim() || disabled}
          className="bg-gradient-to-r from-indigo-400 to-indigo-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full p-2.5 sm:p-3 hover:shadow-md hover:from-indigo-500 hover:to-indigo-600 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:from-slate-700 dark:disabled:to-slate-800 min-w-[40px] min-h-[40px] flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SendHorizonal className="w-5 h-5" />
        </motion.button>
      </div>
    </form>
  );
});

export default ChatInput;