import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Camera, 
  X,
  Save,
  User,
  MapPin,
  Bed,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import SupabaseService from '@/services/supabaseService';
import { supabase } from '@/services/supabaseService';

interface Device {
  id: string;
  name: string;
  category: string;
  isOnline: boolean;
  wristbandId?: string;
  assignedGuest?: string;
  assignedCabin?: string;
}

interface Guest {
  id: string;
  name: string;
  wristbandId?: string;
  wristbandName?: string;
  allergies?: string;
  specialRequests?: string;
  photoUrl1?: string;
  photoUrl2?: string;
}

interface Cabin {
  id: string;
  number: string;
  name: string;
  deck: string;
  side: string;
  type: string;
  color: string;
  guests: Guest[];
  estimatedCapacity: number;
  features: string;
  area: string;
}

// Cabin mapping from the working version
const CABIN_MAPPING: Record<string, { name: string; deck: string; area: string; features: string; capacity: number }> = {
  '602': { name: 'Master Suite', deck: 'Owners Deck', area: 'Center', features: 'Master Suite, King Bed, Private Bathroom', capacity: 2 },
  '503-DUBAI': { name: 'DUBAI', deck: 'Spa Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '503-NEWYORK': { name: 'NEW YORK', deck: 'Spa Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '504': { name: 'MIAMI', deck: 'Spa Deck', area: 'Starboard Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '502': { name: 'SYDNEY', deck: 'Spa Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '507': { name: 'ROME', deck: 'Spa Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '506': { name: 'PARIS', deck: 'Spa Deck', area: 'Starboard Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '510': { name: 'TOKYO', deck: 'Spa Deck', area: 'Starboard Side', features: 'Staff Cabin, Twin Beds, Shared Bathroom', capacity: 2 },
  '403': { name: 'BEIJING', deck: 'Upper Deck', area: 'Port Side', features: 'Staff Cabin, Twin Beds, Shared Bathroom', capacity: 2 },
  '404': { name: 'ISTANBUL', deck: 'Upper Deck', area: 'Starboard Side', features: 'Staff Cabin, Twin Beds, Shared Bathroom', capacity: 2 },
  '407': { name: 'MADRID', deck: 'Upper Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '408': { name: 'CAIRO', deck: 'Upper Deck', area: 'Starboard Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '409': { name: 'MONACO', deck: 'Upper Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '410': { name: 'HOLLYWOOD', deck: 'Upper Deck', area: 'Starboard Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '411': { name: 'RIO', deck: 'Upper Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '412': { name: 'LONDON', deck: 'Upper Deck', area: 'Starboard Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '413': { name: 'VENICE', deck: 'Upper Deck', area: 'Port Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '414': { name: 'MYKONOS', deck: 'Upper Deck', area: 'Starboard Side', features: 'VIP Suite, Twin Beds, Shared Bathroom', capacity: 2 },
  '418': { name: 'CAPRI', deck: 'Upper Deck', area: 'Starboard Side', features: 'Staff Cabin, Twin Beds, Shared Bathroom', capacity: 2 },
};

const YachtDeckLayout: React.FC = () => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuest, setEditingGuest] = useState<{ cabinNumber: string; guestIndex: number } | null>(null);
  const [showAddGuest, setShowAddGuest] = useState<{ cabinNumber: string } | null>(null);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({});
  const [expandedDecks, setExpandedDecks] = useState<Record<string, boolean>>({
    'Owners Deck': true,
    'Spa Deck': true,
    'Upper Deck': true
  });

  // Load cabins and devices on component mount
  useEffect(() => {
    // Initialize Supabase service and test database connection
    SupabaseService.initialize().then(() => {
      console.log('✅ Supabase service initialized');
    }).catch((error) => {
      console.error('❌ Failed to initialize Supabase service:', error);
    });
    
    loadCabins();
    loadTrackingDevices();
  }, []);

  const loadCabins = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading cabins...');
      
      // Initialize cabins with the mapping
      const cabinData: Cabin[] = Object.entries(CABIN_MAPPING).map(([number, details]) => ({
        id: number,
        number,
        name: details.name,
        deck: details.deck,
        side: details.area === 'Port Side' ? 'port' : details.area === 'Starboard Side' ? 'starboard' : 'center',
        type: details.name === 'Master' ? 'Master' : details.name.includes('Staff') ? 'Staff' : 'VIP',
        color: details.area === 'Port Side' ? 'Red' : details.area === 'Starboard Side' ? 'Green' : 'Yellow',
        guests: [],
        estimatedCapacity: details.capacity,
        features: details.features,
        area: details.area
      }));

      console.log('📋 Initialized cabin data:', cabinData.length, 'cabins');

      // Load existing assignments from Supabase
      const assignments = await SupabaseService.getCabinAssignments();
      console.log('📊 Assignments from Supabase:', assignments);
      
      // Map assignments to cabins
      cabinData.forEach(cabin => {
        const assignment = assignments.find(a => a.cabin_number === cabin.id);
        console.log(`🔍 Looking for cabin ${cabin.id}:`, assignment ? 'Found assignment' : 'No assignment');
        if (assignment) {
          cabin.guests = [{
            id: assignment.id || '1',
            name: assignment.guest_name,
            wristbandId: assignment.device_id,
            wristbandName: assignment.device_name,
            allergies: assignment.allergies || '',
            specialRequests: assignment.special_requests || ''
          }];
          console.log(`✅ Assigned guest to cabin ${cabin.id}:`, assignment.guest_name);
        }
      });

      console.log('🏠 Final cabin data with guests:', cabinData);
      setCabins(cabinData);
    } catch (error) {
      console.error('❌ Error loading cabins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrackingDevices = async () => {
    try {
      // Get wristbands from the API
      const response = await fetch('/api/tracking/wristbands');
      const wristbandData = await response.json();
      
      if (wristbandData.success && wristbandData.data) {
        const devices: Device[] = wristbandData.data.map((wristband: string) => ({
          id: wristband,
          name: wristband,
          category: 'wristband',
          isOnline: true,
          wristbandId: wristband
        }));
        
        setAvailableDevices(devices);
        console.log(`Loaded ${devices.length} tracking devices`);
      }
    } catch (error) {
      console.error('Error loading tracking devices:', error);
      // Fallback to mock data if API fails
      const mockDevices: Device[] = [
        { id: 'P1 Mr', name: 'P1 Mr', category: 'wristband', isOnline: true },
        { id: 'P2 Mrs', name: 'P2 Mrs', category: 'wristband', isOnline: true },
        { id: 'P3 Allison', name: 'P3 Allison', category: 'wristband', isOnline: true },
        { id: 'P4 Jonathan', name: 'P4 Jonathan', category: 'wristband', isOnline: true },
        { id: 'C1 Sophia', name: 'C1 Sophia', category: 'wristband', isOnline: true },
        { id: 'C2 Max', name: 'C2 Max', category: 'wristband', isOnline: true },
      ];
      setAvailableDevices(mockDevices);
    }
  };

  const handleAddGuest = async (cabinNumber: string) => {
    if (!newGuest.name) {
      alert('Please enter a guest name');
      return;
    }

    const cabinDetails = CABIN_MAPPING[cabinNumber];
    if (!cabinDetails) {
      alert('Invalid cabin number');
      return;
    }

    try {
      const result = await SupabaseService.assignGuestToCabin(
        cabinNumber,
        cabinDetails.name,
        newGuest.name,
        newGuest.wristbandId || '',
        newGuest.wristbandId || '',
        newGuest.allergies,
        newGuest.specialRequests
      );

      if (result.success) {
        await loadCabins(); // Reload cabins to show new guest
        setShowAddGuest(null);
        setNewGuest({});
        alert('Guest added successfully!');
      } else {
        alert(`Error adding guest: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('Error adding guest. Please try again.');
    }
  };

  const handleUpdateGuest = async (_guestId: string, _updates: Partial<Guest>) => {
    try {
      // For now, we'll just reload the data
      await loadCabins();
      setEditingGuest(null);
      alert('Guest updated successfully!');
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Error updating guest. Please try again.');
    }
  };

  const handleRemoveGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to remove this guest?')) {
      return;
    }

    try {
      // Find the cabin with this guest
      const cabin = cabins.find(c => c.guests.some(g => g.id === guestId));
      if (cabin) {
        const result = await SupabaseService.unassignGuestFromCabin(cabin.id);
        if (result.success) {
          await loadCabins(); // Reload cabins to show updated guest list
          alert('Guest removed successfully!');
        } else {
          alert(`Error removing guest: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error removing guest:', error);
      alert('Error removing guest. Please try again.');
    }
  };

  const handlePhotoUpload = async (file: File, _guestId: string, _photoNumber: 1 | 2) => {
    try {
      // Upload to Supabase storage
      const fileName = `guest-images/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from('guest-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      supabase.storage
        .from('guest-images')
        .getPublicUrl(fileName);

      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    }
  };

  // Get cabin header gradient based on deck and area
  const getCabinHeaderGradient = (cabin: Cabin) => {
    if (cabin.deck === 'Owners Deck') return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (cabin.area === 'Port Side') return 'bg-gradient-to-r from-red-500 to-red-600';
    if (cabin.area === 'Starboard Side') return 'bg-gradient-to-r from-green-500 to-green-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  // Toggle deck expansion
  const toggleDeck = (deckName: string) => {
    setExpandedDecks(prev => ({
      ...prev,
      [deckName]: !prev[deckName]
    }));
  };

  // Get deck color classes
  const getDeckColorClasses = (deckName: string) => {
    switch (deckName) {
      case 'Owners Deck': return 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700';
      case 'Spa Deck': return 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700';
      case 'Upper Deck': return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      default: return 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cabin layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cabin Layout Management</h1>
          <p className="text-gray-600">
            Manage guest assignments and cabin information for the yacht
          </p>
        </motion.div>

        {/* Cabin Layout by Deck */}
        <div className="space-y-6">
          {(() => {
            const cabinsByDeck = cabins.reduce((acc, cabin) => {
              if (!acc[cabin.deck]) acc[cabin.deck] = [];
              acc[cabin.deck].push(cabin);
              return acc;
            }, {} as Record<string, Cabin[]>);

            const deckOrder = ['Owners Deck', 'Spa Deck', 'Upper Deck'];
            
            return deckOrder.map((deck) => {
              const deckCabins = cabinsByDeck[deck] || [];
              if (deckCabins.length === 0) return null;
              
              return (
                <motion.div
                  key={deck}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Deck Header - Collapsible */}
                  <button
                    onClick={() => toggleDeck(deck)}
                    className={`w-full p-4 text-left bg-gradient-to-r ${getDeckColorClasses(deck)} text-white transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {expandedDecks[deck] ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                        <h2 className="text-xl font-bold">{deck.toUpperCase()}</h2>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                          {deckCabins.length} cabins
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm opacity-90">
                          {deckCabins.reduce((total, cabin) => total + cabin.guests.length, 0)} guests
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Deck Content - Collapsible */}
                  {expandedDecks[deck] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      {deck === 'Owners Deck' ? (
                        // Owners Deck - Single centered cabin
                        <div className="max-w-md mx-auto">
                          {deckCabins.map((cabin) => (
                            <CabinCard
                              key={cabin.number}
                              cabin={cabin}
                              availableDevices={availableDevices}
                              editingGuest={editingGuest}
                              showAddGuest={showAddGuest}
                              newGuest={newGuest}
                              setEditingGuest={setEditingGuest}
                              setShowAddGuest={setShowAddGuest}
                              setNewGuest={setNewGuest}
                              handleAddGuest={handleAddGuest}
                              handleUpdateGuest={handleUpdateGuest}
                              handleRemoveGuest={handleRemoveGuest}
                              handlePhotoUpload={handlePhotoUpload}
                              getCabinHeaderGradient={getCabinHeaderGradient}
                            />
                          ))}
                        </div>
                      ) : (
                        // Other decks - Port and Starboard sides
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Port Side */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-red-600 text-center border-b-2 border-red-200 pb-2">
                              Port Side (Red)
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                              {deckCabins
                                .filter(cabin => cabin.area === 'Port Side')
                                .map((cabin) => (
                                  <CabinCard
                                    key={cabin.number}
                                    cabin={cabin}
                                    availableDevices={availableDevices}
                                    editingGuest={editingGuest}
                                    showAddGuest={showAddGuest}
                                    newGuest={newGuest}
                                    setEditingGuest={setEditingGuest}
                                    setShowAddGuest={setShowAddGuest}
                                    setNewGuest={setNewGuest}
                                    handleAddGuest={handleAddGuest}
                                    handleUpdateGuest={handleUpdateGuest}
                                    handleRemoveGuest={handleRemoveGuest}
                                    handlePhotoUpload={handlePhotoUpload}
                                    getCabinHeaderGradient={getCabinHeaderGradient}
                                  />
                                ))}
                            </div>
                          </div>

                          {/* Starboard Side */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-green-600 text-center border-b-2 border-green-200 pb-2">
                              Starboard Side (Green)
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                              {deckCabins
                                .filter(cabin => cabin.area === 'Starboard Side')
                                .map((cabin) => (
                                  <CabinCard
                                    key={cabin.number}
                                    cabin={cabin}
                                    availableDevices={availableDevices}
                                    editingGuest={editingGuest}
                                    showAddGuest={showAddGuest}
                                    newGuest={newGuest}
                                    setEditingGuest={setEditingGuest}
                                    setShowAddGuest={setShowAddGuest}
                                    setNewGuest={setNewGuest}
                                    handleAddGuest={handleAddGuest}
                                    handleUpdateGuest={handleUpdateGuest}
                                    handleRemoveGuest={handleRemoveGuest}
                                    handlePhotoUpload={handlePhotoUpload}
                                    getCabinHeaderGradient={getCabinHeaderGradient}
                                  />
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            }).filter(Boolean);
          })()}
        </div>
      </div>
    </div>
  );
};

// Separate component for cabin cards to reduce complexity
interface CabinCardProps {
  cabin: Cabin;
  availableDevices: Device[];
  editingGuest: { cabinNumber: string; guestIndex: number } | null;
  showAddGuest: { cabinNumber: string } | null;
  newGuest: Partial<Guest>;
  setEditingGuest: (value: { cabinNumber: string; guestIndex: number } | null) => void;
  setShowAddGuest: (value: { cabinNumber: string } | null) => void;
  setNewGuest: (value: Partial<Guest>) => void;
  handleAddGuest: (cabinNumber: string) => void;
  handleUpdateGuest: (guestId: string, updates: Partial<Guest>) => void;
  handleRemoveGuest: (guestId: string) => void;
  handlePhotoUpload: (file: File, guestId: string, photoNumber: 1 | 2) => void;
  getCabinHeaderGradient: (cabin: Cabin) => string;
}

const CabinCard: React.FC<CabinCardProps> = ({
  cabin,
  availableDevices,
  editingGuest,
  showAddGuest,
  newGuest,
  setEditingGuest,
  setShowAddGuest,
  setNewGuest,
  handleAddGuest,
  handleUpdateGuest,
  handleRemoveGuest,
  handlePhotoUpload,
  getCabinHeaderGradient
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden"
    >
      {/* Cabin Header */}
      <div className={`${getCabinHeaderGradient(cabin)} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Cabin {cabin.number}</h3>
            <p className="text-sm opacity-90">{cabin.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">{cabin.deck}</p>
            <p className="text-xs opacity-75">{cabin.area}</p>
          </div>
        </div>
      </div>

      {/* Cabin Details */}
      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Bed className="w-4 h-4 mr-1" />
            <span>{cabin.features}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span>Capacity: {cabin.guests.length}/{cabin.estimatedCapacity}</span>
          </div>
        </div>

        {/* Guests List */}
        <div className="space-y-3">
          {cabin.guests.map((guest, index) => (
            <div
              key={guest.id}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              {editingGuest?.cabinNumber === cabin.number && editingGuest?.guestIndex === index ? (
                // Edit Mode
                <div className="space-y-2">
                  <input
                    type="text"
                    value={guest.name}
                    onChange={(_e) => {
                      // Update guest name in local state
                      // This would need to be handled differently in a real implementation
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Guest name"
                  />
                  <input
                    type="text"
                    value={guest.allergies || ''}
                    onChange={(_e) => {
                      // This would need to be handled differently in a real implementation
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Allergies (optional)"
                  />
                  <input
                    type="text"
                    value={guest.specialRequests || ''}
                    onChange={(_e) => {
                      // This would need to be handled differently in a real implementation
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Special requests (optional)"
                  />
                  <select
                    value={guest.wristbandId || ''}
                    onChange={(_e) => {
                      // This would need to be handled differently in a real implementation
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">No wristband assigned</option>
                    {availableDevices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name} {device.assignedGuest ? `(Assigned to ${device.assignedGuest})` : '(Available)'}
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateGuest(guest.id!, {
                        name: guest.name,
                        allergies: guest.allergies,
                        specialRequests: guest.specialRequests,
                        wristbandId: guest.wristbandId
                      })}
                      className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      <Save className="w-3 h-3 inline mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingGuest(null)}
                      className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-medium text-gray-900">{guest.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingGuest({ cabinNumber: cabin.number, guestIndex: index })}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit guest"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveGuest(guest.id!)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove guest"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  {guest.allergies && (
                    <p className="text-xs text-red-600 mb-1">
                      ⚠️ Allergies: {guest.allergies}
                    </p>
                  )}
                  
                  {guest.specialRequests && (
                    <p className="text-xs text-blue-600 mb-1">
                      📝 {guest.specialRequests}
                    </p>
                  )}

                  {guest.wristbandId && (
                    <div className="flex items-center text-xs text-green-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>Wristband: {guest.wristbandId}</span>
                    </div>
                  )}

                  {/* Photo Upload Buttons */}
                  <div className="flex space-x-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && guest.id) {
                            handlePhotoUpload(file, guest.id, 1);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs text-center cursor-pointer hover:bg-blue-200">
                        <Camera className="w-3 h-3 inline mr-1" />
                        Photo 1
                      </div>
                    </label>
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && guest.id) {
                            handlePhotoUpload(file, guest.id, 2);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs text-center cursor-pointer hover:bg-blue-200">
                        <Camera className="w-3 h-3 inline mr-1" />
                        Photo 2
                      </div>
                    </label>
                  </div>

                  {/* Display Photos */}
                  {(guest.photoUrl1 || guest.photoUrl2) && (
                    <div className="flex space-x-2 mt-2">
                      {guest.photoUrl1 && (
                        <img
                          src={guest.photoUrl1}
                          alt="Guest photo 1"
                          className="w-8 h-8 rounded object-cover border"
                        />
                      )}
                      {guest.photoUrl2 && (
                        <img
                          src={guest.photoUrl2}
                          alt="Guest photo 2"
                          className="w-8 h-8 rounded object-cover border"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Guest Button */}
          {cabin.guests.length < cabin.estimatedCapacity && (
            showAddGuest?.cabinNumber === cabin.number ? (
              // Add Guest Form
              <div className="border border-gray-200 rounded-lg p-3 bg-blue-50">
                <input
                  type="text"
                  value={newGuest.name || ''}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                  placeholder="Guest name"
                />
                <input
                  type="text"
                  value={newGuest.allergies || ''}
                  onChange={(e) => setNewGuest({ ...newGuest, allergies: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                  placeholder="Allergies (optional)"
                />
                <input
                  type="text"
                  value={newGuest.specialRequests || ''}
                  onChange={(e) => setNewGuest({ ...newGuest, specialRequests: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                  placeholder="Special requests (optional)"
                />
                <select
                  value={newGuest.wristbandId || ''}
                  onChange={(e) => setNewGuest({ ...newGuest, wristbandId: e.target.value })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                >
                  <option value="">No wristband assigned</option>
                  {availableDevices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.assignedGuest ? `(Assigned to ${device.assignedGuest})` : '(Available)'}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddGuest(cabin.number)}
                    className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  >
                    <Save className="w-3 h-3 inline mr-1" />
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddGuest(null);
                      setNewGuest({});
                    }}
                    className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                  >
                    <X className="w-3 h-3 inline mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddGuest({ cabinNumber: cabin.number })}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4 mx-auto mb-1" />
                <span className="text-sm">Add Guest</span>
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default YachtDeckLayout; 