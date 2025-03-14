import React from 'react';

const Header = ({ selectedCity, onCityChange, diseaseType, onDiseaseChange }) => {
  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="text-blue-600 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Disease Transmission Dashboard</h1>
            <p className="text-sm text-gray-600">Census Tract Level Visualization</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              data-tour="city-selector"
            >
              <option value="sandiego">San Diego</option>
              <option value="nyc">New York City</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disease Type</label>
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={diseaseType}
              onChange={(e) => onDiseaseChange(e.target.value)}
              data-tour="disease-selector"
            >
              <option value="influenza">Influenza</option>
              <option value="covid19">COVID-19</option>
              <option value="rsv">RSV</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;