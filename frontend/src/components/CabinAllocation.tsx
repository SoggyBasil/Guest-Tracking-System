import React, { useState, useEffect } from 'react';
import { Device } from '@/types/tracking';
import { trackingService } from '@/services/trackingService';

interface CabinAllocationProps {
  devices: Device[];
  isLoading: boolean;
}

interface Cabin {
  id: string;
  number: string;
  type: 'cabin' | 'crew' | 'public';
  assignedGuest?: string;
  assignedDevice?: string;
  status: 'occupied' | 'available' | 'maintenance';
}

const CabinAllocation: React.FC<CabinAllocationProps> = ({ devices, isLoading }) => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);
  const [availableWristbands, setAvailableWristbands] = useState<Device[]>([]);
  const [selectedWristband, setSelectedWristband] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Generate sample cabins (in a real app, this would come from the API)
  useEffect(() => {
    const sampleCabins: Cabin[] = [
      { id: '1', number: '101', type: 'cabin', status: 'available' },
      { id: '2', number: '102', type: 'cabin', status: 'available' },
      { id: '3', number: '103', type: 'cabin', status: 'occupied', assignedGuest: 'John Smith', assignedDevice: 'WB001' },
      { id: '4', number: '201', type: 'cabin', status: 'available' },
      { id: '5', number: '202', type: 'cabin', status: 'available' },
      { id: '6', number: '301', type: 'cabin', status: 'maintenance' },
      { id: '7', number: 'Crew-1', type: 'crew', status: 'occupied', assignedGuest: 'Captain', assignedDevice: 'WB007' },
      { id: '8', number: 'Crew-2', type: 'crew', status: 'available' },
      { id: '9', number: 'Lounge', type: 'public', status: 'available' },
      { id: '10', number: 'Deck', type: 'public', status: 'available' },
    ];
    setCabins(sampleCabins);
  }, []);

  // Get available wristbands
  useEffect(() => {
    const wristbands = devices.filter(device => 
      device.category === 'wristband' && 
      !device.assignedGuest && 
      device.isOnline
    );
    setAvailableWristbands(wristbands);
  }, [devices]);

  const getCabinStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCabinTypeIcon = (type: string) => {
    switch (type) {
      case 'cabin':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'crew':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'public':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleAssignGuest = async () => {
    if (!selectedCabin || !selectedWristband || !guestName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsAssigning(true);
    try {
      // In a real app, this would call the API
      const result = await trackingService.assignWristbandToGuest(
        selectedWristband, 
        guestName, 
        selectedCabin.number
      );

      if (result.success) {
        // Update local state
        setCabins(prev => prev.map(cabin => 
          cabin.id === selectedCabin.id 
            ? { ...cabin, assignedGuest: guestName, assignedDevice: selectedWristband, status: 'occupied' as const }
            : cabin
        ));

        // Clear form
        setSelectedCabin(null);
        setSelectedWristband('');
        setGuestName('');
        
        alert('Guest assigned successfully!');
      } else {
        alert(`Failed to assign guest: ${result.error}`);
      }
    } catch (error) {
      console.error('Error assigning guest:', error);
      alert('Failed to assign guest. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignGuest = async (cabinId: string) => {
    if (!confirm('Are you sure you want to unassign this guest?')) return;

    try {
      // In a real app, this would call the API
      setCabins(prev => prev.map(cabin => 
        cabin.id === cabinId 
          ? { ...cabin, assignedGuest: undefined, assignedDevice: undefined, status: 'available' as const }
          : cabin
      ));
      
      alert('Guest unassigned successfully!');
    } catch (error) {
      console.error('Error unassigning guest:', error);
      alert('Failed to unassign guest. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cabin List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Cabin Management</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Maintenance</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading cabin data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cabins.map((cabin) => (
                  <div
                    key={cabin.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedCabin?.id === cabin.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCabin(cabin)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCabinTypeIcon(cabin.type)}
                        <h3 className="font-semibold text-gray-900">{cabin.number}</h3>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCabinStatusColor(cabin.status)}`}>
                        {cabin.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="capitalize text-gray-500">{cabin.type}</div>
                      
                      {cabin.assignedGuest && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{cabin.assignedGuest}</span>
                        </div>
                      )}
                      
                      {cabin.assignedDevice && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>WB: {cabin.assignedDevice}</span>
                        </div>
                      )}
                    </div>

                    {cabin.assignedGuest && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassignGuest(cabin.id);
                        }}
                        className="mt-3 w-full px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Unassign Guest
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignment Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Assignment</h3>
            
            {selectedCabin ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900">Selected Cabin</h4>
                  <p className="text-sm text-blue-700">{selectedCabin.number} ({selectedCabin.type})</p>
                  <p className="text-xs text-blue-600 capitalize">{selectedCabin.status}</p>
                </div>

                {selectedCabin.status === 'available' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guest Name
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter guest name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wristband Device
                      </label>
                      <select
                        value={selectedWristband}
                        onChange={(e) => setSelectedWristband(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a wristband</option>
                        {availableWristbands.map((wristband) => (
                          <option key={wristband.id} value={wristband.id}>
                            {wristband.name} (Battery: {wristband.batteryLevel || 'N/A'}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAssignGuest}
                      disabled={isAssigning || !guestName.trim() || !selectedWristband}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Guest'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm">This cabin is not available for assignment</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-sm">Select a cabin to assign guests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabinAllocation; 