import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-4 mt-auto">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-600 /* dark:text-gray-400 */">
          © {new Date().getFullYear()} Zcanic. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer; 