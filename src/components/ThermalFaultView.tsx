import React, { useState } from 'react';
import { BatteryCell, FaultAlert } from '../types/battery';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Power, RotateCcw, Check, CheckCircle2 } from 'lucide-react';

interface ThermalFaultViewProps {
  cells: BatteryCell[];
  alerts: FaultAlert[];
  relayClosed: boolean;
  onToggleRelay: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onTriggerBalancing: () => void;
}

export const ThermalFaultView: React.FC<ThermalFaultViewProps> = ({
  cells,
  alerts,
  relayClosed,
  onToggleRelay,
  onAcknowledgeAlert,
  onTriggerBalancing
}) => {
  const [maxTempLimit, setMaxTempLimit] = useState(48.0);
  const [maxVoltLimit, setMaxVoltLimit] = useState(4.25);
  const [minVoltLimit, setMinVoltLimit] = useState(2.90);
  const [maxCurrentLimit, setMaxCurrentLimit] = useState(2000);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  const cellVoltages = cells.map(c => c.voltage);
  const maxV = Math.max(...cellVoltages);
  const minV = Math.min(...cellVoltages);
  const deltaV = Math.round((maxV - minV) * 1000) / 1000;
  const isImbalanced = deltaV > 0.035;

  const handleSaveThresholds = () => {
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Hardware Relay Controller */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">
                Intelligent Thermal, Anomaly & Protection Circuit Subsystem
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Monitors individual cell divergence, thermal gradients, and over-current anomalies. Controls the independent
              optocoupled hardware protection relay (GPIO 18) to disconnect charging or load during critical faults.
            </p>
          </div>

          {/* Physical Disconnect Relay Status & Control */}
          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Protection Relay (GPIO 18)</span>
              <span className={`text-sm font-bold font-mono ${relayClosed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {relayClosed ? 'ARMED (CONDUCTING)' : 'TRIPPED (DISCONNECTED)'}
              </span>
            </div>
            <button
              onClick={onToggleRelay}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 font-mono ${
                relayClosed
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{relayClosed ? 'Manual Trip' : 'Reset Relay'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Cell Pack Voltage & Thermal Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">4-Cell Battery Pack Telemetry & Smart Balancing</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual cell voltage differentials, thermal delta, and shunt balancing
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-slate-400">
              Delta (ΔV): <span className={`font-bold ${isImbalanced ? 'text-amber-400' : 'text-emerald-400'}`}>{deltaV.toFixed(3)} V</span>
            </div>
            <button
              onClick={onTriggerBalancing}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Equalize Cells</span>
            </button>
          </div>
        </div>

        {/* The 4 Cells Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {cells.map((cell) => {
            const isHighest = cell.voltage === maxV;
            const isLowest = cell.voltage === minV;
            return (
              <div
                key={cell.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono font-bold text-white">Cell #{cell.id}</span>
                  <span className="text-[11px] font-mono">
                    {cell.balancing ? (
                      <span className="text-amber-400 font-semibold animate-pulse">Shunt Active</span>
                    ) : (
                      <span className="text-slate-500">Standby</span>
                    )}
                  </span>
                </div>

                {/* Voltage */}
                <div className="flex items-baseline">
                  <span className="text-2xl font-mono font-bold text-white tabular-nums">
                    {cell.voltage.toFixed(3)}
                  </span>
                  <span className="ml-1 text-xs font-mono text-slate-400">V</span>
                </div>

                {/* Temp & Health */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Temp</span>
                    <span className="text-slate-200">{cell.temperature.toFixed(1)} °C</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500">Health</span>
                    <span className="text-emerald-400">{cell.health.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Bar representation */}
                <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cell.voltage > 4.2 ? 'bg-rose-500' : 'bg-cyan-400'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, ((cell.voltage - 3.0) / (4.25 - 3.0)) * 100))}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Threshold Calibration & Incident Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Threshold Tuner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Hardware Protection Thresholds</h3>
            </div>
            <button
              onClick={handleSaveThresholds}
              className="px-3 py-1 text-xs font-medium bg-cyan-500 text-slate-950 font-sans hover:bg-cyan-400 rounded transition-colors flex items-center gap-1"
            >
              {thresholdSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Limits</span>
              )}
            </button>
          </div>

          <div className="space-y-4 mt-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Over-Temperature Cutoff</span>
                <span className="text-cyan-400 font-bold">{maxTempLimit.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="40"
                max="60"
                step="0.5"
                value={maxTempLimit}
                onChange={(e) => setMaxTempLimit(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Over-Voltage Trip Threshold</span>
                <span className="text-cyan-400 font-bold">{maxVoltLimit.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="4.10"
                max="4.35"
                step="0.01"
                value={maxVoltLimit}
                onChange={(e) => setMaxVoltLimit(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Under-Voltage Cutoff Threshold</span>
                <span className="text-cyan-400 font-bold">{minVoltLimit.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="2.50"
                max="3.20"
                step="0.05"
                value={minVoltLimit}
                onChange={(e) => setMinVoltLimit(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Over-Current Cutoff</span>
                <span className="text-cyan-400 font-bold">{maxCurrentLimit} mA</span>
              </div>
              <input
                type="range"
                min="1000"
                max="3000"
                step="50"
                value={maxCurrentLimit}
                onChange={(e) => setMaxCurrentLimit(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded"
              />
            </div>
          </div>
        </div>

        {/* Incident Audit Log */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Protection Incident Audit Log</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{alerts.length} logged events</span>
            </div>

            <div className="space-y-3 mt-4 max-h-72 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No critical faults detected. Circuit nominal.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold ${
                            alert.severity === 'critical'
                              ? 'text-rose-400'
                              : alert.severity === 'warning'
                              ? 'text-amber-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          [{alert.severity.toUpperCase()}]
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-200">{alert.message}</p>
                      <div className="text-[11px] font-mono text-slate-400">
                        Value: <span className="text-white">{alert.value}</span> · Threshold: {alert.threshold}
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors shrink-0"
                      >
                        Ack
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Hardware Watchdog: Active (Timer 500ms)</span>
            <span className="text-emerald-400">Trip Delay: &lt;12ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
