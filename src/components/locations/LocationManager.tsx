import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  Save, 
  X,
  Phone,
  User
} from 'lucide-react';
import L from 'leaflet';
import { storageService } from '../../services/storage';
import { Location, LocationCategory } from '../../types';
import { KENYA_COUNTIES } from '../../data/mockDatabase';

export const LocationManager: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // New location form state
  const [newLoc, setNewLoc] = useState({
    code: '',
    name: '',
    category: 'modern_trade' as LocationCategory,
    county: 'Nairobi',
    subCounty: 'Westlands',
    town: 'Westlands',
    address: '',
    latitude: -1.2655,
    longitude: 36.8040,
    geofenceRadiusMeters: 100,
    channelType: 'Tier 1 Supermarket',
    contactPerson: '',
    contactPhone: ''
  });

  const loadData = () => {
    const loaded = storageService.getLocations();
    setLocations(loaded);
    if (!selectedLocation && loaded.length > 0) {
      setSelectedLocation(loaded[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([-1.286389, 36.817223], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // Click to pick location
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (selectedLocation) {
          const updated = {
            ...selectedLocation,
            latitude: Number(e.latlng.lat.toFixed(6)),
            longitude: Number(e.latlng.lng.toFixed(6))
          };
          setSelectedLocation(updated);
          storageService.updateLocation(updated);
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    if (selectedLocation) {
      map.setView([selectedLocation.latitude, selectedLocation.longitude], 15);

      // Remove previous marker & circle
      if (markerRef.current) map.removeLayer(markerRef.current);
      if (circleRef.current) map.removeLayer(circleRef.current);

      // Add geofence circle
      circleRef.current = L.circle([selectedLocation.latitude, selectedLocation.longitude], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: selectedLocation.geofenceRadiusMeters,
        weight: 2
      }).addTo(map);

      // Add center marker
      markerRef.current = L.marker([selectedLocation.latitude, selectedLocation.longitude]).addTo(map);
      markerRef.current.bindPopup(`<strong>${selectedLocation.name}</strong><br/>Geofence: ${selectedLocation.geofenceRadiusMeters}m`).openPopup();
    }
  }, [selectedLocation]);

  const handleUpdateGeofenceRadius = (radius: number) => {
    if (!selectedLocation) return;
    const updated = { ...selectedLocation, geofenceRadiusMeters: radius };
    setSelectedLocation(updated);
    storageService.updateLocation(updated);
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name || !newLoc.code) return;

    const created: Location = {
      id: 'loc_' + Date.now().toString(36),
      code: newLoc.code.toUpperCase(),
      name: newLoc.name,
      category: newLoc.category,
      county: newLoc.county,
      subCounty: newLoc.subCounty,
      town: newLoc.town,
      address: newLoc.address,
      latitude: Number(newLoc.latitude),
      longitude: Number(newLoc.longitude),
      geofenceRadiusMeters: Number(newLoc.geofenceRadiusMeters),
      channelType: newLoc.channelType,
      contactPerson: newLoc.contactPerson,
      contactPhone: newLoc.contactPhone,
      isActive: true,
      averageComplianceScore: 90
    };

    storageService.addLocation(created);
    setSelectedLocation(created);
    setShowCreateModal(false);
  };

  const filteredLocations = locations.filter(loc => {
    if (selectedCounty !== 'all' && loc.county !== selectedCounty) return false;
    if (selectedCategory !== 'all' && loc.category !== selectedCategory) return false;
    if (searchTerm && !loc.name.toLowerCase().includes(searchTerm.toLowerCase()) && !loc.code.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>Master Location Registry &amp; GIS Geofences</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure retail outlets, hypermarkets, on-premise venues, and exact PostGIS-grade geofence boundary radii.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register Retail Venue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search venue name, code or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <select
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
        >
          <option value="all">All Kenyan Counties</option>
          {KENYA_COUNTIES.map(c => (
            <option key={c} value={c}>{c} County</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700"
        >
          <option value="all">All Retail Channels</option>
          <option value="modern_trade">Modern Trade (Supermarket/Mall)</option>
          <option value="on_premise">On-Premise (Bar / Lounge)</option>
          <option value="general_trade">General Trade (Kiosk / Wholesaler)</option>
          <option value="outdoor">Outdoor / Activation Site</option>
        </select>
      </div>

      {/* Main Grid: Location List & Geofence GIS Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Locations List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2.5 max-h-[640px] overflow-y-auto">
          {filteredLocations.map(loc => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                      {loc.code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{loc.name}</h3>
                    <p className="text-[11px] text-slate-500">{loc.channelType}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {loc.geofenceRadiusMeters}m
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{loc.town}, {loc.county}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Geofence Workbench & Interactive Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-4">
          {selectedLocation ? (
            <>
              {/* Geofence Parameters Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{selectedLocation.name}</h3>
                  <p className="text-xs text-slate-500">{selectedLocation.address} &bull; {selectedLocation.county} County</p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-slate-700">Geofence Radius:</span>
                  <span className="font-black text-blue-600 font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {selectedLocation.geofenceRadiusMeters} meters
                  </span>
                </div>
              </div>

              {/* Radius Adjustment Slider */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Adjust Allowed Check-In Geofence Radius</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Recommended: 80m for street retail, 150m for malls
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="400"
                  step="10"
                  value={selectedLocation.geofenceRadiusMeters}
                  onChange={(e) => handleUpdateGeofenceRadius(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Leaflet Map Interactive View */}
              <div className="relative">
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-80 rounded-xl border border-slate-200 overflow-hidden shadow-inner"
                ></div>
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-slate-600 border border-slate-200 font-medium z-20">
                  Tip: Click anywhere on the map to relocate target venue coordinates.
                </div>
              </div>

              {/* Coordinates & Store Contact */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Target Latitude / Longitude</span>
                  <span className="font-bold text-slate-800">
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Floor Contact</span>
                  <span className="font-bold text-slate-800 font-sans">
                    {selectedLocation.contactPerson || 'Unassigned'} ({selectedLocation.contactPhone || 'N/A'})
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Select a location to edit geofence radius.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register Retail Venue */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Register New Field Location</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="LOC-NBI-010"
                    value={newLoc.code}
                    onChange={(e) => setNewLoc({ ...newLoc, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Venue Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Chandarana Foodplus Lavington"
                    value={newLoc.name}
                    onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retail Category</label>
                  <select
                    value={newLoc.category}
                    onChange={(e) => setNewLoc({ ...newLoc, category: e.target.value as LocationCategory })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="modern_trade">Modern Trade (Supermarket/Mall)</option>
                    <option value="on_premise">On-Premise (Bar / Lounge)</option>
                    <option value="general_trade">General Trade (Kiosk / Duka)</option>
                    <option value="outdoor">Outdoor / Activation Site</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kenyan County</label>
                  <select
                    value={newLoc.county}
                    onChange={(e) => setNewLoc({ ...newLoc, county: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {KENYA_COUNTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sub-County / Town</label>
                  <input
                    type="text"
                    placeholder="Lavington / Dagoretti"
                    value={newLoc.town}
                    onChange={(e) => setNewLoc({ ...newLoc, town: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Geofence Radius (Meters)</label>
                  <input
                    type="number"
                    value={newLoc.geofenceRadiusMeters}
                    onChange={(e) => setNewLoc({ ...newLoc, geofenceRadiusMeters: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLoc.latitude}
                    onChange={(e) => setNewLoc({ ...newLoc, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLoc.longitude}
                    onChange={(e) => setNewLoc({ ...newLoc, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Address Description</label>
                <input
                  type="text"
                  placeholder="Lavington Mall, 1st Floor, James Gichuru Road"
                  value={newLoc.address}
                  onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Save Location &amp; Set Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
