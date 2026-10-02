import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  X, 
  Briefcase,
  DollarSign
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { Client, Campaign } from '../../types';

export const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Client Form State
  const [newClient, setNewClient] = useState({
    code: '',
    name: '',
    industry: 'Fast-Moving Consumer Goods (FMCG)',
    primaryContactName: '',
    email: '',
    phone: '',
    address: '',
    county: 'Nairobi',
    totalBudgetKes: 10000000,
    notes: ''
  });

  const loadData = () => {
    const loadedClients = storageService.getClients();
    setClients(loadedClients);
    setCampaigns(storageService.getCampaigns());
    if (!selectedClient && loadedClients.length > 0) {
      setSelectedClient(loadedClients[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.code) return;

    const created: Client = {
      id: 'cli_' + Date.now().toString(36),
      code: newClient.code.toUpperCase(),
      name: newClient.name,
      industry: newClient.industry,
      primaryContactName: newClient.primaryContactName,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
      county: newClient.county,
      status: 'active',
      activeCampaignsCount: 0,
      totalBudgetKes: Number(newClient.totalBudgetKes),
      notes: newClient.notes,
      createdAt: new Date().toISOString()
    };

    storageService.addClient(created);
    setSelectedClient(created);
    setShowCreateModal(false);
    setNewClient({
      code: '',
      name: '',
      industry: 'Fast-Moving Consumer Goods (FMCG)',
      primaryContactName: '',
      email: '',
      phone: '',
      address: '',
      county: 'Nairobi',
      totalBudgetKes: 10000000,
      notes: ''
    });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientCampaigns = selectedClient 
    ? campaigns.filter(cmp => cmp.clientId === selectedClient.id)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Client Portfolios &amp; Accounts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage TTL brand client profiles, service level agreements (SLAs), and campaign allocations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Client</span>
        </button>
      </div>

      {/* Main 2-Column Split: Client List & Client 360 Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Directory */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, code or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {filteredClients.map((client) => {
              const isSelected = selectedClient?.id === client.id;
              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {client.code}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-1">{client.name}</h3>
                      <p className="text-[11px] text-slate-500">{client.industry}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {client.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{client.county}</span>
                    </span>
                    <span className="font-semibold text-slate-700">
                      KES {client.totalBudgetKes.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Client 360 Detail View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          {selectedClient ? (
            <div className="space-y-6">
              {/* Client Profile Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedClient.name}</h2>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                      {selectedClient.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedClient.industry}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Portfolio Budget</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    KES {selectedClient.totalBudgetKes.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Key Contact & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Primary Stakeholder</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{selectedClient.primaryContactName}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Official Email</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{selectedClient.email}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Phone / Tel</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{selectedClient.phone}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Corporate Headquarters</span>
                  <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{selectedClient.address}, {selectedClient.county}</span>
                  </span>
                </div>
              </div>

              {/* Operational SLA / Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1.5">Operational SLA Brief &amp; Execution Guidelines</h4>
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                  {selectedClient.notes || 'Standard TTL Field Operations SLA: 95% attendance adherence, mandatory live GPS-stamped photo capture.'}
                </div>
              </div>

              {/* Client Campaigns */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Active Client Campaigns ({clientCampaigns.length})</span>
                  </h4>
                </div>

                {clientCampaigns.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No active campaigns currently attached to this client.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientCampaigns.map(cmp => (
                      <div key={cmp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 font-mono">{cmp.code}</span>
                          <h5 className="text-xs font-bold text-slate-900">{cmp.name}</h5>
                          <span className="text-[10px] text-slate-500">
                            {cmp.startDate} to {cmp.endDate} &bull; Mgr: {cmp.managerName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-800 font-mono block">
                            KES {cmp.budgetKes.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {cmp.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Select a client from the directory to inspect account details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Register New Client */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Register New Agency Brand Client</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COCA-COLA"
                    value={newClient.code}
                    onChange={(e) => setNewClient({ ...newClient, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corporate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coca-Cola Beverages Africa"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. FMCG (Beverages)"
                  value={newClient.industry}
                  onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Wangari (Brand Mgr)"
                    value={newClient.primaryContactName}
                    onChange={(e) => setNewClient({ ...newClient, primaryContactName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="jane.wangari@client.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contract Budget (KES)</label>
                  <input
                    type="number"
                    value={newClient.totalBudgetKes}
                    onChange={(e) => setNewClient({ ...newClient, totalBudgetKes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Office Address &amp; County</label>
                <input
                  type="text"
                  placeholder="Embassy House, Harambee Ave, Nairobi"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operational SLA Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific campaign compliance guidelines, target coverage, reporting frequency..."
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
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
                  Save &amp; Provision Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
