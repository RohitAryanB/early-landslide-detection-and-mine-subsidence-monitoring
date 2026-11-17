import React from 'react';
import { useMine, ViewType } from '../../context/MineContext';
import {
  LayoutDashboard,
  Box,
  Radio,
  BrainCircuit,
  LineChart,
  Network,
  AlertOctagon,
  Map,
  Wrench,
  FileText,
  Settings,
  ShieldCheck,
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    nodes,
    alerts,
    maintenanceTasks,
    aiRisk,
    resetAllDemo
  } = useMine();

  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const pendingTasksCount = maintenanceTasks.filter(t => t.status !== 'completed').length;

  const navItems: { id: ViewType; label: string; icon: React.ElementType; badge?: string; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'digital_twin', label: '3D Digital Twin', icon: Box, badge: '3D TWIN', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
    { id: 'nodes', label: 'Sensor Nodes', icon: Radio, badge: `${nodes.length}`, badgeColor: 'bg-slate-800 text-slate-300' },
    { id: 'ai_risk', label: 'AI Risk Intelligence', icon: BrainCircuit, badge: 'DUAL AI', badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    { id: 'analytics', label: 'Data Analytics', icon: LineChart },
    { id: 'network', label: 'Network Topology', icon: Network },
    { 
      id: 'alerts', 
      label: 'Alerts & Incidents', 
      icon: AlertOctagon, 
      badge: criticalAlertsCount > 0 ? `${criticalAlertsCount} CRIT` : `${alerts.filter(a => a.status === 'active').length}`,
      badgeColor: criticalAlertsCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'
    },
    { id: 'gis', label: 'GIS & Environment', icon: Map },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench, 
      badge: `${pendingTasksCount}`, 
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
    },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-950/50">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-wider text-white flex items-center gap-1.5">
                <span>MINEGUARD</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-semibold border border-cyan-800/40">
                  v2.4
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-tight">
                AI Subsidence & Landslide Early Warning
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1 tracking-wider">
            Control Room Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Status Widget */}
      <div className="p-3 border-t border-slate-800 bg-[#0b0f17]/60 space-y-2.5">
        <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Dual Risk Status</span>
            <span className="text-[10px] font-mono text-cyan-400">Live AI Eval</span>
          </div>

          <div className="space-y-1.5">
            {/* Subsidence mini gauge */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  Subsidence
                </span>
                <span className="font-mono font-bold text-slate-200">{aiRisk.subsidenceScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    aiRisk.subsidenceScore > 75 ? 'bg-red-500' : aiRisk.subsidenceScore > 50 ? 'bg-amber-400' : 'bg-purple-400'
                  }`}
                  style={{ width: `${aiRisk.subsidenceScore}%` }}
                />
              </div>
            </div>

            {/* Landslide mini gauge */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  Landslide
                </span>
                <span className="font-mono font-bold text-slate-200">{aiRisk.landslideScore}/100</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    aiRisk.landslideScore > 75 ? 'bg-red-500' : aiRisk.landslideScore > 50 ? 'bg-amber-400' : 'bg-orange-400'
                  }`}
                  style={{ width: `${aiRisk.landslideScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reset Demo button */}
        <button
          onClick={resetAllDemo}
          className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-700/60 transition-colors"
          title="Reset all demo states and restore defaults"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Demo Defaults</span>
        </button>
      </div>
    </aside>
  );
};
