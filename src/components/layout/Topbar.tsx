import React, { useState } from 'react';
import { 
  Smartphone, 
  Bell, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck, 
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { User, UserRole } from '../../types';

interface TopbarProps {
  activeTab: string;
  isMobileSimOpen: boolean;
  onToggleMobileSim: () => void;
  onSearch?: (term: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  isMobileSimOpen,
  onToggleMobileSim,
  onSearch
}) => {
  const activeUser = storageService.getActiveUser();
  const allUsers = storageService.getUsers();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const campaigns = storageService.getCampaigns();
  const locations = storageService.getLocations();
  const users = storageService.getUsers();
  const products = storageService.getProducts();

  const searchResults = searchTerm.trim().length > 1 ? [
    ...campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())).map(c => ({ type: 'Campaign', title: c.name, sub: c.clientName, code: c.code })),
    ...locations.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.county.toLowerCase().includes(searchTerm.toLowerCase())).map(l => ({ type: 'Location', title: l.name, sub: `${l.town}, ${l.county}`, code: l.code })),
    ...users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())).map(u => ({ type: 'Workforce', title: u.name, sub: u.role.replace('_', ' '), code: u.employeeCode })),
    ...products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).map(p => ({ type: 'Product SKU', title: p.name, sub: `KES ${p.recommendedRetailPriceKes}`, code: p.sku }))
  ] : [];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'system_admin':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-semibold">Sys Admin</span>;
      case 'ops_manager':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">Ops Manager</span>;
      case 'campaign_manager':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-semibold">Campaign Mgr</span>;
      case 'supervisor':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-semibold">Supervisor</span>;
      case 'field_agent':
        return <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-0.5 rounded font-semibold">Field Agent</span>;
      case 'client_user':
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded font-semibold">Client Viewer</span>;
    }
  };

  const handleSwitchUser = (user: User) => {
    storageService.setActiveUser(user);
    setShowRoleMenu(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default Kenyan seed data?')) {
      storageService.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Brand Identity & Current Scope */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              Meta Intel <span className="text-blue-600 font-black">Technologies</span>
            </span>
            <span className="hidden sm:inline-block bg-slate-100 text-slate-600 text-xs font-mono px-2 py-0.5 rounded border border-slate-200">
              v2.4 Production
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium hidden md:block">
            Field Operations &amp; Retail Execution Platform &bull; Kenya (KES / Africa/Nairobi)
          </p>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6 relative">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns, retail locations, agents, or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 1);
              if (onSearch) onSearch(e.target.value);
            }}
            onFocus={() => setShowSearchResults(searchTerm.trim().length > 1)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Matching Records ({searchResults.length})</span>
              <span className="text-[10px] text-blue-600 font-mono cursor-pointer" onClick={() => setShowSearchResults(false)}>Close</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching records found for "{searchTerm}"
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchTerm('');
                    }}
                    className="px-3 py-2 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{res.title}</span>
                      <span className="text-[10px] text-slate-500">{res.sub}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono uppercase">
                        {res.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Mobile Device Simulator Trigger */}
        <button
          onClick={onToggleMobileSim}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isMobileSimOpen
              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
          title="Toggle interactive Flutter field agent mobile app simulator"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Mobile Field App</span>
          <span className="bg-emerald-500 w-2 h-2 rounded-full inline-block animate-pulse"></span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Operational Alerts</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto">
                <div className="py-2.5">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Proximity Warning (Visit #9803)</p>
                      <p className="text-slate-500 text-[11px]">Clean Shelf Ruiru: Agent 260m outside geofence.</p>
                      <span className="text-[10px] text-slate-400">12 mins ago</span>
                    </div>
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Batch Dispatch Synced</p>
                      <p className="text-slate-500 text-[11px]">35 weekend assignments dispatched to Nairobi West squad.</p>
                      <span className="text-[10px] text-slate-400">45 mins ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
          title="Reset database to initial Kenyan demo state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Active User & Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 p-1.5 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
              {activeUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {activeUser.name}
                </span>
                {getRoleBadge(activeUser.role)}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {activeUser.employeeCode}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Quick Persona Switcher Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (RBAC Simulation)
                </p>
                <p className="text-[10px] text-slate-500">
                  Click any persona to inspect the platform from their access view.
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      u.id === activeUser.id ? 'bg-blue-50/70 border-l-3 border-blue-600' : ''
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </div>
                    <div>{getRoleBadge(u.role)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
