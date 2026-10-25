import React from 'react';
import { BatteryTelemetry } from '../types/battery';
import { Zap, Gauge, Flame, BatteryCharging, ShieldAlert, Cpu } from 'lucide-react';

interface TelemetryCardsProps {
  telemetry: BatteryTelemetry;
  relayClosed: boolean;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({ telemetry, relayClosed }) => {
  const isCharging = telemetry.current > 0;
  const isHighTemp = telemetry.temperature >= 45;
  const isOverVoltage = telemetry.voltage >= 4.25 || telemetry.voltage <= 2.90;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. Terminal Bus Voltage */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono">Bus Voltage</span>
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {telemetry.voltage.toFixed(2)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">V</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Range: 3.00 - 4.20V</span>
            <span className={isOverVoltage ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
              {isOverVoltage ? 'Trip Hazard' : 'Nominal'}
            </span>
          </div>
        </div>
        {/* Visual range track */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverVoltage ? 'bg-rose-500' : 'bg-cyan-400'
            }`}
            style={{
              width: `${Math.min(100, Math.max(5, ((telemetry.voltage - 2.8) / (4.25 - 2.8)) * 100))}%`
            }}
          />
        </div>
      </div>

      {/* 2. Measured Current */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono">Pack Current</span>
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {Math.abs(telemetry.current).toString().padStart(3, '0')}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">mA</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Flow: {isCharging ? 'Charging' : telemetry.current < 0 ? 'Discharging' : 'Idle'}</span>
            <span className={isCharging ? 'text-emerald-400' : 'text-cyan-400'}>
              {isCharging ? '+ Solar IN' : '- Load OUT'}
            </span>
          </div>
        </div>
        {/* Visual Current Flow Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCharging ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
            style={{
              width: `${Math.min(100, Math.max(10, (Math.abs(telemetry.current) / 500) * 100))}%`
            }}
          />
        </div>
      </div>

      {/* 3. Instantaneous Power */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono">Net Power</span>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {Math.round(telemetry.power)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">mW</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{(telemetry.power / 1000).toFixed(3)} W</span>
            <span className="text-slate-400">P = V × I</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(8, (telemetry.power / 1200) * 100))}%` }}
          />
        </div>
      </div>

      {/* 4. Thermal Sensor */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono">Cell Temp</span>
          <Flame className={`w-3.5 h-3.5 ${isHighTemp ? 'text-rose-400' : 'text-cyan-400'}`} />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${
              isHighTemp ? 'text-rose-400' : 'text-white'
            }`}>
              {telemetry.temperature.toFixed(1)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Cutoff: 48.0°C</span>
            <span className={isHighTemp ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
              {isHighTemp ? 'Thermal Warning' : 'Optimal'}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isHighTemp ? 'bg-rose-500' : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, (telemetry.temperature / 60) * 100))}%` }}
          />
        </div>
      </div>

      {/* 5. State of Charge (SoC) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono">State of Charge</span>
          <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
              {telemetry.soc.toFixed(1)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Li-ion 18650</span>
            <span className="text-cyan-400 font-mono">Coulomb est.</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              telemetry.soc < 20 ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(3, telemetry.soc))}%` }}
          />
        </div>
      </div>

      {/* 6. AI State of Health (SoH) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-mono">Health (SoH)</span>
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
              {telemetry.soh.toFixed(1)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>R_int: {telemetry.internalResistance.toFixed(1)} mΩ</span>
            <span className="text-emerald-400">Good</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(5, telemetry.soh))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
