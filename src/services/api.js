// API Service for Disease Transmission Dashboard

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3001';

// Load census tract GeoJSON data
export const loadCensusTracts = async (city) => {
  try {
    // Prioritize loading the new format file
    try {
      const response = await fetch(`/data/${city}/census-tracts.geojson`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('New format file not found, trying legacy format');
    }
    
    // Try the original path format as fallback
    try {
      const response = await fetch(`/data/census-tracts-${city}.geojson`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Legacy format file not found, trying API');
    }
    
    // Try API as last resort
    try {
      const response = await fetch(`${API_BASE_URL}/census-tracts?city=${city}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('API not available, falling back to generated tracts');
    }
    
    // If all else fails, generate mock tracts
    return generateMockCensusTracts(city);
  } catch (error) {
    console.error('Error loading census tracts:', error);
    return generateMockCensusTracts(city);
  }
};

// Generate mock census tracts for demo purposes (unchanged as fallback)
const generateMockCensusTracts = (city) => {
  // Create a simple grid of polygons that look like census tracts
  const features = [];
  const tractCount = city === 'nyc' ? 2168 : 628;
  const rows = Math.ceil(Math.sqrt(tractCount / 2));
  const cols = Math.ceil(tractCount / rows);
  
  // Base coordinates (roughly San Diego or NYC)
  const baseCoords = city === 'nyc' 
    ? [40.7128, -74.0060] 
    : [32.7157, -117.1611];
    
  // Size of each "tract" in degrees
  const size = city === 'nyc' ? 0.005 : 0.008;
  
  // Tract ID prefix based on city (FIPS codes)
  const tractPrefix = city === 'nyc' ? '36061' : '06073';
  
  // Generate a simple grid of polygons
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = row * cols + col + 1;
      if (id > tractCount) continue;
      
      const tractId = `${tractPrefix}${String(id).padStart(6, '0')}`;
      
      // Add some randomness to tract locations for a more natural look
      const jitterLat = (Math.random() - 0.5) * 0.002;
      const jitterLng = (Math.random() - 0.5) * 0.002;
      
      // Create tract coordinates
      const lat = baseCoords[0] - 0.1 + (row * size) + jitterLat;
      const lng = baseCoords[1] - 0.1 + (col * size) + jitterLng;
      
      // Add some variation to tract shapes
      const shapeType = Math.random() > 0.7 ? 'irregular' : 'rectangular';
      
      let polygon;
      if (shapeType === 'rectangular') {
        polygon = [
          [lng, lat],
          [lng + size, lat],
          [lng + size, lat - size],
          [lng, lat - size],
          [lng, lat] // Close the polygon
        ];
      } else {
        // Create an irregular polygon with some randomization
        const irregularity = Math.random() * 0.002;
        polygon = [
          [lng, lat],
          [lng + size + irregularity, lat - irregularity],
          [lng + size - irregularity, lat - size + irregularity],
          [lng - irregularity, lat - size - irregularity],
          [lng, lat] // Close the polygon
        ];
      }
      
      features.push({
        type: 'Feature',
        properties: {
          GEOID: tractId,
          NAME: `Census Tract ${id}`,
          CENTER: [lng + size/2, lat - size/2]
        },
        geometry: {
          type: 'Polygon',
          coordinates: [polygon]
        }
      });
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  };
};

// Fetch disease data for a specific date
export const fetchDiseaseData = async (city, diseaseType, date) => {
  try {
    // First try to fetch from the data directory
    try {
      const response = await fetch(`/data/${city}/${diseaseType}/${date}.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Data file not found, trying API');
    }
    
    // Try to fetch from the API
    try {
      const response = await fetch(`${API_BASE_URL}/disease-data?city=${city}&disease=${diseaseType}&date=${date}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('API not available, generating data');
    }
    
    // If API and file both fail, generate local data
    return generateSimulatedDiseaseData(city, diseaseType, date);
  } catch (error) {
    console.error('Error fetching disease data:', error);
    return {};
  }
};

// Generate simulated disease data for demonstration
const generateSimulatedDiseaseData = (city, diseaseType, date) => {
  const data = {};
  
  // Parse date to get day of month for temporal patterns
  const dateObj = new Date(date);
  const dayOfMonth = dateObj.getDate();
  
  // Number of tracts to generate data for
  const tractCount = city === 'nyc' ? 2168 : 628;
  const sampleSize = Math.min(tractCount, city === 'nyc' ? 300 : 200);
  
  // Create data for each tract
  for (let i = 1; i <= sampleSize; i++) {
    // Generate a tractId based on city
    const tractId = city === 'nyc' 
      ? `36061${String(i).padStart(6, '0')}` 
      : `06073${String(i).padStart(6, '0')}`;
    
    // Create a pseudorandom but deterministic value based on tract ID and date
    const hash = hashCode(`${tractId}_${date}_${diseaseType}`);
    const baseFactor = (hash % 100) / 100;
    
    // Apply disease type modifier
    const diseaseModifier = diseaseType === 'influenza' ? 1 :
                          diseaseType === 'covid19' ? 1.5 : 0.8;
    
    // Apply temporal pattern (epidemic curve)
    let temporalFactor;
    if (dayOfMonth < 10) {
      // Early growth phase
      temporalFactor = Math.pow(1.2, dayOfMonth) / 20;
    } else if (dayOfMonth < 20) {
      // Peak and early decline
      temporalFactor = Math.pow(1.2, 10) * Math.pow(0.95, dayOfMonth - 10) / 20;
    } else {
      // Later decline
      temporalFactor = Math.pow(1.2, 10) * Math.pow(0.95, 10) * Math.pow(0.9, dayOfMonth - 20) / 20;
    }
    
    // Apply geographic effect - create clusters
    const geographicFactor = getGeographicFactor(city, i, sampleSize);
    
    // Calculate final case count
    const caseCount = Math.round(
      baseFactor * 100 * temporalFactor * diseaseModifier * geographicFactor
    );
    
    // Determine if this is estimated data (20% chance)
    const isEstimated = (hash % 10) < 2;
    
    // Create tract data object
    data[tractId] = {
      totalCases: caseCount,
      qualityMetrics: {
        completenessScore: isEstimated ? 0.5 + (hash % 20) / 40 : 0.7 + (hash % 30) / 100,
        confidenceScore: isEstimated ? 0.3 + (hash % 20) / 40 : 0.6 + (hash % 40) / 100,
        isEstimated
      }
    };
  }
  
  return data;
};

// Fetch historical trend data for a specific tract
export const fetchTractTrendData = async (tractId, city, diseaseType) => {
  try {
    // First try to fetch from file
    try {
      const response = await fetch(`/data/${city}/${diseaseType}/trends/${tractId}.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Trend data file not found, trying API');
    }
    
    // Try to fetch from the API
    try {
      const response = await fetch(`${API_BASE_URL}/tract-trends?tractId=${tractId}&city=${city}&disease=${diseaseType}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('API not available, generating trend data');
    }
    
    // If API and file both fail, generate local data
    return generateTractTrendData(tractId, city, diseaseType);
  } catch (error) {
    console.error('Error fetching tract trend data:', error);
    return [];
  }
};

// Generate trend data for a specific tract
const generateTractTrendData = (tractId, city, diseaseType) => {
  const trendData = [];
  const startDate = new Date('2025-03-01');
  const endDate = new Date('2025-03-30');
  
  // Create a pseudorandom but deterministic value based on tract ID
  const hash = hashCode(`${tractId}_${city}_${diseaseType}`);
  const baseValue = 5 + (hash % 20);
  const growthRate = 1.1 + ((hash % 10) / 100);
  const peakDay = 5 + (hash % 20);
  
  // Disease modifier
  const diseaseModifier = diseaseType === 'influenza' ? 1 :
                          diseaseType === 'covid19' ? 1.5 : 0.8;
  
  let currentDate = new Date(startDate);
  let day = 1;
  
  while (currentDate <= endDate) {
    let caseValue;
    if (day < peakDay) {
      // Growth phase
      caseValue = baseValue * Math.pow(growthRate, day) * diseaseModifier;
    } else {
      // Decline phase
      caseValue = baseValue * Math.pow(growthRate, peakDay) * 
                  Math.pow(0.9, day - peakDay) * diseaseModifier;
    }
    
    // Add randomization
    const reportedCases = Math.round(caseValue * (0.9 + Math.random() * 0.2));
    const estimatedCases = Math.round(caseValue * (0.8 + Math.random() * 0.4));
    
    // Some days are estimated (based on hash)
    const isEstimated = ((hash + day) % 7) < 2;
    
    trendData.push({
      date: currentDate.toISOString().split('T')[0],
      day,
      reportedCases,
      estimatedCases,
      isEstimated
    });
    
    // Advance to next day
    currentDate.setDate(currentDate.getDate() + 1);
    day++;
  }
  
  return trendData;
};

// Simple string hash function for deterministic randomness
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Get geographic factor based on city and tract index
const getGeographicFactor = (city, index, totalSample) => {
  if (city === 'nyc') {
    // Create clusters in different boroughs
    if (index < totalSample * 0.1) return 1.5; // Manhattan
    if (index < totalSample * 0.3) return 1.3; // Brooklyn
    if (index < totalSample * 0.5) return 1.2; // Queens
    if (index < totalSample * 0.7) return 1.1; // Bronx
    return 1.0; // Staten Island
  } else {
    // San Diego areas - updated for more realistic clustering
    if (index < totalSample * 0.08) return 1.6; // Downtown San Diego
    if (index >= totalSample * 0.08 && index < totalSample * 0.15) return 1.5; // UCSD area
    if (index >= totalSample * 0.15 && index < totalSample * 0.22) return 1.4; // San Diego State Univ area
    if (index >= totalSample * 0.22 && index < totalSample * 0.30) return 1.3; // Beaches (La Jolla, PB, etc)
    if (index >= totalSample * 0.30 && index < totalSample * 0.42) return 1.2; // Mid-City & Kearny Mesa
    if (index >= totalSample * 0.42 && index < totalSample * 0.55) return 1.1; // Southern areas (Chula Vista)
    if (index >= totalSample * 0.55 && index < totalSample * 0.70) return 1.0; // Eastern suburbs
    return 0.9; // Rural areas
  }
};