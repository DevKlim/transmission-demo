const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const cities = ['sandiego']; // Focus on San Diego only for this script
const diseases = ['influenza', 'covid19', 'rsv'];
const startDate = new Date('2025-03-01');
const endDate = new Date('2025-03-30');

// San Diego tract GeoJSON URL
const sdTractUrl = 'https://geo.sandag.org/server/rest/directories/downloads/Census_Tracts_2020.geojson';
const sdTractFile = path.join('public', 'data', 'sandiego', 'census-tracts.geojson');

// Create directory structure
function createDirectoryStructure() {
  console.log('Creating directory structure...');
  
  for (const city of cities) {
    fs.mkdirSync(path.join('public', 'data', city), { recursive: true });
    
    for (const disease of diseases) {
      const outputDir = path.join('public', 'data', city, disease);
      const trendsDir = path.join(outputDir, 'trends');
      
      fs.mkdirSync(outputDir, { recursive: true });
      fs.mkdirSync(trendsDir, { recursive: true });
      
      console.log(`Created directory: ${outputDir}`);
      console.log(`Created directory: ${trendsDir}`);
    }
  }
}

// Download the San Diego census tracts GeoJSON file
function downloadSanDiegoTracts() {
  return new Promise((resolve, reject) => {
    console.log('Downloading San Diego census tracts...');
    
    // Create the directory if it doesn't exist
    fs.mkdirSync(path.dirname(sdTractFile), { recursive: true });
    
    // Try to download the file
    const file = fs.createWriteStream(sdTractFile);
    
    https.get(sdTractUrl, (response) => {
      // Check if the response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      // Close the file when done
      file.on('finish', () => {
        file.close();
        console.log('✓ Downloaded San Diego census tracts');
        resolve();
      });
    }).on('error', (err) => {
      // Delete the file if there was an error
      fs.unlink(sdTractFile, () => {});
      reject(err);
    });
  });
}

// Load the GeoJSON file and process the tracts
function processSanDiegoTracts() {
  return new Promise((resolve, reject) => {
    console.log('Processing San Diego census tracts...');
    
    try {
      // Read the GeoJSON file
      const geojson = JSON.parse(fs.readFileSync(sdTractFile, 'utf8'));
      
      console.log(`Loaded ${geojson.features.length} census tracts`);
      
      // Extract the tract IDs and other properties
      const tracts = geojson.features.map(feature => {
        let tractId = '';
        
        // Try different property names to find the tract ID
        // SANDAG GeoJSON typically uses GEOID for census tracts
        if (feature.properties.GEOID) {
          tractId = feature.properties.GEOID;
        } else if (feature.properties.TRACTCE) {
          // Format with state and county FIPS prefix
          tractId = `06073${feature.properties.TRACTCE}`;
        } else if (feature.properties.TRACT) {
          // Format with state and county FIPS prefix
          tractId = `06073${feature.properties.TRACT}`;
        } else {
          // Generate a random tract ID if none found
          tractId = `06073${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`;
        }
        
        // Calculate the center of the tract
        const center = calculateCenter(feature.geometry);
        
        return {
          tractId,
          geometry: feature.geometry,
          properties: feature.properties,
          center
        };
      });
      
      console.log(`Processed ${tracts.length} tracts`);
      
      resolve(tracts);
    } catch (err) {
      reject(err);
    }
  });
}

