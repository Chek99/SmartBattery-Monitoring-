import React, { useState } from 'react';
import { solarForecast24h } from '../data/initialData';
import { Sun, CloudSun, Zap, ShieldCheck, Compass, BatteryCharging, ArrowUpRight } from 'lucide-react';

interface SolarOptimizerViewProps {
  currentSoc: number;
  batteryVoltage: number;
}

export const SolarOptimizerView: React.FC<SolarOptimizerViewProps> = ({ currentSoc, batteryVoltage }) => {
  const [strategy, setStrategy] = useState<'lifespan' | 'storm' | 'mppt'>('lifespan');

  // SVG Chart for 24h Solar vs Load
  const svgWidth = 840;
  const svgHeight = 220;
  const padX = 45;
  const padY = 25;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const maxPower = 400; // Watts

  const solarPoints = solarForecast24h.map((d, i) => {
    const x = padX + (i / (solarForecast24h.length - 1)) * chartW;
    const y = padY + chartH - (d.expectedSolarPower / maxPower) * chartH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const loadPoints = solarForecast24h.map((d, i) => {
    const x = padX + (i / (solarForecast24h.length - 1)) * chartW;
    const y = padY + chartH - (d.loadDemand / maxPower) * chartH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white">
                Predictive Solar Charging & MPPT Orchestration
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Synthesizes localized weather forecasts, expected irradiance curves, and load consumption patterns to
              proactively regulate charging current and prevent unnecessary micro-cycling degradation.
            </p>
          </div>

          {/* Strategy Mode Segmented Control */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 shrink-0 text-xs font-medium">
            <button
              onClick={() => setStrategy('lifespan')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                strategy === 'lifespan'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lifespan Cap (80% Max)
            </button>
            <button
              onClick={() => setStrategy('storm')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                strategy === 'storm'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Storm Pre-Charge (100%)
            </button>
            <button
              onClick={() => setStrategy('mppt')}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                strategy === 'mppt'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Max MPPT Harvest
            </button>
          </div>
        </div>
      </div>

      {/* Solar Status Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Current Irradiance</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">780</span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">W/m²</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Peak window: 11:00 - 14:00</span>
            <span className="text-amber-400 font-semibold">Clear Sky</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Est. Daily Harvest</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-cyan-400 tabular-nums">2.48</span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">kWh</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>PV Array: 400W Mono-Si</span>
            <span className="text-emerald-400">98.2% MPPT eff.</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Time to Target Charge</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">1.4</span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">Hours</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Target: {strategy === 'lifespan' ? '80% SoC' : '100% SoC'}</span>
            <span className="text-cyan-400 font-mono">Now: {currentSoc.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Expected Cloud Front</span>
            <CloudSun className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">T+18</span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">Hours</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Tomorrow: 65% Rain</span>
            <span className="text-amber-400">Pre-charge advised</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Solar Generation vs Consumption Curve */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">24-Hour Solar Yield vs. Load Consumption Forecast</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies net surplus energy available for battery storage without grid dependency
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span>Solar Generation (W)</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-0.5 border-b border-cyan-400 border-dashed inline-block" />
              <span>Load Demand (W)</span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 w-full overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
            {/* Horizontal Grid */}
            {[0, 100, 200, 300, 400].map((pwr) => {
              const y = padY + chartH - (pwr / maxPower) * chartH;
              return (
                <g key={pwr}>
                  <line x1={padX} y1={y} x2={svgWidth - padX} y2={y} stroke="#1e293b" strokeDasharray="2 4" />
                  <text x={padX - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">
                    {pwr} W
                  </text>
                </g>
              );
            })}

            {/* Vertical Hour Grid */}
            {solarForecast24h.filter((_, idx) => idx % 3 === 0).map((hourData, i) => {
              const realIdx = i * 3;
              const x = padX + (realIdx / (solarForecast24h.length - 1)) * chartW;
              return (
                <g key={hourData.hour}>
                  <line x1={x} y1={padY} x2={x} y2={padY + chartH} stroke="#1e293b" strokeDasharray="2 4" />
                  <text x={x} y={padY + chartH + 16} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                    {hourData.hour}
                  </text>
                </g>
              );
            })}

            {/* Solar Path */}
            <path d={solarPoints} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

            {/* Load Path */}
            <path d={loadPoints} fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Strategy Description Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">
            Active Strategy: <strong className="text-white">
              {strategy === 'lifespan' && 'Cycle Preservation (Avoids 80-100% High-Voltage Cathode Oxidation)'}
              {strategy === 'storm' && 'Pre-Emptive Full Charge (Guarantees 100% Backup Before Approaching Storm Front)'}
              {strategy === 'mppt' && 'Unrestricted MPPT Yield (Continuous Maximum Solar Array Harvesting)'}
            </strong>
          </span>
          <span className="font-mono text-cyan-400">Solar Bus: 18.4V → Bat: {batteryVoltage.toFixed(2)}V</span>
        </div>
      </div>
    </div>
  );
};
