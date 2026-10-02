import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Activity, 
  Database, 
  Server, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Clock
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { AuditLogEntry } from '../../types';

export const AuditAndHealth: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    setLogs(storageService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.diffSummary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>Audit Trail &amp; System Health Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system change log with before/after deltas, security event triggers, and infrastructure health metrics.
          </p>
        </div>
      </div>

      {/* Infrastructure Health Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-800">PostgreSQL 16 DB</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">14 Active Pools &bull; PostGIS Ready</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-800">Laravel 11 REST API</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">Latency: 38ms &bull; HTTP 200 OK</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-800">Redis 7 Queue Workers</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">0 Failed Jobs &bull; 4 Workers Active</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-800">S3 Media Storage</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">4.8 GB &bull; TLS 1.3 Encrypted</p>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by user, action, IP or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {filteredLogs.length} Logged Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp / IP</th>
                <th className="px-4 py-3">User &amp; Role</th>
                <th className="px-4 py-3">Action Key</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Audit Details &amp; JSON Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-slate-600">
                    <span className="font-bold text-slate-900 block">{log.timestamp.slice(0, 19).replace('T', ' ')}</span>
                    <span className="text-[10px] text-slate-400">{log.ipAddress}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded capitalize">
                      {log.userRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {log.module}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">
                    {log.diffSummary}
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
