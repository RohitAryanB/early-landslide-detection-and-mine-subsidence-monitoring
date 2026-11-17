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
  NodeStatus
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

export const MineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [timelineIndex, setTimelineIndex] = useState<number>(24); // 0 to 24 (24 is current/latest)
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [currentUser, setCurrentUser] = useState<UserProfile>(USER_PROFILES.mine_manager);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nodeFilterPreset, setNodeFilterPreset] = useState<{ status?: NodeStatus; zone?: string; category?: string; lowBattery?: boolean } | null>(null);

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

  // Recalculate AI Risk and Node Health dynamically from current measurements
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

    // Calculate score 0-100
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

          // Subtle realistic noise
          const m = node.measurements;
          const noiseFactor = (Math.random() - 0.49) * 0.05;

          // Battery drain or solar recharge depending on solar current
          const netPower = m.solarChargingCurrent - 120; // mA
          const newBatteryPct = Math.min(100, Math.max(5, +(m.batteryPercentage + (netPower > 0 ? 0.04 : -0.05) * simulationSpeed).toFixed(1)));
          const newBatteryVoltage = +(3.2 + (newBatteryPct / 100) * 1.0).toFixed(2);

          // Sensor drift depending on scenario
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

          // Determine node status
          let newStatus: NodeStatus = 'normal';
          if (newDisp > 50 || newTilt > 3.5 || newCrack > 14 || newPore > 35 || m.batteryPercentage < 20) {
            newStatus = 'critical';
          } else if (newDisp > 20 || newTilt > 1.5 || newCrack > 5 || newPore > 22 || m.batteryPercentage < 40) {
            newStatus = 'warning';
          }

          // Update latest history entry
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
            lastCommunication: 'Just now'
          };
        });

        evaluateDynamicRiskAndHealth(updated);
        return updated;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, activeScenario]);

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

    // Add alert
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
      // simulate 5 nodes experiencing severe issues
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
