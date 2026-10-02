import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  User, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { FieldIssue, IssueStatus, IssuePriority, IssueCategory } from '../../types';

export const IssueTracker: React.FC = () => {
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<FieldIssue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>('resolved');
  const [resolutionNote, setResolutionNote] = useState('');

  const loadData = () => {
    setIssues(storageService.getIssues());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleUpdateStatus = () => {
    if (!selectedIssue) return;
    storageService.updateIssueStatus(selectedIssue.id, newStatus, resolutionNote);
    setSelectedIssue(null);
    setResolutionNote('');
  };

  const getPriorityBadge = (p: IssuePriority) => {
    switch (p) {
      case 'urgent':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Urgent</span>;
      case 'high':
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Medium</span>;
      case 'low':
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Low</span>;
    }
  };

  const statuses: IssueStatus[] = ['open', 'escalated', 'in_progress', 'resolved'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span>Field Issue Logging &amp; Escalation Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Triage on-ground blockers: retail stock-outs, damaged POSM, closed outlets, and competitor promotions.
          </p>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map(status => {
          const colIssues = issues.filter(i => i.status === status);
          return (
            <div key={status} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {status.replace('_', ' ')}
                </span>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                  {colIssues.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                {colIssues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded capitalize">
                        {issue.category.replace('_', ' ')}
                      </span>
                      {getPriorityBadge(issue.priority)}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {issue.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[120px]">{issue.locationName}</span>
                      </span>
                      <span>{issue.reportedAt.slice(11, 16)}</span>
                    </div>
                  </div>
                ))}

                {colIssues.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No tickets
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Ticket #{selectedIssue.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedIssue.title}</h3>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                {getPriorityBadge(selectedIssue.priority)}
                <span className="text-slate-600">Category: <strong>{selectedIssue.category.replace('_', ' ')}</strong></span>
                <span className="text-slate-600">Venue: <strong>{selectedIssue.locationName}</strong></span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium mb-1">Issue Description</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                  {selectedIssue.description}
                </div>
              </div>

              {selectedIssue.photoUrl && (
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Attached Incident Photo</span>
                  <img src={selectedIssue.photoUrl} alt="Issue" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
                </div>
              )}

              {selectedIssue.resolutionNotes && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                  <span className="font-bold block mb-0.5">Existing Resolution Notes:</span>
                  <p>{selectedIssue.resolutionNotes}</p>
                </div>
              )}

              {/* Status Transition Control */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="escalated">Escalated to Brand Manager</option>
                      <option value="resolved">Mark Resolved</option>
                      <option value="closed">Close Ticket</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resolution Actions Taken</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Coordinated with Thika distributor to dispatch emergency stock van on Saturday morning."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(null)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    Save &amp; Update Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
