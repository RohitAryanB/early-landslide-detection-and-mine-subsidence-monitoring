import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  SensorNode,
  AlertIncident,
  MaintenanceTask,
  AiriskAssessment,
  SiteConfig,
  ScenarioPreset,
  UserRole,
  UserProfile,
  RiskSeverity,
  NodeStatus,
  HardwareTelemetryPayload
} from '../types';
import {
  INITIAL_SITE_CONFIG,
  INITIAL_ZONES,
  INITIAL_NODES,
  INITIAL_ALERTS,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_AI_ASSESSMENT
} from '../data/initialData';

export type ViewType = 
  | 'overview' 
  | 'digital_twin' 
  | 'nodes' 
  | 'ai_risk' 
  | 'analytics' 
  | 'network' 
  | 'alerts' 
  | 'gis' 
  | 'maintenance' 
  | 'reports' 
  | 'settings';

interface MineContextType {
  siteConfig: SiteConfig;
  setSiteConfig: (config: SiteConfig) => void;
  zones: typeof INITIAL_ZONES;
  nodes: SensorNode[];
  alerts: AlertIncident[];
  maintenanceTasks: MaintenanceTask[];
  aiRisk: AiriskAssessment;
  activeScenario: ScenarioPreset;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  timelineIndex: number;
  setTimelineIndex: (idx: number) => void;
  isPlayingTimeline: boolean;
  setIsPlayingTimeline: (play: boolean) => void;
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  currentUser: UserProfile;
  setUserRole: (role: UserRole) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Authentication
  isAuthenticated: boolean;
  login: (username: string, pass: string) => boolean;
  logout: () => void;

  // Real Hardware ESP32 Integration
  isHardwareConnected: boolean;
  hardwareTelemetry: HardwareTelemetryPayload | null;
  isHardwareModalOpen: boolean;
  setIsHardwareModalOpen: (open: boolean) => void;
  ingestHardwareData: (payload: HardwareTelemetryPayload) => void;
  connectWebSerial: () => Promise<boolean>;
  disconnectWebSerial: () => void;

  // Modals & Panels
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isAddNodeModalOpen: boolean;
  setIsAddNodeModalOpen: (open: boolean) => void;

  // Scenario & simulation actions
  setScenario: (scenario: ScenarioPreset) => void;
  triggerHeavyRainfall: () => void;
  triggerSlopeInstability: (zoneName?: string) => void;
  triggerMineSubsidence: (zoneName?: string) => void;
  simulateNodeOffline: (nodeId: string) => void;
  simulateLowBattery: (nodeId: string) => void;
  triggerSensorAnomaly: (nodeId: string) => void;
  resetNode: (nodeId: string) => void;
  restoreNormalConditions: () => void;
  resetAllDemo: () => void;

  // Node CRUD
  addNode: (node: Omit<SensorNode, 'id' | 'history' | 'lastCommunication'> & { id?: string }) => void;
  updateNode: (id: string, updates: Partial<SensorNode>) => void;
  deleteNode: (id: string) => void;

  // Alert Actions
  acknowledgeAlert: (id: string, note?: string) => void;
  resolveAlert: (id: string, note?: string) => void;
  assignAlert: (id: string, assignee: string) => void;
  addAlertNote: (id: string, note: string) => void;

  // Maintenance Actions
  createMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdDate'>) => void;
  updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  completeMaintenanceTask: (id: string) => void;

  // Filter helper navigation
  navigateToFilteredNodes: (filter: { status?: NodeStatus; zone?: string; category?: string; lowBattery?: boolean }) => void;
  nodeFilterPreset: { status?: NodeStatus; zone?: string; category?: string; lowBattery?: boolean } | null;
  setNodeFilterPreset: (preset: { status?: NodeStatus; zone?: string; category?: string; lowBattery?: boolean } | null) => void;
}

const MineContext = createContext<MineContextType | undefined>(undefined);

const USER_PROFILES: Record<UserRole, UserProfile> = {
  admin: { name: 'Dr. Vikram Seth', role: 'admin', title: 'System Administrator & Chief Geotech', avatar: '👨‍💼' },
  mine_manager: { name: 'Rajesh K. Singhania', role: 'mine_manager', title: 'General Mine Operations Manager', avatar: '👷‍♂️' },
  safety_officer: { name: 'Pooja Narayanan', role: 'safety_officer', title: 'Senior Safety & Geotech Inspector', avatar: '🛡️' },
  field_technician: { name: 'Amitav Das', role: 'field_technician', title: 'Field Instrumentation Tech', avatar: '🔧' },
  analyst: { name: 'Sunita Rao', role: 'analyst', title: 'Data Scientist & GIS Specialist', avatar: '📊' },
  viewer: { name: 'Observer Guest', role: 'viewer', title: 'Auditor / Industry Guest', avatar: '👁️' },
};

