import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Search, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  X,
  Send,
  AlertTriangle
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { Assignment, Campaign, Location, User as UserType } from '../../types';

export const DispatchScheduler: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedDate, setSelectedDate] = useState('2026-10-02');
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Batch Form State
  const [batchCampaignId, setBatchCampaignId] = useState('');
  const [batchLocationId, setBatchLocationId] = useState('');
  const [batchAgentId, setBatchAgentId] = useState('');
  const [batchDate, setBatchDate] = useState('2026-10-03');
  const [batchNotes, setBatchNotes] = useState('');

  const loadData = () => {
    setAssignments(storageService.getAssignments());
    setCampaigns(storageService.getCampaigns());
    setLocations(storageService.getLocations());
    setUsers(storageService.getUsers().filter(u => u.role === 'field_agent'));
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find(c => c.id === batchCampaignId);
    const location = locations.find(l => l.id === batchLocationId);
    const agent = users.find(u => u.id === batchAgentId);

    if (!campaign || !location || !agent) return;

    const activity = campaign.activities[0] || {
      id: 'act_default',
      name: 'Retail Merchandising Execution'
    };

    const newAssignment: Assignment = {
      id: 'asg_' + Date.now().toString(36),
      campaignId: campaign.id,
      campaignName: campaign.name,
      activityId: activity.id,
      activityName: activity.name,
      locationId: location.id,
      locationName: location.name,
      locationCategory: location.category,
      locationAddress: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      geofenceRadiusMeters: location.geofenceRadiusMeters,
      agentId: agent.id,
      agentName: agent.name,
      scheduledDate: batchDate,
      status: 'pending',
      notes: batchNotes || 'Standard shift execution.',
      formId: 'frm_eabl_matchday'
    };

    storageService.addAssignment(newAssignment);
    setShowBatchModal(false);
    setBatchNotes('');
  };

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">In Progress</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending Sync</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            <span>Shift Scheduling &amp; Dispatch Matrix</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch date-bounded visit assignments to field agents with geofence rules and questionnaire briefs.
          </p>
        </div>

        <button
          onClick={() => setShowBatchModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
          <span>Dispatch Shift Assignment</span>
        </button>
      </div>

      {/* Date Filter & Summary Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Filter Shift Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-mono"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500">
            Total Shifts: <strong className="text-slate-900">{assignments.length}</strong>
          </span>
          <span className="text-emerald-600">
            Completed: <strong>{assignments.filter(a => a.status === 'completed').length}</strong>
          </span>
          <span className="text-amber-600">
            Pending: <strong>{assignments.filter(a => a.status === 'pending').length}</strong>
          </span>
        </div>
      </div>

      {/* Assignments Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Scheduled Date</th>
                <th className="px-4 py-3">Field Agent</th>
                <th className="px-4 py-3">Target Retail Venue</th>
                <th className="px-4 py-3">Campaign Wave</th>
                <th className="px-4 py-3">Geofence</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {asg.scheduledDate}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>{asg.agentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800 block">{asg.locationName}</span>
                    <span className="text-[10px] text-slate-400 block">{asg.locationAddress}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="font-medium text-slate-800 block">{asg.campaignName}</span>
                    <span className="text-[10px] text-slate-400">{asg.activityName}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {asg.geofenceRadiusMeters}m
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(asg.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Dispatch Assignment */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>Dispatch Shift Assignment</span>
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Campaign *</label>
                <select
                  required
                  value={batchCampaignId}
                  onChange={(e) => setBatchCampaignId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Campaign --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Venue *</label>
                  <select
                    required
                    value={batchLocationId}
                    onChange={(e) => setBatchLocationId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Choose Venue --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.county})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Field Agent *</label>
                  <select
                    required
                    value={batchAgentId}
                    onChange={(e) => setBatchAgentId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Choose Agent --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.employeeCode})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operational Instructions &amp; Brief</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Check for cold stock, ensure counter banners are visible, target 20 consumer engagements."
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Confirm &amp; Push to Agent Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
