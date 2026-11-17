import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Network,
  Radio,
  Wifi,
  WifiOff,
  Signal,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Server,
  Activity,
  ArrowRight
} from 'lucide-react';
import { SensorNode } from '../../types';

export const NetworkTopologyView: React.FC = () => {
  const {
    nodes,
    simulateNodeOffline,
    resetNode,
    setActiveNodeId
  } = useMine();

  const [selectedTopologyNode, setSelectedTopologyNode] = useState<SensorNode | null>(nodes[0] || null);

  const gateways = nodes.filter(n => n.category === 'gateway_relay');
  const sensorNodes = nodes.filter(n => n.category !== 'gateway_relay');

  const onlineCount = nodes.filter(n => n.status !== 'offline').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline');
  const weakNodes = nodes.filter(n => n.status !== 'offline' && (n.signalRssi < -90 || n.packetLoss > 4));

  const avgLatency = Math.round(
    nodes.filter(n => n.status !== 'offline').reduce((a, b) => a + b.latency, 0) / (onlineCount || 1)
  );

  const avgPacketLoss = +(
    nodes.filter(n => n.status !== 'offline').reduce((a, b) => a + b.packetLoss, 0) / (onlineCount || 1)
  ).toFixed(2);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-[#141d33] border border-cyan-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              LoRa Wireless Sensor Mesh Network Topology
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Distributed star-of-stars / wireless mesh telemetry architecture, gateway uplink backbones, and radio frequency diagnostics.
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500 text-[10px] block">UPTIME</span>
            <span className="text-emerald-400 font-bold">98.8%</span>
          </div>
          <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500 text-[10px] block">AVG LATENCY</span>
            <span className="text-cyan-400 font-bold">{avgLatency} ms</span>
          </div>
          <div className="bg-[#0f172a] border border-slate-700 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500 text-[10px] block">PACKET LOSS</span>
            <span className={avgPacketLoss > 3 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {avgPacketLoss}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Topology Map & Sidebar Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Interactive Visual Mesh Diagram */}
        <div className="lg:col-span-2 bg-[#141d33] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase text-slate-300">
              LoRaWAN 868 / 865 MHz Topology Graph
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Strong (&gt; -80dBm)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Moderate
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> Degraded
              </span>
            </div>
          </div>

          {/* SVG / Interactive Diagram Area */}
          <div className="h-96 w-full bg-[#0b0f17] rounded-xl border border-slate-800 relative overflow-hidden p-4 flex flex-col justify-between">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]"></div>

            {/* Fiber Backbone Base Station at Top */}
            <div className="flex justify-center z-10">
              <div className="bg-[#141d33] border border-cyan-500/50 rounded-xl px-4 py-2 flex items-center space-x-2 shadow-lg">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono">MINE CONTROL ROOM FIBER BACKBONE</span>
              </div>
            </div>

            {/* Gateway Tier (Mid-Upper) */}
            <div className="grid grid-cols-2 gap-8 z-10 max-w-lg mx-auto w-full">
              {gateways.slice(0, 2).map(gw => (
                <div
                  key={gw.id}
                  onClick={() => setSelectedTopologyNode(gw)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTopologyNode?.id === gw.id
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50'
                      : 'bg-[#141d33] border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <div>
                      <div className="font-bold text-white font-mono text-xs">{gw.id}</div>
                      <div className="text-[10px] text-slate-400">{gw.name}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-400 font-mono flex justify-between">
                    <span>RSSI: {gw.signalRssi} dBm</span>
                    <span>SNR: {gw.snr} dB</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mesh Relays Tier */}
            <div className="grid grid-cols-2 gap-8 z-10 max-w-sm mx-auto w-full">
              {gateways.slice(2, 4).map(relay => (
                <div
                  key={relay.id}
                  onClick={() => setSelectedTopologyNode(relay)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTopologyNode?.id === relay.id
                      ? 'bg-cyan-950/60 border-cyan-400'
                      : 'bg-[#141d33] border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Radio className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-white font-mono text-xs">{relay.id}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">Solar Mesh Relay</div>
                </div>
              ))}
            </div>

            {/* Sensor Nodes Cluster Grid */}
            <div className="z-10 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex justify-between">
                <span>Distributed Edge Transducer Nodes ({sensorNodes.length})</span>
                <span className="text-cyan-400">Click node icon to inspect RF link</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-11 gap-2">
                {sensorNodes.map(n => {
                  const isOff = n.status === 'offline';
                  const isDegraded = n.signalRssi < -92 || n.packetLoss > 4;
                  const isSelected = selectedTopologyNode?.id === n.id;

                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelectedTopologyNode(n)}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-cyan-500 text-black border-white font-bold shadow-md'
                          : isOff
                          ? 'bg-slate-800/80 border-slate-700 text-slate-500'
                          : isDegraded
                          ? 'bg-red-950/40 border-red-500/50 text-red-400'
                          : 'bg-[#141d33] border-slate-700 text-slate-300 hover:border-cyan-500'
                      }`}
                      title={`${n.id} (${n.signalRssi} dBm, Loss: ${n.packetLoss}%)`}
                    >
                      <div className="text-[9px] font-mono leading-none truncate">{n.id.split('-').slice(1).join('-')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Topology Node Telemetry Inspector */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Signal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">RF & Link Diagnostics</h3>
              </div>
              {selectedTopologyNode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/40">
                  {selectedTopologyNode.id}
                </span>
              )}
            </div>

            {selectedTopologyNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedTopologyNode.name}</h4>
                  <p className="text-[11px] text-slate-400">{selectedTopologyNode.zone} • {selectedTopologyNode.zoneName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Signal (RSSI)</div>
                    <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                      {selectedTopologyNode.signalRssi} dBm
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">SNR Quality</div>
                    <div className="text-base font-bold font-mono text-purple-400 mt-0.5">
                      {selectedTopologyNode.snr} dB
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Packet Loss Rate</div>
                    <div className={`text-base font-bold font-mono mt-0.5 ${
                      selectedTopologyNode.packetLoss > 5 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {selectedTopologyNode.packetLoss}%
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Mesh Latency</div>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {selectedTopologyNode.latency} ms
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parent Gateway / Relay:</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedTopologyNode.parentGatewayId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Telemetry Packet:</span>
                    <span className="font-mono text-slate-300">{selectedTopologyNode.lastCommunication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Battery Status:</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedTopologyNode.battery}% ({selectedTopologyNode.measurements.batteryVoltage}V)</span>
                  </div>
                </div>

                {/* RF Simulation Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Simulate RF Fault</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => simulateNodeOffline(selectedTopologyNode.id)}
                      className="flex-1 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 hover:border-red-500 text-red-300 text-xs font-semibold transition-colors"
                    >
                      Disconnect Node
                    </button>
                    <button
                      onClick={() => resetNode(selectedTopologyNode.id)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      Restore Link
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select any node or gateway on the map to inspect RF link.
              </div>
            )}
          </div>

          {selectedTopologyNode && (
            <button
              onClick={() => setActiveNodeId(selectedTopologyNode.id)}
              className="w-full mt-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Inspect Full Node Transducers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Weak & Disconnected Devices Summary Table */}
      <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">
          Weak Wireless Links & Disconnected Devices Watchlist ({offlineNodes.length + weakNodes.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {offlineNodes.map(n => (
            <div key={n.id} className="p-3 bg-red-950/20 border border-red-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-white">{n.id}</span>
                  <div className="text-[10px] text-red-300">Heartbeat Lost ({n.lastCommunication})</div>
                </div>
              </div>
              <button
                onClick={() => resetNode(n.id)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
              >
                Reconnect
              </button>
            </div>
          ))}

          {weakNodes.map(n => (
            <div key={n.id} className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-mono font-bold text-white">{n.id}</span>
                  <div className="text-[10px] text-amber-300">Weak RSSI: {n.signalRssi} dBm (Packet loss: {n.packetLoss}%)</div>
                </div>
              </div>
              <button
                onClick={() => setActiveNodeId(n.id)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
