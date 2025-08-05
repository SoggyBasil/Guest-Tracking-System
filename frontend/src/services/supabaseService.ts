import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xdgkmyqqjtmrhfgtuywg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZ2tteXFxanRtcmhmZ3R1eXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTQzMTYsImV4cCI6MjA2OTY5MDMxNn0.F0-W4G3YUUMsuJXlfVnE0nx30dcD6fhp4kCC4TJynjQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Let's first inspect the actual database structure
export const inspectDatabase = async () => {
  try {
    console.log('🔍 Inspecting database structure...');
    
    // Check guests table structure
    const { data: guestsData, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    
    if (guestsError) {
      console.error('❌ Error accessing guests:', guestsError);
    } else {
      console.log('✅ guests columns:', Object.keys(guestsData?.[0] || {}));
      console.log('✅ Sample guests data:', guestsData?.[0]);
    }
    
    // Check device_metadata table structure
    const { data: deviceData, error: deviceError } = await supabase
      .from('device_metadata')
      .select('*')
      .limit(1);
    
    if (deviceError) {
      console.error('❌ Error accessing device_metadata:', deviceError);
    } else {
      console.log('✅ device_metadata columns:', Object.keys(deviceData?.[0] || {}));
      console.log('✅ Sample device_metadata data:', deviceData?.[0]);
    }
    
    // Get all guests to see what data exists
    const { data: allGuests, error: allGuestsError } = await supabase
      .from('guests')
      .select('*');
    
    if (allGuestsError) {
      console.error('❌ Error fetching all guests:', allGuestsError);
    } else {
      console.log('📊 Total guests records:', allGuests?.length || 0);
      if (allGuests && allGuests.length > 0) {
        console.log('📋 Sample guest:', allGuests[0]);
      }
    }
    
    // Get all device_metadata to see what data exists
    const { data: allDevices, error: allDevicesError } = await supabase
      .from('device_metadata')
      .select('*');
    
    if (allDevicesError) {
      console.error('❌ Error fetching all device_metadata:', allDevicesError);
    } else {
      console.log('📊 Total device_metadata records:', allDevices?.length || 0);
      console.log('📋 Available device names:', allDevices?.map(d => d.name).slice(0, 10));
    }
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error);
  }
};

export interface CabinAssignment {
  id?: string;
  cabin_id: string;
  cabin_number: string;
  cabin_name: string;
  guest_name: string;
  device_id: string;
  device_name: string;
  assigned_at: string;
  allergies?: string;
  special_requests?: string;
}

export interface Cabin {
  id: string;
  number: string;
  name: string;
  deck: 'OWNERS DECK' | 'SPA DECK' | 'UPPER DECK';
  side: 'port' | 'starboard' | 'center';
  type: 'VIP' | 'Staff' | 'Master';
  color: 'Red' | 'Green' | 'Yellow';
}

export class SupabaseService {
  /**
   * Initialize and inspect database structure
   */
  static async initialize() {
    await inspectDatabase();
    await this.testDatabaseConnection();
  }

  /**
   * Test database connection and show existing data
   */
  static async testDatabaseConnection() {
    try {
      console.log('🧪 Testing Supabase database connection...');
      
      // Test 1: Check if we can connect to guests table
      const { data: guests, error: guestsError } = await supabase
        .from('guests')
        .select('*');
      
      if (guestsError) {
        console.error('❌ Cannot access guests table:', guestsError);
      } else {
        console.log('✅ guests table accessible');
        console.log('📊 Total records in guests:', guests?.length || 0);
        if (guests && guests.length > 0) {
          console.log('📋 Sample guests record:', guests[0]);
        }
      }

      // Test 2: Check if we can connect to device_metadata table
      const { data: deviceMetadata, error: deviceMetadataError } = await supabase
        .from('device_metadata')
        .select('*');
      
      if (deviceMetadataError) {
        console.error('❌ Cannot access device_metadata table:', deviceMetadataError);
      } else {
        console.log('✅ device_metadata table accessible');
        console.log('📊 Total records in device_metadata:', deviceMetadata?.length || 0);
        if (deviceMetadata && deviceMetadata.length > 0) {
          console.log('📋 Sample device_metadata record:', deviceMetadata[0]);
        }
      }

      // Test 3: Check if we can connect to guest_device_links table
      const { data: guestLinks, error: guestLinksError } = await supabase
        .from('guest_device_links')
        .select('*');
      
      if (guestLinksError) {
        console.error('❌ Cannot access guest_device_links table:', guestLinksError);
      } else {
        console.log('✅ guest_device_links table accessible');
        console.log('📊 Total records in guest_device_links:', guestLinks?.length || 0);
        if (guestLinks && guestLinks.length > 0) {
          console.log('📋 Sample guest_device_links record:', guestLinks[0]);
        }
      }

    } catch (error) {
      console.error('❌ Database connection test failed:', error);
    }
  }

