import React from 'react';

const MapControls = ({ 
  mapView, 
  onMapViewChange, 
  currentDate, 
  onDateChange, 
  isPlaying, 
  onTogglePlay 
}) => {
  const handleDateSliderChange = (e) => {
    const day = parseInt(e.target.value, 10);
    const date = new Date('2025-03-01');
    date.setDate(date.getDate() + day - 1); // Slider starts at 1
    onDateChange(date.toISOString().split('T')[0]);
  };
  
  // Calculate day number (1-30) from date string
  const getDayNumber = () => {
    try {
      const date = new Date(currentDate);
      const startDate = new Date('2025-03-01');
      return Math.floor((date - startDate) / (24 * 60 * 60 * 1000)) + 1;
    } catch (e) {
      return 1;
    }
  };
  
  return (
    <div className="flex items-center space-x-4 w-full">
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700">Map Type</label>
        <select
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={mapView}
          onChange={(e) => onMapViewChange(e.target.value)}
          data-tour="map-type"
        >
          <option value="choropleth">Choropleth</option>
          <option value="heatmap">Heat Map</option>
        </select>
      </div>
      
      <div className="flex-grow">
        <label className="block text-sm font-medium text-gray-700">
          Date: {currentDate}
        </label>
        <input
          type="range"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          min="1"
          max="30"
          value={getDayNumber()}
          onChange={handleDateSliderChange}
          data-tour="date-slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Mar 1</span>
          <span>Mar 15</span>
          <span>Mar 30</span>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <button
          className={`px-4 py-2 rounded-md ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          onClick={onTogglePlay}
          data-tour="play-button"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
};

export default MapControls;