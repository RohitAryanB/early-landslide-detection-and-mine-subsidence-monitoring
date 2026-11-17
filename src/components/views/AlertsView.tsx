import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  Filter,
  Clock,
  UserCheck,
  FileText,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Plus
} from 'lucide-react';
import { AlertIncident, AlertSeverity, AlertCategory } from '../../types';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    assignAlert,
    addAlertNote,
    currentUser,
    setActiveView,
    setActiveNodeId
  } = useMine();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'investigating' | 'resolved'>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<string>(alerts[0]?.id || '');
  const [newNoteText, setNewNoteText] = useState('');
  const [assigneeName, setAssigneeName] = useState('Geotechnical Survey Team');

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || alerts[0];

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.zone.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedAlert) return;
    addAlertNote(selectedAlert.id, `${currentUser.name} (${currentUser.role}): ${newNoteText.trim()}`);
    setNewNoteText('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#141d33] border border-red-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Alerts & Geotechnical Incident Command
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hazard triage, geotechnical emergency perimeter protocols, and duty officer assignment.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-[#0f172a] border border-red-500/40 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 text-[10px] block">ACTIVE CRITICAL</span>
            <span className="text-red-400 font-bold text-base">
              {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
            </span>
          </div>
          <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 text-[10px] block">UNACKNOWLEDGED</span>
            <span className="text-amber-400 font-bold text-base">
              {alerts.filter(a => !a.acknowledged).length}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Incident Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Filterable Incident List */}
        <div className="lg:col-span-1 space-y-3">
          {/* Search & Filters */}
          <div className="bg-[#141d33] border border-slate-800 p-3.5 rounded-xl space-y-2.5 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents by zone or keyword..."
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="flex-1 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-slate-300"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-slate-300"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No incidents matching search/filters.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedAlert?.id === alert.id;
                const isCrit = alert.severity === 'critical';
                const isHigh = alert.severity === 'high';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                        : isCrit
                        ? 'bg-red-950/20 border-red-500/40 hover:bg-red-950/30'
                        : 'bg-[#141d33] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-1.5 font-bold">
                        {isCrit ? (
                          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className="font-mono text-cyan-400">{alert.id}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <h4 className="font-semibold text-white leading-snug mb-1 line-clamp-1">
                      {alert.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>{alert.zone}</span>
                      <span className="font-mono">{alert.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Full Incident Details & Emergency Response */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAlert ? (
            <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-6 space-y-5">
              {/* Incident Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{selectedAlert.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      selectedAlert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedAlert.severity} Severity
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                      Status: {selectedAlert.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedAlert.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Logged: {selectedAlert.timestamp} • Sector: {selectedAlert.zone}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!selectedAlert.acknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(selectedAlert.id, `Incident acknowledged by ${currentUser.name}`)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shadow"
                    >
                      Acknowledge Incident
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Acknowledged</span>
                    </div>
                  )}

                  {selectedAlert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(selectedAlert.id, 'Mitigation protocols confirmed by control room')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 leading-relaxed bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Incident Telemetry Synopsis:</span>
                {selectedAlert.description}
              </div>

              {/* Emergency Response & Recommended Protocol (Section 10 Requirement) */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-red-300">
                    <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Geotechnical Emergency Protocol & Recommended Response</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                    SIMULATED GUIDANCE
                  </span>
                </div>

                <div className="text-xs font-semibold text-white leading-relaxed">
                  {selectedAlert.recommendedAction}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-red-900/40 text-[11px] text-slate-300">
                  <div>Affected Sector: <span className="font-semibold text-white">{selectedAlert.zone}</span></div>
                  <div>Originating Sensor: <span className="font-mono text-cyan-300">{selectedAlert.nodeId || 'Multiple Nodes'}</span></div>
                  <div>Impact Radius: <span className="text-amber-400 font-semibold">80m Perimeter</span></div>
                </div>

                {selectedAlert.restrictedZoneId && (
                  <button
                    onClick={() => setActiveView('digital_twin')}
                    className="w-full py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Inspect Evacuation Zone on 3D Digital Twin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Assignment & Notes Log */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Assignment Box */}
                <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Duty Assignment</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{selectedAlert.assignedTo || 'Unassigned'}</div>
                      <div className="text-[10px] text-slate-500">Responsible Field / Geotech Party</div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      placeholder="Assignee name..."
                      className="flex-1 bg-[#141d33] border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                    />
                    <button
                      onClick={() => assignAlert(selectedAlert.id, assigneeName)}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg text-xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Ack Info */}
                <div className="bg-[#0f172a] p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Verification Audit</span>
                  <div className="text-slate-300">
                    Ack Status: <span className="font-semibold text-white">{selectedAlert.acknowledged ? 'Verified' : 'Pending'}</span>
                  </div>
                  {selectedAlert.acknowledgedBy && (
                    <div className="text-slate-300">
                      Officer: <span className="font-semibold text-cyan-300">{selectedAlert.acknowledgedBy}</span>
                    </div>
                  )}
                  {selectedAlert.acknowledgedAt && (
                    <div className="text-slate-400 text-[11px]">
                      Time: {selectedAlert.acknowledgedAt}
                    </div>
                  )}
                </div>
              </div>

              {/* Incident Notes Log */}
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase text-[10px]">Duty Officer Log & Field Notes</span>
                  <span className="text-[10px] text-slate-500">{selectedAlert.notes?.length || 0} Entries</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedAlert.notes?.map((n, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      {n}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add operational notes or field inspection remarks..."
                    className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl"
                  >
                    Post Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select an incident from the registry to view emergency response protocols.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
