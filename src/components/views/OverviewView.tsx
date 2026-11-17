import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  Radio,
  Wifi,
  WifiOff,
  BatteryCharging,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  TrendingUp,
  Box,
  CloudRain,
  Activity,
  Layers,
  Mountain,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    nodes,
    alerts,
    aiRisk,
    maintenanceTasks,
    setActiveView,
    setActiveNodeId,
    navigateToFilteredNodes,
    setIsDemoModalOpen
  } = useMine();

  // Metrics
  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter(n => n.status !== 'offline').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;
  const maintenanceNeeded = nodes.filter(n => n.battery < 25 || n.maintenanceFlag || n.status === 'critical').length;
  const avgBattery = Math.round(nodes.reduce((acc, n) => acc + n.battery, 0) / (totalNodes || 1));
  const activeWarnings = alerts.filter(a => a.severity === 'moderate' || a.severity === 'high').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const systemHealth = Math.round((onlineNodes / (totalNodes || 1)) * 60 + (avgBattery / 100) * 25 + (1 - Math.min(1, criticalAlerts / 5)) * 15);

  const recentAlerts = alerts.slice(0, 4);
  const activeCriticalNodes = nodes.filter(n => n.status === 'critical' || n.status === 'warning').slice(0, 5);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / AI Site Summary */}
      <div className="bg-gradient-to-r from-[#141d33] via-slate-900 to-[#141d33] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  AI Early Warning System Briefing
                </span>
                <span className="text-xs text-slate-500">• Evaluated across 32 telemetry streams</span>
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-white mt-1">
                Kusmunda Colliery: Elevated Slope Creep & Panel 04 Subsidence Active
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Dual AI engines report critical shear acceleration on <span className="text-amber-400 font-semibold">North Overburden Dump #3</span> due to antecedent 74.5mm monsoon saturation, and active vertical trough settlement (+2.2mm/day) over <span className="text-purple-400 font-semibold">Longwall Panel 04 Seam IV</span>. Surface monitoring mesh is 96.9% online.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 self-end lg:self-center">
            <button
              onClick={() => setActiveView('ai_risk')}
              className="px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <span>Inspect AI Risk Engine</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('digital_twin')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D Twin</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Interactive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Nodes */}
        <div 
          onClick={() => setActiveView('nodes')}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Nodes</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-white mt-1.5">{totalNodes}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">5 Zones Mapped</div>
        </div>

        {/* Online Nodes */}
        <div 
          onClick={() => navigateToFilteredNodes({ status: 'normal' })}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Online Mesh</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1.5">{onlineNodes}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">{((onlineNodes / totalNodes) * 100).toFixed(0)}% Connected</div>
        </div>

        {/* Offline Nodes */}
        <div 
          onClick={() => navigateToFilteredNodes({ status: 'offline' })}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-red-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Offline Nodes</span>
            <WifiOff className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-xl font-extrabold font-mono mt-1.5 ${offlineNodes > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {offlineNodes}
          </div>
          <div className="text-[10px] text-red-400/80 mt-0.5">{offlineNodes > 0 ? 'Action Needed' : 'All Transmitting'}</div>
        </div>

        {/* Maintenance Needed */}
        <div 
          onClick={() => setActiveView('maintenance')}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Maint. Req.</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-amber-400 mt-1.5">{maintenanceNeeded}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Tasks Queued</div>
        </div>

        {/* Avg Battery */}
        <div 
          onClick={() => navigateToFilteredNodes({ lowBattery: true })}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Battery</span>
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-cyan-300 mt-1.5">{avgBattery}%</div>
          <div className="text-[10px] text-cyan-400/80 mt-0.5">Solar Recharged</div>
        </div>

        {/* Active Warnings */}
        <div 
          onClick={() => setActiveView('alerts')}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Warnings</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-amber-400 mt-1.5">{activeWarnings}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Moderate/High</div>
        </div>

        {/* Critical Alerts */}
        <div 
          onClick={() => setActiveView('alerts')}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-red-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Critical</span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className={`text-xl font-extrabold font-mono mt-1.5 ${criticalAlerts > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
            {criticalAlerts}
          </div>
          <div className="text-[10px] text-red-400/80 mt-0.5">Immediate Evac</div>
        </div>

        {/* Overall System Health */}
        <div 
          onClick={() => setActiveView('settings')}
          className="bg-[#141d33] hover:bg-[#1a2542] border border-slate-800 hover:border-emerald-500/40 p-3 rounded-xl transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sys Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-emerald-400 mt-1.5">{systemHealth}%</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Nominal Status</div>
        </div>
      </div>

      {/* DUAL RISK ENGINES DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mine Subsidence Risk Card */}
        <div className="bg-[#141d33] border border-purple-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white tracking-wide">Mine Subsidence Hazard</h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800/40">
                    DEEP STRATA
                  </span>
                </div>
                <p className="text-xs text-slate-400">Underground coal extraction & surface settlement basin</p>
              </div>
            </div>

            <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md font-mono ${
              aiRisk.subsidenceLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              aiRisk.subsidenceLevel === 'high' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
              aiRisk.subsidenceLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {aiRisk.subsidenceLevel} Risk
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Score</div>
              <div className="text-2xl font-extrabold font-mono text-purple-400 mt-0.5">
                {aiRisk.subsidenceScore}<span className="text-xs font-normal text-slate-500">/100</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Trough Velocity</div>
              <div className="text-sm font-bold text-white mt-1 capitalize font-mono text-amber-300">
                {aiRisk.subsidenceTrend.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Impacted Zones</div>
              <div className="text-xs font-bold text-cyan-300 mt-1">
                {aiRisk.subsidenceAffectedZones.length} Sectors
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-purple-950/20 border border-purple-900/40 rounded-xl p-3 leading-relaxed mb-4">
            <span className="font-semibold text-purple-300">Geotech Diagnostic: </span>
            {aiRisk.subsidenceExplanation}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Primary Seam: IV Longwall (-180m depth)</span>
            <button
              onClick={() => setActiveView('ai_risk')}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <span>Subsidence AI Intelligence</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Landslide Risk Card */}
        <div className="bg-[#141d33] border border-orange-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-400">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white tracking-wide">Slope & Landslide Hazard</h3>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 font-bold border border-orange-800/40">
                    SLOPE STABILITY
                  </span>
                </div>
                <p className="text-xs text-slate-400">Overburden dump benches, pore pressure & rainfall creep</p>
              </div>
            </div>

            <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md font-mono ${
              aiRisk.landslideLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
              aiRisk.landslideLevel === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
              aiRisk.landslideLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {aiRisk.landslideLevel} Risk
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Score</div>
              <div className="text-2xl font-extrabold font-mono text-orange-400 mt-0.5">
                {aiRisk.landslideScore}<span className="text-xs font-normal text-slate-500">/100</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Creep Dynamic</div>
              <div className="text-sm font-bold text-white mt-1 capitalize font-mono text-red-400">
                {aiRisk.landslideTrend.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Critical Slopes</div>
              <div className="text-xs font-bold text-cyan-300 mt-1">
                {aiRisk.landslideAffectedZones.length} Dumps
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-orange-950/20 border border-orange-900/40 rounded-xl p-3 leading-relaxed mb-4">
            <span className="font-semibold text-orange-300">Geotech Diagnostic: </span>
            {aiRisk.landslideExplanation}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Key Driver: Soil saturation (44.8% VWC) & Tension Fissure</span>
            <button
              onClick={() => setActiveView('ai_risk')}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1"
            >
              <span>Landslide AI Intelligence</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: 3D Twin Preview & Environmental / Rainfall Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Digital Twin Interactive Preview Card */}
        <div className="lg:col-span-2 bg-[#141d33] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 z-10">
            <div className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">3D Mine Digital Twin</h3>
                <p className="text-[11px] text-slate-400">Real-time geospatial mesh, underground seams & 32 sensor telemetry</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('digital_twin')}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Open Full 3D Viewport</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive 3D Mock Snapshot / Map View with Node markers */}
          <div 
            onClick={() => setActiveView('digital_twin')}
            className="h-56 bg-[#0b0f17] rounded-xl border border-slate-800 relative cursor-pointer overflow-hidden flex items-center justify-center group-hover:border-cyan-500/50 transition-colors"
          >
            {/* Visual topography grid background */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Elevation Contour Rings simulation */}
            <div className="absolute inset-4 border border-cyan-500/20 rounded-full opacity-40"></div>
            <div className="absolute inset-12 border border-purple-500/30 rounded-full opacity-40"></div>
            <div className="absolute inset-20 border border-orange-500/30 rounded-full opacity-40"></div>

            {/* Underground Panel Overlay Representation */}
            <div className="absolute w-44 h-24 bg-purple-950/40 border border-dashed border-purple-500/60 rounded flex items-center justify-center text-[10px] text-purple-300 font-mono">
              [Longwall Panel 04 -180m]
            </div>

            {/* Simulated Node Badges on map preview */}
            {nodes.slice(0, 10).map((n, idx) => (
              <div 
                key={n.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-1"
                style={{
                  left: `${45 + (n.position3D[0] * 0.45)}%`,
                  top: `${48 + (n.position3D[2] * 0.45)}%`
                }}
              >
                <span className={`w-2 h-2 rounded-full ring-2 ring-black ${
                  n.status === 'critical' ? 'bg-red-500 animate-ping' :
                  n.status === 'warning' ? 'bg-amber-400' :
                  'bg-cyan-400'
                }`} />
              </div>
            ))}

            <div className="z-10 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center space-x-2 group-hover:scale-105 transition-transform">
              <Box className="w-4 h-4 text-cyan-400" />
              <span>Click to Enter Full 3D Interactive Digital Twin Scene</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>Layers: Surface Terrain, Underground Seams, Inclinometers, Heatmap</span>
            <span className="font-mono text-cyan-400">Three.js WebGL Engine</span>
          </div>
        </div>

        {/* Rainfall & Met Environmental Status */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CloudRain className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Weather & Site Saturation</h3>
              </div>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/40">
                LIVE MET
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Rainfall Intensity</span>
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {Math.max(...nodes.map(n => n.measurements.rainfallRate)).toFixed(1)} mm/hr
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Heavy Precipitation Trigger Active</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">24h Cumulative Precipitation</span>
                  <span className="text-base font-bold font-mono text-blue-400">74.5 mm</span>
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5">Exceeds 60mm Landslide Threshold</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Avg Overburden Moisture</span>
                  <span className="text-base font-bold font-mono text-emerald-400">38.5% VWC</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Soil Shear Resistance Dropped 28%</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('gis')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Open GIS & Environmental Map</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Incidents & Live Sensor Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Alerts Widget */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Recent Incident Alerts</h3>
            </div>
            <button
              onClick={() => setActiveView('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>View All ({alerts.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => setActiveView('alerts')}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      alert.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-semibold text-white truncate max-w-[240px] sm:max-w-md">{alert.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-1">{alert.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">{alert.timestamp}</span>
                  <span className="text-[10px] text-cyan-400">{alert.zone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Anomalous Node Activity */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Active Node Watchlist</h3>
            </div>
            <button
              onClick={() => setActiveView('nodes')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>Manage All Nodes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {activeCriticalNodes.map(node => (
              <div
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-colors text-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    node.status === 'critical' ? 'bg-red-500 animate-pulse' :
                    node.status === 'warning' ? 'bg-amber-400' :
                    'bg-slate-500'
                  }`} />
                  <div>
                    <div className="font-bold text-white font-mono flex items-center gap-1.5">
                      <span>{node.id}</span>
                      <span className="text-slate-400 font-sans font-normal text-[11px] truncate max-w-[140px]">
                        ({node.name})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{node.zone} • Disp: <span className="text-cyan-400 font-semibold">{node.measurements.displacement}mm</span></div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-purple-400">{node.measurements.tiltAngle}° Tilt</span>
                  <span className="text-[10px] text-slate-500 block">Battery: {node.battery}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
