import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TelemetryCards } from './components/TelemetryCards';
import { VirtualLcdDisplay } from './components/VirtualLcdDisplay';
import { ChartsView } from './components/ChartsView';
import { HealthPredictionView } from './components/HealthPredictionView';
import { ThermalFaultView } from './components/ThermalFaultView';
import { SolarOptimizerView } from './components/SolarOptimizerView';
import { Esp32BridgeView } from './components/Esp32BridgeView';
import { ProjectReferenceModal } from './components/ProjectReferenceModal';
import { ImplementationGuideModal } from './components/ImplementationGuideModal';
import {
  initialTelemetry,
  initialCells,
  initialHealthPrediction,
  generateInitialHistory,
  initialAlerts
} from './data/initialData';
import { BatteryTelemetry, BatteryCell, FaultAlert, HealthPrediction } from './types/battery';
import { estimateSoCFromVoltage, calculatePowerMw } from './services/batteryPhysics';
import { AlertTriangle, ShieldCheck, Sun, Cpu, ArrowRight, BookOpen, HardDrive } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'thermal' | 'solar' | 'esp32'>('overview');
  const [telemetry, setTelemetry] = useState<BatteryTelemetry>(initialTelemetry);
  const [history, setHistory] = useState<BatteryTelemetry[]>(generateInitialHistory());
  const [cells, setCells] = useState<BatteryCell[]>(initialCells);
  const [alerts, setAlerts] = useState<FaultAlert[]>(initialAlerts);
  const [prediction, setPrediction] = useState<HealthPrediction>(initialHealthPrediction);
  const [relayClosed, setRelayClosed] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isProjectDossierOpen, setIsProjectDossierOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHardwareLinked, setIsHardwareLinked] = useState<boolean>(false);

  const apiEndpoint = typeof window !== 'undefined'
    ? `${window.location.origin}/api/telemetry`
    : 'http://localhost:3000/api/telemetry';

  // Poll backend for real hardware telemetry / simulated stream
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          if (data && data.latest) {
            if (data.latest.source === 'hardware') {
              setIsHardwareLinked(true);
              setTelemetry(data.latest);
              if (data.history && Array.isArray(data.history)) {
                setHistory(data.history);
              }
              return;
            }
          }
        }
      } catch (err) {
        // Fallback to client physics if offline
      }

      // Client simulation step
      setTelemetry((prev) => {
        if (!relayClosed) {
          const updated: BatteryTelemetry = {
            ...prev,
            current: 0,
            power: 0,
            temperature: Math.round(Math.max(24, prev.temperature - 0.1) * 10) / 10,
            timestamp: Date.now()
          };
          setHistory((hist) => [...hist.slice(-70), updated]);
          return updated;
        }

        const noiseV = (Math.random() - 0.49) * 0.008;
        const noiseI = Math.round((Math.random() - 0.48) * 3);
        const newV = Math.round(Math.max(2.85, Math.min(4.22, prev.voltage + noiseV)) * 100) / 100;
        const newI = Math.round(Math.max(10, Math.min(180, prev.current + noiseI)));
        const newP = calculatePowerMw(newV, newI);
        const newTemp = Math.round(Math.max(22, Math.min(42, prev.temperature + (Math.random() - 0.49) * 0.05)) * 10) / 10;
        const newSoc = estimateSoCFromVoltage(newV);

        const updated: BatteryTelemetry = {
          ...prev,
          voltage: newV,
          current: newI,
          power: newP,
          temperature: newTemp,
          soc: newSoc,
          timestamp: Date.now()
        };

        setHistory((hist) => [...hist.slice(-70), updated]);
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, relayClosed]);

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = 'Timestamp,ISO_Time,Voltage_V,Current_mA,Power_mW,Temperature_C,SoC_Percent,SoH_Percent,InternalResistance_mOhm\n';
    const rows = history
      .map(
        (h) =>
          `${h.timestamp},${new Date(h.timestamp).toISOString()},${h.voltage.toFixed(2)},${h.current},${h.power},${h.temperature.toFixed(1)},${h.soc.toFixed(1)},${h.soh.toFixed(1)},${h.internalResistance.toFixed(1)}`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `battery_telemetry_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Toggle Relay Trip / Reset
  const handleToggleRelay = () => {
    const nextState = !relayClosed;
    setRelayClosed(nextState);

    const newAlert: FaultAlert = {
      id: `trip-${Date.now()}`,
      timestamp: Date.now(),
      severity: nextState ? 'info' : 'critical',
      type: 'relay_trip',
      message: nextState
        ? 'Protection Relay manually ARMED and conducting'
        : 'Protection Relay manually TRIPPED and circuit isolated',
      value: nextState ? 'CLOSED' : 'OPEN',
      threshold: 'Manual Override',
      acknowledged: false
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  // Trigger active cell balancing simulation
  const handleTriggerBalancing = () => {
    setCells((prev) => {
      const avgV = prev.reduce((sum, c) => sum + c.voltage, 0) / prev.length;
      return prev.map((c) => ({
        ...c,
        voltage: Math.round((c.voltage * 0.4 + avgV * 0.6) * 1000) / 1000,
        balancing: Math.abs(c.voltage - avgV) > 0.005
      }));
    });
  };

  // Inject manual simulation values from ESP32 bench
  const handleInjectTelemetry = async (v: number, i: number, temp: number) => {
    const p = calculatePowerMw(v, i);
    const soc = estimateSoCFromVoltage(v);

    // Also post to backend
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voltage: v, current: i, power: p, temperature: temp })
      });
    } catch (e) {
      // ignore
    }

    // Fault check
    if (temp >= 48.0 && relayClosed) {
      setRelayClosed(false);
      setAlerts((prev) => [
        {
          id: `fault-temp-${Date.now()}`,
          timestamp: Date.now(),
          severity: 'critical',
          type: 'overtemperature',
          message: `Overtemperature trip limit exceeded (${temp.toFixed(1)}°C)`,
          value: `${temp.toFixed(1)}°C`,
          threshold: '48.0°C Cutoff',
          acknowledged: false
        },
        ...prev
      ]);
    } else if (v >= 4.25 && relayClosed) {
      setRelayClosed(false);
      setAlerts((prev) => [
        {
          id: `fault-volt-${Date.now()}`,
          timestamp: Date.now(),
          severity: 'critical',
          type: 'overvoltage',
          message: `Overvoltage cutoff triggered (${v.toFixed(2)}V)`,
          value: `${v.toFixed(2)}V`,
          threshold: '4.25V Max',
          acknowledged: false
        },
        ...prev
      ]);
    }

    setTelemetry((prev) => ({
      ...prev,
      voltage: v,
      current: i,
      power: p,
      temperature: temp,
      soc,
      timestamp: Date.now()
    }));
  };

  // Reset to prototype values
  const handleResetToPrototype = async () => {
    try {
      await fetch('/api/telemetry/reset', { method: 'POST' });
    } catch (e) {}
    setIsHardwareLinked(false);
    setTelemetry({
      ...initialTelemetry,
      timestamp: Date.now()
    });
    setRelayClosed(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Header with Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        onExportCsv={handleExportCsv}
        onOpenProjectDossier={() => setIsProjectDossierOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isHardwareLinked={isHardwareLinked}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Implementation Action Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white">
                How to Make This System Real: Hardware Blueprint & Wiring Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Turn your ESP32 breadboard prototype into this production system in 4 practical steps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center gap-1.5"
            >
              <span>View 5-Step Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Render Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary KPI Strip */}
            <TelemetryCards telemetry={telemetry} relayClosed={relayClosed} />

            {/* Split Grid: Virtual LCD Replica (Left) & Real-time Oscilloscope (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Virtual LCD & Hardware Status */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <VirtualLcdDisplay
                  voltage={telemetry.voltage}
                  current={telemetry.current}
                  power={telemetry.power}
                  temperature={telemetry.temperature}
                  relayClosed={relayClosed}
                />

                {/* Quick Hardware Bench Link Card */}
                <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">ESP32 Firmware Bridge</h4>
                      <p className="text-[11px] text-slate-400">Arduino C++ driver & fault bench</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('esp32')}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Configure</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Multi-channel Live Telemetry Waveform */}
              <div className="lg:col-span-7">
                <ChartsView history={history} />
              </div>
            </div>

            {/* Lower Summary Row: Cell Pack Preview & Solar Optimization Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cell Balancing Preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">4-Cell Balance Overview</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('thermal')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>Full Matrix</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {cells.map((cell) => (
                      <div key={cell.id} className="bg-slate-950 p-2.5 rounded border border-slate-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Cell #{cell.id}</span>
                        <span className="text-base font-mono font-bold text-white tabular-nums">
                          {cell.voltage.toFixed(2)}V
                        </span>
                        <div className="mt-1 text-[10px] font-mono text-emerald-400">{cell.health.toFixed(0)}% SoH</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>ΔV Spread: {(Math.max(...cells.map(c => c.voltage)) - Math.min(...cells.map(c => c.voltage))).toFixed(3)}V</span>
                  <span className="text-emerald-400">Balanced</span>
                </div>
              </div>

              {/* Solar Charging Intelligence Preview */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Predictive Solar Charging</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('solar')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>Solar Schedule</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Solar Array</span>
                      <span className="text-sm font-bold text-amber-400">780 W/m²</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Harvest Est.</span>
                      <span className="text-sm font-bold text-cyan-400">2.48 kWh</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase">Target Cap</span>
                      <span className="text-sm font-bold text-emerald-400">80% SoC</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Strategy: Cycle Life Extension</span>
                  <span className="text-cyan-400">MPPT 98.2%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <HealthPredictionView
            prediction={prediction}
            internalResistance={telemetry.internalResistance}
          />
        )}

        {activeTab === 'thermal' && (
          <ThermalFaultView
            cells={cells}
            alerts={alerts}
            relayClosed={relayClosed}
            onToggleRelay={handleToggleRelay}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onTriggerBalancing={handleTriggerBalancing}
          />
        )}

        {activeTab === 'solar' && (
          <SolarOptimizerView
            currentSoc={telemetry.soc}
            batteryVoltage={telemetry.voltage}
          />
        )}

        {activeTab === 'esp32' && (
          <Esp32BridgeView
            currentVoltage={telemetry.voltage}
            currentCurrent={telemetry.current}
            currentTemp={telemetry.temperature}
            onInjectTelemetry={handleInjectTelemetry}
            onResetToPrototype={handleResetToPrototype}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IoT Battery Health Monitoring & Predictive Maintenance System</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              Hardware Implementation Guide
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsProjectDossierOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Research Paper Dossier
            </button>
            <span aria-hidden="true">·</span>
            <span>ESP32 + INA219 + 18650 Li-ion</span>
          </div>
        </div>
      </footer>

      {/* Project Reference Modal */}
      <ProjectReferenceModal
        isOpen={isProjectDossierOpen}
        onClose={() => setIsProjectDossierOpen(false)}
      />

      {/* Implementation Guide Modal */}
      <ImplementationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        apiEndpoint={apiEndpoint}
      />
    </div>
  );
}
