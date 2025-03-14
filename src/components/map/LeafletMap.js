import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadCensusTracts, fetchDiseaseData } from '../../services/api';
import MapControls from './MapControls';
import TrendChart from '../charts/TrendChart';

// Fix for Leaflet's broken marker paths
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41], 
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LeafletMap = ({ selectedCity, diseaseType, currentDate, onDateChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({
    choropleth: null,
    heatmap: null
  });
  const [mapView, setMapView] = useState('choropleth');
  const [isPlaying, setIsPlaying] = useState(false);
  const [censusTracts, setCensusTracts] = useState(null);
  const [diseaseData, setDiseaseData] = useState(null);
  const [selectedTract, setSelectedTract] = useState(null);
  const animationRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Get city coordinates
      const cityCoords = selectedCity === 'nyc' 
        ? [40.7128, -74.0060]  // NYC
        : [32.7157, -117.1611]; // San Diego
      
      // Create map instance with adjusted zoom for San Diego
      mapRef.current = L.map(mapContainerRef.current, {
        center: cityCoords,
        zoom: selectedCity === 'nyc' ? 11 : 10, // Slightly wider view for San Diego
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        ]
      });
      
      // Add info panel
      createInfoPanel();
      
      // Add legend
      createLegend();
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);
  
  // Load census tracts when city changes
  useEffect(() => {
    const loadTractsData = async () => {
      setIsLoading(true);
      
      try {
        // Try loading from your API service first
        const tracts = await loadCensusTracts(selectedCity);
        setCensusTracts(tracts);
      } catch (error) {
        console.error('Error loading census tracts:', error);
        
        // Fallback to loading directly from file
        try {
          const response = await fetch(`/data/${selectedCity}/census-tracts.geojson`);
          if (response.ok) {
            const tracts = await response.json();
            setCensusTracts(tracts);
          } else {
            console.error('Failed to load census tracts from file');
          }
        } catch (fileError) {
          console.error('Error loading census tracts from file:', fileError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTractsData();
  }, [selectedCity]);
  
  // Load disease data when necessary parameters change
  useEffect(() => {
    const loadDiseaseData = async () => {
      if (!censusTracts) return;
      
      setIsLoading(true);
      
      try {
        // First try to get data from existing API
        const data = await fetchDiseaseData(selectedCity, diseaseType, currentDate);
        setDiseaseData(data);
      } catch (error) {
        console.error('Error loading disease data from API:', error);
        
        // Fallback to loading directly from file
        try {
          const response = await fetch(`/data/${selectedCity}/${diseaseType}/${currentDate}.json`);
          if (response.ok) {
            const data = await response.json();
            setDiseaseData(data);
          } else {
            console.error('Failed to load disease data from file');
          }
        } catch (fileError) {
          console.error('Error loading disease data from file:', fileError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDiseaseData();
  }, [censusTracts, selectedCity, diseaseType, currentDate]);
  
  // Handle animation playback
  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => stopAnimation();
  }, [isPlaying]);
  
  // Create info panel
  const createInfoPanel = () => {
    if (!mapRef.current) return;
    
    const info = L.control({ position: 'topright' });
    
    info.onAdd = () => {
      const div = L.DomUtil.create('div', 'bg-white p-3 rounded-lg shadow-md');
      div.id = 'info-panel';
      div.innerHTML = '<h3 class="font-bold">Disease Data</h3><p>Hover over a tract</p>';
      return div;
    };
    
    info.addTo(mapRef.current);
  };
  
  // Create legend
  const createLegend = () => {
    if (!mapRef.current) return;
    
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'bg-white p-2 rounded-lg shadow-md');
      div.id = 'map-legend';
      div.innerHTML = '<h4 class="text-sm font-bold mb-1">Cases per Tract</h4>';
      
      // Add legend items with new color scheme
      const grades = [0, 20, 40, 60, 80, 100, 150, 200];
      const labels = ['0-20', '20-40', '40-60', '60-80', '80-100', '100-150', '150-200', '200+'];
      
      for (let i = 0; i < grades.length; i++) {
        const intensity = Math.min(1, grades[i] / 200);
        const color = getColor(intensity);
        
        div.innerHTML += `
          <div class="flex items-center text-xs mb-1">
            <div class="w-4 h-4 mr-1" style="background-color: ${color}"></div>
            <span>${i < grades.length - 1 ? labels[i] : grades[i] + '+'}</span>
          </div>
        `;
      }
      
      return div;
    };
    
    legend.addTo(mapRef.current);
  };
  
  // Update map layers
  useEffect(() => {
    updateMapLayers();
  }, [censusTracts, diseaseData, mapView]);
  
  // Update map layers
  const updateMapLayers = () => {
    if (!mapRef.current || !censusTracts || !diseaseData) return;
    
    // Clear existing layers
    if (layersRef.current.choropleth) {
      mapRef.current.removeLayer(layersRef.current.choropleth);
    }
    if (layersRef.current.heatmap) {
      mapRef.current.removeLayer(layersRef.current.heatmap);
    }
    
    if (mapView === 'choropleth') {
      // Add choropleth layer
      layersRef.current.choropleth = L.geoJSON(censusTracts, {
        style: feature => {
          const tractId = feature.properties.GEOID;
          const tractData = diseaseData[tractId] || { totalCases: 0 };
          
          // Color scale based on case count
          const intensity = Math.min(1, tractData.totalCases / 200);
          
          return {
            fillColor: getColor(intensity),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: tractData.qualityMetrics?.isEstimated ? '3' : '0',
            fillOpacity: tractData.qualityMetrics?.isEstimated ? 0.4 : 0.7
          };
        },
        onEachFeature: (feature, layer) => {
          const tractId = feature.properties.GEOID;
          
          // Add hover effect
          layer.on({
            mouseover: e => {
              const layer = e.target;
              layer.setStyle({
                weight: 2,
                color: '#666',
                fillOpacity: 0.8
              });
              
              updateInfoPanel(feature.properties);
            },
            mouseout: e => {
              layersRef.current.choropleth.resetStyle(e.target);
            },
            click: () => {
              setSelectedTract(tractId);
            }
          });
        }
      }).addTo(mapRef.current);
    } else {
      // Add heatmap layer
      const heatData = [];
      
      Object.entries(diseaseData).forEach(([tractId, data]) => {
        const tract = censusTracts.features.find(f => f.properties.GEOID === tractId);
        
        if (tract && data.totalCases > 0) {
          // Get centroid
          const centroid = tract.properties.CENTER || getCentroid(tract);
          
          if (centroid) {
            heatData.push([
              centroid[1], // lat
              centroid[0], // lng
              data.totalCases / 5 // intensity
            ]);
          }
        }
      });
      
      // Create heatmap layer if we have data
      if (heatData.length > 0) {
        try {
          layersRef.current.heatmap = L.heatLayer(heatData, {
            radius: 20,
            blur: 15,
            maxZoom: 17,
            gradient: {0.4: 'blue', 0.65: 'lime', 0.8: 'yellow', 1: 'red'}
          }).addTo(mapRef.current);
        } catch (error) {
          console.error('Error creating heatmap layer:', error);
          // Fallback to choropleth if heatmap fails
          setMapView('choropleth');
        }
      }
    }
  };
  
  // Get color for choropleth
  const getColor = (intensity) => {
    // Use a color scale that's better for distinguishing values
    if (intensity >= 0.9) return '#7f0000'; // Very dark red
    if (intensity >= 0.8) return '#b30000'; // Darker red
    if (intensity >= 0.7) return '#d7301f'; // Dark red
    if (intensity >= 0.6) return '#ef6548'; // Medium red
    if (intensity >= 0.5) return '#fc8d59'; // Light red
    if (intensity >= 0.4) return '#fdbb84'; // Orange
    if (intensity >= 0.3) return '#fdd49e'; // Light orange
    if (intensity >= 0.2) return '#fee8c8'; // Very light orange
    if (intensity >= 0.1) return '#fff7ec'; // Off-white
    return '#ffffff'; // White for lowest values
  };
  
  // Get centroid from feature
  const getCentroid = (feature) => {
    try {
      // Use turf.js in real implementation
      // Simplified version
      const coords = feature.geometry.coordinates[0];
      let sumX = 0;
      let sumY = 0;
      
      coords.forEach(coord => {
        sumX += coord[0];
        sumY += coord[1];
      });
      
      return [sumX / coords.length, sumY / coords.length];
    } catch (e) {
      console.error("Error calculating centroid", e);
      return null;
    }
  };
  
  // Update info panel with tract data
  const updateInfoPanel = (properties) => {
    const panel = document.getElementById('info-panel');
    if (!panel) return;
    
    const tractId = properties.GEOID;
    const tractData = diseaseData[tractId] || { totalCases: 0 };
    
    let tractName = properties.NAME;
    // Try different property fields that might contain meaningful names
    if (properties.NAMELSAD) {
      tractName = properties.NAMELSAD;
    } else if (properties.NAME10) {
      tractName = properties.NAME10;
    }
    
    panel.innerHTML = `
      <h3 class="font-bold">${tractName || `Census Tract ${tractId.slice(-6)}`}</h3>
      <div class="text-xs text-gray-500 mb-1">GEOID: ${tractId}</div>
      <div class="mt-1">
        <div>Cases: ${tractData.totalCases || 0}</div>
        <div class="text-xs text-gray-500">
          ${tractData.qualityMetrics?.isEstimated ? 'Estimated data' : 'Reported data'}
        </div>
        ${tractData.qualityMetrics?.confidenceScore ? 
          `<div class="text-xs text-gray-500">
            Confidence: ${Math.round(tractData.qualityMetrics.confidenceScore * 100)}%
          </div>` : ''}
      </div>
    `;
  };
  
  // Animation control
  const startAnimation = () => {
    if (animationRef.current) return;
    
    // Parse current date
    const date = new Date(currentDate);
    const endDate = new Date('2025-03-30');
    
    animationRef.current = setInterval(() => {
      // Advance by one day
      date.setDate(date.getDate() + 1);
      
      // Stop if we reached the end
      if (date > endDate) {
        stopAnimation();
        setIsPlaying(false);
        return;
      }
      
      // Update current date
      const newDate = date.toISOString().split('T')[0];
      onDateChange(newDate);
    }, 1000); // 1 second per day
  };
  
  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };
  
  // Toggle animation
  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center bg-white p-3 mb-3 rounded-lg shadow-md">
        <MapControls 
          mapView={mapView}
          onMapViewChange={setMapView}
          currentDate={currentDate}
          onDateChange={onDateChange}
          isPlaying={isPlaying}
          onTogglePlay={toggleAnimation}
        />
      </div>
      
      <div className="flex flex-grow">
        <div className="w-3/4 pr-3">
          <div className="relative h-full w-full rounded-lg shadow-md overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading map...</div>
              </div>
            )}
            <div 
              ref={mapContainerRef} 
              className="h-full w-full"
            ></div>
          </div>
        </div>
        
        <div className="w-1/4">
          {selectedTract ? (
            <div className="bg-white p-3 rounded-lg shadow-md h-full">
              <h3 className="font-bold mb-2">
                Tract {selectedTract}
                <button 
                  className="ml-2 text-sm text-gray-400"
                  onClick={() => setSelectedTract(null)}
                >
                  ×
                </button>
              </h3>
              
              <TrendChart 
                tractId={selectedTract}
                city={selectedCity}
                diseaseType={diseaseType}
              />
            </div>
          ) : (
            <div className="bg-white p-3 rounded-lg shadow-md h-full">
              <h3 className="font-bold mb-2">Tract Statistics</h3>
              {selectedCity === 'sandiego' ? (
                <div>
                  <p className="text-gray-600 mb-3">
                    San Diego County has 628 census tracts, allowing for detailed disease transmission analysis at the neighborhood level.
                  </p>
                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <h4 className="font-semibold mb-1">Notable Areas:</h4>
                    <ul className="list-disc pl-4 text-xs space-y-1">
                      <li><span className="font-medium">Downtown:</span> Higher density population center</li>
                      <li><span className="font-medium">UCSD Area:</span> Major campus and medical facilities</li>
                      <li><span className="font-medium">Chula Vista:</span> Second largest city in county</li>
                      <li><span className="font-medium">El Cajon:</span> Inland community</li>
                    </ul>
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    Click on a census tract to view detailed trends
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">
                  Click on a census tract to view detailed trends
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;