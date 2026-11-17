import React, { useState, useEffect } from 'react';
import { useMine } from '../../context/MineContext';
import {
  X,
  Cpu,
  Radio,
  Wifi,
  Terminal,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  ExternalLink,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { HardwareTelemetryPayload } from '../../types';

export const HardwareStreamModal: React.FC = () => {
  const {
    isHardwareModalOpen,
    setIsHardwareModalOpen,
    isHardwareConnected,
    connectWebSerial,
    disconnectWebSerial,
    ingestHardwareData,
    hardwareTelemetry,
    nodes,
    setActiveNodeId
  } = useMine();

  const [activeTab, setActiveTab] = useState<'serial' | 'tester' | 'wiring' | 'api'>('serial');
  const [copiedCode, setCopiedCode] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] MINEGUARD Hardware Gateway initialized.',
    '[READY] Listening on Web Serial API (115200 baud) and HTTP POST /api/telemetry.',
    '[INFO] Physical node ID: ESP32-HARDWARE-01 registered in 3D digital twin & sensor table.'
  ]);

  // Interactive Live Values Tester
  const [testPot, setTestPot] = useState<number>(1450);
  const [testVib, setTestVib] = useState<number>(0);
  const [testRain, setTestRain] = useState<number>(1);
  const [testSoil, setTestSoil] = useState<number>(2100);
  const [testBatt, setTestBatt] = useState<number>(3.95);
  const [testAccelZ, setTestAccelZ] = useState<number>(9.81);

  // Poll for HTTP /api/telemetry packets
  useEffect(() => {
    if (!isHardwareModalOpen) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          if (data && data.batteryV !== undefined) {
            ingestHardwareData(data);
            setConsoleLogs(prev => [
              `[HTTP INGEST] ${new Date().toLocaleTimeString()} - Batt: ${data.batteryV}V, Pot: ${data.slidePotVal}, Vib: ${data.vibration}`,
              ...prev.slice(0, 30)
            ]);
          }
        }
      } catch (e) {
        // quiet
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isHardwareModalOpen]);

  if (!isHardwareModalOpen) return null;

  const handleTestSend = () => {
    const payload: HardwareTelemetryPayload = {
      batteryV: testBatt,
      vibration: testVib,
      slidePotVal: testPot,
      soilAnalog: testSoil,
      rainDigital: testRain,
      rainAnalog: testRain === 0 ? 1200 : 3800,
      accelZ: testAccelZ,
      alert: (testVib === 1 || testRain === 0 || testPot > 2800) ? 1 : 0,
      source: 'manual_test',
      rawString: `BAT:${testBatt.toFixed(2)},VIB:${testVib},RAIN:${testRain},SOIL:${testSoil},POT:${testPot},AZ:${testAccelZ.toFixed(2)},ALERT:${(testVib === 1 || testRain === 0) ? 1 : 0}`
    };

    ingestHardwareData(payload);
    setConsoleLogs(prev => [
      `[INJECTED] ${new Date().toLocaleTimeString()}: ${payload.rawString}`,
      ...prev.slice(0, 30)
    ]);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(`python3 serial_bridge.py /dev/ttyUSB0`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div 
        className="w-full max-w-4xl bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#141d33] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Live ESP32 Hardware Integration Gateway
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isHardwareConnected 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 animate-pulse' 
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                }`}>
                  {isHardwareConnected ? 'LIVE USB LINK ACTIVE' : 'NODE ESP32-HARDWARE-01'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Display real sensor readings from your physical ESP32 node (OLED, MPU6050, Vibration, Slide Pot, Soil Moisture, Rain Plate, Battery).
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHardwareModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-[#141d33]/50 flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('serial')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'serial' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Web Serial & Terminal (1-Click USB)</span>
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'tester' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interactive Live Slider Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('wiring')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'wiring' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Pin Mapping & Code Protocol</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'api' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>WiFi HTTP API & Python Bridge</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: WEB SERIAL & LIVE TERMINAL */}
          {activeTab === 'serial' && (
            <div className="space-y-4">
              <div className="bg-[#141d33] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">Direct Web Serial Connection (Browser $\leftrightarrow$ ESP32)</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Plug your ESP32 into a USB port on this computer and click below. Chrome will prompt you to select the serial port (e.g. <span className="font-mono text-cyan-300">/dev/ttyUSB0</span> or <span className="font-mono text-cyan-300">COM3</span>).
                  </p>
                </div>

                {!isHardwareConnected ? (
                  <button
                    onClick={connectWebSerial}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center space-x-2 transition-colors shrink-0 shadow-lg shadow-cyan-950/40"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Connect ESP32 (USB Serial)</span>
                  </button>
                ) : (
                  <button
                    onClick={disconnectWebSerial}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-2 transition-colors shrink-0 shadow"
                  >
                    <span>Disconnect USB Port</span>
                  </button>
                )}
              </div>

              {/* Live Terminal Window */}
              <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ESP32 115200 Baud Real-Time Terminal Feed</span>
                  </span>
                  <span className="text-slate-500">Auto-parsers: LoRa string + Multi-line Serial</span>
                </div>

                <div className="h-52 overflow-y-auto space-y-1 text-slate-300 pr-2">
                  {consoleLogs.map((log, i) => (
                    <div key={i} className={log.includes('INJECTED') || log.includes('HTTP') ? 'text-cyan-300' : 'text-slate-400'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Status of ESP32-HARDWARE-01 */}
              <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Mapped Node in Digital Twin:</span>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="font-mono text-cyan-400">ESP32-HARDWARE-01</span>
                    <span className="text-slate-400 font-normal">(North Overburden Dump #3 Bench 2)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveNodeId('ESP32-HARDWARE-01');
                    setIsHardwareModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center space-x-1"
                >
                  <span>Inspect in Node Detail Drawer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE LIVE SLIDER TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl text-cyan-300 text-xs">
                💡 <strong>Test your real sensor readings right now!</strong> Adjust the sliders below matching what your ESP32 reads, or click <strong>"Push Live Packet"</strong> to see the 3D twin, dual AI risk score, and overview dashboard respond immediately!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slide Potentiometer (Extensometer / Displacement) */}
                <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-xs">Slide Potentiometer (Pin D35)</span>
                      <span className="text-[10px] text-slate-400 block">Measures Crack Width & Ground Displacement</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 text-sm">{testPot} ADC</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4095"
                    value={testPot}
                    onChange={(e) => setTestPot(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Displacement: {((testPot / 4095.0) * 50.0).toFixed(1)} mm</span>
                    <span>Crack: {((testPot / 4095.0) * 18.0).toFixed(1)} mm</span>
                  </div>
                </div>

                {/* Vibration Sensor */}
                <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-xs">Vibration Sensor (Pin D27)</span>
                      <span className="text-[10px] text-slate-400 block">Digital DO Shock / Tremor Sensor</span>
                    </div>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      testVib === 1 ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {testVib === 1 ? 'VIBRATION DETECTED (HIGH)' : 'STABLE (LOW)'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setTestVib(0)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        testVib === 0 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Stable (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestVib(1)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        testVib === 1 ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Trigger Tremor (1)
                    </button>
                  </div>
                </div>

                {/* Rain Sensor Plate */}
                <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-xs">Rain Detector (Pin D4 & D39)</span>
                      <span className="text-[10px] text-slate-400 block">Rain comparator plate (LOW = Rain)</span>
                    </div>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      testRain === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {testRain === 0 ? 'RAIN DETECTED' : 'DRY'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setTestRain(1)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        testRain === 1 ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Dry Plate (DO=1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestRain(0)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        testRain === 0 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Wet / Rain (DO=0)
                    </button>
                  </div>
                </div>

                {/* Soil Moisture Sensor */}
                <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-xs">Soil Moisture (Pin VP/GPIO36)</span>
                      <span className="text-[10px] text-slate-400 block">Analog AO (4095 dry $\rightarrow$ 1200 submerged)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{testSoil} AO</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="4095"
                    value={testSoil}
                    onChange={(e) => setTestSoil(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Moisture: {(((4095 - testSoil) / 3095.0) * 45.0 + 10.0).toFixed(1)}% VWC</span>
                    <span>Pore Pressure: {(((4095 - testSoil) / 3095.0) * 35.0 + 5.0).toFixed(1)} kPa</span>
                  </div>
                </div>

                {/* Battery Sensing */}
                <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-xs">Battery Sensing (Pin D34)</span>
                      <span className="text-[10px] text-slate-400 block">TP4056 + 100k/100k Divider</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">{testBatt.toFixed(2)} V</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="420"
                    value={Math.round(testBatt * 100)}
                    onChange={(e) => setTestBatt(parseInt(e.target.value) / 100)}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Battery Percentage: {Math.round(Math.min(100, Math.max(5, ((testBatt - 3.2) / 1.0) * 100)))}%</span>
                  </div>
                </div>

                {/* MPU6050 Accel */}
                <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-xs">MPU6050 Tilt / Accel (I2C D21/D22)</span>
                      <span className="text-[10px] text-slate-400 block">Z-Axis Gravitational Component</span>
                    </div>
                    <span className="font-mono font-bold text-purple-400 text-sm">{testAccelZ.toFixed(2)} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="1000"
                    value={Math.round(testAccelZ * 100)}
                    onChange={(e) => setTestAccelZ(parseInt(e.target.value) / 100)}
                    className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Computed Ground Tilt: {Math.abs(Math.atan2(Math.sqrt(Math.max(0, 96 - testAccelZ * testAccelZ)), testAccelZ) * 180 / Math.PI).toFixed(2)}°</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleTestSend}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center space-x-2 transition-colors shadow-lg"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Push Live Packet to MINEGUARD System</span>
              </button>
            </div>
          )}

          {/* TAB 3: WIRING PIN MAPPING */}
          {activeTab === 'wiring' && (
            <div className="space-y-4">
              <div className="text-slate-300 text-xs leading-relaxed">
                Here is the verified hardware pinout table matching your exact connections in <span className="font-mono text-cyan-300">mine_node_combined.ino</span>:
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl">
                  <thead className="bg-[#141d33] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Component / Sensor</th>
                      <th className="p-2.5">ESP32 Pin</th>
                      <th className="p-2.5">Wire / Signal</th>
                      <th className="p-2.5">MINEGUARD Geotechnical Mapping</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-bold text-white">Slide Potentiometer</td>
                      <td className="p-2.5 font-mono text-cyan-400">GPIO 35 (OTA)</td>
                      <td className="p-2.5 text-slate-300">Analog (0 - 4095)</td>
                      <td className="p-2.5 text-cyan-300">Crack Width (mm) & Surface Displacement</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">MPU6050 Gyro/Accel</td>
                      <td className="p-2.5 font-mono text-purple-400">GPIO 21 (SDA), 22 (SCL)</td>
                      <td className="p-2.5 text-slate-300">I2C Bus (shared with OLED)</td>
                      <td className="p-2.5 text-purple-300">Biaxial Ground & Slope Tilt Angle (°)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Vibration Sensor</td>
                      <td className="p-2.5 font-mono text-red-400">GPIO 27 (DO)</td>
                      <td className="p-2.5 text-slate-300">Digital (0 or 1)</td>
                      <td className="p-2.5 text-red-300">Ground Vibration PPV (mm/s) Tremor Trigger</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Soil Moisture Sensor</td>
                      <td className="p-2.5 font-mono text-emerald-400">GPIO 36 (VP / AO)</td>
                      <td className="p-2.5 text-slate-300">Analog (0 - 4095)</td>
                      <td className="p-2.5 text-emerald-300">Volumetric Water Content (% VWC)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Rain Detector Board</td>
                      <td className="p-2.5 font-mono text-blue-400">GPIO 4 (DO), 39 (VN / AO)</td>
                      <td className="p-2.5 text-slate-300">Digital & Analog</td>
                      <td className="p-2.5 text-blue-300">Rainfall Precipitation Intensity (mm/hr)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Battery Voltage Divider</td>
                      <td className="p-2.5 font-mono text-amber-400">GPIO 34 (ADC)</td>
                      <td className="p-2.5 text-slate-300">100kΩ + 100kΩ Divider</td>
                      <td className="p-2.5 text-amber-300">Real LiFePO4 / Li-ion Voltage & Battery %</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Buzzer & LEDs</td>
                      <td className="p-2.5 font-mono text-slate-400">GPIO 25, 26, 33</td>
                      <td className="p-2.5 text-slate-300">Actuators</td>
                      <td className="p-2.5 text-slate-400">Local Audible & Visual Hazard Alarms</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">SX1278 LoRa Ra-02</td>
                      <td className="p-2.5 font-mono text-cyan-400">GPIO 18, 19, 23, 5, 14, 2</td>
                      <td className="p-2.5 text-slate-300">SPI Bus (433 / 868 MHz)</td>
                      <td className="p-2.5 text-cyan-300">Long-range wireless packet transmission</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HTTP API & PYTHON BRIDGE */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="text-slate-300 text-xs">
                You can forward the ESP32 serial data to MINEGUARD using our included bridge script:
              </div>

              <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Terminal Command:</span>
                  <button
                    onClick={copyScript}
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-[11px]"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-cyan-300 bg-black/60 p-2.5 rounded-lg">
                  python3 serial_bridge.py /dev/ttyUSB0
                </div>
                <div className="text-[10px] text-slate-500">
                  (On Windows, use COM port: <span className="text-slate-400">python serial_bridge.py COM3</span>)
                </div>
              </div>

              <div className="bg-[#141d33] border border-slate-800 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-white text-xs">Direct HTTP REST Webhook:</span>
                <p className="text-slate-400 text-[11px]">
                  If your ESP32 has WiFi enabled or is connected to a WiFi/Ethernet gateway, it can send JSON directly:
                </p>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-[11px] text-slate-300">
                  POST http://localhost:5173/api/telemetry<br/>
                  Content-Type: application/json<br/><br/>
                  {JSON.stringify({
                    batteryV: 3.92,
                    vibration: 0,
                    slidePotVal: 1450,
                    soilAnalog: 2100,
                    rainDigital: 1,
                    accelZ: 9.81
                  }, null, 2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            Node: <span className="text-cyan-400 font-bold">ESP32-HARDWARE-01</span> • Status: <span className="text-emerald-400 font-bold">Active in 3D Scene</span>
          </div>
          <button
            onClick={() => setIsHardwareModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
