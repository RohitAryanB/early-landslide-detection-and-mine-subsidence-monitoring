import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  X,
  Radio,
  Battery,
  BatteryCharging,
  Wifi,
  Activity,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  MapPin,
  ShieldAlert,
  Wrench
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const NodeDetailDrawer: React.FC = () => {
  const {
    activeNodeId,
    setActiveNodeId,
    nodes,
    simulateNodeOffline,
    simulateLowBattery,
    triggerSensorAnomaly,
    resetNode,
    setActiveView,
    createMaintenanceTask
  } = useMine();

  if (!activeNodeId) return null;

  const node = nodes.find(n => n.id === activeNodeId);
  if (!node) return null;

  const m = node.measurements;
  const isOffline = node.status === 'offline';
  const isCrit = node.status === 'critical';
  const isWarn = node.status === 'warning';

  // Format historical data for mini spark chart
  const chartData = node.history.map((h, i) => ({
    time: `${24 - i}h ago`,
    displacement: h.displacement,
    porePressure: h.porePressure,
    tilt: h.tilt,
    moisture: h.soilMoisture
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-xl bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#141d33] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl border ${
                isCrit ? 'bg-red-950/60 border-red-500/50 text-red-400' :
                isWarn ? 'bg-amber-950/60 border-amber-500/50 text-amber-400' :
                isOffline ? 'bg-slate-800 border-slate-700 text-slate-400' :
                'bg-cyan-950/60 border-cyan-500/50 text-cyan-400'
              }`}>
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold text-white tracking-wide font-mono">
                    {node.id}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    isWarn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    isOffline ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {node.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-slate-300">{node.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-400">{node.zone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveNodeId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Status & Anomaly Banner if present */}
            {node.anomalyFlag && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 flex items-start space-x-2 text-red-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div>
                  <div className="font-bold text-xs">Automated Anomaly Alert</div>
                  <div className="text-[11px] text-red-300/90">{node.anomalyFlag}</div>
                </div>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Displacement</div>
                <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                  {m.displacement} <span className="text-xs font-normal text-slate-400">mm</span>
                </div>
                <div className="text-[9px] text-slate-500">Cumulative ground shift</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Tilt Angle</div>
                <div className="text-base font-bold font-mono text-purple-400 mt-0.5">
                  {m.tiltAngle}°
                </div>
                <div className="text-[9px] text-slate-500">Dual-axis inclination</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Crack Width</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {m.crackWidth} <span className="text-xs font-normal text-slate-400">mm</span>
                </div>
                <div className="text-[9px] text-slate-500">Extensometer fissure</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Pore Pressure</div>
                <div className="text-base font-bold font-mono text-blue-400 mt-0.5">
                  {m.porePressure} <span className="text-xs font-normal text-slate-400">kPa</span>
                </div>
                <div className="text-[9px] text-slate-500">Vibrating wire piezometer</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Soil Moisture</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  {m.soilMoisture}%
                </div>
                <div className="text-[9px] text-slate-500">Volumetric Water Content</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Vibration PPV</div>
                <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                  {m.vibration} <span className="text-xs font-normal text-slate-400">mm/s</span>
                </div>
                <div className="text-[9px] text-slate-500">Triaxial accelerometer</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Rainfall Rate</div>
                <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                  {m.rainfallRate} <span className="text-xs font-normal text-slate-400">mm/h</span>
                </div>
                <div className="text-[9px] text-slate-500">Tipping bucket gauge</div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-lg p-2.5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Ambient Temp</div>
                <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                  {m.temperature}°C
                </div>
                <div className="text-[9px] text-slate-500">Internal sensor cavity</div>
              </div>
            </div>

            {/* Historical Trend Chart */}
            <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  24-Hour Telemetry Trend (Displacement & Pore Pressure)
                </span>
                <span className="text-[10px] text-slate-500">Hourly Samples</span>
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="poreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#475569" fontSize={9} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="displacement" name="Displacement (mm)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#dispGrad)" />
                    <Area type="monotone" dataKey="porePressure" name="Pore Pressure (kPa)" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#poreGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hardware, Power & Wireless Mesh Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Battery Diagnostics */}
              <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    Power Subsystem
                  </span>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    node.battery < 20 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {node.battery}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      node.battery < 20 ? 'bg-red-500' : node.battery < 40 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${node.battery}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-400">
                  <div>Voltage: <span className="font-mono text-white font-semibold">{m.batteryVoltage}V</span></div>
                  <div>Solar Current: <span className="font-mono text-cyan-300 font-semibold">{m.solarChargingCurrent} mA</span></div>
                  <div>Health Score: <span className="font-mono text-emerald-400 font-semibold">{node.health}%</span></div>
                  <div>Power Mode: <span className="text-slate-300 font-medium">Adaptive Sleep</span></div>
                </div>
              </div>

              {/* LoRa Mesh Details */}
              <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    Wireless Mesh Link
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {node.parentGatewayId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>RSSI: <span className="font-mono text-white font-semibold">{node.signalRssi} dBm</span></div>
                  <div>SNR: <span className="font-mono text-cyan-300 font-semibold">{node.snr} dB</span></div>
                  <div>Packet Loss: <span className={`font-mono font-semibold ${node.packetLoss > 5 ? 'text-red-400' : 'text-emerald-400'}`}>{node.packetLoss}%</span></div>
                  <div>Latency: <span className="font-mono text-slate-300 font-semibold">{node.latency} ms</span></div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <span>Last heartbeat:</span>
                  <span className="text-slate-300 font-mono">{node.lastCommunication}</span>
                </div>
              </div>
            </div>

            {/* AI Risk Contribution */}
            <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">AI Hazard Risk Contribution</div>
                <div className="text-[11px] text-slate-400">Model feature weight in localized hazard cluster</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-extrabold font-mono ${
                  node.aiRiskContribution > 75 ? 'text-red-400' :
                  node.aiRiskContribution > 50 ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {node.aiRiskContribution}/100
                </div>
                <span className="text-[10px] text-slate-500">Impact Score</span>
              </div>
            </div>

            {/* Quick Demo Manipulation Actions on this Node */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simulate Node Actions (Demo)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => simulateNodeOffline(node.id)}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-left font-medium text-[11px] transition-all"
                >
                  Disconnect Node
                </button>
                <button
                  onClick={() => simulateLowBattery(node.id)}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-yellow-950/40 border border-slate-700 hover:border-yellow-500/40 text-slate-300 hover:text-yellow-300 text-left font-medium text-[11px] transition-all"
                >
                  Force Low Battery
                </button>
                <button
                  onClick={() => triggerSensorAnomaly(node.id)}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-950/40 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-left font-medium text-[11px] transition-all"
                >
                  Spike Displacement
                </button>
                <button
                  onClick={() => resetNode(node.id)}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-left font-medium text-[11px] transition-all flex items-center justify-between"
                >
                  <span>Reset Normal</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-[#141d33] flex items-center justify-between">
            <button
              onClick={() => {
                createMaintenanceTask({
                  title: `Physical Inspection & Diagnostic — ${node.id}`,
                  nodeId: node.id,
                  zone: node.zone,
                  priority: node.status === 'critical' ? 'critical' : 'medium',
                  assignedTechnician: 'Field Dispatch Team',
                  status: 'pending',
                  dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                  issueType: node.battery < 30 ? 'battery_replacement' : 'sensor_calibration',
                  notes: `Automated dispatch created from Node Drawer. Current status: ${node.status}.`
                });
                setActiveView('maintenance');
                setActiveNodeId(null);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Create Work Order</span>
            </button>

            <button
              onClick={() => {
                setActiveView('analytics');
                setActiveNodeId(null);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors"
            >
              <span>Open in Data Analytics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
