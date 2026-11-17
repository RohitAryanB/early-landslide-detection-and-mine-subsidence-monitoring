import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Settings,
  Sliders,
  Shield,
  User,
  RotateCcw,
  CheckCircle2,
  Save,
  Radio,
  SlidersHorizontal,
  BellRing,
  Globe
} from 'lucide-react';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    siteConfig,
    setSiteConfig,
    currentUser,
    setUserRole,
    resetAllDemo,
    activeScenario,
    setScenario,
    simulationSpeed,
    setSimulationSpeed
  } = useMine();

  const [mineName, setMineName] = useState(siteConfig.mineName);
  const [location, setLocation] = useState(siteConfig.location);
  const [coords, setCoords] = useState(siteConfig.coordinates);
  const [savedToast, setSavedToast] = useState(false);

  // Thresholds state
  const [dispThreshold, setDispThreshold] = useState('50');
  const [tiltThreshold, setTiltThreshold] = useState('2.5');
  const [poreThreshold, setPoreThreshold] = useState('35');
  const [rainThreshold, setRainThreshold] = useState('30');
  const [batThreshold, setBatThreshold] = useState('25');

  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteConfig({
      ...siteConfig,
      mineName,
      location,
      coordinates: coords
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const roles: { role: UserRole; name: string; title: string; perms: string[] }[] = [
    {
      role: 'admin',
      name: 'System Administrator',
      title: 'Dr. Vikram Seth',
      perms: ['Full System Configuration', 'Sensor Calibration Overrides', 'Node Provisioning', 'Firmware Flashing', 'Security Audits']
    },
    {
      role: 'mine_manager',
      name: 'Mine Operations Manager',
      title: 'Rajesh K. Singhania',
      perms: ['Full Operations Dashboard', 'Haulage Stoppage Authority', '3D Digital Twin Command', 'Daily Production Reports']
    },
    {
      role: 'safety_officer',
      name: 'Safety & Geotechnical Inspector',
      title: 'Pooja Narayanan',
      perms: ['Emergency Incident Triage', 'Cordon Evacuation Perimeter', 'Hazard Escalation', 'Acknowledge Incidents']
    },
    {
      role: 'field_technician',
      name: 'Field Instrumentation Tech',
      title: 'Amitav Das',
      perms: ['Manage Maintenance Tasks', 'Battery Pack Swaps', 'Solar Photovoltaic Clean', 'Radio Antennas']
    },
    {
      role: 'analyst',
      name: 'Geotech Data Scientist',
      title: 'Sunita Rao',
      perms: ['InSAR Correlation Models', 'Kinematic Rate-of-Change Analysis', 'Raw CSV Export', 'AI Feature Weights']
    },
    {
      role: 'viewer',
      name: 'External Auditor / Guest',
      title: 'Observer Guest',
      perms: ['Read-Only Viewport', 'View Live Metrics', 'Inspect 3D Twin']
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#141d33] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              System Settings & Role-Based Access Control (RBAC)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure colliery parameters, geotechnical hazard alarm thresholds, and switch simulated operator roles.
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings Persisted Successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Site & Seams Configuration Form */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Mine Site Configuration</h3>
          </div>

          <form onSubmit={handleSaveSiteConfig} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mine / Colliery Name</label>
              <input
                type="text"
                value={mineName}
                onChange={(e) => setMineName(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Geographic Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">GPS Coordinates (WGS84)</label>
              <input
                type="text"
                value={coords}
                onChange={(e) => setCoords(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div>Active Seams: <span className="text-cyan-300 font-bold">{siteConfig.activeSeams.join(', ')}</span></div>
              <div>Monitored Surface Area: <span className="text-purple-300 font-bold">{siteConfig.totalAreaHectares} Hectares</span></div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Persist Site Profile</span>
            </button>
          </form>
        </div>

        {/* Alarm Thresholds Configuration */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BellRing className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Geotechnical Alert Thresholds</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Displacement Critical Threshold</span>
                <span className="text-[10px] text-slate-400 block">Triggers high subsidence / landslide alert</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={dispThreshold}
                  onChange={(e) => setDispThreshold(e.target.value)}
                  className="w-16 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-right font-mono text-cyan-300"
                />
                <span className="text-slate-400 font-mono">mm</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Ground Tilt Angle Limit</span>
                <span className="text-[10px] text-slate-400 block">Maximum slope flexure / panel trough tilt</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.1"
                  value={tiltThreshold}
                  onChange={(e) => setTiltThreshold(e.target.value)}
                  className="w-16 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-right font-mono text-purple-300"
                />
                <span className="text-slate-400 font-mono">°</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Pore-Water Pressure High Alarm</span>
                <span className="text-[10px] text-slate-400 block">Critical slope saturation limit</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={poreThreshold}
                  onChange={(e) => setPoreThreshold(e.target.value)}
                  className="w-16 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-right font-mono text-blue-300"
                />
                <span className="text-slate-400 font-mono">kPa</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Monsoon Rain Rate Trigger</span>
                <span className="text-[10px] text-slate-400 block">Automated rainfall warning alert threshold</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={rainThreshold}
                  onChange={(e) => setRainThreshold(e.target.value)}
                  className="w-16 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-right font-mono text-cyan-300"
                />
                <span className="text-slate-400 font-mono">mm/h</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Low Battery Warning</span>
                <span className="text-[10px] text-slate-400 block">Generates automated field maintenance work order</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={batThreshold}
                  onChange={(e) => setBatThreshold(e.target.value)}
                  className="w-16 bg-[#0f172a] border border-slate-700 rounded-lg p-1.5 text-right font-mono text-yellow-300"
                />
                <span className="text-slate-400 font-mono">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Switcher & Perms */}
      <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Demonstrate Role-Based Access Control (RBAC)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Active Role: <span className="font-semibold text-cyan-400 capitalize">{currentUser.role.replace(/_/g, ' ')}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {roles.map(({ role, name, title, perms }) => {
            const isActive = currentUser.role === role;
            return (
              <div
                key={role}
                onClick={() => setUserRole(role)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-sm">{name}</span>
                    {isActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500 text-black">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-medium mb-3">{title}</div>

                  <div className="space-y-1 text-[11px] text-slate-400">
                    {perms.map((p, i) => (
                      <div key={i} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserRole(role);
                  }}
                  className={`mt-4 w-full py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                    isActive ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isActive ? 'Logged In As This Role' : 'Switch to this Role'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-red-300">Reset Demo Environment</h4>
          <p className="text-xs text-red-300/80 mt-0.5">
            Clear all browser localStorage persistence, wipe added demo nodes and custom notes, and restore baseline colliery telemetry.
          </p>
        </div>
        <button
          onClick={resetAllDemo}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shrink-0 shadow"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>
    </div>
  );
};
