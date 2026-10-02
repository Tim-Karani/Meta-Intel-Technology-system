import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ExternalLink,
  ShieldCheck,
  Calendar,
  Filter
} from 'lucide-react';
import L from 'leaflet';
import { storageService } from '../../services/storage';
import { Campaign, FieldVisit, Location, AttendanceRecord } from '../../types';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const ExecutiveDashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const activeUser = storageService.getActiveUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  
  // Filters
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<string>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const loadData = () => {
      setCampaigns(storageService.getCampaigns());
      setVisits(storageService.getVisits());
      setLocations(storageService.getLocations());
      setAttendance(storageService.getAttendance());
    };
    loadData();
    const unsubscribe = storageService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Filtered datasets
  const filteredVisits = visits.filter(v => {
    if (selectedCampaignId !== 'all' && v.campaignId !== selectedCampaignId) return false;
    if (selectedCounty !== 'all' && v.locationCounty !== selectedCounty) return false;
    return true;
  });

  const totalSalesKes = filteredVisits.reduce((acc, v) => {
    const visitSales = v.salesRecords.reduce((sAcc, s) => sAcc + s.totalPriceKes, 0);
    return acc + visitSales;
  }, 0);

  const approvedVisitsCount = filteredVisits.filter(v => v.status === 'approved').length;
  const pendingVisitsCount = filteredVisits.filter(v => v.status === 'submitted' || v.status === 'under_review').length;
  const flaggedVisitsCount = filteredVisits.filter(v => v.fraudRiskScore >= 25).length;

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([-1.286389, 36.817223], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layers other than tileLayer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Render location markers & geofence circles
    locations.forEach(loc => {
      // Circle for geofence radius
      L.circle([loc.latitude, loc.longitude], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        radius: loc.geofenceRadiusMeters,
        weight: 1.5
      }).addTo(map);

      // Marker for venue
      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 7,
        fillColor: '#1d4ed8',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: #1e293b; font-size: 13px;">${loc.name}</strong><br/>
          <span style="color: #64748b;">${loc.channelType} &bull; ${loc.county}</span><br/>
          <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: 600;">
            Geofence: ${loc.geofenceRadiusMeters}m
          </span>
        </div>
      `);
    });

    // Render active field visits on map
    filteredVisits.forEach(v => {
      const isBreach = v.geofenceStatus !== 'inside_geofence';
      const marker = L.circleMarker([v.checkInLat, v.checkInLng], {
        radius: 6,
        fillColor: isBreach ? '#e11d48' : '#10b981',
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <span style="font-weight: bold; color: ${isBreach ? '#be123c' : '#047857'}">
            Visit: ${v.locationName}
          </span><br/>
          Agent: ${v.agentName}<br/>
          Distance: ${Math.round(v.distanceFromLocationMeters)}m from target<br/>
          Fraud Score: <strong>${v.fraudRiskScore} / 100</strong><br/>
          Status: <span style="text-transform: uppercase; font-weight: 600;">${v.status}</span>
        </div>
      `);
    });

  }, [locations, filteredVisits]);

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner: Greeting & Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Agency Operations Command Centre
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring across Kenyan retail outlets, on-premise venues, and field teams.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Active Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Counties (Kenya)</option>
              <option value="Nairobi">Nairobi County</option>
              <option value="Kiambu">Kiambu County</option>
              <option value="Mombasa">Mombasa County</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visits & Execution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Visits</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{filteredVisits.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {approvedVisitsCount} verified
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (approvedVisitsCount / (filteredVisits.length || 1)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {pendingVisitsCount} awaiting supervisor sign-off
          </p>
        </div>

        {/* On-Shelf Availability (OSA) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OSA Availability</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">91.4%</span>
            <span className="text-xs font-semibold text-emerald-600">+2.1% target</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Average across Modern Trade &amp; Bars
          </p>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-rose-500 font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>1 Stock-out flagged at Ruiru</span>
          </div>
        </div>

        {/* Direct Field Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Sales Volume</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              KES {totalSalesKes.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Direct sales &amp; till bookings confirmed
          </p>
          <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-1">
            M-Pesa Verified
          </span>
        </div>

        {/* Anti-Fraud Telemetry */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Geofence Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {filteredVisits.length > 0
                ? Math.round(((filteredVisits.length - flaggedVisitsCount) / filteredVisits.length) * 100)
                : 100}%
            </span>
            <span className="text-xs font-bold text-emerald-600">Clean</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {flaggedVisitsCount} visit flagged for proximity review
          </p>
          <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
            <span>Hardware spoofing checks active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive GIS Map & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GIS Interactive Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Territory Geofence &amp; Execution Map (OpenStreetMap)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Blue rings = Configured retail geofences. Green dots = Clean check-ins. Red dots = Proximity warnings.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('locations')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>Manage Locations</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Leaflet Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-96 rounded-xl border border-slate-200 shadow-inner overflow-hidden"
          ></div>
        </div>

        {/* Right Col: Active Campaign Waves & Quick QA Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Active Campaign Waves</h2>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              View all
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {campaigns.map(c => (
              <div 
                key={c.id} 
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 transition-all cursor-pointer"
                onClick={() => onNavigateTab('campaigns')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                      {c.code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">{c.name}</h3>
                    <p className="text-[11px] text-slate-500">{c.clientName}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                    {c.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Progress: {c.completedVisits} / {c.targetVisits} visits</span>
                  <span className="font-bold text-slate-800">
                    {Math.round((c.completedVisits / c.targetVisits) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (c.completedVisits / c.targetVisits) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick QA Action Callout */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center space-x-2 text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">1 Visit Pending QA Audit</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              Visit #9803 at Clean Shelf Ruiru flagged for 260m geofence breach.
            </p>
            <button
              onClick={() => onNavigateTab('visits_qa')}
              className="mt-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-lg transition-colors"
            >
              Open Audit Inspector &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
