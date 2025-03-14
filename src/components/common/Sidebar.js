import React from 'react';

const Sidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'map', label: 'Interactive Map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { id: 'methodology', label: 'Methodology', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'data-quality', label: 'Data Quality', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];
  
  return (
    <div className="w-64 bg-gray-100 shadow-inner px-2 py-4 hidden md:block">
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-3 py-3 text-sm font-medium rounded-md w-full text-left ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onTabChange(tab.id)}
            data-tour={tab.id === 'methodology' ? 'methodology-tab' : null}
          >
            <svg
              className={`mr-3 h-5 w-5 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </nav>
      
      <div className="mt-8 px-4">
        <div className="bg-blue-50 p-3 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Data Last Updated</h3>
          <p className="text-xs text-blue-700">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="mt-4 px-4">
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium shadow-sm"
          onClick={() => alert('Start guided tour feature would be implemented here')}
        >
          Take a Guided Tour
        </button>
      </div>
    </div>
  );
};

export default Sidebar;