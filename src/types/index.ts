export type SensorType = 
  | 'tilt' 
  | 'vibration' 
  | 'displacement' 
  | 'crack' 
  | 'soil_moisture' 
  | 'pore_pressure' 
  | 'rainfall' 
  | 'extensometer';

export type NodeCategory = 
  | 'subsidence' 
  | 'slope' 
  | 'environmental' 
  | 'gateway_relay';

export type NodeStatus = 'normal' | 'warning' | 'critical' | 'offline';

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface SensorMeasurement {
  tiltAngle: number; // degrees (e.g. 0.05 to 5.2)
  vibration: number; // mm/s (PPV: Peak Particle Velocity, normal 0.1 - 2.0, critical > 8.0)
  displacement: number; // mm (cumulative surface settlement or lateral slip, normal 0-5mm, critical > 50mm)
  crackWidth: number; // mm (extensometer gap, 0.0 to 25.0mm)
  soilMoisture: number; // % (volumetric water content, 15% - 48%)
  porePressure: number; // kPa (pore-water pressure, 5 - 45 kPa)
  rainfallRate: number; // mm/hr (0 - 65 mm/hr)
  temperature: number; // °C (20 - 42°C)
  batteryVoltage: number; // Volts (3.2V - 4.2V LiFePO4 / Li-ion)
  batteryPercentage: number; // 0 - 100%
  solarChargingCurrent: number; // mA (0 - 450 mA)
}

export interface NodeHistoricalSample {
  timestamp: string; // ISO string
  tilt: number;
  vibration: number;
  displacement: number;
  crackWidth: number;
  soilMoisture: number;
  porePressure: number;
  rainfall: number;
  battery: number;
}

export interface SensorNode {
  id: string; // e.g. "NODE-SB-01", "NODE-SL-05"
  name: string;
  category: NodeCategory;
  zone: string; // "Zone A", "Zone B", etc.
  zoneName: string; // "North Overburden Dump", "Longwall Panel 04 Surface", etc.
  status: NodeStatus;
  health: number; // 0 - 100%
  battery: number; // 0 - 100%
  signalRssi: number; // dBm (-115 to -55 dBm)
  snr: number; // dB (-10 to +12 dB)
  packetLoss: number; // % (0 - 15%)
  latency: number; // ms (40 - 250 ms)
  lastCommunication: string;
  position3D: [number, number, number]; // [x, y, z] for 3D digital twin
  geoCoords: [number, number]; // [latitude, longitude]
  elevation: number; // meters above sea level
  parentGatewayId: string; // e.g. "GW-ALPHA", "RELAY-01"
  measurements: SensorMeasurement;
  history: NodeHistoricalSample[];
  anomalyFlag?: string; // e.g. "Rapid acceleration", "High pore pressure"
  maintenanceFlag?: string;
  aiRiskContribution: number; // 0 - 100 score contribution
}

export type AlertSeverity = 'info' | 'low' | 'moderate' | 'high' | 'critical';
export type AlertCategory = 
  | 'subsidence' 
  | 'landslide' 
  | 'crack' 
  | 'weather' 
  | 'network' 
  | 'battery' 
  | 'sensor_fault';

export interface AlertIncident {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  timestamp: string;
  nodeId?: string;
  zone: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  status: 'active' | 'investigating' | 'mitigating' | 'resolved';
  recommendedAction: string;
  notes?: string[];
  restrictedZoneId?: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  nodeId: string;
  zone: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTechnician: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  createdDate: string;
  issueType: 'battery_replacement' | 'sensor_calibration' | 'antenna_realign' | 'firmware_update' | 'physical_inspection';
  notes: string;
}

export type ScenarioPreset = 
  | 'normal' 
  | 'heavy_rainfall' 
  | 'subsidence_event' 
  | 'network_battery_failure';

export interface AiriskAssessment {
  subsidenceScore: number; // 0 - 100
  subsidenceLevel: RiskSeverity;
  subsidenceTrend: 'stable' | 'increasing' | 'critical_acceleration';
  subsidenceAffectedZones: string[];
  subsidenceExplanation: string;
  subsidenceContributingFactors: { factor: string; impact: number; value: string }[];
  subsidenceForecast: { time: string; score: number; confidence: number }[];

  landslideScore: number; // 0 - 100
  landslideLevel: RiskSeverity;
  landslideTrend: 'stable' | 'elevated' | 'critical_shear';
  landslideAffectedZones: string[];
  landslideExplanation: string;
  landslideContributingFactors: { factor: string; impact: number; value: string }[];
  landslideForecast: { time: string; score: number; confidence: number }[];
}

export type UserRole = 
  | 'admin' 
  | 'mine_manager' 
  | 'safety_officer' 
  | 'field_technician' 
  | 'analyst' 
  | 'viewer';

export interface UserProfile {
  name: string;
  role: UserRole;
  title: string;
  avatar: string;
}

export interface SiteConfig {
  mineName: string;
  location: string;
  coordinates: string;
  activeSeams: string[];
  totalAreaHectares: number;
}
