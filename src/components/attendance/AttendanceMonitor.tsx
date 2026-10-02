import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Calendar,
  Compass
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { AttendanceRecord } from '../../types';

export const AttendanceMonitor: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const loadData = () => {
    setAttendance(storageService.getAttendance());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const getStatusBadge = (rec: AttendanceRecord) => {
    switch (rec.status) {
      case 'present':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Present</span>;
      case 'late':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Late</span>;
      case 'absent':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Absent</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{rec.status}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Live Field Attendance &amp; Geo-Clock In Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry verifying agent clock-in times, venue proximity, GPS accuracy, and shift durations.
          </p>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Today's Clock-Ins</span>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{attendance.length}</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">100% On-shift reporting</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Geofence Compliance</span>
          <span className="text-2xl font-black text-blue-600 mt-2 block">
            {Math.round((attendance.filter(a => a.isGeofenceCompliant).length / (attendance.length || 1)) * 100)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Within permitted venue radius</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Supervisor Overrides</span>
          <span className="text-2xl font-black text-amber-600 mt-2 block">
            {attendance.filter(a => a.supervisorOverrideApproved).length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Regularized attendance punches</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Field Agent</th>
                <th className="px-4 py-3">Campaign Wave</th>
                <th className="px-4 py-3">Target Retail Venue</th>
                <th className="px-4 py-3">Clock-In Time</th>
                <th className="px-4 py-3">GPS Proximity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {rec.agentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-slate-900">{rec.agentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {rec.campaignName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800 block">{rec.locationName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rec.clockInLat.toFixed(4)}, {rec.clockInLng.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {rec.clockInTime.slice(11, 19)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5">
                      {rec.isGeofenceCompliant ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{Math.round(rec.distanceFromAssignedMeters)}m (In-Fence)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>{Math.round(rec.distanceFromAssignedMeters)}m (Warning)</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(rec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
