import { BatteryTelemetry, BatteryCell, FaultAlert, SolarForecastHour, HealthPrediction } from '../types/battery';

// Baseline matches user prototype image: V = 3.41 V, I = 54 mA, P = 184 mW
export const initialTelemetry: BatteryTelemetry = {
  timestamp: Date.now(),
  voltage: 3.41,
  current: 54, // mA
  power: 184, // mW (3.41 * 54 = 184.14 mW)
  temperature: 26.8, // °C
  soc: 24.5, // %
  soh: 92.4, // %
  internalResistance: 38.6 // mΩ
};

export const initialCells: BatteryCell[] = [
  { id: 1, voltage: 3.41, temperature: 26.8, health: 92.8, balancing: false },
  { id: 2, voltage: 3.40, temperature: 26.6, health: 92.4, balancing: false },
  { id: 3, voltage: 3.42, temperature: 27.1, health: 91.9, balancing: true },
  { id: 4, voltage: 3.39, temperature: 26.5, health: 92.5, balancing: false },
];

export const initialHealthPrediction: HealthPrediction = {
  currentCapacityMah: 2402,
  nominalCapacityMah: 2600, // standard 18650 Li-ion cell rating
  cycleCount: 384,
  depthOfDischargeAvg: 68.5, // %
  predictedRemainingCycles: 576,
  predictedRemainingDays: 482,
  endOfLifeThresholdPercent: 80,
  coulombicEfficiency: 99.4, // %
  degradationRatePer100Cycles: 1.95 // %
};

// Generate 40 historical telemetry points
export function generateInitialHistory(): BatteryTelemetry[] {
  const points: BatteryTelemetry[] = [];
  const now = Date.now();
  for (let i = 40; i >= 0; i--) {
    const t = now - i * 3000;
    // Slight realistic drift around 3.41V and 54mA
    const noiseV = (Math.sin(i * 0.3) * 0.02);
    const noiseI = Math.round(Math.cos(i * 0.25) * 4);
    const v = Math.round((3.41 + noiseV) * 100) / 100;
    const curr = 54 + noiseI;
    const p = Math.round(v * curr);
    const temp = Math.round((26.5 + (40 - i) * 0.015) * 10) / 10;
    points.push({
      timestamp: t,
      voltage: v,
      current: curr,
      power: p,
      temperature: temp,
      soc: 24.5,
      soh: 92.4,
      internalResistance: 38.6
    });
  }
  return points;
}

export const initialAlerts: FaultAlert[] = [
  {
    id: 'alt-01',
    timestamp: Date.now() - 1000 * 60 * 42,
    severity: 'info',
    type: 'relay_trip',
    message: 'Hardware Protection Relay initialized and armed (Normal mode)',
    value: 'ARMED',
    threshold: 'Nominal',
    acknowledged: true
  },
  {
    id: 'alt-02',
    timestamp: Date.now() - 1000 * 60 * 18,
    severity: 'warning',
    type: 'cell_imbalance',
    message: 'Cell #3 voltage deviation delta exceeds 0.025V baseline',
    value: '0.030V delta',
    threshold: '0.025V max',
    acknowledged: false
  }
];