const CREDENTIALS_MAP: Record<string, { pass: string; role: UserRole }> = {
  manager: { pass: 'mineguard2026', role: 'mine_manager' },
  safety: { pass: 'mineguard2026', role: 'safety_officer' },
  technician: { pass: 'mineguard2026', role: 'field_technician' },
  analyst: { pass: 'mineguard2026', role: 'analyst' },
  admin: { pass: 'mineguard2026', role: 'admin' },
  guest: { pass: 'guest123', role: 'viewer' }
};

export const MineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mineguard_auth') === 'true';
  });

  // Load from localStorage or default
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('mineguard_site_config');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONFIG;
  });

  const [nodes, setNodes] = useState<SensorNode[]>(() => {
    const saved = localStorage.getItem('mineguard_nodes');
    return saved ? JSON.parse(saved) : INITIAL_NODES;
  });

  const [alerts, setAlerts] = useState<AlertIncident[]>(() => {
    const saved = localStorage.getItem('mineguard_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(() => {
    const saved = localStorage.getItem('mineguard_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TASKS;
  });

  const [aiRisk, setAiRisk] = useState<AiriskAssessment>(() => {
    const saved = localStorage.getItem('mineguard_airisk');
    return saved ? JSON.parse(saved) : INITIAL_AI_ASSESSMENT;
  });

  const [activeScenario, setActiveScenario] = useState<ScenarioPreset>('subsidence_event');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [timelineIndex, setTimelineIndex] = useState<number>(24);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedRole = localStorage.getItem('mineguard_role') as UserRole;
    return (savedRole && USER_PROFILES[savedRole]) ? USER_PROFILES[savedRole] : USER_PROFILES.mine_manager;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nodeFilterPreset, setNodeFilterPreset] = useState<{ status?: NodeStatus; zone?: string; category?: string; lowBattery?: boolean } | null>(null);

  // Hardware State & Refs
  const [isHardwareConnected, setIsHardwareConnected] = useState<boolean>(false);
  const [hardwareTelemetry, setHardwareTelemetry] = useState<HardwareTelemetryPayload | null>(null);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);

  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mineguard_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('mineguard_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('mineguard_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('mineguard_maintenance', JSON.stringify(maintenanceTasks));
  }, [maintenanceTasks]);

  useEffect(() => {
    localStorage.setItem('mineguard_airisk', JSON.stringify(aiRisk));
  }, [aiRisk]);

  // Auth Methods
  const login = (username: string, pass: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (CREDENTIALS_MAP[cleanUser] && CREDENTIALS_MAP[cleanUser].pass === cleanPass) {
      const role = CREDENTIALS_MAP[cleanUser].role;
      setCurrentUser(USER_PROFILES[role]);
      setIsAuthenticated(true);
      localStorage.setItem('mineguard_auth', 'true');
      localStorage.setItem('mineguard_role', role);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('mineguard_auth');
  };

  // Recalculate AI Risk and Node Health dynamically
  const evaluateDynamicRiskAndHealth = (currentNodes: SensorNode[]) => {
    const activeNodes = currentNodes.filter(n => n.status !== 'offline');
    if (activeNodes.length === 0) return;

    // Subsidence calculation (Zone B & C)
    const subsidenceNodes = activeNodes.filter(n => n.category === 'subsidence' || n.zone === 'Zone B');
    const avgSubDisp = subsidenceNodes.length > 0 
      ? subsidenceNodes.reduce((acc, n) => acc + n.measurements.displacement, 0) / subsidenceNodes.length 
      : 10;
    const maxSubTilt = subsidenceNodes.length > 0 
      ? Math.max(...subsidenceNodes.map(n => n.measurements.tiltAngle)) 
      : 0.5;

    // Landslide calculation (Zone A, C, D)
    const slopeNodes = activeNodes.filter(n => n.category === 'slope' || n.zone === 'Zone A' || n.zone === 'Zone D');
    const avgPorePress = slopeNodes.length > 0 
      ? slopeNodes.reduce((acc, n) => acc + n.measurements.porePressure, 0) / slopeNodes.length 
      : 12;
    const avgMoisture = slopeNodes.length > 0 
      ? slopeNodes.reduce((acc, n) => acc + n.measurements.soilMoisture, 0) / slopeNodes.length 
      : 25;
    const maxCrack = slopeNodes.length > 0 
      ? Math.max(...slopeNodes.map(n => n.measurements.crackWidth)) 
      : 1;
    const maxRain = Math.max(...activeNodes.map(n => n.measurements.rainfallRate));

    const calculatedSubScore = Math.min(98, Math.max(12, Math.round((avgSubDisp / 70) * 55 + (maxSubTilt / 4) * 35 + 10)));
    const calculatedLandslideScore = Math.min(99, Math.max(15, Math.round((avgPorePress / 35) * 40 + (avgMoisture / 45) * 30 + (maxCrack / 15) * 20 + (maxRain / 25) * 10)));

    const getSeverity = (score: number): RiskSeverity => {
      if (score >= 80) return 'critical';
      if (score >= 60) return 'high';
      if (score >= 40) return 'moderate';
      return 'low';
    };

    setAiRisk(prev => ({
      ...prev,
      subsidenceScore: calculatedSubScore,
      subsidenceLevel: getSeverity(calculatedSubScore),
      subsidenceTrend: calculatedSubScore > 75 ? 'critical_acceleration' : calculatedSubScore > 50 ? 'increasing' : 'stable',
      landslideScore: calculatedLandslideScore,
      landslideLevel: getSeverity(calculatedLandslideScore),
      landslideTrend: calculatedLandslideScore > 80 ? 'critical_shear' : calculatedLandslideScore > 55 ? 'elevated' : 'stable'
    }));
  };

  // Real Physical ESP32 Hardware Ingestion Engine
  const ingestHardwareData = (payload: HardwareTelemetryPayload) => {
    setHardwareTelemetry(payload);
    setIsHardwareConnected(true);

    setNodes(prev => {
      return prev.map(node => {
        if (node.id === 'ESP32-HARDWARE-01') {
          const m = { ...node.measurements };

          // 1. Battery Voltage & Percentage (Pin D34)
          if (payload.batteryV !== undefined && payload.batteryV > 0) {
            m.batteryVoltage = +payload.batteryV.toFixed(2);
            m.batteryPercentage = Math.round(Math.min(100, Math.max(5, ((payload.batteryV - 3.2) / 1.0) * 100)));
          }

          // 2. Vibration (Pin D27)
          if (payload.vibration !== undefined) {
            m.vibration = payload.vibration === 1 ? 8.45 : 0.18;
          }

          // 3. Slide Potentiometer -> Displacement & Crack (Pin D35)
          if (payload.slidePotVal !== undefined) {
            // 0 - 4095 mapped to 0 - 50 mm displacement
            m.displacement = +((payload.slidePotVal / 4095.0) * 50.0).toFixed(2);
            m.crackWidth = +((payload.slidePotVal / 4095.0) * 18.0).toFixed(2);
          }

          // 4. Soil Moisture (Pin VP/GPIO36)
          if (payload.soilAnalog !== undefined) {
            // 4095 is bone dry, ~1000 is saturated
            const dryScale = Math.min(4095, Math.max(1000, payload.soilAnalog));
            m.soilMoisture = +(((4095 - dryScale) / 3095.0) * 45.0 + 10.0).toFixed(1);
            m.porePressure = +(((4095 - dryScale) / 3095.0) * 35.0 + 5.0).toFixed(1);
          }

          // 5. Rain Detector (Pin D4 & D39)
          if (payload.rainDigital !== undefined) {
            // In typical rain comparator boards: LOW (0) = Rain detected!
            if (payload.rainDigital === 0) {
              m.rainfallRate = payload.rainAnalog !== undefined 
                ? +(((4095 - payload.rainAnalog) / 4095.0) * 50.0 + 10.0).toFixed(1)
                : 35.0;
            } else {
              m.rainfallRate = 0.0;
            }
          }

          // 6. MPU6050 Accel / Tilt Angle (I2C D21/D22)
          if (payload.accelZ !== undefined) {
            const az = Math.abs(payload.accelZ);
            const ax = payload.accelX || 0;
            const ay = payload.accelY || 0;
            const horizontal = Math.hypot(ax, ay);
            // Tilt from vertical
            m.tiltAngle = +(Math.atan2(horizontal > 0 ? horizontal : Math.sqrt(Math.max(0, 96 - az * az)), az) * 180 / Math.PI).toFixed(2);
          }

          // Determine Status based on actual hardware thresholds
          let newStatus: NodeStatus = 'normal';
          let anomaly: string | undefined = undefined;

          if (payload.alert === 1 || m.vibration > 6 || m.displacement > 35 || m.porePressure > 32 || payload.rainDigital === 0) {
            newStatus = 'critical';
            anomaly = `ESP32 Alarm: ${m.vibration > 6 ? 'Excessive Vibration' : m.rainfallRate > 0 ? 'Torrential Rain' : 'Displacement Spike'}`;
          } else if (m.displacement > 15 || m.tiltAngle > 1.8 || m.batteryPercentage < 30) {
            newStatus = 'warning';
          }

          // Trigger Alert Incident if Critical and not already active
          if (newStatus === 'critical') {
            const alertId = `ALT-HW-${Date.now().toString().slice(-4)}`;
            const newAlert: AlertIncident = {
              id: alertId,
              title: `Live Hardware Alert: ESP32 Node Exceeded Critical Thresholds`,
              description: `Physical ESP32 node reports ${m.displacement}mm displacement, ${m.vibration}mm/s vibration, and ${m.porePressure}kPa pore pressure.`,
              category: 'landslide',
              severity: 'critical',
              timestamp: 'Just now',
              nodeId: 'ESP32-HARDWARE-01',
              zone: 'Zone A',
              acknowledged: false,
              status: 'active',
              recommendedAction: 'Verify physical breadboard sensors; inspect crown berm perimeter on North OB Dump.',
              restrictedZoneId: 'zone-a'
            };
            setAlerts(a => [newAlert, ...a.slice(0, 15)]);
          }

          // Append to history
          const newHist = [...node.history];
          if (newHist.length > 0) {
            newHist[newHist.length - 1] = {
              timestamp: new Date().toISOString(),
              tilt: m.tiltAngle,
              vibration: m.vibration,
              displacement: m.displacement,
              crackWidth: m.crackWidth,
              soilMoisture: m.soilMoisture,
              porePressure: m.porePressure,
              rainfall: m.rainfallRate,
              battery: m.batteryPercentage
            };
          }

          return {
            ...node,
            status: newStatus,
            battery: m.batteryPercentage,
            measurements: m,
            anomalyFlag: anomaly,
            history: newHist,
            lastCommunication: `Live Hardware Telemetry (${new Date().toLocaleTimeString()})`,
            hardwareRawPacket: payload.rawString || node.hardwareRawPacket
          };
        }
        return node;
      });
    });

    // Also re-evaluate dynamic risk immediately
    setNodes(current => {
      evaluateDynamicRiskAndHealth(current);
      return current;
    });
  };

  // Serial Line Parser (Parses both LoRa packet line and Serial monitor print lines)
  const parseAndIngestSerialLine = (line: string) => {
    if (!line) return;

    // Format A: LoRa Compact Packet (e.g. BAT:3.92,VIB:0,RAIN:1,SOIL:2100,POT:1250,AZ:9.80,ALERT:0)
    if (line.includes('BAT:') && line.includes('VIB:')) {
      const data: HardwareTelemetryPayload = { source: 'usb_serial', rawString: line };
      const tokens = line.split(',');
      for (const t of tokens) {
        const [k, v] = t.split(':');
        if (k && v) {
          const val = parseFloat(v.trim());
          if (!isNaN(val)) {
            const key = k.trim().toUpperCase();
            if (key === 'BAT') data.batteryV = val;
            else if (key === 'VIB') data.vibration = Math.round(val);
            else if (key === 'RAIN') data.rainDigital = Math.round(val);
            else if (key === 'SOIL') data.soilAnalog = Math.round(val);
            else if (key === 'POT') data.slidePotVal = Math.round(val);
            else if (key === 'AZ') data.accelZ = val;
            else if (key === 'ALERT') data.alert = Math.round(val);
          }
        }
      }
      ingestHardwareData(data);
      return;
    }

    // Format B: Multi-line Serial Monitor text
    if (line.includes('Slide pot:') || line.includes('Vibration:') || line.includes('Soil AO:') || line.includes('Rain DO:') || line.includes('Battery:')) {
      // Create partial update
      const data: HardwareTelemetryPayload = { source: 'usb_serial', rawString: line };
      const mPot = line.match(/Slide pot:\s*(\d+)/);
      if (mPot) data.slidePotVal = parseInt(mPot[1]);

      const mVib = line.match(/Vibration:\s*(\d+)/);
      if (mVib) data.vibration = parseInt(mVib[1]);

      const mSoil = line.match(/Soil AO:\s*(\d+)/);
      if (mSoil) data.soilAnalog = parseInt(mSoil[1]);

      const mRain = line.match(/Rain DO:\s*(\d+)/);
      if (mRain) data.rainDigital = parseInt(mRain[1]);

      const mBatt = line.match(/Battery:\s*([\d\.]+)V/);
      if (mBatt) data.batteryV = parseFloat(mBatt[1]);

      ingestHardwareData(data);
    }
  };

  // Web Serial API Connector
  const connectWebSerial = async (): Promise<boolean> => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is not supported in this browser. Please use Google Chrome or Edge, or run: python3 serial_bridge.py /dev/ttyUSB0');
      return false;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;
      setIsHardwareConnected(true);

      const textDecoder = new (window as any).TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      serialReaderRef.current = reader;

      let buffer = '';
      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                parseAndIngestSerialLine(line.trim());
              }
            }
          }
        } catch (err) {
          console.error('Serial stream closed:', err);
        } finally {
          setIsHardwareConnected(false);
        }
      })();

      return true;
    } catch (err) {
      console.error('Serial connection error:', err);
      return false;
    }
  };

  const disconnectWebSerial = async () => {
    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
      }
      if (serialPortRef.current) {
        await serialPortRef.current.close();
      }
    } catch (e) {
      // quiet
    }
    setIsHardwareConnected(false);
  };

  // Continuous Simulation Tick Engine
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = Math.max(300, 1500 / simulationSpeed);
    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const updated = prevNodes.map(node => {
          if (node.status === 'offline') {
            return node;
          }

          // If this is the real physical ESP32 node and live hardware is connected, keep its real reading!
          if (node.isHardwareNode && isHardwareConnected) {
            return node;
          }

          const m = node.measurements;
          const netPower = m.solarChargingCurrent - 120;
          const newBatteryPct = Math.min(100, Math.max(5, +(m.batteryPercentage + (netPower > 0 ? 0.04 : -0.05) * simulationSpeed).toFixed(1)));
          const newBatteryVoltage = +(3.2 + (newBatteryPct / 100) * 1.0).toFixed(2);

          let newDisp = m.displacement;
          let newTilt = m.tiltAngle;
          let newCrack = m.crackWidth;
          let newRain = m.rainfallRate;
          let newMoist = m.soilMoisture;
          let newPore = m.porePressure;
          let newVib = Math.max(0.08, +(m.vibration + (Math.random() - 0.49) * 0.15).toFixed(2));

          if (activeScenario === 'subsidence_event' && (node.category === 'subsidence' || node.zone === 'Zone B')) {
            newDisp = +(m.displacement + 0.15 * simulationSpeed).toFixed(2);
            newTilt = +(m.tiltAngle + 0.01 * simulationSpeed).toFixed(3);
            newCrack = +(m.crackWidth + 0.03 * simulationSpeed).toFixed(2);
          } else if (activeScenario === 'heavy_rainfall') {
            newRain = Math.min(60, +(m.rainfallRate + (Math.random() * 0.5 - 0.2) * simulationSpeed).toFixed(1));
            newMoist = Math.min(50, +(m.soilMoisture + 0.1 * simulationSpeed).toFixed(1));
            newPore = Math.min(45, +(m.porePressure + 0.12 * simulationSpeed).toFixed(1));
            if (node.category === 'slope') {
              newDisp = +(m.displacement + 0.12 * simulationSpeed).toFixed(2);
              newCrack = +(m.crackWidth + 0.04 * simulationSpeed).toFixed(2);
            }
          }

          let newStatus: NodeStatus = 'normal';
          if (newDisp > 50 || newTilt > 3.5 || newCrack > 14 || newPore > 35 || m.batteryPercentage < 20) {
            newStatus = 'critical';
          } else if (newDisp > 20 || newTilt > 1.5 || newCrack > 5 || newPore > 22 || m.batteryPercentage < 40) {
            newStatus = 'warning';
          }

          const newHistory = [...node.history];
          if (newHistory.length > 0) {
            const lastSample = newHistory[newHistory.length - 1];
            newHistory[newHistory.length - 1] = {
              ...lastSample,
              tilt: newTilt,
              vibration: newVib,
              displacement: newDisp,
              crackWidth: newCrack,
              soilMoisture: newMoist,
              porePressure: newPore,
              rainfall: newRain,
              battery: newBatteryPct
            };
          }

          return {
            ...node,
            status: newStatus,
            battery: newBatteryPct,
            measurements: {
              ...m,
              tiltAngle: newTilt,
              vibration: newVib,
              displacement: newDisp,
              crackWidth: newCrack,
              soilMoisture: newMoist,
              porePressure: newPore,
              rainfallRate: newRain,
              batteryPercentage: newBatteryPct,
              batteryVoltage: newBatteryVoltage
            },
            history: newHistory,
            lastCommunication: node.isHardwareNode ? node.lastCommunication : 'Just now'
          };
        });

        evaluateDynamicRiskAndHealth(updated);
        return updated;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, activeScenario, isHardwareConnected]);

  // Timeline playback loop
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const timer = setInterval(() => {
      setTimelineIndex(prev => {
        if (prev >= 24) {
          setIsPlayingTimeline(false);
          return 24;
        }
        return prev + 1;
      });
    }, 1200 / simulationSpeed);
    return () => clearInterval(timer);
  }, [isPlayingTimeline, simulationSpeed]);

  // Scenarios implementation
  const setScenario = (scenario: ScenarioPreset) => {
    setActiveScenario(scenario);
    if (scenario === 'normal') {
      restoreNormalConditions();
    } else if (scenario === 'heavy_rainfall') {
      triggerHeavyRainfall();
    } else if (scenario === 'subsidence_event') {
      triggerMineSubsidence();
    } else if (scenario === 'network_battery_failure') {
      triggerNetworkBatteryFailure();
    }
  };

  const restoreNormalConditions = () => {
    setNodes(prev => prev.map(n => {
      if (n.isHardwareNode) return n;
      const isGateway = n.category === 'gateway_relay';
      return {
        ...n,
        status: 'normal',
        battery: Math.floor(82 + Math.random() * 15),
        health: 95,
        anomalyFlag: undefined,
        maintenanceFlag: undefined,
        signalRssi: isGateway ? -60 : -75,
        packetLoss: 0.4,
        measurements: {
          ...n.measurements,
          tiltAngle: +(0.2 + Math.random() * 0.4).toFixed(2),
          vibration: +(0.3 + Math.random() * 0.4).toFixed(2),
          displacement: +(2.0 + Math.random() * 4.0).toFixed(1),
          crackWidth: +(0.2 + Math.random() * 0.6).toFixed(1),
          soilMoisture: +(20.0 + Math.random() * 5.0).toFixed(1),
          porePressure: +(6.0 + Math.random() * 4.0).toFixed(1),
          rainfallRate: +(0.5 + Math.random() * 2.0).toFixed(1),
          batteryPercentage: 90,
          batteryVoltage: 4.08,
          solarChargingCurrent: 280
        }
      };
    }));

    setAiRisk({
      subsidenceScore: 28,
      subsidenceLevel: 'low',
      subsidenceTrend: 'stable',
      subsidenceAffectedZones: ['None — Normal background strata conditions'],
      subsidenceExplanation: 'Strata movement is within normal design tolerances. Longwall face advance is steady with no anomalous roof weighting or surface tensile strain.',
      subsidenceContributingFactors: [
        { factor: 'Surface Vertical Displacement', impact: 22, value: '3.4 mm (Normal < 15mm)' },
        { factor: 'Ground Tilt Angle', impact: 18, value: '0.45° (Normal < 1.5°)' },
        { factor: 'Extensometer Crack Width', impact: 15, value: '0.4 mm (Stable)' }
      ],
      subsidenceForecast: [
        { time: '+6 Hours', score: 29, confidence: 96 },
        { time: '+12 Hours', score: 30, confidence: 94 },
        { time: '+24 Hours', score: 32, confidence: 91 },
        { time: '+48 Hours', score: 35, confidence: 85 }
      ],
      landslideScore: 24,
      landslideLevel: 'low',
      landslideTrend: 'stable',
      landslideAffectedZones: ['None — Normal overburden dump equilibrium'],
      landslideExplanation: 'Slope factor of safety (FoS) estimated at 1.84. Pore-water pressure and soil moisture levels are low, with zero creep acceleration recorded.',
      landslideContributingFactors: [
        { factor: 'Soil Moisture Saturation', impact: 24, value: '21.5% (Safe < 35%)' },
        { factor: 'Pore-Water Pressure', impact: 19, value: '8.2 kPa (Safe < 20 kPa)' },
        { factor: 'Cumulative Rainfall', impact: 12, value: '4.2 mm / 24h (Normal)' }
      ],
      landslideForecast: [
        { time: '+6 Hours', score: 25, confidence: 97 },
        { time: '+12 Hours', score: 26, confidence: 95 },
        { time: '+24 Hours', score: 28, confidence: 90 },
        { time: '+48 Hours', score: 30, confidence: 85 }
      ]
    });
  };

  const triggerHeavyRainfall = () => {
    setNodes(prev => prev.map(n => {
      const isSlopeOrTailings = n.zone === 'Zone A' || n.zone === 'Zone D' || n.category === 'slope';
      const rainRate = +(35.0 + Math.random() * 20.0).toFixed(1);
      const moisture = isSlopeOrTailings ? +(42.0 + Math.random() * 6.0).toFixed(1) : +(32.0 + Math.random() * 4.0).toFixed(1);
      const pore = isSlopeOrTailings ? +(34.0 + Math.random() * 9.0).toFixed(1) : +(18.0 + Math.random() * 5.0).toFixed(1);
      const disp = isSlopeOrTailings ? +(n.measurements.displacement + 12.0 + Math.random() * 15.0).toFixed(1) : n.measurements.displacement;
      const crack = isSlopeOrTailings ? +(n.measurements.crackWidth + 4.5 + Math.random() * 5.0).toFixed(1) : n.measurements.crackWidth;

      const isCrit = isSlopeOrTailings && (pore > 35 || crack > 12);

      return {
        ...n,
        status: isCrit ? 'critical' : isSlopeOrTailings ? 'warning' : n.status,
        anomalyFlag: isSlopeOrTailings ? 'Rainfall threshold exceeded (Antecedent 24h > 80mm)' : n.anomalyFlag,
        measurements: {
          ...n.measurements,
          rainfallRate: rainRate,
          soilMoisture: moisture,
          porePressure: pore,
          displacement: disp,
          crackWidth: crack
        }
      };
    }));

    const newAlert: AlertIncident = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      title: 'Monsoon Torrential Rain & Slope Pore-Pressure Spikes',
      description: 'Precipitation exceeded 45 mm/hr. Piezometers in Zone A and Zone D report dangerous saturation (>42% VWC, pore pressure >36 kPa).',
      category: 'landslide',
      severity: 'critical',
      timestamp: 'Just now',
      zone: 'Zone A',
      acknowledged: false,
      status: 'active',
      recommendedAction: 'Immediate stoppage of haulage along Dump #3; evacuate dump toe; monitor decant drainage channels.',
      restrictedZoneId: 'zone-a'
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const triggerMineSubsidence = (targetZone: string = 'Zone B') => {
    setNodes(prev => prev.map(n => {
      if (n.zone === targetZone || n.category === 'subsidence') {
        const newDisp = +(n.measurements.displacement + 28.0 + Math.random() * 18.0).toFixed(1);
        const newTilt = +(n.measurements.tiltAngle + 1.6 + Math.random() * 0.9).toFixed(2);
        const newCrack = +(n.measurements.crackWidth + 4.8 + Math.random() * 3.0).toFixed(1);
        const newVib = +(n.measurements.vibration + 1.8 + Math.random() * 1.5).toFixed(2);

        return {
          ...n,
          status: newDisp > 55 ? 'critical' : 'warning',
          anomalyFlag: 'Accelerating vertical trough subsidence over longwall extraction',
          measurements: {
            ...n.measurements,
            displacement: newDisp,
            tiltAngle: newTilt,
            crackWidth: newCrack,
            vibration: newVib
          }
        };
      }
      return n;
    }));

    const newAlert: AlertIncident = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      title: 'Active Subsidence Trough Deepening — Longwall Panel 04',
      description: 'Multiple surface nodes detect collective downward displacement exceeding 75mm with 3.9° surface tilt. Risk of road shear.',
      category: 'subsidence',
      severity: 'critical',
      timestamp: 'Just now',
      zone: 'Zone B',
      acknowledged: false,
      status: 'active',
      recommendedAction: 'Enforce 10 km/h speed limit and cordon off secondary access haul road; notify underground deputy of roof weighting correlation.',
      restrictedZoneId: 'zone-b'
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const triggerSlopeInstability = (targetZone: string = 'Zone A') => {
    setNodes(prev => prev.map(n => {
      if (n.zone === targetZone) {
        return {
          ...n,
          status: 'critical',
          anomalyFlag: 'Tertiary slope creep acceleration (Inverse velocity d(1/v)/dt < 0)',
          measurements: {
            ...n.measurements,
            displacement: +(n.measurements.displacement + 35.0).toFixed(1),
            crackWidth: +(n.measurements.crackWidth + 8.5).toFixed(1),
            tiltAngle: +(n.measurements.tiltAngle + 2.2).toFixed(2),
            vibration: +(n.measurements.vibration + 3.4).toFixed(2)
          }
        };
      }
      return n;
    }));
  };

  const triggerNetworkBatteryFailure = () => {
    setNodes(prev => prev.map((n, idx) => {
      if (idx % 6 === 2) {
        return {
          ...n,
          status: 'offline',
          health: 0,
          battery: 0,
          signalRssi: -125,
          packetLoss: 100,
          latency: 0,
          lastCommunication: '2 hours ago',
          anomalyFlag: 'Communication link down — Heartbeat expired'
        };
      }
      if (idx % 6 === 4) {
        return {
          ...n,
          status: 'warning',
          battery: 14,
          health: 55,
          signalRssi: -108,
          packetLoss: 18.5,
          latency: 320,
          measurements: {
            ...n.measurements,
            batteryPercentage: 14,
            batteryVoltage: 3.32,
            solarChargingCurrent: 20
          },
          anomalyFlag: 'Critical low battery (14%) & high packet drop'
        };
      }
      return n;
    }));

    const newAlert: AlertIncident = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      title: 'LoRa Mesh Packet Loss & Multiple Node Dropouts',
      description: 'Gateway Alpha reports lost heartbeats on 4 remote sensor nodes and severe RSSI degradation across western relay sectors.',
      category: 'network',
      severity: 'high',
      timestamp: 'Just now',
      zone: 'Zone E',
      acknowledged: false,
      status: 'active',
      recommendedAction: 'Verify relay post solar power lines and check master gateway antenna connection.'
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const simulateNodeOffline = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? {
      ...n,
      status: 'offline',
      health: 0,
      packetLoss: 100,
      lastCommunication: 'Disconnected just now',
      anomalyFlag: 'Simulated node disconnect'
    } : n));
  };

  const simulateLowBattery = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? {
      ...n,
      status: 'warning',
      battery: 12,
      health: 45,
      measurements: {
        ...n.measurements,
        batteryPercentage: 12,
        batteryVoltage: 3.28,
        solarChargingCurrent: 10
      },
      maintenanceFlag: 'Battery replacement urgently required'
    } : n));
  };

  const triggerSensorAnomaly = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? {
      ...n,
      status: 'critical',
      anomalyFlag: 'Simulated rapid displacement spike (+45mm)',
      measurements: {
        ...n.measurements,
        displacement: +(n.measurements.displacement + 45.0).toFixed(1),
        vibration: +(n.measurements.vibration + 6.2).toFixed(2),
        crackWidth: +(n.measurements.crackWidth + 9.5).toFixed(1)
      }
    } : n));
  };

  const resetNode = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? {
      ...n,
      status: 'normal',
      health: 98,
      battery: 92,
      packetLoss: 0.2,
      signalRssi: -72,
      anomalyFlag: undefined,
      maintenanceFlag: undefined,
      measurements: {
        ...n.measurements,
        displacement: 4.2,
        tiltAngle: 0.35,
        crackWidth: 0.4,
        vibration: 0.35,
        batteryPercentage: 92,
        batteryVoltage: 4.10,
        solarChargingCurrent: 240
      }
    } : n));
  };

  const resetAllDemo = () => {
    localStorage.removeItem('mineguard_site_config');
    localStorage.removeItem('mineguard_nodes');
    localStorage.removeItem('mineguard_alerts');
    localStorage.removeItem('mineguard_maintenance');
    localStorage.removeItem('mineguard_airisk');
    setSiteConfig(INITIAL_SITE_CONFIG);
    setNodes(INITIAL_NODES);
    setAlerts(INITIAL_ALERTS);
    setMaintenanceTasks(INITIAL_MAINTENANCE_TASKS);
    setAiRisk(INITIAL_AI_ASSESSMENT);
    setActiveScenario('subsidence_event');
    setTimelineIndex(24);
  };

  // Node CRUD
  const addNode = (newNodeData: Omit<SensorNode, 'id' | 'history' | 'lastCommunication'> & { id?: string }) => {
    const id = newNodeData.id || `NODE-${Date.now().toString().slice(-4)}`;
    const history = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      history.push({
        timestamp: new Date(now - i * 3600000).toISOString(),
        tilt: newNodeData.measurements.tiltAngle,
        vibration: newNodeData.measurements.vibration,
        displacement: newNodeData.measurements.displacement,
        crackWidth: newNodeData.measurements.crackWidth,
        soilMoisture: newNodeData.measurements.soilMoisture,
        porePressure: newNodeData.measurements.porePressure,
        rainfall: newNodeData.measurements.rainfallRate,
        battery: newNodeData.measurements.batteryPercentage
      });
    }

    const completeNode: SensorNode = {
      ...newNodeData,
      id,
      history,
      lastCommunication: 'Just now'
    };

    setNodes(prev => [completeNode, ...prev]);
  };

  const updateNode = (id: string, updates: Partial<SensorNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  // Alerts
  const acknowledgeAlert = (id: string, note?: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      acknowledged: true,
      acknowledgedBy: currentUser.name,
      acknowledgedAt: 'Just now',
      notes: note ? [...(a.notes || []), note] : a.notes
    } : a));
  };

  const resolveAlert = (id: string, note?: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      status: 'resolved',
      notes: note ? [...(a.notes || []), `Resolved: ${note}`] : a.notes
    } : a));
  };

  const assignAlert = (id: string, assignee: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      assignedTo: assignee,
      status: 'investigating'
    } : a));
  };

  const addAlertNote = (id: string, note: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? {
      ...a,
      notes: [...(a.notes || []), note]
    } : a));
  };

  // Maintenance
  const createMaintenanceTask = (task: Omit<MaintenanceTask, 'id' | 'createdDate'>) => {
    const newTask: MaintenanceTask = {
      ...task,
      id: `MT-${Math.floor(400 + Math.random() * 500)}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setMaintenanceTasks(prev => [newTask, ...prev]);
  };

  const updateMaintenanceTask = (id: string, updates: Partial<MaintenanceTask>) => {
    setMaintenanceTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const completeMaintenanceTask = (id: string) => {
    setMaintenanceTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const setUserRole = (role: UserRole) => {
    setCurrentUser(USER_PROFILES[role]);
    localStorage.setItem('mineguard_role', role);
  };

  const navigateToFilteredNodes = (filter: { status?: NodeStatus; zone?: string; category?: string; lowBattery?: boolean }) => {
    setNodeFilterPreset(filter);
    setActiveView('nodes');
  };

  return (
    <MineContext.Provider
      value={{
        siteConfig,
        setSiteConfig,
        zones: INITIAL_ZONES,
        nodes,
        alerts,
        maintenanceTasks,
        aiRisk,
        activeScenario,
        isSimulating,
        setIsSimulating,
        simulationSpeed,
        setSimulationSpeed,
        timelineIndex,
        setTimelineIndex,
        isPlayingTimeline,
        setIsPlayingTimeline,
        activeNodeId,
        setActiveNodeId,
        activeView,
        setActiveView,
        currentUser,
        setUserRole,
        searchQuery,
        setSearchQuery,
        isAuthenticated,
        login,
        logout,
        isHardwareConnected,
        hardwareTelemetry,
        isHardwareModalOpen,
        setIsHardwareModalOpen,
        ingestHardwareData,
        connectWebSerial,
        disconnectWebSerial,
        isDemoModalOpen,
        setIsDemoModalOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isAddNodeModalOpen,
        setIsAddNodeModalOpen,
        setScenario,
        triggerHeavyRainfall,
        triggerSlopeInstability,
        triggerMineSubsidence,
        simulateNodeOffline,
        simulateLowBattery,
        triggerSensorAnomaly,
        resetNode,
        restoreNormalConditions,
        resetAllDemo,
        addNode,
        updateNode,
        deleteNode,
        acknowledgeAlert,
        resolveAlert,
        assignAlert,
        addAlertNote,
        createMaintenanceTask,
        updateMaintenanceTask,
        completeMaintenanceTask,
        navigateToFilteredNodes,
        nodeFilterPreset,
        setNodeFilterPreset
      }}
    >
      {children}
    </MineContext.Provider>
  );
};

export const useMine = () => {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
};
