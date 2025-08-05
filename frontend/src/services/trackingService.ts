import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Device, TrackingData, TrackingConfig } from '@/types/tracking';

export interface TrackingDevice {
  id: string;
  name: string;
  category: string;
  isOnline: boolean;
  lastSeen?: string;
  batteryLevel?: number;
  location?: string;
  wristbandId?: string;
  assignedGuest?: string;
  assignedCabin?: string;
}

export interface WristbandDevice extends TrackingDevice {
  wristbandId: string;
  assignedGuest?: string;
  assignedCabin?: string;
}

export class TrackingService {
  private api: AxiosInstance;
  // private _config: TrackingConfig;

  constructor(config: TrackingConfig) {
    // this._config = config;
    this.api = axios.create({
      baseURL: config.apiEndpoint,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
      }
    );
  }

  async fetchTrackingData(): Promise<TrackingData> {
    try {
      console.log('Fetching tracking data from backend API...');
      
      const response = await this.api.get('/api/tracking/data');
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ Successfully fetched tracking data from backend API!');
        const data = response.data.data;
        
        // Convert lastUpdate string to Date object
        if (data.lastUpdate && typeof data.lastUpdate === 'string') {
          data.lastUpdate = new Date(data.lastUpdate);
        }
        
        // Convert lastSeen strings to Date objects for all devices
        if (data.devices && Array.isArray(data.devices)) {
          data.devices = data.devices.map((device: any) => ({
            ...device,
            lastSeen: typeof device.lastSeen === 'string' ? new Date(device.lastSeen) : device.lastSeen
          }));
        }
        
        return data;
      } else {
        console.log('Backend API returned unexpected response, returning empty tracking data');
        return {
          devices: [],
          floorPlans: [],
          lastUpdate: new Date()
        };
      }
    } catch (error: any) {
      console.error('Failed to fetch tracking data:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      console.log('Returning empty tracking data due to fetch error');
      return {
        devices: [],
        floorPlans: [],
        lastUpdate: new Date()
      };
    }
  }

  async fetchDevices(): Promise<Device[]> {
    try {
      const response: AxiosResponse<Device[]> = await this.api.get('/api/tracking/devices');
      return response.data.map(device => ({
        ...device,
        lastSeen: new Date(device.lastSeen),
      }));
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw new Error('Failed to fetch devices');
    }
  }

  async fetchDeviceById(id: string): Promise<Device> {
    try {
      const response: AxiosResponse<Device> = await this.api.get(`/api/tracking/devices/${id}`);
      return {
        ...response.data,
        lastSeen: new Date(response.data.lastSeen),
      };
    } catch (error) {
      console.error(`Failed to fetch device ${id}:`, error);
      throw new Error(`Failed to fetch device ${id}`);
    }
  }

  // Test the API endpoint and return raw response for debugging
  async testApiEndpoint(): Promise<any> {
    try {
      console.log('Testing backend API endpoint...');
      
      const response = await this.api.get('/api/tracking/test');
      
      console.log('API Test Response Status:', response.status);
      console.log('API Test Response Headers:', response.headers);
      console.log('API Test Response Data Type:', typeof response.data);
      console.log('API Test Response Data Keys:', Object.keys(response.data));
      console.log('API Test Response Data Size:', JSON.stringify(response.data).length, 'bytes');
      
      // Log the full response data for debugging
      console.log('=== FULL API RESPONSE DATA ===');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('=== END FULL API RESPONSE DATA ===');
      
      return {
        success: true,
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        dataKeys: Object.keys(response.data),
        dataSize: JSON.stringify(response.data).length,
        fullData: response.data, // Include the full data for inspection
      };
    } catch (error: any) {
      console.error('API Test Failed:', error);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  }

  /**
   * Get all wristbands from the backend API
   */
  async getWristbands(): Promise<string[]> {
    try {
      console.log('Fetching wristbands from backend API...');
      
      const response = await this.api.get('/api/tracking/wristbands');
      
      if (response.status === 200 && response.data.success) {
        console.log(`✅ Successfully fetched ${response.data.data.length} wristbands from backend API`);
        return response.data.data;
      } else {
        console.log('Backend API returned unexpected response, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error fetching wristbands from backend API:', error);
      return [];
    }
  }

  /**
   * Clear the wristband cache via backend API
   */
  async clearWristbandCache(): Promise<void> {
    try {
      console.log('Clearing wristband cache via backend API...');
      
      const response = await this.api.post('/api/tracking/wristbands/clear-cache');
      
      if (response.status === 200 && response.data.success) {
        console.log('✅ Successfully cleared wristband cache via backend API');
      } else {
        console.log('Failed to clear wristband cache via backend API');
      }
    } catch (error) {
      console.error('Error clearing wristband cache via backend API:', error);
    }
  }

  /**
   * Get online wristband devices
   */
  async getOnlineWristbands(): Promise<WristbandDevice[]> {
    try {
      const response = await this.api.get('/api/tracking/devices/online');
      
      if (response.status === 200 && response.data.success) {
        return response.data.data.filter((device: any) => 
          device.isOnline && 
          (device.category === 'wristband' || device.category === 'guest')
        ) as WristbandDevice[];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting online wristbands:', error);
      return [];
    }
  }

  /**
   * Get available (unassigned) wristband devices
   */
  async getAvailableWristbands(): Promise<WristbandDevice[]> {
    try {
      const allWristbands = await this.getOnlineWristbands();
      return allWristbands.filter(device => !device.assignedGuest);
    } catch (error) {
      console.error('Error getting available wristbands:', error);
      return [];
    }
  }

  /**
   * Assign wristband to guest
   */
  async assignWristbandToGuest(wristbandId: string, guestId: string, _cabinNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.api.post('/api/cabins/guests/link', {
        deviceId: wristbandId,
        guestId
      });

      if (response.status === 200 && response.data.success) {
        return { success: true };
      }

      return { success: false, error: response.data.error || 'Assignment failed' };
    } catch (error: any) {
      console.error('Error assigning wristband:', error);
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
}

export const trackingService = new TrackingService({ 
  apiEndpoint: 'http://localhost:3001',
  updateInterval: 5000,
  retryAttempts: 3,
  retryDelay: 1000
}); 