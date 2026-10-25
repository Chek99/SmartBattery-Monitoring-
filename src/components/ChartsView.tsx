import React, { useState } from 'react';
import { BatteryTelemetry } from '../types/battery';
import { Activity, Clock, Zap, Flame, Gauge, Cpu } from 'lucide-react';

interface ChartsViewProps {
  history: BatteryTelemetry[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ history }) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'voltage' | 'current' | 'power' | 'temperature'>('all');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const displayPoints = history.slice(-40);
  const hoveredPoint = hoverIndex !== null && displayPoints[hoverIndex] ? displayPoints[hoverIndex] : displayPoints[displayPoints.length - 1];

  // Helper for generating SVG path
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const getCoordinates = (values: number[], minVal: number, maxVal: number) => {
    if (values.length === 0) return '';
    const span = maxVal - minVal || 1;
    return values
      .map((val, idx) => {
        const x = paddingX + (idx / (values.length - 1 || 1)) * graphWidth;
        const normalizedY = (val - minVal) / span;
        const y = paddingY + graphHeight - normalizedY * graphHeight;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Min and max for channels
  const voltages = displayPoints.map(p => p.voltage);
  const currents = displayPoints.map(p => p.current);
  const powers = displayPoints.map(p => p.power);
  const temps = displayPoints.map(p => p.temperature);

  const minV = Math.floor(Math.min(...voltages, 3.2) * 10) / 10;
  const maxV = Math.ceil(Math.max(...voltages, 3.6) * 10) / 10;

  const minI = Math.min(0, Math.min(...currents));
  const maxI = Math.max(100, Math.max(...currents) + 20);

  const minP = 0;
  const maxP = Math.max(300, Math.max(...powers) + 50);

  const minT = 20;
  const maxT = Math.max(35, Math.ceil(Math.max(...temps) + 5));

  const voltagePath = getCoordinates(voltages, minV, maxV);
  const currentPath = getCoordinates(currents, minI, maxI);
  const powerPath = getCoordinates(powers, minP, maxP);
  const tempPath = getCoordinates(temps, minT, maxT);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
      {/* Chart Header & Channel Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Live Telemetry Waveform Oscilloscope</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">High-rate sensor bus samples (V, I, P, Temp)</p>
        </div>

        {/* Channel Selection Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveChannel('all')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeChannel === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setActiveChannel('voltage')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeChannel === 'voltage' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voltage (V)
          </button>
          <button
            onClick={() => setActiveChannel('current')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeChannel === 'current' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Current (mA)
          </button>
          <button
            onClick={() => setActiveChannel('power')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeChannel === 'power' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Power (mW)
          </button>
          <button
            onClick={() => setActiveChannel('temperature')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeChannel === 'temperature' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Temp (°C)
          </button>
        </div>
      </div>

      {/* Real-Time Hover HUD */}
      {hoveredPoint && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-3 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Time: {new Date(hoveredPoint.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-bold tabular-nums">V: {hoveredPoint.voltage.toFixed(2)} V</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <Gauge className="w-3.5 h-3.5" />
            <span className="font-bold tabular-nums">I: {Math.round(hoveredPoint.current)} mA</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Cpu className="w-3.5 h-3.5" />
            <span className="font-bold tabular-nums">P: {Math.round(hoveredPoint.power)} mW</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold tabular-nums">T: {hoveredPoint.temperature.toFixed(1)} °C</span>
          </div>
        </div>
      )}

      {/* SVG Multi-trace Viewport */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            if (relX >= paddingX && relX <= svgWidth - paddingX) {
              const fraction = (relX - paddingX) / graphWidth;
              const idx = Math.min(displayPoints.length - 1, Math.max(0, Math.round(fraction * (displayPoints.length - 1))));
              setHoverIndex(idx);
            }
          }}
        >
          {/* Subtle Gridlines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + graphHeight / 2} x2={svgWidth - paddingX} y2={paddingY + graphHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + graphHeight} x2={svgWidth - paddingX} y2={paddingY + graphHeight} stroke="#334155" />

          {/* Time axis hairline verticals */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={paddingX + ratio * graphWidth}
              y1={paddingY}
              x2={paddingX + ratio * graphWidth}
              y2={paddingY + graphHeight}
              stroke="#1e293b"
              strokeDasharray="2 4"
            />
          ))}

          {/* Traces */}
          {(activeChannel === 'all' || activeChannel === 'voltage') && (
            <path
              d={voltagePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeChannel === 'all' || activeChannel === 'current') && (
            <path
              d={currentPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray={activeChannel === 'all' ? '4 2' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeChannel === 'all' || activeChannel === 'power') && (
            <path
              d={powerPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {(activeChannel === 'all' || activeChannel === 'temperature') && (
            <path
              d={tempPath}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray={activeChannel === 'all' ? '2 2' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active Hover Crosshair Line */}
          {hoverIndex !== null && (
            <line
              x1={paddingX + (hoverIndex / (displayPoints.length - 1 || 1)) * graphWidth}
              y1={paddingY}
              x2={paddingX + (hoverIndex / (displayPoints.length - 1 || 1)) * graphWidth}
              y2={paddingY + graphHeight}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Voltage ({minV}V - {maxV}V)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Current ({minI}mA - {maxI}mA)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" /> Power ({minP}mW - {maxP}mW)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 inline-block" /> Temp ({minT}°C - {maxT}°C)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Continuous 3.0s telemetry polling</span>
        </div>
      </div>
    </div>
  );
};
