import React, { useState } from 'react';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import Footer from '../common/Footer';
import LeafletMap from '../map/LeafletMap';
import DiseaseTransmissionDemo from './DiseaseTransmissionDemo';
import MethodologyPanel from '../methodology/MethodologyPanel';
import DataQualityPanel from './DataQualityPanel';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCity, setSelectedCity] = useState('sandiego');
  const [diseaseType, setDiseaseType] = useState('influenza');
  const [dateRange, setDateRange] = useState({
    start: '2025-03-01',
    end: '2025-03-30',
    current: '2025-03-14'
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        selectedCity={selectedCity} 
        onCityChange={setSelectedCity}
        diseaseType={diseaseType}
        onDiseaseChange={setDiseaseType}
      />
      
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className="flex-grow p-4 overflow-auto">
          {activeTab === 'overview' && (
            <DiseaseTransmissionDemo 
              selectedCity={selectedCity}
              diseaseType={diseaseType}
              dateRange={dateRange}
            />
          )}
          
          {activeTab === 'map' && (
            <LeafletMap 
              selectedCity={selectedCity}
              diseaseType={diseaseType}
              currentDate={dateRange.current}
              onDateChange={(date) => setDateRange({...dateRange, current: date})}
            />
          )}
          
          {activeTab === 'methodology' && (
            <MethodologyPanel />
          )}
          
          {activeTab === 'data-quality' && (
            <DataQualityPanel 
              selectedCity={selectedCity}
              diseaseType={diseaseType}
            />
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;