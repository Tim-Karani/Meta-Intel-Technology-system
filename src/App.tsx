import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ClientManager } from './components/clients/ClientManager';
import { CampaignManager } from './components/campaigns/CampaignManager';
import { LocationManager } from './components/locations/LocationManager';
import { WorkforceManager } from './components/workforce/WorkforceManager';
import { FormBuilder } from './components/forms/FormBuilder';
import { DispatchScheduler } from './components/dispatch/DispatchScheduler';
import { AttendanceMonitor } from './components/attendance/AttendanceMonitor';
import { VisitAuditQueue } from './components/visits/VisitAuditQueue';
import { RetailExecution } from './components/retail/RetailExecution';
import { IssueTracker } from './components/issues/IssueTracker';
import { EvidenceGallery } from './components/evidence/EvidenceGallery';
import { ReportingHub } from './components/reports/ReportingHub';
import { AuditAndHealth } from './components/audit/AuditAndHealth';
import { MobileDeviceSimulator } from './components/mobile-sim/MobileDeviceSimulator';
import { storageService } from './services/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStateTrigger, setUserStateTrigger] = useState(0);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setUserStateTrigger(prev => prev + 1);
    });
    return () => unsub();
  }, []);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <ExecutiveDashboard onNavigateTab={(tab: NavTab) => setCurrentTab(tab)} />;
      case 'clients':
        return <ClientManager />;
      case 'campaigns':
        return <CampaignManager />;
      case 'locations':
        return <LocationManager />;
      case 'workforce':
        return <WorkforceManager />;
      case 'forms':
        return <FormBuilder />;
      case 'dispatch':
        return <DispatchScheduler />;
      case 'attendance':
        return <AttendanceMonitor />;
      case 'visits_qa':
        return <VisitAuditQueue />;
      case 'retail':
      case 'sales':
        return <RetailExecution />;
      case 'issues':
        return <IssueTracker />;
      case 'evidence':
        return <EvidenceGallery />;
      case 'reports':
        return <ReportingHub />;
      case 'audit':
        return <AuditAndHealth />;
      default:
        return <ExecutiveDashboard onNavigateTab={(tab: NavTab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Left Application Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenMobileSim={() => setIsMobileSimOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Navigation & Profile Switcher */}
        <Topbar
          activeTab={currentTab}
          isMobileSimOpen={isMobileSimOpen}
          onToggleMobileSim={() => setIsMobileSimOpen(!isMobileSimOpen)}
          onSearch={(term) => setSearchQuery(term)}
        />

        {/* Scrollable Viewport Container */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <div className="max-w-7xl mx-auto py-2">
            {renderActiveTab()}
          </div>
        </main>
      </div>

      {/* Interactive Mobile Device Simulator Modal */}
      <MobileDeviceSimulator
        isOpen={isMobileSimOpen}
        onClose={() => setIsMobileSimOpen(false)}
      />
    </div>
  );
}
