import React, { useState, useEffect } from 'react';
import { useMine } from '../../context/MineContext';
import { 
  Radio, 
  Search, 
  Bell, 
  Sliders, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Play, 
  Pause,
  User,
  ExternalLink,
  Cpu,
  LogOut
} from 'lucide-react';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    siteConfig,
    activeScenario,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    currentUser,
    setUserRole,
    alerts,
    nodes,
    searchQuery,
    setSearchQuery,
    setIsDemoModalOpen,
    setIsNotificationDrawerOpen,
    setActiveNodeId,
    setActiveView,
    isHardwareConnected,
    setIsHardwareModalOpen,
    logout
  } = useMine();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'mine_manager', label: 'Mine Manager', desc: 'Full operational control room access' },
    { role: 'safety_officer', label: 'Safety Officer', desc: 'Alert response & hazard mitigation' },
    { role: 'field_technician', label: 'Field Technician', desc: 'Sensor maintenance & calibration' },
    { role: 'analyst', label: 'Geotech Analyst', desc: 'In-depth AI & time-series analysis' },
    { role: 'admin', label: 'System Admin', desc: 'Full system configuration' },
    { role: 'viewer', label: 'Observer (Read-Only)', desc: 'Auditor inspection view' },
  ];

  // Search filter
  const searchResults = searchQuery.trim() ? {
    nodes: nodes.filter(n => 
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.zone.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5),
    alerts: alerts.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.zone.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  } : null;

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Site Selector & Clock */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site:</span>
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] lg:max-w-[280px]">
                {siteConfig.mineName.split('—')[0]}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Sector 7 & Overburden Slopes (Active)
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center pl-3 border-l border-slate-800 text-xs text-slate-400 space-x-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1 font-sans">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            LoRa Mesh Online (98.8%)
          </span>
        </div>
      </div>

      {/* Center: Search Bar with Autocomplete */}
      <div className="relative flex-1 max-w-xs md:max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search nodes, zones, alerts (e.g. NODE-SL-01, ESP32, Zone A)..."
            className="w-full bg-[#141d33] border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchFocused && searchResults && (searchResults.nodes.length > 0 || searchResults.alerts.length > 0) && (
          <div 
            className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs"
            onMouseDown={(e) => e.preventDefault()}
          >
            {searchResults.nodes.length > 0 && (
              <div className="mb-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Nodes Found</div>
                {searchResults.nodes.map(n => (
                  <div 
                    key={n.id}
                    onClick={() => {
                      setActiveNodeId(n.id);
                      setIsSearchFocused(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/80 cursor-pointer text-slate-200"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${n.status === 'critical' ? 'bg-red-500' : n.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                      <span className="font-semibold text-cyan-400 font-mono">{n.id}</span>
                      <span className="text-slate-400 truncate max-w-[150px]">{n.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{n.zone}</span>
                  </div>
                ))}
              </div>
            )}

            {searchResults.alerts.length > 0 && (
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 border-t border-slate-800">Alerts Found</div>
                {searchResults.alerts.map(a => (
                  <div 
                    key={a.id}
                    onClick={() => {
                      setActiveView('alerts');
                      setIsSearchFocused(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800/80 cursor-pointer text-slate-200"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <AlertTriangle className={`w-3.5 h-3.5 ${a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                      <span className="truncate">{a.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{a.zone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Hardware Gateway, Demo Mode, Notifications, User Switcher */}
      <div className="flex items-center space-x-2.5">
        {/* ESP32 Physical Hardware Button */}
        <button
          onClick={() => setIsHardwareModalOpen(true)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm group ${
            isHardwareConnected
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
              : 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
          }`}
          title="Connect ESP32 Physical Sensor Node via USB Serial / WiFi"
        >
          <Cpu className={`w-4 h-4 ${isHardwareConnected ? 'text-emerald-400 animate-pulse' : 'text-cyan-400 group-hover:rotate-12 transition-transform'}`} />
          <span className="font-bold">{isHardwareConnected ? 'ESP32 Live' : 'ESP32 Node'}</span>
          <span className={`w-2 h-2 rounded-full ${isHardwareConnected ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
        </button>

        {/* Demo Mode Button / Pill */}
        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:text-white transition-all text-xs font-medium shadow-sm group"
          title="Open Simulation Control Center"
        >
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                activeScenario === 'subsidence_event' ? 'bg-purple-400' :
                activeScenario === 'heavy_rainfall' ? 'bg-blue-400' :
                activeScenario === 'network_battery_failure' ? 'bg-amber-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                activeScenario === 'subsidence_event' ? 'bg-purple-500' :
                activeScenario === 'heavy_rainfall' ? 'bg-blue-500' :
                activeScenario === 'network_battery_failure' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span className="font-bold tracking-wider uppercase text-[10px]">Scenario:</span>
          </div>
          <span className="text-white capitalize font-semibold max-w-[100px] sm:max-w-none truncate">
            {activeScenario.replace(/_/g, ' ')}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-900/60 rounded text-cyan-200">
            {simulationSpeed}x
          </span>
          <Sliders className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
        </button>

        {/* Play/Pause Simulation toggle */}
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`p-1.5 rounded-lg border transition-colors ${
            isSimulating 
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
              : 'bg-amber-950/80 border-amber-600/60 text-amber-300 hover:bg-amber-900'
          }`}
          title={isSimulating ? "Pause real-time simulation" : "Resume real-time simulation"}
        >
          {isSimulating ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-amber-400 fill-amber-400" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 rounded-lg bg-[#141d33] border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
          title="Open Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[10px] font-bold text-white ${
              criticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
            }`}>
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-[#141d33] border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition-colors"
          >
            <span className="text-base">{currentUser.avatar}</span>
            <div className="hidden lg:flex flex-col text-left">
              <span className="font-semibold text-slate-200 text-xs leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-cyan-400 capitalize">{currentUser.role.replace(/_/g, ' ')}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div 
              className="absolute right-0 top-full mt-1.5 w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsRoleDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Switch Demo User Role
              </div>
              {roles.map(({ role, label, desc }) => (
                <button
                  key={role}
                  onClick={() => {
                    setUserRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start space-x-2.5 transition-colors ${
                    currentUser.role === role ? 'bg-cyan-950/40 text-cyan-300 font-semibold border-l-2 border-cyan-400' : 'text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-base mt-0.5">
                    {role === 'mine_manager' ? '👷‍♂️' : role === 'safety_officer' ? '🛡️' : role === 'field_technician' ? '🔧' : role === 'analyst' ? '📊' : role === 'admin' ? '👨‍💼' : '👁️'}
                  </span>
                  <div>
                    <div className="text-xs font-semibold">{label}</div>
                    <div className="text-[10px] text-slate-500">{desc}</div>
                  </div>
                </button>
              ))}

              <div className="pt-1 mt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsRoleDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 flex items-center space-x-2 text-red-400 hover:bg-red-950/30 rounded transition-colors text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Operator</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
