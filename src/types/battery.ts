export interface BatteryTelemetry {
  timestamp: number;
  voltage: number; // Volts (e.g. 3.41 V)
  current: number; // mA (positive = charging, negative = discharging)
  power: number; // mW
  temperature: number; // °C
  soc: number; // State of Charge % (0 - 100)
  soh: number; // State of Health % (0 - 100)
  internalResistance: number; // mOhm
}

export interface BatteryCell {
  id: number;
  voltage: number;
  temperature: number;
  health: number;
  balancing: boolean;
}

export interface FaultAlert {
  id: string;
  timestamp: number;
  severity: 'critical' | 'warning' | 'info';
  type: 'overvoltage' | 'undervoltage' | 'overtemperature' | 'high_current' | 'cell_imbalance' | 'relay_trip';
  message: string;
  value: string;
  threshold: string;
  acknowledged: boolean;
}

export interface SolarForecastHour {
  hour: string;
  irradiance: number; // W/m²
  ambientTemp: number; // °C
  expectedSolarPower: number; // Watts
  loadDemand: number; // Watts
  chargeRecommendation: 'max_charge' | 'eco_charge' | 'idle' | 'discharge';
}

export interface HealthPrediction {
  currentCapacityMah: number;
  nominalCapacityMah: number;
  cycleCount: number;
  depthOfDischargeAvg: number; // %
  predictedRemainingCycles: number;
  predictedRemainingDays: number;
  endOfLifeThresholdPercent: number; // usually 80%
  coulombicEfficiency: number; // %
  degradationRatePer100Cycles: number; // %
}

export type OperationMode = 'solar_charge' | 'grid_charge' | 'discharging_load' | 'idle';
