import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-inner py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
        <div className="mb-2 md:mb-0">
          <p>Disease Transmission Dashboard Demo</p>
          <p className="text-xs">Data for demonstration purposes only</p>
        </div>
        
        <div className="flex space-x-4">
          <button className="hover:text-blue-600 transition-colors">
            About
          </button>
          <button className="hover:text-blue-600 transition-colors">
            Help
          </button>
          <button className="hover:text-blue-600 transition-colors">
            Privacy
          </button>
          <button className="hover:text-blue-600 transition-colors">
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;