  /**
   * Get all cabin assignments
   */
  static async getCabinAssignments(): Promise<CabinAssignment[]> {
    try {
      console.log('🔍 Fetching cabin assignments from guests table...');
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .not('cabin_number', 'is', null); // Only get records that have cabin assignments
      
      if (error) {
        console.error('❌ Error fetching cabin assignments:', error);
        throw error;
      }
      
      console.log('✅ Cabin assignments data from guests:', data);
      console.log('📊 Number of assignments found:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('📋 Sample assignment:', data[0]);
      }
      
      // Transform the data to match our CabinAssignment interface
      const assignments: CabinAssignment[] = (data || []).map(item => ({
        id: item.id,
        cabin_id: item.cabin_number,
        cabin_number: item.cabin_number,
        cabin_name: item.cabin_name || item.cabin_number,
        guest_name: item.name,
        device_id: item.wristband_id,
        device_name: item.wristband_id, // Use wristband_id as device_name for now
        assigned_at: item.created_at || new Date().toISOString(),
        allergies: item.allergies,
        special_requests: item.special_requests
      }));
      
      console.log('🔄 Transformed assignments:', assignments);
      return assignments;
    } catch (error) {
      console.error('❌ Failed to fetch cabin assignments:', error);
      return [];
    }
  }

