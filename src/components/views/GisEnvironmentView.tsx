import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Map,
  Compass,
  Layers,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  EyeOff,
  Navigation,
  Mountain,
  ChevronRight,
  Radio
} from 'lucide-react';

export const GisEnvironmentView: React.FC = () => {
  const {
    nodes,
    zones,
    siteConfig,
    aiRisk,
    setActiveNodeId,
    setActiveView
  } = useMine();

  const [selectedGisZone, setSelectedGisZone] = useState<string>('Zone A');
  const [overlays, setOverlays] = useState({
    subsidence: true,
    landslide: true,
    sensors: true,
    rainfall: true,
    contours: true,
    roads: true
  });

  const activeZoneObj = zones.find(z => z.name === selectedGisZone) || zones[0];
  const zoneNodes = nodes.filter(n => n.zone === selectedGisZone);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#141d33] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              GIS Geotechnical Map & Environmental Intelligence
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topographic contours, slope gradient analysis, InSAR interferogram layers, and meteorological telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Mine Coordinates:</span>
          <span className="text-cyan-300 font-bold bg-[#0f172a] px-2.5 py-1 rounded-lg border border-slate-700">
            {siteConfig.coordinates}
          </span>
        </div>
      </div>

      {/* Weather & Environmental Gauges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Precipitation Rate</div>
            <div className="text-lg font-extrabold font-mono text-blue-300">
              {Math.max(...nodes.map(n => n.measurements.rainfallRate)).toFixed(1)} <span className="text-xs font-normal">mm/hr</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Soil Moisture</div>
            <div className="text-lg font-extrabold font-mono text-emerald-300">
              34.8% <span className="text-xs font-normal">VWC</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ambient Temperature</div>
            <div className="text-lg font-extrabold font-mono text-amber-300">
              28.4°C
            </div>
          </div>
        </div>

        <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Wind Speed & Dir</div>
            <div className="text-lg font-extrabold font-mono text-cyan-300">
              14.2 km/h <span className="text-xs font-normal">SSW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Vector GIS Map & Sector Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Vector GIS Interactive Map Canvas (3 Cols) */}
        <div className="lg:col-span-3 bg-[#141d33] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <Map className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Topographic Sector Map & Overburden Bench Contours</h3>
            </div>

            {/* Overlay Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setOverlays(o => ({ ...o, contours: !o.contours }))}
                className={`px-2 py-1 rounded font-medium transition-all ${overlays.contours ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'}`}
              >
                Contours
              </button>
              <button
                onClick={() => setOverlays(o => ({ ...o, subsidence: !o.subsidence }))}
                className={`px-2 py-1 rounded font-medium transition-all ${overlays.subsidence ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-500'}`}
              >
                Subsidence Overlay
              </button>
              <button
                onClick={() => setOverlays(o => ({ ...o, landslide: !o.landslide }))}
                className={`px-2 py-1 rounded font-medium transition-all ${overlays.landslide ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'text-slate-500'}`}
              >
                Landslide Hazard
              </button>
              <button
                onClick={() => setOverlays(o => ({ ...o, sensors: !o.sensors }))}
                className={`px-2 py-1 rounded font-medium transition-all ${overlays.sensors ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-500'}`}
              >
                Sensors
              </button>
            </div>
          </div>

          {/* Interactive Vector SVG Mine Plan */}
          <div className="h-[420px] w-full bg-[#0b0f17] rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* Mine Boundary Outer Polygon */}
              <polygon
                points="80,60 720,40 760,440 60,460"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="6,4"
              />

              {/* Topographic Contour Lines */}
              {overlays.contours && (
                <g stroke="#334155" strokeWidth="1.2" fill="none" opacity="0.6">
                  {/* High Dump Contours */}
                  <ellipse cx="250" cy="140" rx="140" ry="80" />
                  <ellipse cx="250" cy="140" rx="105" ry="60" />
                  <ellipse cx="250" cy="140" rx="70" ry="40" stroke="#06b6d4" strokeWidth="1.5" />
                  <ellipse cx="250" cy="140" rx="35" ry="20" />
                  
                  {/* Pit Depression Contours */}
                  <ellipse cx="200" cy="340" rx="130" ry="70" strokeDasharray="3,3" />
                  <ellipse cx="200" cy="340" rx="90" ry="50" strokeDasharray="3,3" />
                  <ellipse cx="200" cy="340" rx="50" ry="30" strokeDasharray="3,3" />

                  {/* Tailings Embankment */}
                  <ellipse cx="620" cy="330" rx="110" ry="60" />
                  <ellipse cx="620" cy="330" rx="70" ry="38" />
                </g>
              )}

              {/* Haulage Access Roads */}
              {overlays.roads && (
                <g stroke="#64748b" strokeWidth="3" fill="none">
                  <path d="M 120,460 C 220,380 320,280 400,240 C 480,200 560,180 720,160" strokeDasharray="8,4" />
                  <path d="M 400,240 C 350,180 280,150 250,140" strokeDasharray="4,4" />
                </g>
              )}

              {/* Zone A: North Overburden Dump Hazard Polygon */}
              {overlays.landslide && (
                <g>
                  <polygon
                    points="150,80 380,80 360,200 130,190"
                    fill="rgba(249, 115, 22, 0.18)"
                    stroke="#f97316"
                    strokeWidth="2"
                    className="cursor-pointer hover:fill-orange-500/30 transition-all"
                    onClick={() => setSelectedGisZone('Zone A')}
                  />
                  <text x="200" y="115" fill="#fb923c" fontSize="12" fontWeight="bold">ZONE A: NORTH OB DUMP</text>
                  <text x="200" y="132" fill="#fed7aa" fontSize="10">High Shear Creep Risk</text>
                </g>
              )}

              {/* Zone B: Longwall Panel 04 Underground Projection Polygon */}
              {overlays.subsidence && (
                <g>
                  <polygon
                    points="420,120 620,110 650,260 440,270"
                    fill="rgba(139, 92, 246, 0.18)"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    className="cursor-pointer hover:fill-purple-500/30 transition-all"
                    onClick={() => setSelectedGisZone('Zone B')}
                  />
                  <text x="450" y="180" fill="#c084fc" fontSize="12" fontWeight="bold">ZONE B: PANEL 04 TROUGH</text>
                  <text x="450" y="196" fill="#e9d5ff" fontSize="10">Active Surface Subsidence</text>
                </g>
              )}

              {/* Zone C: West Pit Excavation Benches */}
              <g>
                <polygon
                  points="110,260 300,250 280,410 90,400"
                  fill="rgba(56, 189, 248, 0.12)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:fill-cyan-500/20 transition-all"
                  onClick={() => setSelectedGisZone('Zone C')}
                />
                <text x="130" y="325" fill="#38bdf8" fontSize="11" fontWeight="bold">ZONE C: WEST PIT BENCHES</text>
              </g>

              {/* Zone D: East Tailings Embankment */}
              <g>
                <polygon
                  points="540,270 730,260 750,420 560,425"
                  fill="rgba(245, 158, 11, 0.14)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:fill-amber-500/20 transition-all"
                  onClick={() => setSelectedGisZone('Zone D')}
                />
                <text x="580" y="340" fill="#fbbf24" fontSize="11" fontWeight="bold">ZONE D: TAILINGS DAM</text>
              </g>

              {/* Sensor Node Markers Overlay */}
              {overlays.sensors && nodes.map((n, idx) => {
                const cx = 400 + (n.position3D[0] * 4.5);
                const cy = 250 + (n.position3D[2] * 4.2);
                const isCrit = n.status === 'critical';
                const isWarn = n.status === 'warning';
                const fill = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';

                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onClick={() => setActiveNodeId(n.id)}
                  >
                    <circle cx={cx} cy={cy} r="5" fill={fill} stroke="#0f172a" strokeWidth="1.5" />
                    {isCrit && <circle cx={cx} cy={cy} r="10" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" className="animate-ping" />}
                    <text x={cx + 8} y={cy + 3} fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                      {n.id.split('-').slice(1).join('-')}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
            <span>Projection: UTM Zone 44N (WGS 84) • Grid Resolution: 5m DEM</span>
            <button
              onClick={() => setActiveView('digital_twin')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Open in 3D Digital Twin View
            </button>
          </div>
        </div>

        {/* Right 1 Col: Selected Sector Diagnostics */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Active Geotechnical Sector
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {activeZoneObj.fullName}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/40">
              {activeZoneObj.area} Surface Coverage
            </span>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Sector Hazard Focus</div>
                <div className="text-sm font-bold text-white capitalize mt-0.5">
                  {activeZoneObj.riskFocus} Monitoring
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Active Transducers Installed</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">
                  {zoneNodes.length} Sensor Nodes Online
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Max Displacement in Sector</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5 font-mono">
                  {Math.max(...zoneNodes.map(n => n.measurements.displacement), 0)} mm
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sector Nodes</div>
              <div className="flex flex-wrap gap-1.5">
                {zoneNodes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setActiveNodeId(n.id)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-mono text-cyan-300"
                  >
                    {n.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('nodes')}
            className="w-full mt-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors"
          >
            Manage Sector Nodes
          </button>
        </div>
      </div>
    </div>
  );
};
