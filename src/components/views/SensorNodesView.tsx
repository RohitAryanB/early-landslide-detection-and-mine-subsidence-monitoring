import React, { useState, useMemo } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Radio,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  Battery,
  Wifi,
  AlertTriangle,
  RotateCcw,
  Zap,
  WifiOff,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SensorNode, NodeStatus, NodeCategory, RiskSeverity } from '../../types';

export const SensorNodesView: React.FC = () => {
  const {
    nodes,
    setActiveNodeId,
    setIsAddNodeModalOpen,
    simulateNodeOffline,
    simulateLowBattery,
    triggerSensorAnomaly,
    resetNode,
    deleteNode,
    nodeFilterPreset,
    setNodeFilterPreset,
    setActiveView
  } = useMine();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(nodeFilterPreset?.status || 'all');
  const [zoneFilter, setZoneFilter] = useState<string>(nodeFilterPreset?.zone || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(nodeFilterPreset?.category || 'all');
  const [batteryFilter, setBatteryFilter] = useState<string>(nodeFilterPreset?.lowBattery ? 'low' : 'all');
  const [sortField, setSortField] = useState<'id' | 'displacement' | 'tilt' | 'battery' | 'risk'>('risk');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Clear presets if any
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setZoneFilter('all');
    setCategoryFilter('all');
    setBatteryFilter('all');
    setNodeFilterPreset(null);
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Search
      const matchesSearch = 
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.zone.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;

      // Zone
      const matchesZone = zoneFilter === 'all' || node.zone === zoneFilter;

      // Category
      const matchesCategory = categoryFilter === 'all' || node.category === categoryFilter;

      // Battery
      let matchesBattery = true;
      if (batteryFilter === 'low') matchesBattery = node.battery < 25;
      else if (batteryFilter === 'medium') matchesBattery = node.battery >= 25 && node.battery < 60;
      else if (batteryFilter === 'high') matchesBattery = node.battery >= 60;

      return matchesSearch && matchesStatus && matchesZone && matchesCategory && matchesBattery;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'id') {
        return sortAsc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      } else if (sortField === 'displacement') {
        valA = a.measurements.displacement;
        valB = b.measurements.displacement;
      } else if (sortField === 'tilt') {
        valA = a.measurements.tiltAngle;
        valB = b.measurements.tiltAngle;
      } else if (sortField === 'battery') {
        valA = a.battery;
        valB = b.battery;
      } else if (sortField === 'risk') {
        valA = a.aiRiskContribution;
        valB = b.aiRiskContribution;
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [nodes, searchTerm, statusFilter, zoneFilter, categoryFilter, batteryFilter, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Add Node */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141d33] border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Sensor Node Management & Diagnostics
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              {nodes.length} Nodes Mapped
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry registry across LoRa mesh sectors, precision geotechnical transducers, and simulation controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddNodeModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shadow-lg shadow-cyan-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Demo Node</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141d33] border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name, or zone (e.g. NODE-SL-01, Crown)..."
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="normal">Healthy (Normal)</option>
              <option value="warning">Warning Threshold</option>
              <option value="critical">Critical Alarm</option>
              <option value="offline">Offline / Disconnected</option>
            </select>

            {/* Zone Filter */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Zones</option>
              <option value="Zone A">Zone A (North OB Dump)</option>
              <option value="Zone B">Zone B (Panel 04 Surface)</option>
              <option value="Zone C">Zone C (West Pit Benches)</option>
              <option value="Zone D">Zone D (Tailings Embankment)</option>
              <option value="Zone E">Zone E (Central Haulage)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="subsidence">Subsidence Monitoring</option>
              <option value="slope">Slope / Landslide</option>
              <option value="environmental">Environmental / Met</option>
              <option value="gateway_relay">Gateway / Mesh Relay</option>
            </select>

            {/* Battery Filter */}
            <select
              value={batteryFilter}
              onChange={(e) => setBatteryFilter(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Battery Levels</option>
              <option value="low">Low Battery (&lt;25%)</option>
              <option value="medium">Medium (25 - 60%)</option>
              <option value="high">High (&gt;60%)</option>
            </select>

            {(searchTerm || statusFilter !== 'all' || zoneFilter !== 'all' || categoryFilter !== 'all' || batteryFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nodes Table */}
      <div className="bg-[#141d33] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f172a] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('id')}>
                  <div className="flex items-center space-x-1">
                    <span>Node ID / Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Zone / Location</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('displacement')}>
                  <div className="flex items-center space-x-1">
                    <span>Displacement</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('tilt')}>
                  <div className="flex items-center space-x-1">
                    <span>Tilt Angle</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('battery')}>
                  <div className="flex items-center space-x-1">
                    <span>Battery</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Signal (RSSI)</th>
                <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('risk')}>
                  <div className="flex items-center space-x-1">
                    <span>AI Risk Impact</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Demo Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredNodes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No monitoring nodes matching active filter criteria.
                  </td>
                </tr>
              ) : (
                filteredNodes.map(node => {
                  const m = node.measurements;
                  const isCrit = node.status === 'critical';
                  const isWarn = node.status === 'warning';
                  const isOff = node.status === 'offline';

                  return (
                    <tr
                      key={node.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setActiveNodeId(node.id)}
                    >
                      {/* Node ID & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isCrit ? 'bg-red-500 animate-pulse' :
                            isWarn ? 'bg-amber-400' :
                            isOff ? 'bg-slate-600' : 'bg-emerald-400'
                          }`} />
                          <div>
                            <span className="font-mono font-bold text-cyan-400 hover:underline">{node.id}</span>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{node.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Zone */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-200">{node.zone}</span>
                        <div className="text-[10px] text-slate-500">{node.elevation}m ASL</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="capitalize font-mono text-[11px] text-slate-300">
                          {node.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                          isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                          isWarn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          isOff ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {node.status}
                        </span>
                      </td>

                      {/* Displacement */}
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={m.displacement > 40 ? 'text-red-400' : m.displacement > 15 ? 'text-amber-400' : 'text-slate-200'}>
                          {m.displacement} mm
                        </span>
                      </td>

                      {/* Tilt */}
                      <td className="py-3 px-3 font-mono text-purple-300">
                        {m.tiltAngle}°
                      </td>

                      {/* Battery */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5 font-mono">
                          <span className={node.battery < 25 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                            {node.battery}%
                          </span>
                          <span className="text-[10px] text-slate-500">({m.batteryVoltage}V)</span>
                        </div>
                      </td>

                      {/* Signal */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {node.signalRssi} dBm
                      </td>

                      {/* AI Risk Impact */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                node.aiRiskContribution > 75 ? 'bg-red-500' :
                                node.aiRiskContribution > 50 ? 'bg-amber-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${node.aiRiskContribution}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200">{node.aiRiskContribution}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => simulateNodeOffline(node.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 transition-colors"
                            title="Simulate Disconnect"
                          >
                            <WifiOff className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => simulateLowBattery(node.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-yellow-950/60 hover:text-yellow-400 text-slate-400 transition-colors"
                            title="Simulate Low Battery"
                          >
                            <Battery className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => triggerSensorAnomaly(node.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-purple-950/60 hover:text-purple-400 text-slate-400 transition-colors"
                            title="Simulate Ground Movement Spike"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => resetNode(node.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-400 text-slate-400 transition-colors"
                            title="Reset Node to Normal"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveNodeId(node.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-400 text-slate-400 transition-colors"
                            title="Inspect Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
