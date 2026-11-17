import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  CloudRain,
  Mountain,
  Layers,
  WifiOff,
  BatteryLow,
  Zap,
  CheckCircle,
  X,
  Gauge,
  Flame,
  Radio
} from 'lucide-react';
import { ScenarioPreset } from '../../types';

export const DemoControlModal: React.FC = () => {
  const {
    isDemoModalOpen,
    setIsDemoModalOpen,
    activeScenario,
    setScenario,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed,
    triggerHeavyRainfall,
    triggerSlopeInstability,
    triggerMineSubsidence,
    simulateNodeOffline,
    simulateLowBattery,
    triggerSensorAnomaly,
    restoreNormalConditions,
    resetAllDemo,
    nodes
  } = useMine();

  if (!isDemoModalOpen) return null;

  const scenarios: { id: ScenarioPreset; title: string; desc: string; icon: React.ElementType; color: string; badge: string }[] = [
    {
      id: 'normal',
      title: 'Scenario 1: Normal Operations',
      desc: 'All zones stable. Low displacement, nominal soil moisture, 98% mesh uptime, safe FoS > 1.8.',
      icon: CheckCircle,
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 text-emerald-300',
      badge: 'STABLE BASELINE'
    },
    {
      id: 'heavy_rainfall',
      title: 'Scenario 2: Heavy Monsoon Rainfall',
      desc: '45 mm/hr rain rate triggers pore-water pressure surge (>36 kPa) and crest shear creep on North OB Dump #3.',
      icon: CloudRain,
      color: 'border-blue-500/40 hover:border-blue-400 bg-blue-950/20 text-blue-300',
      badge: 'LANDSLIDE HAZARD'
    },
    {
      id: 'subsidence_event',
      title: 'Scenario 3: Active Mine Subsidence',
      desc: 'Longwall Panel 04 extraction depth -180m triggers 75mm settlement trough, 3.9° ground tilt and surface road tensile cracks.',
      icon: Layers,
      color: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/20 text-purple-300',
      badge: 'SUBSIDENCE HAZARD'
    },
    {
      id: 'network_battery_failure',
      title: 'Scenario 4: Network & Battery Degrade',
      desc: 'Dust occlusion and solar panel damage drops battery to 12%, causes packet drop and offline sensor nodes.',
      icon: WifiOff,
      color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20 text-amber-300',
      badge: 'TELEMETRY FAULT'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#141d33] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Simulation & Demo Control Center
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                  Interactive Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger real-time physical phenomena and observe instant system-wide cascade across 3D twin, AI models, and alerts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Simulation Loop State & Speed Controls */}
          <div className="bg-[#141d33] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                  isSimulating
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/50 hover:bg-amber-600/30'
                    : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-600/30'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-emerald-400" />}
                <span>{isSimulating ? 'Pause Simulation' : 'Start Simulation'}</span>
              </button>
              <div className="text-xs text-slate-400">
                Status: <span className={isSimulating ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {isSimulating ? 'Active Generating Telemetry' : 'Paused (Freeze-Frame)'}
                </span>
              </div>
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Speed:</span>
              {[1, 2, 5, 10].map(speed => (
                <button
                  key={speed}
                  onClick={() => setSimulationSpeed(speed)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    simulationSpeed === speed
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Preset Scenarios Section */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Preset Demonstrations</span>
              <span className="text-[11px] text-slate-500 font-normal">One-click complete environmental switch</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenarios.map(sc => {
                const Icon = sc.icon;
                const isSelected = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setScenario(sc.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `${sc.color} ring-1 ring-cyan-400 shadow-lg`
                        : 'border-slate-800 bg-[#141d33]/50 text-slate-300 hover:border-slate-700 hover:bg-[#141d33]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-bold text-white">{sc.title}</span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/40 font-semibold border border-white/10">
                          {sc.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {sc.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                        Active Scenario Running
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Event Injections */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Direct Physical & Telemetry Event Injection
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={triggerHeavyRainfall}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 hover:border-blue-500 text-blue-200 text-xs font-medium text-left transition-all"
              >
                <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Spike Rainfall</div>
                  <div className="text-[10px] text-blue-400">45 mm/hr monsoon</div>
                </div>
              </button>

              <button
                onClick={() => triggerSlopeInstability('Zone A')}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 hover:border-amber-500 text-amber-200 text-xs font-medium text-left transition-all"
              >
                <Mountain className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Slope Creep Slip</div>
                  <div className="text-[10px] text-amber-400">Zone A Overburden</div>
                </div>
              </button>

              <button
                onClick={() => triggerMineSubsidence('Zone B')}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 hover:border-purple-500 text-purple-200 text-xs font-medium text-left transition-all"
              >
                <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Deepen Trough</div>
                  <div className="text-[10px] text-purple-400">Zone B Panel 04</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const target = nodes.find(n => n.status !== 'offline') || nodes[0];
                  simulateNodeOffline(target.id);
                }}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 hover:border-red-500 text-red-200 text-xs font-medium text-left transition-all"
              >
                <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Drop Node Offline</div>
                  <div className="text-[10px] text-red-400">Simulate packet loss</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const target = nodes.find(n => n.battery > 50) || nodes[0];
                  simulateLowBattery(target.id);
                }}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-yellow-950/40 border border-yellow-800/40 hover:border-yellow-500 text-yellow-200 text-xs font-medium text-left transition-all"
              >
                <BatteryLow className="w-4 h-4 text-yellow-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Drain Battery</div>
                  <div className="text-[10px] text-yellow-400">Force &lt;15% level</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const target = nodes[0];
                  triggerSensorAnomaly(target.id);
                }}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-500 text-cyan-200 text-xs font-medium text-left transition-all"
              >
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Displacement Spike</div>
                  <div className="text-[10px] text-cyan-400">+45 mm sudden jump</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={resetAllDemo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Factory Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={restoreNormalConditions}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
            >
              Restore Normal Conditions
            </button>
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
