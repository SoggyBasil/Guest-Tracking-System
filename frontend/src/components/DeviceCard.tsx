import React from 'react';
import { Device } from '@/types/tracking';

interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
  isSelected?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick, isSelected = false }) => {
  const getStatusColor = () => {
    return device.isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'bg-gray-300';
    if (level > 60) return 'bg-green-500';
    if (level > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSignalColor = (level?: number) => {
    if (!level) return 'bg-gray-300';
    if (level > 80) return 'bg-green-500';
    if (level > 50) return 'bg-yellow-500';
    if (level > 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getCategoryIcon = () => {
    switch (device.category) {
      case 'family':
        return (
          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26A3 3 0 0 0 12 12c-1.11 0-2.08-.6-2.6-1.5L7.7 8.74A2.5 2.5 0 0 0 5.46 8H4c-.8 0-1.54.37-2.01 1L1.46 11.37A1.5 1.5 0 0 0 3.5 14H6v6h2v-6h6v6h2v-6h2z"/>
          </svg>
        );
      case 'crew':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'guest':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
        </div>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        {device.room && (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{device.room}</span>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Last seen: {formatLastSeen(device.lastSeen)}</span>
        </div>

        {device.batteryLevel !== undefined && (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Battery: {device.batteryLevel}%</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1 ml-1">
              <div 
                className={`h-1 rounded-full ${getBatteryColor(device.batteryLevel)}`}
                style={{ width: `${device.batteryLevel}%` }}
              />
            </div>
          </div>
        )}

        {device.signalStrength !== undefined && (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span>Signal: {device.signalStrength}%</span>
            <div className="flex-1 bg-gray-200 rounded-full h-1 ml-1">
              <div 
                className={`h-1 rounded-full ${getSignalColor(device.signalStrength)}`}
                style={{ width: `${device.signalStrength}%` }}
              />
            </div>
          </div>
        )}

        {device.assignedGuest && (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Guest: {device.assignedGuest}</span>
          </div>
        )}

        {device.assignedCabin && (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Cabin: {device.assignedCabin}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceCard; 