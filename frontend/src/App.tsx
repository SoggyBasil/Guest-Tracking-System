import { useState, useEffect } from 'react';
import DeviceList from './components/DeviceList';
import YachtDeckLayout from './components/YachtDeckLayout';
import Navigation from './components/Navigation';
import { Device, TrackingData } from './types/tracking';
import { trackingService } from './services/trackingService';

function App() {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    devices: [],
    floorPlans: [],
    lastUpdate: new Date()
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'tracking' | 'cabins'>('tracking');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await trackingService.fetchTrackingData();
        setTrackingData(data);
      } catch (err) {
        console.error('Failed to fetch tracking data:', err);
        setError('Failed to load tracking data. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Only set up polling for real-time updates when on tracking view
    let interval: NodeJS.Timeout | null = null;
    if (currentView === 'tracking') {
      interval = setInterval(fetchData, 5000); // Update every 5 seconds only for tracking view
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentView]); // Add currentView as dependency

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-sm text-gray-600">
                {isLoading ? 'Updating...' : 'Live'}
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              Last update: {trackingData.lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {trackingData.devices.length} devices total
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'tracking' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Device List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Device Tracking</h2>
                  <div className="text-sm text-gray-500">
                    {trackingData.devices.length} devices total
                  </div>
                </div>
                
                <DeviceList
                  devices={trackingData.devices}
                  onDeviceSelect={handleDeviceSelect}
                  selectedDevice={selectedDevice}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Device Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Details</h3>
                
                {selectedDevice ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedDevice.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{selectedDevice.category}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`text-sm font-medium ${selectedDevice.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedDevice.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      
                      {selectedDevice.room && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Room</span>
                          <span className="text-sm font-medium text-gray-900">{selectedDevice.room}</span>
                        </div>
                      )}
                      
                      {selectedDevice.batteryLevel !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Battery</span>
                          <span className="text-sm font-medium text-gray-900">{selectedDevice.batteryLevel}%</span>
                        </div>
                      )}

                      {selectedDevice.signalStrength !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Signal</span>
                          <span className="text-sm font-medium text-gray-900">{selectedDevice.signalStrength}%</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Seen</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDevice.lastSeen.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    {selectedDevice.assignedGuest && (
                      <div className="pt-3 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Guest Assignment</h5>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Guest</span>
                            <span className="text-sm font-medium text-gray-900">{selectedDevice.assignedGuest}</span>
                          </div>
                          {selectedDevice.assignedCabin && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Cabin</span>
                              <span className="text-sm font-medium text-gray-900">{selectedDevice.assignedCabin}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">Select a device to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
             ) : (
         <YachtDeckLayout />
       )}
    </div>
  );
}

export default App; 