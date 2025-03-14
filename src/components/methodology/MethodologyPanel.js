import React from 'react';

const MethodologyPanel = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Data Collection & Processing Methodology</h2>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-3">Data Sources</h3>
          <p className="mb-4">Our visualization combines multiple data sources to provide comprehensive disease surveillance at the census tract level:</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Primary Sources</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Hospital reporting (80% of facilities)</li>
                <li>Emergency department syndromic surveillance</li>
                <li>Laboratory test results</li>
                <li>Primary care facility reports</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">Supplementary Sources</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Wastewater surveillance</li>
                <li>School absenteeism data</li>
                <li>Mobile health app self-reporting</li>
                <li>Pharmacy prescription data</li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 italic">
            By combining these diverse data streams, we can create a more complete picture of disease prevalence even when individual sources have gaps.
          </p>
        </section>
        
        <section>
          <h3 className="text-xl font-semibold mb-3">Data Processing Pipeline</h3>
          
          <div className="relative">
            <div className="absolute h-full w-0.5 bg-blue-200 left-2.5 top-0"></div>
            
            <div className="relative pl-8 pb-8">
              <div className="absolute w-5 h-5 bg-blue-500 rounded-full left-0 top-0"></div>
              <h4 className="font-bold">1. Data Collection</h4>
              <p className="text-gray-700">
                Raw data is collected from healthcare facilities through secure API connections and standardized formats. Facilities submit daily reports containing anonymized case counts by patient ZIP code.
              </p>
            </div>
            
            <div className="relative pl-8 pb-8">
              <div className="absolute w-5 h-5 bg-blue-500 rounded-full left-0 top-0"></div>
              <h4 className="font-bold">2. Geocoding & Anonymization</h4>
              <p className="text-gray-700">
                Patient ZIP codes and addresses are converted to census tract identifiers without storing the original addresses. This preserves privacy while enabling geographic analysis.
              </p>
            </div>
            
            <div className="relative pl-8 pb-8">
              <div className="absolute w-5 h-5 bg-blue-500 rounded-full left-0 top-0"></div>
              <h4 className="font-bold">3. Data Validation</h4>
              <p className="text-gray-700">
                Automated systems check for data anomalies, inconsistencies, and potential reporting errors. Outliers are flagged for manual review.
              </p>
            </div>
            
            <div className="relative pl-8 pb-8">
              <div className="absolute w-5 h-5 bg-blue-500 rounded-full left-0 top-0"></div>
              <h4 className="font-bold">4. Missing Data Imputation</h4>
              <p className="text-gray-700">
                For census tracts with insufficient direct reporting, spatial interpolation methods estimate disease prevalence based on neighboring areas, demographic similarities, and historical patterns.
              </p>
            </div>
            
            <div className="relative pl-8">
              <div className="absolute w-5 h-5 bg-blue-500 rounded-full left-0 top-0"></div>
              <h4 className="font-bold">5. Visualization</h4>
              <p className="text-gray-700">
                Processed data is transformed into interactive maps and charts. Estimated data is clearly marked with dashed borders and quality indicators.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h3 className="text-xl font-semibold mb-4">Estimation Methods for Missing Data</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-2">Spatial Interpolation</h4>
            <p>
              For areas with incomplete reporting, we use a combination of spatial techniques to estimate disease prevalence:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li><span className="font-medium">Inverse Distance Weighting (IDW):</span> Census tracts closer to known data points have more influence on estimates.</li>
              <li><span className="font-medium">Kriging:</span> Advanced geostatistical method that accounts for spatial autocorrelation patterns.</li>
              <li><span className="font-medium">Bayesian hierarchical models:</span> Incorporate prior knowledge about disease dynamics and spatial relationships.</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-2">Demographic Factors</h4>
            <p>
              Estimation models incorporate demographic similarities between tracts, including:
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Population density</li>
              <li>Age distribution</li>
              <li>Housing type (multi-unit vs. single-family)</li>
              <li>Mobility patterns (from anonymized cell phone data)</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-center my-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-2xl">
              <p className="text-yellow-700">
                <span className="font-bold">Important note:</span> All estimated data is clearly marked in the visualization interface with dashed borders and lower opacity. Users can filter by data quality to see only directly reported information if preferred.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h3 className="text-xl font-semibold mb-3">Validation & Accuracy</h3>
          
          <p className="mb-4">
            Our estimation methods have been validated through several approaches:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold mb-2">Cross-validation testing</h4>
              <p className="text-sm">
                We regularly mask known data points and test our estimation methods against them. For adjacent census tracts, our methods achieve 85-90% accuracy.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold mb-2">Historical comparison</h4>
              <p className="text-sm">
                Comparing our estimates to historical ground truth data from previous outbreaks shows 80-85% accuracy for overall patterns.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold mb-2">Independent verification</h4>
              <p className="text-sm">
                Academic partners conduct independent verification studies using alternative data sources and methods.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold mb-2">Confidence metrics</h4>
              <p className="text-sm">
                Each data point includes confidence scores that reflect the quality and reliability of the underlying information.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MethodologyPanel;