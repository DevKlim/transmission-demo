import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DiseaseTransmissionDemo = ({ selectedCity, diseaseType, dateRange }) => {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState('2weeks');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get disease transmission data
    setIsLoading(true);
    
    // Simulating different data based on selections
    setTimeout(() => {
      let simulatedData;
      
      if (selectedCity === 'nyc') {
        if (timeRange === '2weeks') {
          simulatedData = generateNYCData(diseaseType);
        } else {
          simulatedData = generateNYCData(diseaseType, 30);
        }
      } else {
        if (timeRange === '2weeks') {
          simulatedData = generateSDData(diseaseType);
        } else {
          simulatedData = generateSDData(diseaseType, 30);
        }
      }
      
      setData(simulatedData);
      setIsLoading(false);
    }, 500);
  }, [selectedCity, timeRange, diseaseType]);

  // Generate NYC data - different census tracts have different patterns
  const generateNYCData = (diseaseType, days = 14) => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // These would represent different census tracts
    const tracts = {
      'Manhattan North': { initialCases: 15, growthRate: 1.2, peakDay: 10 },
      'Manhattan South': { initialCases: 12, growthRate: 1.15, peakDay: 8 },
      'Brooklyn East': { initialCases: 25, growthRate: 1.3, peakDay: 7 },
      'Brooklyn West': { initialCases: 18, growthRate: 1.25, peakDay: 12 },
      'Queens North': { initialCases: 22, growthRate: 1.22, peakDay: 9 },
      'Bronx Central': { initialCases: 30, growthRate: 1.35, peakDay: 6 },
      'Staten Island': { initialCases: 8, growthRate: 1.1, peakDay: 11 }
    };
    
    // Multiplier based on disease type to simulate different transmission rates
    const multiplier = diseaseType === 'influenza' ? 1 : 
                       diseaseType === 'covid19' ? 1.5 : 0.8; // 'other'
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayData = {
        date: date.toLocaleDateString(),
        totalCases: 0,
      };
      
      // Calculate cases for each census tract
      Object.entries(tracts).forEach(([tract, props]) => {
        // Create a realistic epidemic curve with growth, peak, and decline
        let casesValue;
        if (i < props.peakDay) {
          casesValue = props.initialCases * Math.pow(props.growthRate, i) * multiplier;
        } else {
          // After peak, cases decline
          casesValue = props.initialCases * Math.pow(props.growthRate, props.peakDay) * 
                      Math.pow(0.9, i - props.peakDay) * multiplier;
        }
        
        // Add some randomness
        casesValue = Math.round(casesValue * (0.9 + Math.random() * 0.2));
        
        dayData[tract] = casesValue;
        dayData.totalCases += casesValue;
      });
      
      data.push(dayData);
    }
    
    return data;
  };
  
  // Generate San Diego data with different patterns
  const generateSDData = (diseaseType, days = 14) => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // These would represent different census tracts in San Diego
    const tracts = {
      'Downtown': { initialCases: 10, growthRate: 1.18, peakDay: 9 },
      'La Jolla': { initialCases: 6, growthRate: 1.1, peakDay: 10 },
      'Mission Valley': { initialCases: 14, growthRate: 1.2, peakDay: 8 },
      'North Park': { initialCases: 18, growthRate: 1.25, peakDay: 7 },
      'Chula Vista': { initialCases: 22, growthRate: 1.28, peakDay: 6 },
      'East County': { initialCases: 15, growthRate: 1.22, peakDay: 8 },
      'UCSD Campus': { initialCases: 8, growthRate: 1.3, peakDay: 5 }
    };
    
    // Multiplier based on disease type
    const multiplier = diseaseType === 'influenza' ? 1 : 
                       diseaseType === 'covid19' ? 1.5 : 0.8; // 'other'
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayData = {
        date: date.toLocaleDateString(),
        totalCases: 0,
      };
      
      // Calculate cases for each census tract
      Object.entries(tracts).forEach(([tract, props]) => {
        let casesValue;
        if (i < props.peakDay) {
          casesValue = props.initialCases * Math.pow(props.growthRate, i) * multiplier;
        } else {
          casesValue = props.initialCases * Math.pow(props.growthRate, props.peakDay) * 
                      Math.pow(0.85, i - props.peakDay) * multiplier;
        }
        
        casesValue = Math.round(casesValue * (0.9 + Math.random() * 0.2));
        
        dayData[tract] = casesValue;
        dayData.totalCases += casesValue;
      });
      
      data.push(dayData);
    }
    
    return data;
  };
  
  // Transform data for charts
  const getChartData = () => {
    if (!data.length) return [];
    
    // Get all tract names (except date and totalCases)
    const tractNames = Object.keys(data[0]).filter(key => 
      key !== 'date' && key !== 'totalCases'
    );
    
    // For each day, sum up the cases by tract
    return data.map(day => {
      const chartDay = { date: day.date };
      
      // Add each tract's data
      tractNames.forEach(tract => {
        chartDay[tract] = day[tract];
      });
      
      return chartDay;
    });
  };
  
  // Get colors for chart
  const getColors = () => {
    const cityColors = {
      'nyc': [
        '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'
      ],
      'sandiego': [
        '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'
      ]
    };
    
    return cityColors[selectedCity] || cityColors.nyc;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Census Tract Disease Transmission Visualization</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="2weeks">Past 2 Weeks</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Data Sources:</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>Primary healthcare facilities reporting (80% coverage)</li>
          <li>Emergency department syndromic surveillance</li>
          <li>Laboratory test results from participating hospitals</li>
          <li>Mobile health app self-reporting (supplementary)</li>
          <li>Wastewater surveillance data (neighborhood level)</li>
        </ul>
        <p className="mt-2 text-sm text-gray-500 italic">
          *Data shown is simulated for demonstration purposes
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading data...</div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {diseaseType === 'influenza' ? 'Influenza' : 
               diseaseType === 'covid19' ? 'COVID-19' : 'Respiratory Disease'} Cases by Census Tract
            </h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(data[0] || {})
                    .filter(key => key !== 'date' && key !== 'totalCases')
                    .map((tract, index) => (
                      <Bar 
                        key={tract}
                        dataKey={tract} 
                        stackId="a"
                        fill={getColors()[index % getColors().length]} 
                      />
                    ))}
                  <Line 
                    type="monotone" 
                    dataKey="totalCases" 
                    stroke="#ff7300" 
                    name="Total Cases"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Key Insights:</h3>
            <ul className="text-sm space-y-1">
              {selectedCity === 'nyc' ? (
                <>
                  <li>• Bronx Central showed earliest outbreak with highest initial growth rate</li>
                  <li>• Manhattan South experienced delayed onset but moderate growth</li>
                  <li>• Brooklyn East transmission peaked earlier than other areas</li>
                </>
              ) : (
                <>
                  <li>• UCSD Campus showed rapid early transmission before quick containment</li>
                  <li>• Downtown and North Park areas experienced sustained transmission</li>
                  <li>• La Jolla showed lower overall case rates than other census tracts</li>
                </>
              )}
              <li>• Secondary peaks evident approximately 10 days after initial surge</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default DiseaseTransmissionDemo;