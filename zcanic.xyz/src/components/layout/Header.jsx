import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';

export default function Header() {
  const { isDarkMode, toggleTheme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-clay-50/80 backdrop-blur-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-2xl font-bold text-clay-800">
              AI Chatbox
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <Link href="#features" className="text-clay-600 hover:text-clay-800 transition-colors">
                Features
              </Link>
              <Link href="#chat" className="text-clay-600 hover:text-clay-800 transition-colors">
                Chat
              </Link>
              <button
                onClick={toggleTheme}
                className="clay-button"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:hidden clay-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </motion.button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4"
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-clay-600 hover:text-clay-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#chat"
                className="text-clay-600 hover:text-clay-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Chat
              </Link>
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMenuOpen(false);
                }}
                className="clay-button"
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
} 