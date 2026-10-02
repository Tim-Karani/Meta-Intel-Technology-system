import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Camera, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  Send, 
  DollarSign, 
  ShoppingBag, 
  RotateCw,
  RefreshCw,
  Radio,
  Sliders,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { GeoService } from '../../services/geoService';
import { 
  User, 
  Assignment, 
  FieldVisit, 
  FormTemplate, 
  Product, 
  VisitResponseAnswer, 
  OSARecord, 
  SalesRecord 
} from '../../types';

interface MobileSimProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDeviceSimulator: React.FC<MobileSimProps> = ({ isOpen, onClose }) => {
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Mobile Network Simulation State
  const [isAirplaneMode, setIsAirplaneMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<FieldVisit[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');

  // Mobile App Navigation Screen State
  const [currentScreen, setCurrentScreen] = useState<'home' | 'visit_flow' | 'sync_center' | 'report_issue'>('home');
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  // Agent Shift State
  const [isShiftClockedIn, setIsShiftClockedIn] = useState(true);

  // New Issue Form State on Mobile
  const [issueCategory, setIssueCategory] = useState<any>('stock_out');
  const [issuePriority, setIssuePriority] = useState<any>('high');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');

  // Visit Execution Workflow State
  const [simulatedDistanceMeters, setSimulatedDistanceMeters] = useState(25);
  const [isSimulatedMockGps, setIsSimulatedMockGps] = useState(false);
  const [visitStep, setVisitStep] = useState<number>(1); // 1: CheckIn, 2: Form, 3: Photo, 4: Merch/Sales, 5: Review
  
  // Visit Form Payload
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState<string>('https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&auto=format&fit=crop');
  const [photoCaption, setPhotoCaption] = useState('Front counter branding and chilled Guinness setup');
  const [salesQty, setSalesQty] = useState<number>(12);
  const [salesMpesa, setSalesMpesa] = useState<string>('QKB7219LPS');
  const [osaFacings, setOsaFacings] = useState<number>(16);

  const loadData = () => {
    const allUsers = storageService.getUsers().filter(u => u.role === 'field_agent');
    setAgents(allUsers);
    if (!selectedAgent && allUsers.length > 0) {
      setSelectedAgent(allUsers[0]);
    }
    setAssignments(storageService.getAssignments());
    setForms(storageService.getForms());
    setProducts(storageService.getProducts());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const agentAssignments = selectedAgent 
    ? assignments.filter(a => a.agentId === selectedAgent.id)
    : [];

  const handleStartVisit = (assignment: Assignment) => {
    setActiveAssignment(assignment);
    setCurrentScreen('visit_flow');
    setVisitStep(1);
    setAnswers({});
  };

  const handleSubmitVisit = () => {
    if (!activeAssignment || !selectedAgent) return;

    // Evaluate anti-fraud telemetry
    const targetLat = activeAssignment.latitude;
    const targetLon = activeAssignment.longitude;
    // Compute agent coordinates based on simulated distance offset
    const offsetDegrees = simulatedDistanceMeters / 111000;
    const agentLat = targetLat + offsetDegrees;
    const agentLon = targetLon;

    const telemetry = GeoService.evaluateCheckIn(
      agentLat,
      agentLon,
      targetLat,
      targetLon,
      activeAssignment.geofenceRadiusMeters,
      12.0, // Accuracy 12m
      isSimulatedMockGps
    );

    // Form responses
    const formResponses: VisitResponseAnswer[] = Object.keys(answers).map(qId => ({
      questionId: qId,
      questionText: 'Field Questionnaire Item',
      questionType: 'yes_no',
      answer: answers[qId]
    }));

    // New Visit Payload
    const newVisit: FieldVisit = {
      id: 'vst_' + Date.now().toString(36),
      clientUuid: 'uuid_mob_' + Math.random().toString(36).slice(2, 10),
      assignmentId: activeAssignment.id,
      campaignId: activeAssignment.campaignId,
      campaignName: activeAssignment.campaignName,
      activityId: activeAssignment.activityId,
      activityName: activeAssignment.activityName,
      locationId: activeAssignment.locationId,
      locationName: activeAssignment.locationName,
      locationCounty: 'Nairobi',
      locationLat: targetLat,
      locationLng: targetLon,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      visitDate: new Date().toISOString().slice(0, 10),
      checkInTime: new Date().toISOString(),
      checkInLat: agentLat,
      checkInLng: agentLon,
      checkInAccuracyMeters: 12.0,
      distanceFromLocationMeters: telemetry.distanceMeters,
      geofenceStatus: telemetry.geofenceStatus,
      fraudRiskScore: telemetry.fraudRiskScore,
      fraudFlags: telemetry.fraudFlags,
      status: telemetry.fraudRiskScore >= 50 ? 'under_review' : 'submitted',
      formResponses,
      osaRecords: [
        {
          productId: 'prod_guinness_500',
          productName: 'Guinness Foreign Extra 500ml',
          sku: 'EABL-GIN-500RGB',
          isAvailable: true,
          facingsCount: osaFacings,
          competitorFacingsCount: 10,
          posmPresent: true
        }
      ],
      salesRecords: [
        {
          id: 'sl_' + Date.now().toString(36),
          productId: 'prod_guinness_500',
          productName: 'Guinness Foreign Extra 500ml',
          quantity: salesQty,
          unitPriceKes: 250,
          totalPriceKes: salesQty * 250,
          paymentMethod: 'mpesa',
          mpesaReference: salesMpesa
        }
      ],
      evidencePhotos: [
        {
          id: 'ev_' + Date.now().toString(36),
          visitId: 'vst_' + Date.now().toString(36),
          photoUrl: evidencePhotoUrl,
          caption: photoCaption,
          capturedAt: new Date().toISOString(),
          latitude: agentLat,
          longitude: agentLon,
          tag: 'posm_display'
        }
      ],
      notes: 'Completed in field via Meta Intel Android mobile app.',
      isSynced: !isAirplaneMode
    };

    if (isAirplaneMode) {
      // Save locally to simulated SQLite queue
      const updatedQueue = [...offlineQueue, newVisit];
      setOfflineQueue(updatedQueue);
      setSyncStatus('pending');
      alert('Offline Airplane Mode active: Visit securely queued in local SQLite database! Will sync automatically when connectivity returns.');
      setCurrentScreen('home');
      setActiveAssignment(null);
    } else {
      // Online: Direct push to server
      storageService.submitVisit(newVisit);
      alert('Visit successfully verified and uploaded to server! Supervisor dashboard now updated.');
      setCurrentScreen('home');
      setActiveAssignment(null);
    }
  };

  const handleToggleShift = () => {
    if (!selectedAgent) return;
    if (isShiftClockedIn) {
      setIsShiftClockedIn(false);
      alert('Shift Clock-Out Recorded: Daily summary and GPS stored.');
    } else {
      setIsShiftClockedIn(true);
      storageService.recordClockIn({
        id: 'att_' + Date.now().toString(36),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        campaignId: 'cmp_eabl_01',
        campaignName: 'Guinness Matchday Activation',
        date: new Date().toISOString().slice(0, 10),
        clockInTime: new Date().toISOString(),
        clockInLat: -1.2655,
        clockInLng: 36.8040,
        clockInAccuracy: 8.5,
        locationName: 'Assigned Target Territory',
        distanceFromAssignedMeters: simulatedDistanceMeters,
        status: simulatedDistanceMeters <= 100 ? 'present' : 'late',
        isGeofenceCompliant: simulatedDistanceMeters <= 100
      });
      alert(`Shift Clock-In Recorded! Distance: ${simulatedDistanceMeters}m (${simulatedDistanceMeters <= 100 ? 'In-Geofence' : 'Warning'}). Web attendance roster updated.`);
    }
  };

  const handleMobileSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle || !selectedAgent) return;

    storageService.addIssue({
      id: 'iss_' + Date.now().toString(36),
      campaignId: 'cmp_eabl_01',
      campaignName: 'Guinness Matchday On-Premise Activation',
      locationId: 'loc_kizito_lounge',
      locationName: 'Kizito Lounge Westlands',
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      category: issueCategory,
      priority: issuePriority,
      status: 'open',
      title: issueTitle,
      description: issueDesc || 'Reported on-ground from field mobile APK.',
      reportedAt: new Date().toISOString()
    });

    alert('Field Incident Logged! Ticket is now live on the Agency Operations Issue Kanban board.');
    setIssueTitle('');
    setIssueDesc('');
    setCurrentScreen('home');
  };

  const handleManualSync = () => {
    if (isAirplaneMode) {
      alert('Cannot sync: Airplane mode is ON. Disable airplane mode first!');
      return;
    }

    if (offlineQueue.length === 0) {
      alert('Local SQLite sync queue is empty. All visits are up to date.');
      return;
    }

    setSyncStatus('syncing');
    setTimeout(() => {
      // Ingest all queued visits into server database
      offlineQueue.forEach(v => {
        storageService.submitVisit({ ...v, isSynced: true });
      });
      setOfflineQueue([]);
      setSyncStatus('synced');
      alert('Sync Complete: All queued offline visits streamed to Laravel backend and stored in PostgreSQL!');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Container with Android Phone Frame + Side Controls */}
      <div className="flex flex-col md:flex-row items-center gap-6 max-h-[95vh]">
        {/* Left Side: Real-Time Mobile Simulation Controls & Telemetry Fuzzers */}
        <div className="w-80 bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4 text-xs shadow-2xl hidden lg:block">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-blue-400 flex items-center space-x-2">
              <Sliders className="w-4 h-4" />
              <span>Mobile Hardware Test Controls</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Test how the field app responds to offline network dropouts and GPS spoofing attempts.
            </p>
          </div>

          {/* Field Agent Profile Switcher */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Active Mobile Field Agent</label>
            <select
              value={selectedAgent?.id || ''}
              onChange={(e) => {
                const a = agents.find(u => u.id === e.target.value);
                if (a) setSelectedAgent(a);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.agentSubtype?.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Airplane Mode Toggle */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                {isAirplaneMode ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                <span>Simulate Airplane Mode</span>
              </span>
              <input
                type="checkbox"
                checked={isAirplaneMode}
                onChange={(e) => {
                  const val = e.target.checked;
                  setIsAirplaneMode(val);
                  if (!val && offlineQueue.length > 0) {
                    handleManualSync();
                  }
                }}
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {isAirplaneMode ? 'Network disconnected. Data will be saved in offline SQLite queue.' : 'Connected to 4G Safaricom network.'}
            </p>
          </div>

          {/* GPS Proximity Slider */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">GPS Distance from Venue</span>
              <span className="font-mono text-blue-400 font-black">{simulatedDistanceMeters}m</span>
            </div>
            <input
              type="range"
              min="5"
              max="350"
              step="5"
              value={simulatedDistanceMeters}
              onChange={(e) => setSimulatedDistanceMeters(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              {simulatedDistanceMeters <= 100 ? 'Inside permitted geofence (Green)' : 'Geofence warning/breach (Amber/Red)'}
            </p>
          </div>

          {/* Mock Location Provider Toggle */}
          <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Simulate GPS Mock App</span>
              </span>
              <input
                type="checkbox"
                checked={isSimulatedMockGps}
                onChange={(e) => setIsSimulatedMockGps(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Simulates Android FakeGPS app. Server anti-fraud will flag score +50!
            </p>
          </div>
        </div>

        {/* Center: The Realistic Android Phone Mockup Frame */}
        <div className="w-[360px] h-[720px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-8 ring-slate-950/40">
          {/* Speaker Earpiece & Punch-Hole Camera */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 mr-2"></div>
            <div className="w-8 h-1 rounded-full bg-slate-800"></div>
          </div>

          {/* Mobile Screen Area */}
          <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col relative select-none">
            {/* Status Bar */}
            <div className="h-7 bg-blue-700 text-white px-5 pt-1.5 flex items-center justify-between text-[10px] font-bold z-30">
              <span>09:41</span>
              <div className="flex items-center space-x-1.5">
                {isAirplaneMode ? <WifiOff className="w-3 h-3 text-rose-300" /> : <Wifi className="w-3 h-3" />}
                <span className="font-mono">4G</span>
                <span>94%</span>
              </div>
            </div>

            {/* Mobile App Navigation Bar */}
            <div className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2">
                {currentScreen !== 'home' ? (
                  <button onClick={() => setCurrentScreen('home')} className="p-1">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                    MIT
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold leading-tight">
                    {currentScreen === 'home' ? 'Field Operations' : 
                     currentScreen === 'visit_flow' ? 'Visit Execution' : 'Sync Center'}
                  </h4>
                  <p className="text-[10px] text-blue-200">
                    {selectedAgent ? selectedAgent.name : 'Field Agent'}
                  </p>
                </div>
              </div>

              {/* Sync Status Badge in Mobile App Bar */}
              <button
                onClick={() => setCurrentScreen('sync_center')}
                className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold"
              >
                {offlineQueue.length > 0 ? (
                  <span className="bg-amber-400 text-slate-900 px-1 rounded-full text-[9px] font-black">
                    {offlineQueue.length}
                  </span>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span>{offlineQueue.length > 0 ? 'Pending' : 'Synced'}</span>
              </button>
            </div>

            {/* Mobile Body Content Router */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* SCREEN 1: Mobile Dashboard & Assignments */}
              {currentScreen === 'home' && (
                <div className="space-y-4">
                  {/* Agent Shift Card */}
                  <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-4 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                        Today's Shift Roster
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isShiftClockedIn ? 'bg-emerald-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {isShiftClockedIn ? 'Clocked In' : 'Clocked Out'}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold">{selectedAgent?.name}</h3>
                    <p className="text-[11px] text-blue-100">
                      Nairobi West Squad &bull; 08:00 - 17:00
                    </p>
                    <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                      <button
                        onClick={handleToggleShift}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          isShiftClockedIn
                            ? 'bg-rose-500 hover:bg-rose-600 text-white'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        {isShiftClockedIn ? 'Punch Clock-Out' : 'Punch Clock-In (GPS)'}
                      </button>

                      <button
                        onClick={() => setCurrentScreen('report_issue')}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-300" />
                        <span>Report Blocker</span>
                      </button>
                    </div>
                  </div>

                  {/* Assignments Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800">Assigned Venues Today ({agentAssignments.length})</h4>
                      <span className="text-[10px] text-slate-400 font-mono">2026-10-02</span>
                    </div>

                    <div className="space-y-2.5">
                      {agentAssignments.map((asg) => (
                        <div
                          key={asg.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-blue-600 font-mono">
                                Geofence: {asg.geofenceRadiusMeters}m
                              </span>
                              <h5 className="font-bold text-slate-900 mt-0.5">{asg.locationName}</h5>
                              <p className="text-[10px] text-slate-500">{asg.locationAddress}</p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                              {asg.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400">{asg.activityName}</span>
                            <button
                              onClick={() => handleStartVisit(asg)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] flex items-center space-x-1"
                            >
                              <span>Start Visit</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 2: Visit Execution Stepper Flow */}
              {currentScreen === 'visit_flow' && activeAssignment && (
                <div className="space-y-4">
                  {/* Venue Brief */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Target Location</span>
                    <h4 className="font-black text-slate-900 text-xs mt-0.5">{activeAssignment.locationName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Target Geofence: {activeAssignment.geofenceRadiusMeters} meters
                    </span>
                  </div>

                  {/* Step 1: GPS Proximity & Check-In */}
                  {visitStep === 1 && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700 font-bold">
                        <MapPin className="w-4 h-4" />
                        <span>Step 1: Venue Proximity Verification</span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Calculated Distance:</span>
                          <span className={`font-bold ${simulatedDistanceMeters <= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {simulatedDistanceMeters} meters
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Geofence Status:</span>
                          <span className="font-bold text-slate-800">
                            {simulatedDistanceMeters <= 100 ? 'INSIDE GEOFENCE' : 'WARNING / BREACH'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mock GPS Detected:</span>
                          <span className="font-bold text-slate-800">
                            {isSimulatedMockGps ? 'YES (FLAGGED)' : 'NO (CLEAN)'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setVisitStep(2)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                      >
                        Verify GPS &amp; Proceed &rarr;
                      </button>
                    </div>
                  )}

                  {/* Step 2: Form Questionnaire */}
                  {visitStep === 2 && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Step 2: Field Questionnaire</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="font-bold text-slate-800 block mb-1">
                            1. Is counter POSM branding properly deployed?
                          </label>
                          <div className="flex space-x-2">
                            {['true', 'false'].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setAnswers({ ...answers, q1: val })}
                                className={`flex-1 py-1.5 rounded-lg font-bold border text-xs ${
                                  answers['q1'] === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {val === 'true' ? 'YES' : 'NO'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-800 block mb-1">
                            2. Are chilled beverages in venue fridge &lt; 4°C?
                          </label>
                          <div className="flex space-x-2">
                            {['true', 'false'].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setAnswers({ ...answers, q2: val })}
                                className={`flex-1 py-1.5 rounded-lg font-bold border text-xs ${
                                  answers['q2'] === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {val === 'true' ? 'YES' : 'NO'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setVisitStep(3)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                      >
                        Next: Capture Photo Evidence &rarr;
                      </button>
                    </div>
                  )}

                  {/* Step 3: Photo Evidence Capture */}
                  {visitStep === 3 && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700 font-bold">
                        <Camera className="w-4 h-4" />
                        <span>Step 3: Camera Evidence</span>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-slate-200">
                        <img src={evidencePhotoUrl} alt="Capture" className="w-full h-36 object-cover" />
                        <div className="p-2 bg-slate-50 text-[10px] text-slate-500 font-mono">
                          Auto-stamped: 2026-10-02 09:41 &bull; Lat: -1.2655, Lng: 36.8040
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Photo Caption</label>
                        <input
                          type="text"
                          value={photoCaption}
                          onChange={(e) => setPhotoCaption(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <button
                        onClick={() => setVisitStep(4)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                      >
                        Next: Record Merchandising &amp; Sales &rarr;
                      </button>
                    </div>
                  )}

                  {/* Step 4: Sales & OSA */}
                  {visitStep === 4 && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center space-x-2 text-blue-700 font-bold">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Step 4: Merchandising &amp; Sales</span>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Front Facing Count (OSA)</label>
                        <input
                          type="number"
                          value={osaFacings}
                          onChange={(e) => setOsaFacings(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Units Sold</label>
                          <input
                            type="number"
                            value={salesQty}
                            onChange={(e) => setSalesQty(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Total (KES)</label>
                          <input
                            type="text"
                            disabled
                            value={`KES ${(salesQty * 250).toLocaleString()}`}
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-slate-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">M-Pesa Till Reference</label>
                        <input
                          type="text"
                          value={salesMpesa}
                          onChange={(e) => setSalesMpesa(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <button
                        onClick={handleSubmitVisit}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-sm"
                      >
                        Submit Completed Visit &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN 3: Mobile Sync Center */}
              {currentScreen === 'sync_center' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800">Local SQLite Synchronization Queue</h4>
                    <p className="text-[11px] text-slate-500">
                      Transactions captured while offline are stored here with cryptographic client UUIDs.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {offlineQueue.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        <span className="font-bold">Queue is Clean</span>
                        <p className="text-[10px] mt-0.5">All offline mutations have been synced with server.</p>
                      </div>
                    ) : (
                      offlineQueue.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-mono font-bold text-amber-600">PENDING UPSTREAM SYNC</span>
                          <h5 className="font-bold text-slate-900">{item.locationName}</h5>
                          <p className="text-[10px] text-slate-500">UUID: {item.clientUuid}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={handleManualSync}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Synchronize Queue Now</span>
                  </button>
                </div>
              )}

              {/* SCREEN 4: Mobile Field Blocker / Issue Reporter */}
              {currentScreen === 'report_issue' && (
                <div className="space-y-4">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5 text-rose-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Report On-Ground Blocker</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Instantly alerts your supervisor and campaign manager.
                    </p>
                  </div>

                  <form onSubmit={handleMobileSubmitIssue} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                      <select
                        value={issueCategory}
                        onChange={(e) => setIssueCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="stock_out">Out of Stock on Premises</option>
                        <option value="posm_damaged">Damaged or Missing POSM</option>
                        <option value="store_closed">Outlet Closed / Access Denied</option>
                        <option value="competitor_activity">Aggressive Competitor Promo</option>
                        <option value="pricing_dispute">Retailer Selling Above Price Cap</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Severity Priority</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['medium', 'high', 'urgent'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setIssuePriority(p)}
                            className={`py-1 rounded-lg font-bold text-[10px] uppercase border ${
                              issuePriority === p
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Brief Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Fridge cooling system failed"
                        value={issueTitle}
                        onChange={(e) => setIssueTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Detailed Explanation</label>
                      <textarea
                        rows={3}
                        placeholder="Describe the blocker and who you spoke with..."
                        value={issueDesc}
                        onChange={(e) => setIssueDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Issue to Command Centre</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="h-5 bg-slate-900 flex items-center justify-center">
              <div className="w-24 h-1 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Close Button on top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 bg-slate-800 rounded-full shadow-lg"
          title="Close Mobile Simulator"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
