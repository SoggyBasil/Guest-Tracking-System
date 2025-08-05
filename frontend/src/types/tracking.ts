export interface Device {
  id: string;
  name: string;
  category: 'family' | 'crew' | 'guest' | 'wristband' | 'other';
  isOnline: boolean;
  lastSeen: Date;
  batteryLevel?: number;
  location?: string;
  room?: string;
  wristbandId?: string;
  assignedGuest?: string;
  assignedCabin?: string;
  familyPriority?: number;
  accuracy?: number;
  signalStrength?: number;
  deviceType?: string;
}

export interface TrackingData {
  devices: Device[];
  floorPlans: any[];
  lastUpdate: Date;
}

export interface TrackingConfig {
  apiEndpoint: string;
  updateInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  number: string;
  type: 'cabin' | 'crew' | 'public';
  devices: Device[];
} 