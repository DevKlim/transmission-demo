import React, { useState, useEffect } from 'react';
import './App.css';

function SimpleDemo() {
  const [selectedCity, setSelectedCity] = useState('sandiego');
  const [diseaseType, setDiseaseType] = useState('influenza');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true);
    
    setTimeout(() => {
      const simulatedData = generateData(selectedCity, diseaseType);
      setData(simulatedData);
      setIsLoading(false);
    }, 500);
  }, [selectedCity, diseaseType]);

  // Generate simulated data
  const generateData = (city, disease) => {
    const result = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    
    // Define areas based on selected city
    const areas = city === 'nyc' 
      ? ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
      : ['Downtown', 'La Jolla', 'North Park', 'East County', 'UCSD Campus'];
    
    // Disease modifier
    const multiplier = disease === 'influenza' ? 1 : 
                       disease === 'covid19' ? 1.5 : 0.8;
    
    // Generate data for each day
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayData = {
        date: date.toLocaleDateString(),
        totalCases: 0
      };
      
      // Generate data for each area
      areas.forEach((area, index) => {
        // Base cases with growth and decline pattern
        const peakDay = 5 + (index % 5);
        const growthRate = 1.15 + (index * 0.03);
        const initialCases = 5 + (index * 3);
        
        let cases;
        if (i < peakDay) {
          // Growth phase
          cases = initialCases * Math.pow(growthRate, i) * multiplier;
        } else {
          // Decline phase
          cases = initialCases * Math.pow(growthRate, peakDay) * 
                 Math.pow(0.9, i - peakDay) * multiplier;
        }
        
        // Add randomization
        cases = Math.round(cases * (0.9 + Math.random() * 0.2));
        
        // Add to day data
        dayData[area] = cases;
        dayData.totalCases += cases;
      });
      
      result.push(dayData);
    }
    
    return result;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Disease Transmission Dashboard</h1>
        <div className="controls">
          <div>
            <label>City: </label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="sandiego">San Diego</option>
              <option value="nyc">New York City</option>
            </select>
          </div>
          <div>
            <label>Disease: </label>
            <select value={diseaseType} onChange={(e) => setDiseaseType(e.target.value)}>
              <option value="influenza">Influenza</option>
              <option value="covid19">COVID-19</option>
              <option value="rsv">RSV</option>
            </select>
          </div>
        </div>
      </header>
      
      <main>
        <h2>
          {diseaseType === 'influenza' ? 'Influenza' : 
           diseaseType === 'covid19' ? 'COVID-19' : 'RSV'} 
          Cases in {selectedCity === 'nyc' ? 'New York City' : 'San Diego'}
        </h2>
        
        {isLoading ? (
          <p>Loading data...</p>
        ) : (
          <div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {data.length > 0 && Object.keys(data[0])
                    .filter(key => key !== 'date' && key !== 'totalCases')
                    .map(area => (
                      <th key={area}>{area}</th>
                    ))
                  }
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((day, index) => (
                  <tr key={index}>
                    <td>{day.date}</td>
                    {Object.keys(day)
                      .filter(key => key !== 'date' && key !== 'totalCases')
                      .map(area => (
                        <td key={area}>{day[area]}</td>
                      ))
                    }
                    <td><strong>{day.totalCases}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="insights">
              <h3>Key Insights:</h3>
              <ul>
                {selectedCity === 'nyc' ? (
                  <>
                    <li>Bronx showed earliest outbreak with highest initial growth rate</li>
                    <li>Manhattan experienced delayed onset but moderate growth</li>
                    <li>Brooklyn transmission peaked earlier than other areas</li>
                  </>
                ) : (
                  <>
                    <li>UCSD Campus showed rapid early transmission before quick containment</li>
                    <li>Downtown and North Park areas experienced sustained transmission</li>
                    <li>La Jolla showed lower overall case rates than other areas</li>
                  </>
                )}
                <li>Secondary peaks evident approximately 10 days after initial surge</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SimpleDemo;