export const solarForecast24h: SolarForecastHour[] = [
  { hour: '06:00', irradiance: 45, ambientTemp: 19, expectedSolarPower: 12, loadDemand: 18, chargeRecommendation: 'idle' },
  { hour: '07:00', irradiance: 180, ambientTemp: 21, expectedSolarPower: 58, loadDemand: 22, chargeRecommendation: 'eco_charge' },
  { hour: '08:00', irradiance: 410, ambientTemp: 23, expectedSolarPower: 145, loadDemand: 25, chargeRecommendation: 'max_charge' },
  { hour: '09:00', irradiance: 640, ambientTemp: 25, expectedSolarPower: 240, loadDemand: 30, chargeRecommendation: 'max_charge' },
  { hour: '10:00', irradiance: 820, ambientTemp: 27, expectedSolarPower: 310, loadDemand: 35, chargeRecommendation: 'max_charge' },
  { hour: '11:00', irradiance: 950, ambientTemp: 29, expectedSolarPower: 360, loadDemand: 40, chargeRecommendation: 'max_charge' },
  { hour: '12:00', irradiance: 990, ambientTemp: 31, expectedSolarPower: 380, loadDemand: 45, chargeRecommendation: 'max_charge' },
  { hour: '13:00', irradiance: 920, ambientTemp: 32, expectedSolarPower: 350, loadDemand: 42, chargeRecommendation: 'max_charge' },
  { hour: '14:00', irradiance: 780, ambientTemp: 31, expectedSolarPower: 290, loadDemand: 38, chargeRecommendation: 'max_charge' },
  { hour: '15:00', irradiance: 560, ambientTemp: 29, expectedSolarPower: 210, loadDemand: 35, chargeRecommendation: 'eco_charge' },
  { hour: '16:00', irradiance: 310, ambientTemp: 27, expectedSolarPower: 110, loadDemand: 32, chargeRecommendation: 'eco_charge' },
  { hour: '17:00', irradiance: 120, ambientTemp: 25, expectedSolarPower: 35, loadDemand: 36, chargeRecommendation: 'idle' },
  { hour: '18:00', irradiance: 20, ambientTemp: 23, expectedSolarPower: 5, loadDemand: 48, chargeRecommendation: 'discharge' },
  { hour: '19:00', irradiance: 0, ambientTemp: 22, expectedSolarPower: 0, loadDemand: 55, chargeRecommendation: 'discharge' },
  { hour: '20:00', irradiance: 0, ambientTemp: 21, expectedSolarPower: 0, loadDemand: 50, chargeRecommendation: 'discharge' },
  { hour: '21:00', irradiance: 0, ambientTemp: 20, expectedSolarPower: 0, loadDemand: 42, chargeRecommendation: 'discharge' },
  { hour: '22:00', irradiance: 0, ambientTemp: 19, expectedSolarPower: 0, loadDemand: 28, chargeRecommendation: 'discharge' },
  { hour: '23:00', irradiance: 0, ambientTemp: 18, expectedSolarPower: 0, loadDemand: 20, chargeRecommendation: 'discharge' },
  { hour: '00:00', irradiance: 0, ambientTemp: 18, expectedSolarPower: 0, loadDemand: 16, chargeRecommendation: 'discharge' },
  { hour: '01:00', irradiance: 0, ambientTemp: 17, expectedSolarPower: 0, loadDemand: 15, chargeRecommendation: 'discharge' },
  { hour: '02:00', irradiance: 0, ambientTemp: 17, expectedSolarPower: 0, loadDemand: 15, chargeRecommendation: 'discharge' },
  { hour: '03:00', irradiance: 0, ambientTemp: 16, expectedSolarPower: 0, loadDemand: 15, chargeRecommendation: 'discharge' },
  { hour: '04:00', irradiance: 0, ambientTemp: 16, expectedSolarPower: 0, loadDemand: 16, chargeRecommendation: 'discharge' },
  { hour: '05:00', irradiance: 5, ambientTemp: 17, expectedSolarPower: 0, loadDemand: 17, chargeRecommendation: 'idle' },
];

// 1200-cycle degradation trajectory data
export interface DegradationPoint {
  cycle: number;
  measuredCapacity: number | null; // mAh
  predictedCapacity: number; // mAh
  sohPercent: number;
  resistanceMilliOhm: number;
}

export function generateDegradationCurve(): DegradationPoint[] {
  const points: DegradationPoint[] = [];
  const nominal = 2600;
  
  for (let cycle = 0; cycle <= 1200; cycle += 50) {
    // Non-linear capacity fade: Q = Q0 * (1 - A * cycle^0.75 - B * exp(C * temp))
    const decayFraction = 0.00034 * Math.pow(cycle, 0.76);
    const capacity = Math.max(1600, Math.round(nominal * (1 - decayFraction)));
    const soh = Math.round((capacity / nominal) * 1000) / 10;
    const rInt = Math.round((25 + 0.038 * cycle) * 10) / 10;
    
    // Cycles <= 400 are historical measured data
    const isHistorical = cycle <= 400;
    
    points.push({
      cycle,
      measuredCapacity: isHistorical ? Math.round(capacity + (Math.sin(cycle) * 8)) : null,
      predictedCapacity: capacity,
      sohPercent: soh,
      resistanceMilliOhm: rInt
    });
  }
  return points;
}
