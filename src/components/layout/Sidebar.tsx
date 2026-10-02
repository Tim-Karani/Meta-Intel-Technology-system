import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  MapPin,
  Users2,
  FileSpreadsheet,
  CalendarCheck,
  Clock,
  CheckSquare,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Image,
  BarChart3,
  ShieldAlert,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../../services/storage';

export type NavTab = 
  | 'dashboard'
  | 'clients'
  | 'campaigns'
  | 'locations'
  | 'workforce'
  | 'forms'
  | 'dispatch'
  | 'attendance'
  | 'visits_qa'
  | 'retail'
  | 'sales'
  | 'issues'
  | 'evidence'
  | 'reports'
  | 'audit';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileSim: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileSim
}) => {
  const activeUser = storageService.getActiveUser();
  const visits = storageService.getVisits();
  const issues = storageService.getIssues();

  const pendingVisitsCount = visits.filter(v => v.status === 'submitted' || v.status === 'under_review').length;
  const openIssuesCount = issues.filter(i => i.status === 'open' || i.status === 'escalated').length;

  const isClient = activeUser.role === 'client_user';

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    allowedRoles?: string[];
  }

  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'OPERATIONAL COMMAND',
      items: [
        { id: 'dashboard', label: 'Dashboard & Maps', icon: LayoutDashboard },
        { id: 'clients', label: 'Client Portfolios', icon: Building2, allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager', 'client_user'] },
        { id: 'campaigns', label: 'Campaigns & Waves', icon: Megaphone },
        { id: 'locations', label: 'Master Locations & GIS', icon: MapPin, allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager', 'supervisor'] }
      ]
    },
    {
      title: 'FIELD ROSTER & FORMS',
      items: [
        { id: 'workforce', label: 'Workforce & RBAC', icon: Users2, allowedRoles: ['system_admin', 'ops_manager', 'supervisor'] },
        { id: 'forms', label: 'Dynamic Form Studio', icon: FileSpreadsheet, allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager'] },
        { id: 'dispatch', label: 'Shift Scheduling', icon: CalendarCheck, allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager', 'supervisor'] },
        { id: 'attendance', label: 'Live Attendance Geo', icon: Clock, allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager', 'supervisor'] }
      ]
    },
    {
      title: 'EXECUTION & AUDITS',
      items: [
        { 
          id: 'visits_qa', 
          label: 'Visit QA & Approvals', 
          icon: CheckSquare, 
          badge: pendingVisitsCount, 
          badgeColor: 'bg-amber-500 text-white',
          allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager', 'supervisor', 'client_user'] 
        },
        { id: 'retail', label: 'Merchandising & OSA', icon: ShoppingBag },
        { id: 'sales', label: 'Field Sales Ledger', icon: DollarSign },
        { 
          id: 'issues', 
          label: 'Issue Escalation', 
          icon: AlertCircle, 
          badge: openIssuesCount, 
          badgeColor: 'bg-rose-600 text-white',
          allowedRoles: ['system_admin', 'ops_manager', 'campaign_manager', 'supervisor'] 
        },
        { id: 'evidence', label: 'Digital Evidence Gallery', icon: Image }
      ]
    },
    {
      title: 'INSIGHTS & GOVERNANCE',
      items: [
        { id: 'reports', label: 'Reporting & Exports', icon: BarChart3 },
        { id: 'audit', label: 'Audit Trail & Health', icon: ShieldAlert, allowedRoles: ['system_admin', 'ops_manager'] }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 select-none">
      {/* Platform Branding Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
          <span className="font-black text-sm tracking-tighter">MIT</span>
        </div>
        <div>
          <span className="text-white font-extrabold text-sm tracking-tight block">
            Meta Intel Platform
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Agency Core
          </span>
        </div>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => {
          // Filter items based on user role
          const visibleItems = section.items.filter(item => {
            if (!item.allowedRoles) return true;
            return item.allowedRoles.includes(activeUser.role);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {section.title}
              </p>
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Quick Mobile App Simulator Button in Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onOpenMobileSim}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-all group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                Agent Mobile APK
              </p>
              <p className="text-[10px] text-slate-400">Offline SQLite &amp; GPS</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </aside>
  );
};
