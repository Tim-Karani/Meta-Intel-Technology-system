import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Search, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  X,
  ShieldCheck,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import L from 'leaflet';
import { storageService } from '../../services/storage';
import { FieldVisit } from '../../types';

export const VisitAuditQueue: React.FC = () => {
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<FieldVisit | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectionModalVisit, setRejectionModalVisit] = useState<FieldVisit | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Map ref for modal inspection
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);

  const loadData = () => {
    setVisits(storageService.getVisits());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleApprove = (visitId: string) => {
    storageService.verifyVisit(visitId, 'approved');
    if (selectedVisit && selectedVisit.id === visitId) {
      setSelectedVisit(null);
    }
  };

  const handleReject = () => {
    if (!rejectionModalVisit || !rejectionReason) return;
    storageService.verifyVisit(rejectionModalVisit.id, 'rejected', rejectionReason);
    setRejectionModalVisit(null);
    setRejectionReason('');
    setSelectedVisit(null);
  };

  // Setup modal leaflet inspection map
  useEffect(() => {
    if (!selectedVisit || !modalMapContainerRef.current) return;

    if (modalMapInstanceRef.current) {
      modalMapInstanceRef.current.remove();
      modalMapInstanceRef.current = null;
    }

    const map = L.map(modalMapContainerRef.current).setView(
      [selectedVisit.checkInLat, selectedVisit.checkInLng], 
      15
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Target venue marker (Blue)
    L.circleMarker([selectedVisit.locationLat, selectedVisit.locationLng], {
      radius: 8,
      fillColor: '#1d4ed8',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    }).addTo(map).bindPopup(`<strong>Target: ${selectedVisit.locationName}</strong>`);

    // Actual check-in marker (Green or Red)
    const isBreach = selectedVisit.geofenceStatus !== 'inside_geofence';
    L.circleMarker([selectedVisit.checkInLat, selectedVisit.checkInLng], {
      radius: 8,
      fillColor: isBreach ? '#e11d48' : '#10b981',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    }).addTo(map).bindPopup(`<strong>Check-In GPS</strong><br/>Distance: ${Math.round(selectedVisit.distanceFromLocationMeters)}m`);

    // Draw connecting line between target and check-in
    L.polyline([
      [selectedVisit.locationLat, selectedVisit.locationLng],
      [selectedVisit.checkInLat, selectedVisit.checkInLng]
    ], {
      color: isBreach ? '#e11d48' : '#2563eb',
      weight: 2,
      dashArray: '4, 4'
    }).addTo(map);

    modalMapInstanceRef.current = map;
  }, [selectedVisit]);

  const filteredVisits = visits.filter(v => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span>Visit Quality Assurance &amp; Supervisor Audit Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming field visit submissions, scrutinize anti-fraud risk telemetry, inspect photo evidence, and approve/reject.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {['all', 'under_review', 'submitted', 'approved', 'rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Visit ID / Date</th>
                <th className="px-4 py-3">Field Agent</th>
                <th className="px-4 py-3">Retail Location</th>
                <th className="px-4 py-3">Campaign Wave</th>
                <th className="px-4 py-3">Fraud Risk Score</th>
                <th className="px-4 py-3">Evidence</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block font-mono">#{v.id.slice(4)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{v.visitDate}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{v.agentName}</span>
                    <span className="text-[10px] text-slate-400">Agent</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800 block">{v.locationName}</span>
                    <span className="text-[10px] text-slate-400">{v.locationCounty} County</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-medium text-slate-800 block">{v.campaignName}</span>
                    <span className="text-[10px] text-slate-400">{v.activityName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5">
                      <span className={`font-black font-mono px-2 py-0.5 rounded text-[11px] ${
                        v.fraudRiskScore === 0 ? 'bg-emerald-100 text-emerald-800' :
                        v.fraudRiskScore < 30 ? 'bg-blue-100 text-blue-800' :
                        v.fraudRiskScore < 60 ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {v.fraudRiskScore} / 100
                      </span>
                      {v.fraudFlags.length > 0 && (
                        <span title={v.fraudFlags.join(', ')}>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                      <Camera className="w-3 h-3 text-slate-500" />
                      <span>{v.evidencePhotos.length} Photos</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      v.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                      v.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedVisit(v)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Visit Inspection Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Visit Inspection Dossier #{selectedVisit.id.slice(4)}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Venue: {selectedVisit.locationName} &bull; Agent: {selectedVisit.agentName}
                </p>
              </div>

              <button onClick={() => setSelectedVisit(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Telemetry & Fraud Flags Header */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fraud Risk Score</span>
                  <span className={`text-base font-black font-mono ${
                    selectedVisit.fraudRiskScore === 0 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {selectedVisit.fraudRiskScore} / 100
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Distance to Venue</span>
                  <span className="text-base font-black font-mono text-slate-800">
                    {Math.round(selectedVisit.distanceFromLocationMeters)} meters
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">GPS Accuracy</span>
                  <span className="text-base font-black font-mono text-slate-800">
                    &plusmn;{selectedVisit.checkInAccuracyMeters}m
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Check-In Time</span>
                  <span className="text-base font-black font-mono text-slate-800">
                    {selectedVisit.checkInTime.slice(11, 19)}
                  </span>
                </div>
              </div>

              {/* Fraud Flags Alert */}
              {selectedVisit.fraudFlags.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Triggered Telemetry Flags</span>
                  </span>
                  <ul className="list-disc pl-5 text-amber-800 space-y-0.5">
                    {selectedVisit.fraudFlags.map((flag, idx) => (
                      <li key={idx} className="font-mono text-[11px]">{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* GIS Leaflet Map Comparison */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>GPS Check-In vs Assigned Target Geofence</span>
                </h4>
                <div 
                  ref={modalMapContainerRef} 
                  className="w-full h-52 rounded-xl border border-slate-200 overflow-hidden"
                ></div>
              </div>

              {/* Submitted Photos Gallery */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Submitted Photographic Proof ({selectedVisit.evidencePhotos.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedVisit.evidencePhotos.map(photo => (
                    <div key={photo.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <img src={photo.photoUrl} alt="Field Evidence" className="w-full h-40 object-cover" />
                      <div className="p-2.5">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded capitalize">
                          {photo.tag.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-slate-700 mt-1 font-medium">{photo.caption}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">
                          Timestamp: {photo.capturedAt}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Responses Submitted */}
              {selectedVisit.formResponses.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Questionnaire Responses</h4>
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                    {selectedVisit.formResponses.map((r, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-none last:pb-0">
                        <span className="text-slate-600">{r.questionText}</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {String(r.answer)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Notes */}
              {selectedVisit.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">Field Agent Notes:</span>
                  <p className="text-slate-600 leading-relaxed">{selectedVisit.notes}</p>
                </div>
              )}

              {/* Decision Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectionModalVisit(selectedVisit)}
                  className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Visit Submission</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedVisit.id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Sign-Off Visit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Sub-Modal */}
      {rejectionModalVisit && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-rose-900 flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Reject Field Visit #{rejectionModalVisit.id.slice(4)}</span>
            </h3>

            <p className="text-slate-600">
              Please enter the operational reason for rejecting this visit. The agent will be notified on mobile to redo or appeal.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Geofence violation: Agent check-in was 260m away without prior approval, or shelf photo was blurry."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            ></textarea>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRejectionModalVisit(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
