import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle, 
  Play, 
  Pause, 
  CheckSquare, 
  Users, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  X,
  Target
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { Campaign, CampaignStatus, Client, ActivityType } from '../../types';

export const CampaignManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Campaign Form State
  const [newCampaign, setNewCampaign] = useState({
    code: '',
    name: '',
    clientId: '',
    type: 'Brand Activation & On-Premise Sales',
    description: '',
    startDate: '2026-10-05',
    endDate: '2026-12-31',
    budgetKes: 15000000,
    targetVisits: 350,
    activityName: 'Retail Merchandising & Facing Optimization',
    activityType: 'merchandising' as ActivityType
  });

  const loadData = () => {
    const loadedCampaigns = storageService.getCampaigns();
    setCampaigns(loadedCampaigns);
    const loadedClients = storageService.getClients();
    setClients(loadedClients);

    if (!selectedCampaign && loadedCampaigns.length > 0) {
      setSelectedCampaign(loadedCampaigns[0]);
    } else if (selectedCampaign) {
      const refreshed = loadedCampaigns.find(c => c.id === selectedCampaign.id);
      if (refreshed) setSelectedCampaign(refreshed);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleStatusChange = (newStatus: CampaignStatus) => {
    if (!selectedCampaign) return;
    storageService.updateCampaignStatus(selectedCampaign.id, newStatus);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name || !newCampaign.code || !newCampaign.clientId) return;

    const client = clients.find(c => c.id === newCampaign.clientId);
    const activeUser = storageService.getActiveUser();

    const created: Campaign = {
      id: 'cmp_' + Date.now().toString(36),
      code: newCampaign.code.toUpperCase(),
      name: newCampaign.name,
      clientId: newCampaign.clientId,
      clientName: client?.name || 'Selected Client',
      type: newCampaign.type,
      description: newCampaign.description,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      status: 'active',
      managerId: activeUser.id,
      managerName: activeUser.name,
      budgetKes: Number(newCampaign.budgetKes),
      targetVisits: Number(newCampaign.targetVisits),
      completedVisits: 0,
      attendanceRate: 100,
      osaScore: 90,
      salesTotalKes: 0,
      assignedTeamIds: ['team_nbi_west'],
      productIds: [],
      locationIds: ['loc_two_rivers'],
      activities: [
        {
          id: 'act_' + Date.now().toString(36),
          campaignId: 'cmp_' + Date.now().toString(36),
          name: newCampaign.activityName,
          type: newCampaign.activityType,
          description: 'Standard campaign field execution activity.',
          startDate: newCampaign.startDate,
          endDate: newCampaign.endDate,
          targetVisitsCount: Number(newCampaign.targetVisits),
          status: 'in_progress'
        }
      ]
    };

    storageService.addCampaign(created);
    setSelectedCampaign(created);
    setShowCreateModal(false);
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>;
      case 'planned':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Planned</span>;
      case 'paused':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Paused</span>;
      case 'completed':
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</span>;
      case 'draft':
        return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Draft</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <span>Campaign Management &amp; Wave Planner</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track campaign lifecycle states, multi-activity execution, quotas, and field resource deployments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign Wave</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 w-fit text-xs font-semibold">
        {['all', 'active', 'planned', 'paused', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
              selectedStatus === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Main Grid: Campaign List & Campaign Control Centre */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campaigns Directory */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCampaigns.map((cmp) => {
            const isSelected = selectedCampaign?.id === cmp.id;
            const progress = Math.round((cmp.completedVisits / (cmp.targetVisits || 1)) * 100);
            return (
              <div
                key={cmp.id}
                onClick={() => setSelectedCampaign(cmp)}
                className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
                      {cmp.code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1.5">{cmp.name}</h3>
                    <p className="text-[11px] text-slate-500">{cmp.clientName}</p>
                  </div>
                  <div>{getStatusBadge(cmp.status)}</div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Progress: {cmp.completedVisits} / {cmp.targetVisits} visits</span>
                  <span className="font-bold text-slate-800">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                  <span>{cmp.startDate} &rarr; {cmp.endDate}</span>
                  <span className="font-bold text-slate-700">KES {cmp.budgetKes.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Campaign Control Center */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          {selectedCampaign ? (
            <div className="space-y-6">
              {/* Campaign Header & State Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-extrabold text-slate-900">{selectedCampaign.name}</h2>
                    {getStatusBadge(selectedCampaign.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client: <strong className="text-slate-700">{selectedCampaign.clientName}</strong> &bull; Manager: {selectedCampaign.managerName}
                  </p>
                </div>

                {/* State Machine Transition Buttons */}
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  {selectedCampaign.status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs"
                      title="Activate Campaign Wave"
                    >
                      <Play className="w-3 h-3" />
                      <span>Activate</span>
                    </button>
                  )}
                  {selectedCampaign.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange('paused')}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center space-x-1 shadow-xs"
                      title="Pause Campaign"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                  )}
                  {selectedCampaign.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-1"
                      title="Mark Complete & Archive"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                {selectedCampaign.description}
              </div>

              {/* Quick Metrics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium block">Allocated Budget</span>
                  <span className="font-extrabold text-slate-900 font-mono block mt-1">
                    KES {(selectedCampaign.budgetKes / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium block">Completed Visits</span>
                  <span className="font-extrabold text-blue-600 font-mono block mt-1">
                    {selectedCampaign.completedVisits} / {selectedCampaign.targetVisits}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium block">Attendance Score</span>
                  <span className="font-extrabold text-emerald-600 font-mono block mt-1">
                    {selectedCampaign.attendanceRate}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium block">OSA Compliance</span>
                  <span className="font-extrabold text-indigo-600 font-mono block mt-1">
                    {selectedCampaign.osaScore}%
                  </span>
                </div>
              </div>

              {/* Campaign Activities Engine */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Campaign Operational Activities ({selectedCampaign.activities.length})</span>
                </h4>

                <div className="space-y-2.5">
                  {selectedCampaign.activities.map((act) => (
                    <div key={act.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="text-xs font-bold text-slate-900">{act.name}</h5>
                          <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded capitalize">
                            {act.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 block">
                          Target: {act.targetVisitsCount} visits
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Active In Field</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a campaign wave from the list to inspect operational state.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Campaign Wave */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <span>Launch New Campaign Wave</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Client *</label>
                <select
                  required
                  value={newCampaign.clientId}
                  onChange={(e) => setNewCampaign({ ...newCampaign, clientId: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Brand Client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campaign Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EABL-Q4-FESTIVE"
                    value={newCampaign.code}
                    onChange={(e) => setNewCampaign({ ...newCampaign, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Guinness Matchday Festive Drive"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campaign Operational Objective</label>
                <textarea
                  rows={2}
                  placeholder="Outline key targets, target venues, and team expectations..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget (KES)</label>
                  <input
                    type="number"
                    value={newCampaign.budgetKes}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budgetKes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Total Visits</label>
                  <input
                    type="number"
                    value={newCampaign.targetVisits}
                    onChange={(e) => setNewCampaign({ ...newCampaign, targetVisits: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
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
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
