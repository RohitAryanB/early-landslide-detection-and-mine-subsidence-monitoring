import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import { X, Plus, Radio, MapPin, Battery, Cpu, Layers } from 'lucide-react';
import { NodeCategory, NodeStatus } from '../../types';

export const AddNodeModal: React.FC = () => {
  const {
    isAddNodeModalOpen,
    setIsAddNodeModalOpen,
    addNode,
    zones
  } = useMine();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<NodeCategory>('subsidence');
  const [zone, setZone] = useState('Zone B');
  const [posX, setPosX] = useState('10');
  const [posZ, setPosZ] = useState('-10');
  const [initialDisp, setInitialDisp] = useState('5.0');
  const [initialTilt, setInitialTilt] = useState('0.6');
  const [initialBattery, setInitialBattery] = useState('90');

  if (!isAddNodeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const zoneObj = zones.find(z => z.name === zone);
    const x = parseFloat(posX) || 0;
    const z = parseFloat(posZ) || 0;
    // Calculate simple y elevation from terrain function
    const y = Math.max(2, 4 + Math.sin(x * 0.05) * 4);

    const prefix = category === 'subsidence' ? 'NODE-SB' : category === 'slope' ? 'NODE-SL' : 'NODE-EN';
    const id = `${prefix}-${Math.floor(10 + Math.random() * 89)}`;

    addNode({
      id,
      name: name.trim() || `${zone} Precision Node ${id}`,
      category,
      zone,
      zoneName: zoneObj?.fullName || 'Mining Surface Monitoring Sector',
      status: 'normal',
      health: 98,
      battery: parseInt(initialBattery) || 90,
      signalRssi: -72,
      snr: 8.5,
      packetLoss: 0.2,
      latency: 52,
      position3D: [x, y, z],
      geoCoords: [22.3250 + (z * 0.0001), 82.6850 + (x * 0.0001)],
      elevation: Math.round(220 + y * 2),
      parentGatewayId: 'GW-ALPHA',
      aiRiskContribution: 25,
      measurements: {
        tiltAngle: parseFloat(initialTilt) || 0.5,
        vibration: 0.45,
        displacement: parseFloat(initialDisp) || 4.0,
        crackWidth: 0.5,
        soilMoisture: 24.5,
        porePressure: 10.2,
        rainfallRate: 2.0,
        temperature: 28.5,
        batteryVoltage: 4.10,
        batteryPercentage: parseInt(initialBattery) || 90,
        solarChargingCurrent: 260
      }
    });

    setIsAddNodeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#141d33] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Deploy New Simulated Sensor Node
              </h3>
              <p className="text-[11px] text-slate-400">Configure parameters & install to live 3D mesh network</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddNodeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Node Identifier / Friendly Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Panel 04 Rib Crown Extensometer"
              className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Monitoring Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NodeCategory)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="subsidence">Subsidence Monitoring</option>
                <option value="slope">Slope / Landslide Stability</option>
                <option value="environmental">Environmental Met Station</option>
                <option value="gateway_relay">Mesh Solar Relay Post</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Monitoring Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.name}>{z.name} — {z.fullName.split('(')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">3D Coordinate X (-60 to +60)</label>
              <input
                type="number"
                value={posX}
                onChange={(e) => setPosX(e.target.value)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">3D Coordinate Z (-60 to +60)</label>
              <input
                type="number"
                value={posZ}
                onChange={(e) => setPosZ(e.target.value)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Initial Disp (mm)</label>
              <input
                type="number"
                step="0.1"
                value={initialDisp}
                onChange={(e) => setInitialDisp(e.target.value)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tilt (°)</label>
              <input
                type="number"
                step="0.05"
                value={initialTilt}
                onChange={(e) => setInitialTilt(e.target.value)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Battery (%)</label>
              <input
                type="number"
                value={initialBattery}
                onChange={(e) => setInitialBattery(e.target.value)}
                className="w-full bg-[#141d33] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-[11px] text-cyan-300">
            Node will be automatically provisioned with LoRa telemetry encryption, assigned to the nearest Gateway Alpha/Beta, and will participate in dynamic AI risk scoring.
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddNodeModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors"
            >
              Deploy Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
