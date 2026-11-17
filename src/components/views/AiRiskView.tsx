import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  BrainCircuit,
  Layers,
  Mountain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AiRiskView: React.FC = () => {
  const {
    nodes,
    aiRisk,
    activeScenario,
    siteConfig,
    alerts
  } = useMine();

  const [activeEngine, setActiveEngine] = useState<'subsidence' | 'landslide'>('subsidence');
  const [selectedForecastHorizon, setSelectedForecastHorizon] = useState<string>('+6 Hours');
  const [expandedExplanation, setExpandedExplanation] = useState<boolean>(true);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string; timestamp: string }[]>([
    {
      sender: 'assistant',
      text: `Hello! I am MINEGUARD Geotechnical AI Assistant. I continuously evaluate telemetry from ${nodes.length} wireless sensors across ${siteConfig.mineName}. You can ask me about current subsidence, slope creep, battery diagnostics, or select a predefined query below.`,
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Predefined prompts
  const quickQuestions = [
    'Why is Zone B showing elevated risk?',
    'Which node has the highest displacement?',
    'Which nodes have low battery?',
    'Which area has the highest subsidence risk?',
    'What abnormal readings were recorded today?',
    'Generate a mine safety summary.'
  ];

  const handleAskQuestion = (q: string) => {
    if (!q.trim()) return;
    const userMsg = { sender: 'user' as const, text: q, timestamp: 'Just now' };
    
    // Context-aware response generation based on live app state!
    let responseText = '';
    const qLower = q.toLowerCase();

    if (qLower.includes('zone b') || (qLower.includes('subsidence') && qLower.includes('why'))) {
      const bNodes = nodes.filter(n => n.zone === 'Zone B');
      const maxDispNode = bNodes.reduce((max, n) => n.measurements.displacement > max.measurements.displacement ? n : max, bNodes[0]);
      responseText = `Zone B (Longwall Panel 04 Surface) has an elevated Subsidence Risk Score of ${aiRisk.subsidenceScore}/100. Key driver is active coal seam extraction at depth -180m. Node ${maxDispNode.id} recorded ${maxDispNode.measurements.displacement}mm downward displacement and ${maxDispNode.measurements.tiltAngle}° surface tilt. The inflection point has produced surface tensile cracks up to ${maxDispNode.measurements.crackWidth}mm.`;
    } else if (qLower.includes('highest displacement')) {
      const highest = [...nodes].sort((a, b) => b.measurements.displacement - a.measurements.displacement)[0];
      responseText = `The node with the highest cumulative displacement is ${highest.id} (${highest.name}) in ${highest.zone} with ${highest.measurements.displacement} mm of displacement, tilt angle of ${highest.measurements.tiltAngle}°, and crack width of ${highest.measurements.crackWidth} mm. Current status: ${highest.status.toUpperCase()}.`;
    } else if (qLower.includes('low battery') || qLower.includes('battery')) {
      const lowBatNodes = nodes.filter(n => n.battery < 30);
      if (lowBatNodes.length > 0) {
        responseText = `There are ${lowBatNodes.length} nodes with low battery (<30%): ${lowBatNodes.map(n => `${n.id} (${n.battery}%, ${n.zone})`).join(', ')}. Solar panel cleaning and LiFePO4 pack inspection are recommended.`;
      } else {
        responseText = `All active nodes currently have adequate battery reserves. Average battery level across the network is ${Math.round(nodes.reduce((a, b) => a + b.battery, 0) / nodes.length)}%.`;
      }
    } else if (qLower.includes('abnormal') || qLower.includes('anomalies')) {
      const anomalyNodes = nodes.filter(n => n.anomalyFlag || n.status === 'critical');
      responseText = `Currently ${anomalyNodes.length} nodes have flagged abnormal geotechnical readings: ${anomalyNodes.map(n => `${n.id} (${n.anomalyFlag || 'Critical thresholds exceeded'})`).join('; ')}.`;
    } else if (qLower.includes('safety summary') || qLower.includes('summary')) {
      responseText = `MINEGUARD SAFETY BRIEFING — ${siteConfig.mineName}:
• Overall Strata Subsidence Risk: ${aiRisk.subsidenceScore}/100 (${aiRisk.subsidenceLevel.toUpperCase()})
• Overburden Slope Landslide Risk: ${aiRisk.landslideScore}/100 (${aiRisk.landslideLevel.toUpperCase()})
• Active Critical Incidents: ${alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
• Mesh Network Health: ${((nodes.filter(n => n.status !== 'offline').length / nodes.length) * 100).toFixed(0)}%
• Operator Action: Maintain exclusion perimeter on North Dump #3 and reduce haul road speed limits over Panel 04.`;
    } else {
      responseText = `Analysis across live telemetry: Mine Subsidence Risk is ${aiRisk.subsidenceScore}/100 (${aiRisk.subsidenceLevel}) and Landslide Risk is ${aiRisk.landslideScore}/100 (${aiRisk.landslideLevel}). Model confidence index is 91.4% with 32 synchronized nodes transmitting.`;
    }

    const assistantMsg = {
      sender: 'assistant' as const,
      text: responseText,
      timestamp: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg, assistantMsg]);
    setInputQuery('');
  };

  const currentForecast = activeEngine === 'subsidence' ? aiRisk.subsidenceForecast : aiRisk.landslideForecast;
  const currentFactors = activeEngine === 'subsidence' ? aiRisk.subsidenceContributingFactors : aiRisk.landslideContributingFactors;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-[#141d33] border border-purple-500/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              AI Risk Intelligence & Predictive Analytics Centre
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Dual continuous machine learning models analyzing spatial strain gradients, rainfall-induced pore saturation, and inverse velocity creep kinetics.
          </p>
        </div>

        {/* Engine Switcher Tabs */}
        <div className="flex items-center space-x-1.5 p-1 bg-[#0f172a] rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveEngine('subsidence')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeEngine === 'subsidence'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Subsidence Model (Panel 04)</span>
          </button>
          <button
            onClick={() => setActiveEngine('landslide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeEngine === 'landslide'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mountain className="w-4 h-4" />
            <span>Landslide Model (Dump #3)</span>
          </button>
        </div>
      </div>

      {/* Primary Risk Assessment & Forecast Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Detailed Model Diagnostics & Explainability */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Risk Status Card */}
          <div className={`p-5 rounded-2xl border bg-[#141d33] ${
            activeEngine === 'subsidence' ? 'border-purple-500/40' : 'border-orange-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {activeEngine === 'subsidence' ? 'Underground Extraction Strata Model' : 'Slope Stability & Saturation Model'}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {activeEngine === 'subsidence' ? 'Surface Subsidence Hazard Assessment' : 'Overburden Landslide Hazard Assessment'}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-lg ${
                  (activeEngine === 'subsidence' ? aiRisk.subsidenceLevel : aiRisk.landslideLevel) === 'critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {activeEngine === 'subsidence' ? aiRisk.subsidenceLevel : aiRisk.landslideLevel} Severity
                </span>
                <span className="text-2xl font-extrabold font-mono text-white">
                  {activeEngine === 'subsidence' ? aiRisk.subsidenceScore : aiRisk.landslideScore}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </span>
              </div>
            </div>

            {/* Explainable AI Narrative Panel */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 mb-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedExplanation(!expandedExplanation)}
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Explainable AI (XAI) Reasoning & Root-Cause Attribution</span>
                </div>
                {expandedExplanation ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {expandedExplanation && (
                <div className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  <p className="mb-2">
                    {activeEngine === 'subsidence' ? aiRisk.subsidenceExplanation : aiRisk.landslideExplanation}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>InSAR ground correlation: Coherent fringes indicate 2.4 mm/week baseline settlement.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Contributing Sensor Factors Table */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                Key Contributing Physical Telemetry Features
              </div>
              <div className="space-y-2">
                {currentFactors.map((factor, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{factor.factor}</div>
                      <div className="text-[11px] text-cyan-300 font-mono mt-0.5">{factor.value}</div>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Model Weight</span>
                        <span className="font-mono font-bold text-white">{factor.impact}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            factor.impact > 80 ? 'bg-red-500' : factor.impact > 60 ? 'bg-amber-400' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Forecasting Projections (Next 6h, 12h, 24h, 48h) */}
          <div className="bg-[#141d33] border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Multi-Horizon Risk Forecasting (Predictive Extrapolation)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Simulated demo predictions based on Kalman-filtered velocity curves
                </span>
              </div>
              <div className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded font-mono">
                DEMO PREDICTIONS (SIMULATED)
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="h-44 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentForecast} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    name="Predicted Risk Score" 
                    stroke={activeEngine === 'subsidence' ? '#c084fc' : '#fb923c'} 
                    strokeWidth={3} 
                    dot={{ fill: '#06b6d4', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {currentForecast.map((fc, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-400 font-semibold">{fc.time}</div>
                  <div className="text-base font-extrabold font-mono text-white mt-1">
                    {fc.score} <span className="text-[10px] text-slate-500 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    Confidence: {fc.confidence}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Contextual AI Assistant Chat Interface */}
        <div className="bg-[#141d33] border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl h-[680px]">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-[#141d33] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide">
                  Interactive AI Assistant
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Contextual State Connected
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-black font-medium rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                }`}>
                  <p className="whitespace-pre-line text-[11px]">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Predefined Questions */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Suggested Inquiries</div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] text-left transition-colors border border-slate-700/60"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-[#0f172a] flex items-center space-x-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(inputQuery)}
              placeholder="Ask geotechnical question..."
              className="flex-1 bg-[#141d33] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleAskQuestion(inputQuery)}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
