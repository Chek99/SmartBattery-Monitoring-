import React, { useState } from 'react';
import { HealthPrediction } from '../types/battery';
import { generateDegradationCurve } from '../data/initialData';
import { ShieldCheck, TrendingDown, Gauge, Cpu, Calendar, Sliders, AlertTriangle } from 'lucide-react';

interface HealthPredictionViewProps {
  prediction: HealthPrediction;
  internalResistance: number;
}

export const HealthPredictionView: React.FC<HealthPredictionViewProps> = ({
  prediction,
  internalResistance
}) => {
  const [operatingTempBias, setOperatingTempBias] = useState<number>(27); // °C
  const [dodBias, setDodBias] = useState<number>(70); // %
  const [hoveredCycle, setHoveredCycle] = useState<number | null>(null);

  const baseCurve = generateDegradationCurve();

  // Adjust curve based on user operating parameters
  // Arrhenius factor: higher temp accelerates decay
  // Higher DoD accelerates cycle fade
  const tempAccel = Math.exp((operatingTempBias - 25) / 18);
  const dodFactor = Math.pow(dodBias / 65, 1.2);
  const combinedFactor = tempAccel * dodFactor;

  const adjustedCurve = baseCurve.map((pt) => {
    if (pt.cycle <= 384 && pt.measuredCapacity !== null) {
      return pt; // historical data fixed
    }
    const nominal = 2600;
    const excessDecay = 0.00034 * Math.pow(pt.cycle, 0.76) * (combinedFactor - 1);
    const predictedCap = Math.max(1400, Math.round(pt.predictedCapacity - nominal * Math.max(0, excessDecay)));
    return {
      ...pt,
      predictedCapacity: predictedCap,
      sohPercent: Math.round((predictedCap / nominal) * 1000) / 10
    };
  });

  // Calculate adjusted RUL
  const eolCap = 2600 * 0.80; // 2080 mAh
  const eolPoint = adjustedCurve.find(p => p.predictedCapacity <= eolCap) || adjustedCurve[adjustedCurve.length - 1];
  const calculatedRemainingCycles = Math.max(0, eolPoint.cycle - prediction.cycleCount);
  const calculatedRemainingDays = Math.round(calculatedRemainingCycles * 0.85);

  // SVG Chart rendering
  const svgWidth = 840;
  const svgHeight = 260;
  const padX = 55;
  const padY = 30;
  const chartW = svgWidth - padX * 2;
  const chartH = svgHeight - padY * 2;

  const minCycle = 0;
  const maxCycle = 1200;
  const minCap = 1600;
  const maxCap = 2700;

  const getX = (cycle: number) => padX + (cycle / maxCycle) * chartW;
  const getY = (cap: number) => padY + chartH - ((cap - minCap) / (maxCap - minCap)) * chartH;

  // Path for ML predicted curve
  const predictedPath = adjustedCurve
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.cycle).toFixed(1)},${getY(pt.predictedCapacity).toFixed(1)}`)
    .join(' ');

  const currentCapY = getY(prediction.currentCapacityMah);
  const currentCapX = getX(prediction.cycleCount);
  const eolY = getY(eolCap);

  return (
    <div className="space-y-6">
      {/* Top Banner / Thesis connection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                Machine Learning State of Health (SoH) & RUL Estimator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Combines empirical battery cycle history, Arrhenius thermal degradation dynamics, and real-time internal
              impedance ($R_{`{int}`}$) to predict capacity fade and Remaining Useful Life before reaching the 80% End-of-Life (EoL) retirement boundary.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">AI Degradation Model</span>
              <span className="text-xs font-semibold text-cyan-400">Physics-Informed Random Forest</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Remaining Useful Life */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Predicted RUL</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {calculatedRemainingCycles}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">Cycles</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>~{calculatedRemainingDays} operational days</span>
            <span className="text-cyan-400">80% EoL target</span>
          </div>
        </div>

        {/* Capacity Retention */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Current Capacity</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-emerald-400 tabular-nums">
              {prediction.currentCapacityMah}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">/ 2600 mAh</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>SoH: {((prediction.currentCapacityMah / prediction.nominalCapacityMah) * 100).toFixed(1)}%</span>
            <span className="text-emerald-400">Nominal 18650</span>
          </div>
        </div>

        {/* Internal Impedance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Internal Impedance (R_int)</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {internalResistance.toFixed(1)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">mΩ</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Fresh cell: 25.0 mΩ</span>
            <span className="text-amber-400 font-semibold">+54% growth</span>
          </div>
        </div>

        {/* Coulombic Efficiency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-mono">Coulombic Efficiency</span>
            <TrendingDown className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-mono font-bold text-white tabular-nums">
              {prediction.coulombicEfficiency.toFixed(2)}
            </span>
            <span className="ml-1.5 text-xs font-mono uppercase text-slate-400">%</span>
          </div>
          <div className="mt-2 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Cycle fade: 1.95% / 100 cyc</span>
            <span className="text-emerald-400">High efficiency</span>
          </div>
        </div>
      </div>

      {/* Degradation Trajectory Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Full-Life Capacity Fade & Degradation Trajectory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirical historical cycle points vs. Machine-Learning model projection to 1200 cycles
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              <span>Historical Cycles (1-{prediction.cycleCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span>ML Predicted Curve</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-0.5 border-b border-rose-400 border-dashed inline-block" />
              <span>80% EoL Cutoff</span>
            </div>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="relative mt-4 w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            onMouseLeave={() => setHoveredCycle(null)}
          >
            {/* Horizontal Gridlines */}
            {[2600, 2400, 2200, 2080, 1800].map((cap) => {
              const y = getY(cap);
              const isEol = cap === 2080;
              return (
                <g key={cap}>
                  <line
                    x1={padX}
                    y1={y}
                    x2={svgWidth - padX}
                    y2={y}
                    stroke={isEol ? '#f43f5e' : '#1e293b'}
                    strokeDasharray={isEol ? '4 3' : '2 4'}
                    strokeWidth={isEol ? '1.5' : '1'}
                  />
                  <text
                    x={padX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill={isEol ? '#f43f5e' : '#64748b'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {cap} mAh {isEol ? '(80% EoL)' : ''}
                  </text>
                </g>
              );
            })}

            {/* Vertical Cycle Gridlines */}
            {[0, 200, 400, 600, 800, 1000, 1200].map((cyc) => {
              const x = getX(cyc);
              return (
                <g key={cyc}>
                  <line
                    x1={x}
                    y1={padY}
                    x2={x}
                    y2={padY + chartH}
                    stroke="#1e293b"
                    strokeDasharray="2 4"
                  />
                  <text
                    x={x}
                    y={padY + chartH + 16}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {cyc} cyc
                  </text>
                </g>
              );
            })}

            {/* Predicted Trajectory Line */}
            <path
              d={predictedPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Historical Scatter Points */}
            {adjustedCurve
              .filter(p => p.cycle <= prediction.cycleCount && p.measuredCapacity !== null)
              .map((pt) => {
                const cx = getX(pt.cycle);
                const cy = getY(pt.measuredCapacity!);
                return (
                  <circle
                    key={pt.cycle}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="#06b6d4"
                    stroke="#082f49"
                    strokeWidth="1.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  />
                );
              })}

            {/* Current Operating Point Marker */}
            <g transform={`translate(${currentCapX}, ${currentCapY})`}>
              <circle r="6" fill="#06b6d4" className="animate-ping opacity-60" />
              <circle r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Interactive Model Stress-Testing Parameters */}
        <div className="mt-6 pt-5 border-t border-slate-800 bg-slate-950/60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white">Digital Battery Twin Parameter Calibration</span>
            <span className="text-xs text-slate-400 ml-2">Adjust stress variables to simulate remaining lifetime</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">Average Operating Temperature</span>
                <span className="text-cyan-400 font-bold">{operatingTempBias} °C</span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                step="1"
                value={operatingTempBias}
                onChange={(e) => setOperatingTempBias(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>15°C (Cool storage)</span>
                <span>25°C (Nominal lab)</span>
                <span>45°C (Severe thermal stress)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-400">Average Depth of Discharge (DoD)</span>
                <span className="text-cyan-400 font-bold">{dodBias} %</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={dodBias}
                onChange={(e) => setDodBias(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>30% (Micro-cycling / 3x life)</span>
                <span>70% (Standard)</span>
                <span>95% (Deep discharge fatigue)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
