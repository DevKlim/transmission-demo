import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const DataQualityPanel = ({ selectedCity, diseaseType }) => {
  const [qualityData, setQualityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, this would fetch actual quality metrics
    // For the demo, we'll simulate data after a short delay
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setQualityData(generateQualityData(selectedCity, diseaseType));
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [selectedCity, diseaseType]);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading data quality information...</div>
      </div>
    );
  }
  
  if (!qualityData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-lg text-red-500">Error loading data quality information</div>
      </div>
    );
  }
  
  const { 
    reportingFacilities, 
    dataCoverage, 
    estimationBreakdown, 
    dataQualityByTract,
    confidenceDistribution
  } = qualityData;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Data Quality Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Reporting Facilities</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span>Total facilities:</span>
            <span className="font-bold">{reportingFacilities.total}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Actively reporting:</span>
            <span className="font-bold text-green-600">{reportingFacilities.reporting}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Coverage percentage:</span>
            <span className="font-bold">{reportingFacilities.percentage}%</span>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${reportingFacilities.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Geographic Coverage</h3>
          
          <div className="flex justify-between items-center mb-2">
            <span>Total census tracts:</span>
            <span className="font-bold">{dataCoverage.totalTracts}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Tracts with direct data:</span>
            <span className="font-bold text-green-600">{dataCoverage.tractsWithDirectData}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Tracts with estimated data:</span>
            <span className="font-bold text-yellow-600">{dataCoverage.tractsWithEstimatedData}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span>Tracts with no data:</span>
            <span className="font-bold text-red-600">{dataCoverage.tractsWithNoData}</span>
          </div>
          
          <div className="mt-2 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Direct Data', value: dataCoverage.tractsWithDirectData },
                    { name: 'Estimated Data', value: dataCoverage.tractsWithEstimatedData },
                    { name: 'No Data', value: dataCoverage.tractsWithNoData }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell fill="#4ade80" />
                  <Cell fill="#facc15" />
                  <Cell fill="#f87171" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Estimation Method Breakdown</h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={estimationBreakdown}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} tracts`,
                    name
                  ]}
                />
                <Legend />
                <Bar name="Number of Census Tracts" dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-gray-700">
            <p><span className="font-medium">Spatial Interpolation:</span> Estimates based on neighboring census tracts</p>
            <p><span className="font-medium">Demographics:</span> Estimates based on similar demographic profiles</p>
            <p><span className="font-medium">Historical Patterns:</span> Estimates based on previous outbreak patterns</p>
            <p><span className="font-medium">Wastewater:</span> Estimates derived from wastewater surveillance data</p>
            <p><span className="font-medium">Hybrid:</span> Estimates using multiple complementary methods</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Data Quality Score Distribution</h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={confidenceDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar name="Number of Tracts" dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                All Data
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                High Quality Only
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700">
                Direct Data Only
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Data quality information is updated hourly. Areas with low reporting rates may have less reliable disease prevalence estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate sample quality data for demonstration
const generateQualityData = (city, diseaseType) => {
  // Create pseudo-random but deterministic values based on city and disease
  const seed = city === 'nyc' ? 42 : 24;
  const diseaseMod = diseaseType === 'influenza' ? 1 : 
                     diseaseType === 'covid19' ? 1.2 : 0.9;
  
  // Calculate total tracts based on city
  const totalTracts = city === 'nyc' ? 2168 : 628;
  
  // Calculate reporting percentage (70-85%)
  const reportingPercentage = Math.floor(70 + (seed % 15));
  
  // Calculate direct data coverage (60-80% of tracts)
  const directDataPercentage = Math.floor(60 + (seed % 20) * diseaseMod);
  const tractsWithDirectData = Math.floor(totalTracts * directDataPercentage / 100);
  
  // Calculate estimated data coverage (15-30% of tracts)
  const estimatedDataPercentage = Math.floor(15 + (seed % 15) * diseaseMod);
  const tractsWithEstimatedData = Math.floor(totalTracts * estimatedDataPercentage / 100);
  
  // Remaining tracts have no data
  const tractsWithNoData = totalTracts - tractsWithDirectData - tractsWithEstimatedData;
  
  return {
    reportingFacilities: {
      total: city === 'nyc' ? 175 : 83,
      reporting: Math.floor((city === 'nyc' ? 175 : 83) * reportingPercentage / 100),
      percentage: reportingPercentage
    },
    dataCoverage: {
      totalTracts,
      tractsWithDirectData,
      tractsWithEstimatedData,
      tractsWithNoData
    },
    estimationBreakdown: [
      { method: 'Spatial Interpolation', value: Math.floor(tractsWithEstimatedData * 0.4) },
      { method: 'Demographics', value: Math.floor(tractsWithEstimatedData * 0.2) },
      { method: 'Historical Patterns', value: Math.floor(tractsWithEstimatedData * 0.15) },
      { method: 'Wastewater', value: Math.floor(tractsWithEstimatedData * 0.1) },
      { method: 'Hybrid', value: Math.floor(tractsWithEstimatedData * 0.15) }
    ],
    confidenceDistribution: [
      { range: '0.0-0.2 (Very Low)', count: Math.floor(totalTracts * 0.05) },
      { range: '0.2-0.4 (Low)', count: Math.floor(totalTracts * 0.1) },
      { range: '0.4-0.6 (Medium)', count: Math.floor(totalTracts * 0.15) },
      { range: '0.6-0.8 (High)', count: Math.floor(totalTracts * 0.3) },
      { range: '0.8-1.0 (Very High)', count: Math.floor(totalTracts * 0.4) }
    ]
  };
};

export default DataQualityPanel;