  /**
   * Assign a guest to a cabin with a device
   */
  static async assignGuestToCabin(
    cabinNumber: string,
    cabinName: string,
    guestName: string,
    deviceId: string,
    deviceName: string,
    allergies?: string,
    specialRequests?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First, check if the device is already assigned by looking in guests table
      const { data: existingAssignments } = await supabase
        .from('guests')
        .select('*')
        .eq('wristband_id', deviceId);

      const existingAssignment = existingAssignments?.find(g => g.cabin_number !== null);
      if (existingAssignment) {
        return {
          success: false,
          error: `Device ${deviceName} is already assigned to ${existingAssignment.name} in cabin ${existingAssignment.cabin_number}`
        };
      }

      // Check if the cabin is already occupied by looking in guests table
      const { data: cabinAssignments } = await supabase
        .from('guests')
        .select('*')
        .eq('cabin_number', cabinNumber);

      const cabinOccupied = cabinAssignments?.find(g => g.cabin_number !== null);

      if (cabinOccupied) {
        return {
          success: false,
          error: `Cabin ${cabinNumber} is already occupied by ${cabinOccupied.name}`
        };
      }

      // Create the assignment in guests table
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert([
          {
            name: guestName,
            cabin_number: cabinNumber,
            cabin_name: cabinName,
            deck: this.getDeckFromCabinNumber(cabinNumber),
            wristband_id: deviceId,
            allergies: allergies || null,
            special_requests: specialRequests || null
          }
        ])
        .select()
        .single();

      if (guestError) {
        console.error('Error assigning guest to cabin:', guestError);
        return {
          success: false,
          error: guestError.message
        };
      }

      // Also create a link in guest_device_links table for tracking purposes
      if (newGuest && deviceId) {
        try {
          await supabase
            .from('guest_device_links')
            .insert([
              {
                device_id: deviceId,
                guest_id: newGuest.id
              }
            ]);
          console.log('✅ Created guest-device link for tracking');
        } catch (linkError) {
          console.warn('Could not create guest_device_links record:', linkError);
          // Don't fail the assignment if this fails, but log it
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to assign guest to cabin:', error);
      return {
        success: false,
        error: 'Failed to assign guest to cabin'
      };
    }
  }

  /**
   * Unassign a guest from a cabin
   */
  static async unassignGuestFromCabin(cabinId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the guest for this cabin
      const { data: assignments } = await supabase
        .from('guests')
        .select('*')
        .eq('cabin_number', cabinId);

      const assignment = assignments?.find(g => g.cabin_number !== null);

      if (assignment) {
        // First, remove the guest-device link for tracking
        try {
          await supabase
            .from('guest_device_links')
            .delete()
            .eq('guest_id', assignment.id);
          console.log('✅ Removed guest-device link for tracking');
        } catch (linkError) {
          console.warn('Could not remove guest_device_links record:', linkError);
          // Don't fail the unassignment if this fails
        }

        // Then remove the guest assignment
        const { error: deleteError } = await supabase
          .from('guests')
          .delete()
          .eq('id', assignment.id);

        if (deleteError) {
          console.error('Error removing guest assignment:', deleteError);
          return {
            success: false,
            error: deleteError.message
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to unassign guest from cabin:', error);
      return {
        success: false,
        error: 'Failed to unassign guest from cabin'
      };
    }
  }

  /**
   * Get cabin status for all cabins
   */
  static async getCabinStatus(): Promise<Record<string, CabinAssignment | null>> {
    try {
      // Get assignments from guests table
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .not('cabin_number', 'is', null);

      if (error) {
        console.error('Error fetching cabin status:', error);
        return {};
      }

      const cabinStatus: Record<string, CabinAssignment | null> = {};
      
      // Initialize all cabins as available
      const allCabins = [
        '602', '503-DUBAI', '503-NEWYORK', '504-MIAMI', '502-SYDNEY', '507-ROME', '506-PARIS', '510-TOKYO',
        '403', '404', '407', '408', '409', '410', '411', '412', '413', '414', '418'
      ];

      allCabins.forEach(cabinId => {
        cabinStatus[cabinId] = null;
      });

      // Mark occupied cabins
      data?.forEach(assignment => {
        const cabinId = assignment.cabin_number;
        if (cabinId) {
          cabinStatus[cabinId] = {
            id: assignment.id,
            cabin_id: assignment.cabin_number,
            cabin_number: assignment.cabin_number,
            cabin_name: assignment.cabin_name || assignment.cabin_number,
            guest_name: assignment.name,
            device_id: assignment.wristband_id,
            device_name: assignment.wristband_id,
            assigned_at: assignment.created_at || new Date().toISOString(),
            allergies: assignment.allergies,
            special_requests: assignment.special_requests
          };
        }
      });

      return cabinStatus;
    } catch (error) {
      console.error('Failed to get cabin status:', error);
      return {};
    }
  }

  /**
   * Get all available devices (wristbands) from tracking data
   */
  static async getAvailableDevices(): Promise<any[]> {
    try {
      // Get all devices that are not currently assigned
      const { data: assignedDevices } = await supabase
        .from('guests')
        .select('wristband_id')
        .not('wristband_id', 'is', null);

      const assignedDeviceIds = assignedDevices?.map(d => d.wristband_id) || [];

      // Get tracking data from the API
      const response = await fetch('/api/tracking/data');
      const trackingData = await response.json();

      if (!trackingData.success || !trackingData.data?.devices) {
        console.error('Failed to fetch tracking data');
        return [];
      }

      // Filter for wristbands and available devices
      const wristbands = trackingData.data.devices
        .filter((device: any) => {
          // Check if device name matches wristband pattern (G1, G2, P1, P2, C1, C2, etc.)
          const isWristband = /^(G[12]|P[12]|C[12])\s+\d+/.test(device.name) || 
                             /^(G[12]|P[12]|C[12])\s+[A-Za-z]+/.test(device.name) ||
                             /^(G[12]|P[12]|C[12])$/.test(device.name);
          
          // Check if device is not already assigned
          const isAvailable = !assignedDeviceIds.includes(device.id);
          
          return isWristband && isAvailable;
        })
        .map((device: any) => ({
          id: device.id,
          name: device.name,
          category: 'wristband',
          isOnline: device.isOnline,
          lastSeen: device.lastSeen,
          batteryLevel: device.batteryLevel,
          location: device.room,
          wristbandId: device.id,
          assignedGuest: null,
          assignedCabin: null
        }));

      console.log(`Found ${wristbands.length} available wristbands from tracking data`);
      return wristbands;
    } catch (error) {
      console.error('Failed to get available devices:', error);
      return [];
    }
  }

  /**
   * Helper method to determine deck from cabin number
   */
  private static getDeckFromCabinNumber(cabinNumber: string): string {
    if (cabinNumber === '602') return 'Owners Deck';
    if (cabinNumber.startsWith('5')) return 'Spa Deck';
    if (cabinNumber.startsWith('4')) return 'Upper Deck';
    return 'Unknown Deck';
  }
}

export default SupabaseService; 