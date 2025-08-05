import { Device } from '@/types/tracking';

export interface DeviceAnalytics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  categoryBreakdown: Record<string, number>;
  accuracyBreakdown: Record<string, number>;
  averageSignalStrength: number;
  averageBatteryLevel: number;
  mostActiveDevices: Array<{ device: Device; lastSeen: Date }>;
}

export const generateDeviceAnalytics = (devices: Device[]): DeviceAnalytics => {
  const onlineDevices = devices.filter(d => d.isOnline);
  const offlineDevices = devices.filter(d => !d.isOnline);
  
  const categoryBreakdown = devices.reduce((acc, device) => {
    const category = device.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accuracyBreakdown = devices.reduce((acc, device) => {
    if (device.accuracy !== undefined) {
      acc[device.accuracy] = (acc[device.accuracy] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const signalStrengths = devices
    .filter(d => d.signalStrength !== undefined)
    .map(d => d.signalStrength!);
  
  const batteryLevels = devices
    .filter(d => d.batteryLevel !== undefined)
    .map(d => d.batteryLevel!);

  const mostActiveDevices = devices
    .sort((a, b) => {
      const aDate = typeof a.lastSeen === 'string' ? new Date(a.lastSeen) : a.lastSeen;
      const bDate = typeof b.lastSeen === 'string' ? new Date(b.lastSeen) : b.lastSeen;
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 5)
    .map(device => ({ 
      device, 
      lastSeen: typeof device.lastSeen === 'string' ? new Date(device.lastSeen) : device.lastSeen 
    }));

  return {
    totalDevices: devices.length,
    onlineDevices: onlineDevices.length,
    offlineDevices: offlineDevices.length,
    categoryBreakdown,
    accuracyBreakdown,
    averageSignalStrength: signalStrengths.length > 0 
      ? signalStrengths.reduce((a, b) => a + b, 0) / signalStrengths.length 
      : 0,
    averageBatteryLevel: batteryLevels.length > 0 
      ? batteryLevels.reduce((a, b) => a + b, 0) / batteryLevels.length 
      : 0,
    mostActiveDevices
  };
};

export const exportToCSV = (devices: Device[], filename: string = 'device-data.csv') => {
  const headers = [
    'Name',
    'Category',
    'Room',
    'Status',
    'Accuracy',
    'Signal Strength (dBm)',
    'Battery Level (%)',
    'Last Seen',
    'Device Type',
    'Family Priority'
  ];

  const csvContent = [
    headers.join(','),
    ...devices.map(device => [
      `"${device.name}"`,
      device.category || 'other',
      `"${device.room}"`,
      device.isOnline ? 'Online' : 'Offline',
      device.accuracy,
      device.signalStrength || '',
      device.batteryLevel || '',
      (typeof device.lastSeen === 'string' ? new Date(device.lastSeen) : device.lastSeen).toISOString(),
      device.deviceType || 'Unknown',
      device.familyPriority || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateAnalyticsReport = (analytics: DeviceAnalytics): string => {
  const report = `
Device Analytics Report
Generated: ${new Date().toLocaleString()}

Summary:
- Total Devices: ${analytics.totalDevices}
- Online Devices: ${analytics.onlineDevices} (${((analytics.onlineDevices / analytics.totalDevices) * 100).toFixed(1)}%)
- Offline Devices: ${analytics.offlineDevices} (${((analytics.offlineDevices / analytics.totalDevices) * 100).toFixed(1)}%)

Category Breakdown:
${Object.entries(analytics.categoryBreakdown)
  .map(([category, count]) => `- ${category}: ${count} devices`)
  .join('\n')}

Accuracy Breakdown:
${Object.entries(analytics.accuracyBreakdown)
  .map(([accuracy, count]) => `- ${accuracy}: ${count} devices`)
  .join('\n')}

Performance Metrics:
- Average Signal Strength: ${analytics.averageSignalStrength.toFixed(1)} dBm
- Average Battery Level: ${analytics.averageBatteryLevel.toFixed(1)}%

Most Active Devices:
${analytics.mostActiveDevices
  .map((item, index) => `${index + 1}. ${item.device.name} - Last seen: ${item.lastSeen.toLocaleString()}`)
  .join('\n')}
  `.trim();

  return report;
}; 