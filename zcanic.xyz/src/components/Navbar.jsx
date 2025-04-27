import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, Settings } from 'lucide-react';
import { Transition } from '@headlessui/react';
import SettingsPanel from './SettingsPanel';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // NavLink 激活时的样式
  const activeClassName = "border-blue-500 text-gray-900";
  const inactiveClassName = "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";
  const mobileActiveClassName = "block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium text-blue-700 bg-blue-50";
  const mobileInactiveClassName = "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300";

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/chat" className="flex items-center text-xl font-bold text-gray-900 /* dark:text-white */">
              {/* ... logo/icon ... */}
              <span className="ml-2">Zcanic</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {/* Other Links - Assuming dark:text-gray-300 is okay for inactive links */}
            <NavLinkComponent to="/chat">Chat</NavLinkComponent>
            <NavLinkComponent to="/blog">Blog</NavLinkComponent>
            {/* <NavLinkComponent to="/about">About</NavLinkComponent> */}
            {/* <NavLinkComponent to="/contact">Contact</NavLinkComponent> */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white dark:hover:bg-gray-700"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              {/* ... menu icons ... */}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden bg-white dark:bg-gray-800" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {/* Mobile Links - remove dark:text-gray-300 from NavLinkComponent if necessary */}
            <NavLinkComponent to="/chat" isMobile>Chat</NavLinkComponent>
            <NavLinkComponent to="/blog" isMobile>Blog</NavLinkComponent>
            {/* ... other mobile links ... */}
          </div>
           <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center px-5">
               {/* Mobile settings/theme buttons */}
                <button
                 onClick={() => { setIsSettingsOpen(true); setMobileMenuOpen(false); }}
                 className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                 aria-label="Settings"
               >
                 <Settings size={20} />
               </button>
               <button
                 onClick={toggleTheme}
                 className="ml-4 p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                 aria-label="Toggle theme"
               >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
             </div>
           </div>
        </div>
      </Transition>
       {/* Settings Panel Modal */}
       <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </nav>
  );
}

// Helper NavLink component
const NavLinkComponent = ({ to, children, isMobile = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `${isMobile ? 'block px-3 py-2 rounded-md text-base font-medium' : 'px-3 py-2 rounded-md text-sm font-medium'} ${isActive
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white' // Keep active state distinct
        : 'text-gray-700 /* dark:text-gray-300 */ hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 /* dark:hover:text-white */'}`
    }
  >
    {children}
  </NavLink>
);

export default Navbar; 