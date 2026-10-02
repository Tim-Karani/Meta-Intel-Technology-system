import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock,
  ShoppingBag,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { ExportService } from '../../services/exportService';

export const ReportingHub: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string>('campaign_perf');

  const campaigns = storageService.getCampaigns();
  const visits = storageService.getVisits();
  const attendance = storageService.getAttendance();
  const issues = storageService.getIssues();

  const handleExport = (reportKey: string) => {
    switch (reportKey) {
      case 'campaign_perf': {
        const headers = ['Campaign Code', 'Campaign Name', 'Client', 'Target Visits', 'Completed Visits', 'Completion %', 'Attendance %', 'OSA Score %', 'Budget (KES)'];
        const rows = campaigns.map(c => [
          c.code,
          c.name,
          c.clientName,
          c.targetVisits,
          c.completedVisits,
          Math.round((c.completedVisits / (c.targetVisits || 1)) * 100),
          c.attendanceRate,
          c.osaScore,
          c.budgetKes
        ]);
        ExportService.downloadCSV('Campaign_Performance_Report', headers, rows);
        break;
      }
      case 'attendance': {
        const headers = ['Agent Name', 'Campaign', 'Date', 'Clock In Time', 'Location', 'Distance (m)', 'Geofence Status', 'Attendance State'];
        const rows = attendance.map(a => [
          a.agentName,
          a.campaignName,
          a.date,
          a.clockInTime,
          a.locationName,
          Math.round(a.distanceFromAssignedMeters),
          a.isGeofenceCompliant ? 'In-Fence' : 'Warning',
          a.status
        ]);
        ExportService.downloadCSV('Daily_Attendance_Report', headers, rows);
        break;
      }
      case 'visits': {
        const headers = ['Visit ID', 'Client UUID', 'Agent', 'Campaign', 'Venue', 'County', 'Date', 'Distance (m)', 'Fraud Score', 'Status'];
        const rows = visits.map(v => [
          v.id,
          v.clientUuid,
          v.agentName,
          v.campaignName,
          v.locationName,
          v.locationCounty,
          v.visitDate,
          Math.round(v.distanceFromLocationMeters),
          v.fraudRiskScore,
          v.status
        ]);
        ExportService.downloadCSV('Field_Visits_QA_Report', headers, rows);
        break;
      }
      case 'sales': {
        const headers = ['Visit ID', 'Date', 'Agent', 'Location', 'Product', 'Quantity', 'Unit Price (KES)', 'Total Amount (KES)', 'Payment Method', 'M-Pesa Ref'];
        const rows = visits.flatMap(v => v.salesRecords.map(s => [
          v.id,
          v.visitDate,
          v.agentName,
          v.locationName,
          s.productName,
          s.quantity,
          s.unitPriceKes,
          s.totalPriceKes,
          s.paymentMethod,
          s.mpesaReference || 'N/A'
        ]));
        ExportService.downloadCSV('Field_Sales_Ledger_Report', headers, rows);
        break;
      }
      case 'osa': {
        const headers = ['Visit ID', 'Date', 'Venue', 'Product SKU', 'Available (OSA)', 'Out of Stock Reason', 'Current Price (KES)', 'Facings Count', 'Competitor Facings'];
        const rows = visits.flatMap(v => v.osaRecords.map(r => [
          v.id,
          v.visitDate,
          v.locationName,
          r.productName,
          r.isAvailable ? 'YES' : 'NO',
          r.outOfStockReason || 'N/A',
          r.currentShelfPriceKes || 0,
          r.facingsCount,
          r.competitorFacingsCount
        ]));
        ExportService.downloadCSV('On_Shelf_Availability_OSA_Report', headers, rows);
        break;
      }
      case 'issues': {
        const headers = ['Ticket ID', 'Reported At', 'Category', 'Priority', 'Status', 'Location', 'Agent', 'Title', 'Description'];
        const rows = issues.map(i => [
          i.id,
          i.reportedAt,
          i.category,
          i.priority,
          i.status,
          i.locationName,
          i.agentName,
          i.title,
          i.description
        ]);
        ExportService.downloadCSV('Field_Issues_Escalation_Report', headers, rows);
        break;
      }
      default: {
        alert('Report data prepared.');
      }
    }
  };

  const reportsList = [
    { id: 'campaign_perf', title: '1. Campaign Overall Performance & Target Attainment', desc: 'Target vs actual completions, budgets, and regional compliance.', icon: BarChart3 },
    { id: 'attendance', title: '2. Daily Attendance & Shift Punctuality Roster', desc: 'Clock-in timestamps, GPS distances, and late arrivals.', icon: Clock },
    { id: 'visits', title: '3. Field Visit Execution & Quality Assurance Audit', desc: 'Detailed visit transaction logs, anti-fraud risk ratings, and sign-offs.', icon: CheckCircle2 },
    { id: 'sales', title: '4. Direct Field Sales & M-Pesa Revenue Ledger', desc: 'Unit sales, gross revenue in KES, payment references, and agent volumes.', icon: DollarSign },
    { id: 'osa', title: '5. On-Shelf Availability (OSA) & Stockout Root Cause', desc: 'SKU availability percentages, facings share, and out-of-stock reasons.', icon: ShoppingBag },
    { id: 'issues', title: '6. Field Issues & SLA Resolution Log', desc: 'On-ground operational blockers, stockouts, damaged POSM, and escalations.', icon: AlertCircle }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Reporting Hub &amp; Asynchronous Data Exports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and stream real production CSV and formatted Excel datasets with complete agency data sanitation.
          </p>
        </div>
      </div>

      {/* Reports Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsList.map((rpt) => {
          const Icon = rpt.icon;
          return (
            <div
              key={rpt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">{rpt.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{rpt.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Format: CSV / XLSX</span>
                <button
                  onClick={() => handleExport(rpt.id)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
