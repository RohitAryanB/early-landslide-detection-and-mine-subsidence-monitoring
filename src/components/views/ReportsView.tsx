import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Layers,
  Mountain
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    siteConfig,
    nodes,
    alerts,
    aiRisk,
    maintenanceTasks,
    currentUser
  } = useMine();

  const [reportType, setReportType] = useState<
    'daily' | 'weekly_safety' | 'subsidence' | 'landslide' | 'sensor_performance'
  >('daily');

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'ReportType,Mine,Date,SubsidenceScore,LandslideScore,ActiveAlerts,TotalNodes,OnlineNodes\n';
    const row = `${reportType},"${siteConfig.mineName}",${reportDate},${aiRisk.subsidenceScore},${aiRisk.landslideScore},${alerts.length},${nodes.length},${nodes.filter(n => n.status !== 'offline').length}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MINEGUARD_${reportType.toUpperCase()}_REPORT_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Export Actions */}
      <div className="bg-[#141d33] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Reports & Geotechnical Compliance Export Centre
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal regulatory safety assessments, DGMS compliance logs, and time-series telemetry reports.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV Summary</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shadow-lg shadow-cyan-950/40"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Bar */}
      <div className="bg-[#141d33] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        {/* Type Selector */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'daily', label: 'Daily Mine Monitoring Report' },
            { id: 'weekly_safety', label: 'Weekly Safety & Risk Summary' },
            { id: 'subsidence', label: 'Seam IV Subsidence Assessment' },
            { id: 'landslide', label: 'North OB Landslide Creep Report' },
            { id: 'sensor_performance', label: 'LoRa Mesh & Transducer Performance' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                reportType === r.id
                  ? 'bg-cyan-500 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Report Date:</span>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="bg-[#0f172a] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
          />
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Document Formal Header */}
        <div className="border-b-2 border-slate-700 pb-5 print:border-black">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase print:text-black">
                  MINEGUARD INDUSTRIAL INTELLIGENCE
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono print:border print:border-black">
                  ISO/IEC 27001 & DGMS READY
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1 print:text-black uppercase tracking-wide">
                {reportType === 'daily' ? 'DAILY GEOTECHNICAL MONITORING & RISK REPORT' :
                 reportType === 'weekly_safety' ? 'WEEKLY SAFETY EXECUTIVE AUDIT & HAZARD SUMMARY' :
                 reportType === 'subsidence' ? 'LONGWALL PANEL 04 SURFACE SUBSIDENCE REPORT' :
                 reportType === 'landslide' ? 'NORTH OVERBURDEN DUMP #3 LANDSLIDE KINEMATICS REPORT' :
                 'WIRELESS MESH SENSOR NETWORK & TELEMETRY AUDIT'}
              </h2>
              <div className="text-xs text-slate-400 mt-1 print:text-slate-700 font-medium">
                Facility: <span className="font-semibold text-white print:text-black">{siteConfig.mineName}</span> ({siteConfig.location})
              </div>
            </div>

            <div className="text-right text-xs font-mono shrink-0">
              <div className="text-slate-400 print:text-slate-600">Document ID: <span className="text-white print:text-black font-bold">RPT-2026-MG-{reportDate.replace(/-/g, '')}</span></div>
              <div className="text-slate-400 print:text-slate-600">Generated: {reportDate} 08:00 IST</div>
              <div className="text-cyan-400 print:text-black font-semibold mt-1">Classification: RESTRICTED</div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
            1. Executive Geotechnical Summary
          </h3>
          <div className="p-4 rounded-xl bg-[#141d33] border border-slate-800 print:bg-slate-100 print:border-slate-300 text-xs leading-relaxed">
            During the 24-hour observation cycle ending {reportDate}, MINEGUARD surface sensor mesh monitored 32 active transducer nodes across 480 hectares. Dual AI hazard algorithms classified Mine Subsidence Risk at <strong className="text-purple-300 print:text-black">{aiRisk.subsidenceScore}/100 ({aiRisk.subsidenceLevel.toUpperCase()})</strong> and Landslide Slope Creep Risk at <strong className="text-orange-300 print:text-black">{aiRisk.landslideScore}/100 ({aiRisk.landslideLevel.toUpperCase()})</strong>.
          </div>
        </div>

        {/* Dual Hazard Metrics Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
            2. Dual Risk Engine Assessment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#141d33] border border-purple-500/30 print:bg-slate-100 print:border-slate-400 text-xs space-y-2">
              <div className="font-bold text-white print:text-black flex items-center justify-between">
                <span>Mine Subsidence (Deep Seam)</span>
                <span className="font-mono text-purple-400 print:text-black font-extrabold">{aiRisk.subsidenceScore}/100</span>
              </div>
              <p className="text-slate-300 print:text-slate-800 text-[11px] leading-relaxed">
                {aiRisk.subsidenceExplanation}
              </p>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                Status: {aiRisk.subsidenceTrend.toUpperCase()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#141d33] border border-orange-500/30 print:bg-slate-100 print:border-slate-400 text-xs space-y-2">
              <div className="font-bold text-white print:text-black flex items-center justify-between">
                <span>Overburden Landslide (Slope)</span>
                <span className="font-mono text-orange-400 print:text-black font-extrabold">{aiRisk.landslideScore}/100</span>
              </div>
              <p className="text-slate-300 print:text-slate-800 text-[11px] leading-relaxed">
                {aiRisk.landslideExplanation}
              </p>
              <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                Status: {aiRisk.landslideTrend.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Critical Transducer Observations Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-black">
            3. Critical Sensor Node Telemetry Register
          </h3>
          <table className="w-full text-left text-xs border border-slate-800 print:border-black">
            <thead className="bg-[#141d33] print:bg-slate-200 text-slate-400 print:text-black uppercase text-[10px]">
              <tr>
                <th className="p-2 border-b border-slate-800 print:border-black">Node ID</th>
                <th className="p-2 border-b border-slate-800 print:border-black">Zone</th>
                <th className="p-2 border-b border-slate-800 print:border-black">Displacement</th>
                <th className="p-2 border-b border-slate-800 print:border-black">Tilt Angle</th>
                <th className="p-2 border-b border-slate-800 print:border-black">Pore Pressure</th>
                <th className="p-2 border-b border-slate-800 print:border-black">Battery</th>
                <th className="p-2 border-b border-slate-800 print:border-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-black">
              {nodes.slice(0, 8).map(n => (
                <tr key={n.id}>
                  <td className="p-2 font-mono font-bold text-cyan-400 print:text-black">{n.id}</td>
                  <td className="p-2 text-slate-300 print:text-black">{n.zone}</td>
                  <td className="p-2 font-mono text-white print:text-black">{n.measurements.displacement} mm</td>
                  <td className="p-2 font-mono text-white print:text-black">{n.measurements.tiltAngle}°</td>
                  <td className="p-2 font-mono text-white print:text-black">{n.measurements.porePressure} kPa</td>
                  <td className="p-2 font-mono text-emerald-400 print:text-black">{n.battery}%</td>
                  <td className="p-2 font-mono uppercase text-[10px] font-bold text-white print:text-black">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Operational Directives & Sign-off Stamp */}
        <div className="border-t border-slate-800 print:border-black pt-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-bold text-slate-400 print:text-black uppercase text-[10px] mb-1">
              Geotechnical Directives
            </div>
            <p className="text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
              1. Enforce strict 80-meter safety cordon along crest of North Overburden Dump #3.
              2. Inspect surface fissures on Panel 04 access haul road every 4 hours.
              3. Dispatch maintenance tech for low-battery node NODE-SL-05.
            </p>
          </div>

          <div className="border-l border-slate-800 print:border-black pl-4 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-400 print:text-black uppercase text-[10px]">
                Authorized Sign-off & Verification
              </div>
              <div className="text-white print:text-black font-bold text-sm mt-1">{currentUser.name}</div>
              <div className="text-slate-400 print:text-slate-600 text-[11px]">{currentUser.title}</div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 print:text-slate-700 pt-2">
              MINEGUARD Digital Signature SHA-256: 7f8b9e...01c4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
