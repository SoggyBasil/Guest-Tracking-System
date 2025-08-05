import React, { useState } from 'react';
import { Device } from '@/types/tracking';
import DeviceCard from './DeviceCard';

interface DeviceListProps {
  devices: Device[];
  onDeviceSelect?: (device: Device) => void;
  selectedDevice?: Device | null;
  isLoading?: boolean;
}

const DeviceList: React.FC<DeviceListProps> = ({ 
  devices, 
  onDeviceSelect, 
  selectedDevice,
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    family: true,
    crew: true,
    guest: true,
    other: true,
    offline: false, // Offline devices section starts collapsed
  });

  const [guestFilter, setGuestFilter] = useState<string>('all'); // 'all', '1', '2', '3', etc.
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastSeen' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filterAndSortDevices = (devices: Device[]) => {
    // Apply search filter
    let filteredDevices = devices;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredDevices = devices.filter(device => 
        device.name.toLowerCase().includes(query) ||
        (device.room && device.room.toLowerCase().includes(query)) ||
        (device.category && device.category.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filteredDevices.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          // For family devices, use family priority for sorting
          if (a.category === 'family' && b.category === 'family') {
            aValue = a.familyPriority || 999;
            bValue = b.familyPriority || 999;
          } else {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
          }
          break;
        case 'status':
          aValue = a.isOnline ? 1 : 0;
          bValue = b.isOnline ? 1 : 0;
          break;
        case 'lastSeen':
          const aDate = typeof a.lastSeen === 'string' ? new Date(a.lastSeen) : a.lastSeen;
          const bDate = typeof b.lastSeen === 'string' ? new Date(b.lastSeen) : b.lastSeen;
          aValue = aDate.getTime();
          bValue = bDate.getTime();
          break;
        case 'category':
          aValue = a.category || 'other';
          bValue = b.category || 'other';
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredDevices;
  };

  const groupDevicesByCategory = (devices: Device[]) => {
    const filteredAndSortedDevices = filterAndSortDevices(devices);
    
    const grouped: Record<string, Device[]> = {
      family: [],
      crew: [],
      guest: [],
      other: [],
      offline: []
    };

    filteredAndSortedDevices.forEach(device => {
      // Separate offline devices into their own section
      if (!device.isOnline) {
        grouped.offline.push(device);
        return;
      }

      const category = device.category || 'other';
      
      // Apply guest filtering
      if (category === 'guest' && guestFilter !== 'all') {
        const guestNumber = device.name.match(/G(\d+)/i)?.[1];
        if (guestNumber !== guestFilter) {
          return; // Skip this device if it doesn't match the filter
        }
      }
      
      grouped[category].push(device);
    });

    return grouped;
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'family':
        return (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26A3 3 0 0 0 12 12c-1.11 0-2.08-.6-2.6-1.5L7.7 8.74A2.5 2.5 0 0 0 5.46 8H4c-.8 0-1.54.37-2.01 1L1.46 11.37A1.5 1.5 0 0 0 3.5 14H6v6h2v-6h6v6h2v-6h2z"/>
            </svg>
            <span>Family</span>
          </div>
        );
      case 'crew':
        return (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Crew</span>
          </div>
        );
      case 'guest':
        return (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span>Guests</span>
          </div>
        );
      case 'other':
        return (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Other Devices</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"/>
            </svg>
            <span>Offline Devices</span>
          </div>
        );
      default:
        return category;
    }
  };

  const getAvailableGuestNumbers = () => {
    const guestDevices = devices.filter(d => d.category === 'guest');
    const numbers = new Set<string>();
    guestDevices.forEach(device => {
      const match = device.name.match(/G(\d+)/i);
      if (match) {
        numbers.add(match[1]);
      }
    });
    return Array.from(numbers).sort((a, b) => parseInt(a) - parseInt(b));
  };

  const getCategoryDescription = (category: string, count: number) => {
    switch (category) {
      case 'family':
        return `${count} family member${count !== 1 ? 's' : ''} (P1-P4, C1-C2)`;
      case 'crew':
        return `${count} crew member${count !== 1 ? 's' : ''}`;
      case 'guest':
        const filterText = guestFilter !== 'all' ? ` (G${guestFilter} only)` : '';
        return `${count} guest${count !== 1 ? 's' : ''}${filterText}`;
      case 'other':
        return `${count} device${count !== 1 ? 's' : ''}`;
      case 'offline':
        return `${count} offline device${count !== 1 ? 's' : ''}`;
      default:
        return `${count} item${count !== 1 ? 's' : ''}`;
    }
  };

  const groupedDevices = groupDevicesByCategory(devices);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Sort Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {isLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-800">Loading device data...</span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search devices by name, room, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="lastSeen">Sort by Last Seen</option>
              <option value="category">Sort by Category</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            >
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mt-3 text-sm text-gray-600">
            Found {Object.values(groupedDevices).flat().length} device(s) matching "{searchQuery}"
          </div>
        )}
      </div>
      {Object.entries(groupedDevices).map(([category, categoryDevices]) => {
        if (categoryDevices.length === 0) return null;

        const isExpanded = expandedSections[category];
        const onlineCount = categoryDevices.filter(d => d.isOnline).length;
        const totalCount = categoryDevices.length;

                 return (
           <div key={category} className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
             category === 'offline' ? 'border-red-200 bg-red-50' : ''
           }`}>
             {/* Section Header */}
             <div 
               className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer transition-colors ${
                 category === 'offline' ? 'hover:bg-red-100' : 'hover:bg-gray-50'
               }`}
               onClick={() => toggleSection(category)}
             >
              <div className="flex items-center space-x-2 sm:space-x-3">
                {isExpanded ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {getCategoryTitle(category)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {getCategoryDescription(category, totalCount)} • {onlineCount} online
                  </p>
                </div>
              </div>
              
                             {/* Status indicator */}
               <div className="flex items-center space-x-2">
                 <div className="flex space-x-1">
                   {categoryDevices.slice(0, 3).map((device) => (
                     <div
                       key={device.id}
                       className={`w-2 h-2 rounded-full ${
                         device.isOnline ? 'bg-green-500' : 'bg-red-500'
                       }`}
                       title={`${device.name}: ${device.isOnline ? 'Online' : 'Offline'}`}
                     />
                   ))}
                   {categoryDevices.length > 3 && (
                     <div className="w-2 h-2 rounded-full bg-gray-300" />
                   )}
                 </div>
                                   {category === 'offline' && (
                    <div className="text-xs text-red-600 font-medium">
                      {totalCount} offline
                    </div>
                  )}
               </div>
            </div>

                         {/* Guest Filter (only for guest category) */}
             {category === 'guest' && isExpanded && (
               <div className="border-t border-gray-200 p-4 bg-gray-50">
                 <div className="flex items-center justify-between mb-3">
                   <span className="text-sm font-medium text-gray-700">Filter by Guest Number:</span>
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       setGuestFilter('all');
                     }}
                     className={`px-2 py-1 text-xs rounded ${
                       guestFilter === 'all' 
                         ? 'bg-green-500 text-white' 
                         : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                     }`}
                   >
                     All Guests
                   </button>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {getAvailableGuestNumbers().map(number => (
                     <button
                       key={number}
                       onClick={(e) => {
                         e.stopPropagation();
                         setGuestFilter(guestFilter === number ? 'all' : number);
                       }}
                       className={`px-3 py-1 text-xs rounded-full font-medium ${
                         guestFilter === number 
                           ? 'bg-green-500 text-white' 
                           : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                       }`}
                     >
                       G{number}
                     </button>
                   ))}
                 </div>
               </div>
             )}

                           {/* Section Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {categoryDevices.map((device) => (
                      <DeviceCard
                        key={device.id}
                        device={device}
                        onClick={() => onDeviceSelect?.(device)}
                        isSelected={selectedDevice?.id === device.id}
                      />
                    ))}
                  </div>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

export default DeviceList; 