import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Bell,
  X,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { AlertSeverity } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    alerts,
    acknowledgeAlert,
    setActiveView,
    currentUser
  } = useMine();

  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');

  if (!isNotificationDrawerOpen) return null;

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#141d33] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Notification Center
                </h3>
                <span className="text-[11px] text-slate-400">
                  {alerts.filter(a => !a.acknowledged).length} unacknowledged incidents
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
            {(['all', 'critical', 'high', 'moderate', 'low'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-all ${
                  severityFilter === sev
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* List of Alerts */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                No alerts matching current filter.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isCrit = alert.severity === 'critical';
                const isHigh = alert.severity === 'high';
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      !alert.acknowledged
                        ? isCrit
                          ? 'bg-red-950/20 border-red-500/50 shadow-md shadow-red-950/30'
                          : isHigh
                          ? 'bg-amber-950/20 border-amber-500/50'
                          : 'bg-slate-800/40 border-slate-700'
                        : 'bg-slate-900/40 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-1.5 font-bold">
                        {isCrit ? (
                          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                        ) : isHigh ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className={`leading-snug ${isCrit ? 'text-red-300' : isHigh ? 'text-amber-300' : 'text-slate-200'}`}>
                          {alert.title}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        isHigh ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{alert.timestamp}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-400">{alert.zone}</span>
                      </div>

                      {!alert.acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlert(alert.id, `Acknowledged from Notification Drawer by ${currentUser.name}`)}
                          className="px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-semibold transition-colors"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Acked by {alert.acknowledgedBy?.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 border-t border-slate-800 bg-[#141d33] flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Total {alerts.length} incidents logged
            </span>
            <button
              onClick={() => {
                setActiveView('alerts');
                setIsNotificationDrawerOpen(false);
              }}
              className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>View All in Alert Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
