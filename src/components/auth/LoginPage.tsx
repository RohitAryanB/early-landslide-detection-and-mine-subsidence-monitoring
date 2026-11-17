import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Radio,
  Sparkles,
  Layers,
  KeyRound,
  Cpu
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, setUserRole } = useMine();

  const [username, setUsername] = useState('manager');
  const [password, setPassword] = useState('mineguard2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Invalid credentials. Use one of the demo role credentials below or click a quick-login card.');
      }
    }, 400);
  };

  const demoRoles: { role: UserRole; user: string; pass: string; title: string; label: string; icon: string }[] = [
    { role: 'mine_manager', user: 'manager', pass: 'mineguard2026', label: 'Mine Manager', title: 'Operational command & 3D twin monitoring', icon: '👷‍♂️' },
    { role: 'safety_officer', user: 'safety', pass: 'mineguard2026', label: 'Safety Officer', title: 'Hazard incidents & evacuation response', icon: '🛡️' },
    { role: 'field_technician', user: 'technician', pass: 'mineguard2026', label: 'Field Technician', title: 'Hardware ESP32 nodes & battery work orders', icon: '🔧' },
    { role: 'analyst', user: 'analyst', pass: 'mineguard2026', label: 'Geotech Analyst', title: 'Dual AI risk models & rate of change', icon: '📊' },
    { role: 'admin', user: 'admin', pass: 'mineguard2026', label: 'Administrator', title: 'System config, sensor thresholds & RBAC', icon: '👨‍💼' },
    { role: 'viewer', user: 'guest', pass: 'guest123', label: 'Auditor (Viewer)', title: 'Read-only inspection view', icon: '👁️' },
  ];

  const handleQuickLogin = (role: UserRole, user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setUserRole(role);
    login(user, pass);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambience & Engineering Radial Grid */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-white flex items-center gap-1.5 leading-none">
              <span>MINEGUARD</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-semibold border border-cyan-800/40">
                v2.4 SECURE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Intelligent Mine Subsidence & Landslide Early Warning</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LoRa & ESP32 Gateway Ready
          </span>
        </div>
      </header>

      {/* Center Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-[#0f172a] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Left Hero Panel (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#141d33] via-slate-900 to-[#0f172a] p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[11px] font-mono font-semibold">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Kusmunda Colliery Sector 7</span>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                  Autonomous Strata & Slope Intelligence
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Real-time monitoring platform for underground longwall subsidence, overburden bench shear kinematics, and physical ESP32 wireless sensor nodes.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>Interactive 3D Digital Twin & Underground Seams</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  <span>Dual AI Subsidence & Landslide Hazard Models</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Live Physical ESP32 Hardware Integration (USB / LoRa)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Security Level: RESTRICTED</span>
              <span className="font-mono text-cyan-400">AES-128 / SHA-256</span>
            </div>
          </div>

          {/* Right Form Panel (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Sign In to Control Room
                  </h3>
                  <p className="text-xs text-slate-400">Enter your credentials or choose a role card below</p>
                </div>
                <KeyRound className="w-5 h-5 text-cyan-400" />
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Operator Username / Role ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. manager, safety, technician, admin"
                      required
                      className="w-full bg-[#141d33] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      required
                      className="w-full bg-[#141d33] border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-cyan-400 rounded"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-cyan-400 font-mono text-[10px]">DGMS-Ready Auth</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Enter MINEGUARD'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Demo Access Roles */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex justify-between">
                <span>1-Click Role Direct Sign-In</span>
                <span className="text-cyan-400 font-normal">Click any card to launch</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {demoRoles.map(r => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickLogin(r.role, r.user, r.pass)}
                    className="p-2 rounded-xl bg-[#141d33] border border-slate-800 hover:border-cyan-500/60 hover:bg-[#1a2542] text-left transition-all group"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm">{r.icon}</span>
                      <span className="font-bold text-white text-[11px] group-hover:text-cyan-300">{r.label}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">{r.user} / {r.pass}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 px-6 border-t border-slate-800/60 bg-[#0f172a]/60 text-[10px] text-slate-500 flex items-center justify-between z-10 font-mono">
        <span>© 2026 MINEGUARD Project. Indigenous Smart Mine Early Warning System.</span>
        <span>Physical Hardware Gateway Active on /api/telemetry</span>
      </footer>
    </div>
  );
};
