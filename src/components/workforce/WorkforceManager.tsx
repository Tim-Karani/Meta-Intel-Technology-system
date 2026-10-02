import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  ShieldCheck, 
  Plus, 
  Search, 
  Smartphone, 
  UserCheck, 
  X,
  Mail,
  Phone,
  Check,
  Lock
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { User, UserRole, AgentSubtype, Team } from '../../types';

export const WorkforceManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'teams' | 'rbac'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    employeeCode: '',
    name: '',
    email: '',
    phone: '',
    role: 'field_agent' as UserRole,
    agentSubtype: 'brand_ambassador' as AgentSubtype
  });

  const loadData = () => {
    setUsers(storageService.getUsers());
    setTeams(storageService.getTeams());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.employeeCode || !newUser.email) return;

    const created: User = {
      id: 'usr_' + Date.now().toString(36),
      employeeCode: newUser.employeeCode.toUpperCase(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      agentSubtype: newUser.role === 'field_agent' ? newUser.agentSubtype : undefined,
      isActive: true,
      assignedCampaignIds: ['cmp_eabl_01'],
      assignedTeamId: 'team_nbi_west',
      lastLoginAt: new Date().toISOString()
    };

    storageService.addUser(created);
    setShowCreateModal(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // RBAC Matrix Permissions definition
  const rbacPermissions = [
    { module: 'Clients', key: 'clients.view', label: 'View Client Portfolios' },
    { module: 'Clients', key: 'clients.create', label: 'Register New Clients' },
    { module: 'Campaigns', key: 'campaigns.create', label: 'Launch New Campaigns' },
    { module: 'Campaigns', key: 'campaigns.edit', label: 'Edit Campaign & Activities' },
    { module: 'Locations', key: 'locations.manage', label: 'Configure Geofences & Venues' },
    { module: 'Forms', key: 'forms.publish', label: 'Design & Publish Questionnaires' },
    { module: 'Attendance', key: 'attendance.override', label: 'Approve Attendance Overrides' },
    { module: 'Visits', key: 'visits.verify', label: 'Verify & Sign-off Field Visits' },
    { module: 'Reports', key: 'reports.export', label: 'Export Data (CSV / Excel / PDF)' },
    { module: 'Audit', key: 'audit.view', label: 'Inspect System Audit Logs' }
  ];

  const defaultRolePermissions: Record<UserRole, string[]> = {
    system_admin: rbacPermissions.map(p => p.key),
    ops_manager: rbacPermissions.map(p => p.key),
    campaign_manager: ['clients.view', 'campaigns.create', 'campaigns.edit', 'locations.manage', 'forms.publish', 'visits.verify', 'reports.export'],
    supervisor: ['locations.manage', 'attendance.override', 'visits.verify', 'reports.export'],
    field_agent: [],
    client_user: ['clients.view', 'reports.export']
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>Workforce Management, Teams &amp; RBAC</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage agency staff, field agents (BAs, Merchandisers, Sales Reps), teams, and granular backend access policies.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workforce Member</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 px-3 text-xs font-bold transition-all flex items-center space-x-1.5 border-b-2 ${
            activeSubTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff &amp; Field Agent Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('teams')}
          className={`pb-3 px-3 text-xs font-bold transition-all flex items-center space-x-1.5 border-b-2 ${
            activeSubTab === 'teams'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Field Teams &amp; Territories ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`pb-3 px-3 text-xs font-bold transition-all flex items-center space-x-1.5 border-b-2 ${
            activeSubTab === 'rbac'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Permissions Matrix</span>
        </button>
      </div>

      {/* Tab 1: Users Directory */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, code or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredUsers.length} active users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Code / Name</th>
                  <th className="px-4 py-3">Role &amp; Subtype</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Supervisor</th>
                  <th className="px-4 py-3">Device Trust</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{u.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-semibold text-slate-800 block">
                        {u.role.replace('_', ' ')}
                      </span>
                      {u.agentSubtype && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded capitalize">
                          {u.agentSubtype.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.supervisorName || <span className="text-slate-400">N/A (Direct)</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.currentDevice ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>{u.currentDevice.model}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Web Portal</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Teams Directory */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">County: {t.county}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {t.memberIds.length} Field Agents
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <span className="text-slate-400 block font-medium">Field Supervisor</span>
                <span className="font-bold text-slate-800">{t.supervisorName}</span>
                <span className="text-[11px] text-slate-500 block">Territory: {t.territory}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: RBAC Matrix */}
      {activeSubTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Backend Authorization &amp; Role-Permission Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every API endpoint evaluates dynamic permissions server-side.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Permission Key / Action</th>
                  <th className="px-3 py-3 text-center">Sys Admin</th>
                  <th className="px-3 py-3 text-center">Ops Mgr</th>
                  <th className="px-3 py-3 text-center">Campaign Mgr</th>
                  <th className="px-3 py-3 text-center">Supervisor</th>
                  <th className="px-3 py-3 text-center">Field Agent</th>
                  <th className="px-3 py-3 text-center">Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rbacPermissions.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <span className="font-bold text-slate-800 block">{perm.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{perm.key}</span>
                    </td>
                    {(['system_admin', 'ops_manager', 'campaign_manager', 'supervisor', 'field_agent', 'client_user'] as UserRole[]).map((r) => {
                      const hasPerm = defaultRolePermissions[r].includes(perm.key);
                      return (
                        <td key={r} className="px-3 py-2.5 text-center">
                          {hasPerm ? (
                            <span className="inline-flex w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mx-auto">
                              <Check className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="text-slate-300">&mdash;</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Users2 className="w-4 h-4 text-blue-600" />
                <span>Add Workforce Member</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="MIT-AGT-105"
                    value={newUser.employeeCode}
                    onChange={(e) => setNewUser({ ...newUser, employeeCode: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Victor Mutiso"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="victor.mutiso@metaintel.co.ke"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="field_agent">Field Agent (Mobile APK)</option>
                    <option value="supervisor">Field Supervisor</option>
                    <option value="campaign_manager">Campaign Manager</option>
                    <option value="ops_manager">Operations Manager</option>
                  </select>
                </div>

                {newUser.role === 'field_agent' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Field Agent Subtype</label>
                    <select
                      value={newUser.agentSubtype}
                      onChange={(e) => setNewUser({ ...newUser, agentSubtype: e.target.value as AgentSubtype })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="brand_ambassador">Brand Ambassador</option>
                      <option value="merchandiser">Merchandiser</option>
                      <option value="sales_rep">Sales Representative</option>
                      <option value="field_auditor">Field Auditor</option>
                    </select>
                  </div>
                )}
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
                  Provision User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