// Calculate the center of a geometry
function calculateCenter(geometry) {
  if (geometry.type === 'Polygon') {
    // Use the first ring of the polygon
    return calculatePolygonCenter(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    // Use the first polygon of the multipolygon
    return calculatePolygonCenter(geometry.coordinates[0][0]);
  }
  
  // Default to a point in San Diego if we can't calculate
  return [-117.1611, 32.7157];
}

// Calculate the center of a polygon
function calculatePolygonCenter(coordinates) {
  let sumX = 0;
  let sumY = 0;
  
  coordinates.forEach(coord => {
    sumX += coord[0];
    sumY += coord[1];
  });
  
  return [sumX / coordinates.length, sumY / coordinates.length];
}

// Generate disease data for the tracts
function generateDiseaseData(tracts) {
  console.log('Generating disease data...');
  
  // For each disease and date, generate data for each tract
  diseases.forEach(disease => {
    console.log(`Generating data for ${disease}...`);
    
    // Get outbreak centers for the disease
    const outbreakCenters = getOutbreakCenters(disease);
    
    // Generate daily data
    let currentDate = new Date(startDate);
    let dayNumber = 1;
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Create data for this day
      const data = {};
      
      // Generate data for each tract
      tracts.forEach(tract => {
        // Create a pseudorandom but deterministic value based on tract ID and date
        const hash = hashCode(`${tract.tractId}_${dateStr}_${disease}`);
        const baseFactor = (hash % 100) / 100;
        
        // Apply temporal pattern (epidemic curve)
        let temporalFactor;
        if (disease === 'influenza') {
          // Influenza typically has a faster onset and shorter duration
          if (dayNumber < 7) {
            // Early growth phase
            temporalFactor = Math.pow(1.3, dayNumber) / 25;
          } else if (dayNumber < 16) {
            // Peak and early decline
            temporalFactor = Math.pow(1.3, 7) * Math.pow(0.9, dayNumber - 7) / 25;
          } else {
            // Later decline
            temporalFactor = Math.pow(1.3, 7) * Math.pow(0.9, 9) * Math.pow(0.8, dayNumber - 16) / 25;
          }
        } else if (disease === 'covid19') {
          // COVID has a slower onset but longer tail
          if (dayNumber < 10) {
            // Early growth phase
            temporalFactor = Math.pow(1.25, dayNumber) / 20;
          } else if (dayNumber < 20) {
            // Peak and early decline
            temporalFactor = Math.pow(1.25, 10) * Math.pow(0.95, dayNumber - 10) / 20;
          } else {
            // Later decline
            temporalFactor = Math.pow(1.25, 10) * Math.pow(0.95, 10) * Math.pow(0.92, dayNumber - 20) / 20;
          }
        } else {
          // RSV
          if (dayNumber < 8) {
            // Early growth phase
            temporalFactor = Math.pow(1.2, dayNumber) / 22;
          } else if (dayNumber < 18) {
            // Peak and early decline
            temporalFactor = Math.pow(1.2, 8) * Math.pow(0.93, dayNumber - 8) / 22;
          } else {
            // Later decline
            temporalFactor = Math.pow(1.2, 8) * Math.pow(0.93, 10) * Math.pow(0.88, dayNumber - 18) / 22;
          }
        }
        
        // Apply geographic effect based on outbreak centers
        let geographicFactor = 1.0;
        
        outbreakCenters.forEach(center => {
          // Only apply if the outbreak has started by this day
          if (dayNumber >= center.startDay) {
            // Calculate how long the outbreak has been active
            const daysSinceOutbreakStart = dayNumber - center.startDay;
            
            // Calculate distance to outbreak center
            const distance = calculateDistance(tract.center, center.center);
            
            // Calculate radius based on how long the outbreak has been active
            const outbreakRadius = center.radius + (daysSinceOutbreakStart * center.spreadRate);
            
            // Apply center's influence if within radius
            if (distance < outbreakRadius) {
              // The closer to the center and the longer the outbreak, the stronger the effect
              const distanceFactor = 1 - (distance / outbreakRadius);
              const timeFactor = Math.min(1, daysSinceOutbreakStart / center.peakDay);
              
              const centerEffect = center.factor * distanceFactor * timeFactor;
              geographicFactor = Math.max(geographicFactor, centerEffect);
            }
          }
        });
        
        // Disease-specific modifier
        const diseaseModifier = disease === 'influenza' ? 1 :
                              disease === 'covid19' ? 1.5 : 0.8;
        
        // Calculate final case count
        const caseCount = Math.round(baseFactor * 100 * temporalFactor * diseaseModifier * geographicFactor);
        
        // Determine if this is estimated data (20% chance)
        const isEstimated = (hash % 10) < 2;
        
        // Create tract data object
        data[tract.tractId] = {
          totalCases: caseCount,
          qualityMetrics: {
            completenessScore: isEstimated ? 0.5 + (hash % 20) / 40 : 0.7 + (hash % 30) / 100,
            confidenceScore: isEstimated ? 0.3 + (hash % 20) / 40 : 0.6 + (hash % 40) / 100,
            isEstimated
          }
        };
      });
      
      // Write to file
      const outputFile = path.join('public', 'data', 'sandiego', disease, `${dateStr}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
      
      // Next day
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }
    
    console.log(`✓ Created data files for ${disease}`);
    
    // Generate trend data for a subset of tracts
    generateTrendData(tracts, disease);
  });
}

// Generate trend data for a subset of tracts
function generateTrendData(tracts, disease) {
  console.log(`Generating trend data for ${disease}...`);
  
  // For performance reasons, generate trend data for a subset of tracts
  const maxTracts = 100; // Generate for the first 100 tracts
  
  const sampleTracts = tracts.slice(0, maxTracts);
  
  sampleTracts.forEach(tract => {
    const trendData = [];
    
    // Create a pseudorandom but deterministic value based on tract ID
    const hash = hashCode(`${tract.tractId}_sandiego_${disease}`);
    const baseValue = 5 + (hash % 20);
    const growthRate = 1.1 + ((hash % 10) / 100);
    const peakDay = 5 + (hash % 20);
    
    // Disease modifier
    const diseaseModifier = disease === 'influenza' ? 1 :
                          disease === 'covid19' ? 1.5 : 0.8;
    
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
    
    // Write trend data to file
    const outputFile = path.join('public', 'data', 'sandiego', disease, 'trends', `${tract.tractId}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(trendData, null, 2));
  });
  
  console.log(`✓ Created trend data files for ${disease}`);
}

// Get outbreak centers for disease for San Diego
function getOutbreakCenters(disease) {
  if (disease === 'influenza') {
    // Influenza - typically starts in schools and spreads through communities
    return [
      // UCSD - starts early (student population)
      { 
        center: [-117.234, 32.880], 
        radius: 0.02, 
        factor: 2.2,
        startDay: 1, // Day 1 = March 2
        peakDay: 5,  // Days until peak effect
        spreadRate: 0.003 // How fast the radius expands per day
      },
      // San Diego State University
      { 
        center: [-117.070, 32.775], 
        radius: 0.02, 
        factor: 2.0,
        startDay: 2,
        peakDay: 5,
        spreadRate: 0.0035
      },
      // USD - University of San Diego
      { 
        center: [-117.188, 32.771], 
        radius: 0.015, 
        factor: 1.8,
        startDay: 3,
        peakDay: 4,
        spreadRate: 0.003
      },
      // Point Loma Nazarene University
      { 
        center: [-117.250, 32.720], 
        radius: 0.015,
        factor: 1.6,
        startDay: 4,
        peakDay: 4,
        spreadRate: 0.0025
      },
      // Downtown (high population density)
      { 
        center: [-117.161, 32.715], 
        radius: 0.025, 
        factor: 1.9,
        startDay: 5, // Starts later
        peakDay: 6,
        spreadRate: 0.004
      },
      // San Diego Airport (travel hub)
      { 
        center: [-117.190, 32.733], 
        radius: 0.02, 
        factor: 1.7,
        startDay: 3,
        peakDay: 4,
        spreadRate: 0.005
      },
      // San Diego Zoo (tourist area)
      { 
        center: [-117.149, 32.735], 
        radius: 0.015, 
        factor: 1.8,
        startDay: 4,
        peakDay: 5,
        spreadRate: 0.0028
      }
    ];
  } else if (disease === 'covid19') {
    // COVID-19 - often starts from travel hubs and spreads more widely
    return [
      // San Diego International Airport - primary entry point
      { 
        center: [-117.190, 32.733], 
        radius: 0.035, 
        factor: 2.5,
        startDay: 1,
        peakDay: 8,
        spreadRate: 0.008
      },
      // Convention Center (large gatherings)
      { 
        center: [-117.161, 32.706], 
        radius: 0.03, 
        factor: 2.2,
        startDay: 2,
        peakDay: 7,
        spreadRate: 0.007
      },
      // UCSD Medical Center - Hillcrest
      { 
        center: [-117.166, 32.754], 
        radius: 0.025, 
        factor: 2.0,
        startDay: 3,
        peakDay: 9,
        spreadRate: 0.006
      },
      // Fashion Valley Mall 
      { 
        center: [-117.167, 32.767], 
        radius: 0.025, 
        factor: 1.9,
        startDay: 2,
        peakDay: 8,
        spreadRate: 0.0055
      },
      // Gaslamp Quarter - tourist and nightlife area
      { 
        center: [-117.160, 32.712], 
        radius: 0.02, 
        factor: 2.1,
        startDay: 3,
        peakDay: 6,
        spreadRate: 0.006
      },
      // Border crossing - San Ysidro
      { 
        center: [-117.031, 32.542], 
        radius: 0.03, 
        factor: 2.3,
        startDay: 2,
        peakDay: 10,
        spreadRate: 0.007
      }
    ];
  } else {
    // RSV - often affects children and elderly
    return [
      // Rady Children's Hospital
      { 
        center: [-117.154, 32.798], 
        radius: 0.025, 
        factor: 2.2,
        startDay: 1,
        peakDay: 6,
        spreadRate: 0.004
      },
      // Elementary School Cluster - La Jolla
      { 
        center: [-117.270, 32.840], 
        radius: 0.03, 
        factor: 2.4,
        startDay: 2,
        peakDay: 5,
        spreadRate: 0.0045
      },
      // Elementary School Cluster - Mira Mesa
      { 
        center: [-117.146, 32.917], 
        radius: 0.025, 
        factor: 2.3,
        startDay: 1,
        peakDay: 4,
        spreadRate: 0.005
      },
      // Daycare Centers - Mission Valley
      { 
        center: [-117.151, 32.765], 
        radius: 0.02, 
        factor: 2.1,
        startDay: 3,
        peakDay: 5,
        spreadRate: 0.004
      },
      // Nursing Home Cluster - Clairemont
      { 
        center: [-117.180, 32.827], 
        radius: 0.025, 
        factor: 2.0,
        startDay: 2,
        peakDay: 7,
        spreadRate: 0.003
      },
      // Nursing Home - Point Loma
      { 
        center: [-117.230, 32.740], 
        radius: 0.02, 
        factor: 1.9,
        startDay: 3,
        peakDay: 6,
        spreadRate: 0.0035
      }
    ];
  }
}

// Calculate distance between two points (in degrees)
function calculateDistance(point1, point2) {
  if (!point1 || !point2) return 999; // Large distance if points aren't defined
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

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

// Create a legacy format file for the LeafletMap component
function createLegacyFormatFile() {
  console.log('Creating legacy format file for backwards compatibility...');
  
  const legacyFile = path.join('public', 'data', 'census-tracts-sandiego.geojson');
  
  // Copy the GeoJSON file
  fs.copyFileSync(sdTractFile, legacyFile);
  
  console.log(`✓ Created legacy format file: ${legacyFile}`);
}

// Main function
async function main() {
  try {
    console.log('Starting data generation for San Diego disease transmission dashboard...');
    
    // Create directory structure
    createDirectoryStructure();
    
    // Download and process census tracts
    await downloadSanDiegoTracts();
    const tracts = await processSanDiegoTracts();
    
    // Create legacy format file
    createLegacyFormatFile();
    
    // Generate disease data
    generateDiseaseData(tracts);
    
    console.log('All data generation complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();