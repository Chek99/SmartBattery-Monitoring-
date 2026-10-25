import React, { useState } from 'react';
import { generateEsp32Firmware } from '../services/batteryPhysics';
import { Cpu, Copy, Check, Download, Radio, Wrench, Terminal, AlertCircle, RefreshCw } from 'lucide-react';

interface Esp32BridgeViewProps {
  currentVoltage: number;
  currentCurrent: number;
  currentTemp: number;
  onInjectTelemetry: (v: number, i: number, temp: number) => void;
  onResetToPrototype: () => void;
}

export const Esp32BridgeView: React.FC<Esp32BridgeViewProps> = ({
  currentVoltage,
  currentCurrent,
  currentTemp,
  onInjectTelemetry,
  onResetToPrototype
}) => {
  const [copied, setCopied] = useState(false);
  const [wifiSsid, setWifiSsid] = useState('Home_IoT_Lab');
  const [serverUrl, setServerUrl] = useState('https://iot-battery-dashboard.local/api/telemetry');
  const [simV, setSimV] = useState(currentVoltage);
  const [simI, setSimI] = useState(currentCurrent);
  const [simT, setSimT] = useState(currentTemp);

  const firmwareCode = generateEsp32Firmware({
    wifiSsid,
    serverUrl,
    updateIntervalMs: 2000,
    ina219Address: '0x40',
    lcdAddress: '0x27'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([firmwareCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'esp32_battery_monitor.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplySliders = (v: number, i: number, t: number) => {
    setSimV(v);
    setSimI(i);
    setSimT(t);
    onInjectTelemetry(v, i, t);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">
                ESP32 Hardware Bridge & Microcontroller Firmware
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Connects the physical breadboard prototype (ESP32 DevKit, INA219 current/voltage sensor, 1602 LCD,
              DS18B20 thermal probe) to this live dashboard. Includes real-time fault injection simulation and Arduino C++ source code.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Simulation & Fault Injection Bench */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Interactive Hardware Simulator & Fault Injection Bench</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inject live electrical and thermal scenarios to evaluate firmware trip responses and dashboard telemetry
            </p>
          </div>

          <button
            onClick={onResetToPrototype}
            className="px-3 py-1.5 text-xs font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-500/30 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Prototype Photo (3.41V, 54mA, 184mW)</span>
          </button>
        </div>

        {/* Quick Fault Injection Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">Fault Presets:</span>
          <button
            onClick={() => handleApplySliders(3.41, 54, 26.8)}
            className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
          >
            Nominal Idle (3.41V, 54mA)
          </button>
          <button
            onClick={() => handleApplySliders(3.95, 380, 29.5)}
            className="px-2.5 py-1 text-xs font-mono bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded transition-colors"
          >
            Solar Charging (+380mA)
          </button>
          <button
            onClick={() => handleApplySliders(3.35, -750, 31.0)}
            className="px-2.5 py-1 text-xs font-mono bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded transition-colors"
          >
            Heavy Load (-750mA)
          </button>
          <button
            onClick={() => handleApplySliders(3.42, 110, 51.5)}
            className="px-2.5 py-1 text-xs font-mono bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded transition-colors"
          >
            Thermal Trip Test (51.5°C)
          </button>
          <button
            onClick={() => handleApplySliders(4.32, 1400, 34.0)}
            className="px-2.5 py-1 text-xs font-mono bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded transition-colors"
          >
            Overvoltage Trip (4.32V)
          </button>
        </div>

        {/* Manual Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-5 border-t border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Bus Voltage (V)</span>
              <span className="text-cyan-400 font-bold">{simV.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="2.80"
              max="4.35"
              step="0.01"
              value={simV}
              onChange={(e) => handleApplySliders(Number(e.target.value), simI, simT)}
              className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Pack Current (mA)</span>
              <span className="text-amber-400 font-bold">{simI} mA</span>
            </div>
            <input
              type="range"
              min="-1200"
              max="1500"
              step="10"
              value={simI}
              onChange={(e) => handleApplySliders(simV, Number(e.target.value), simT)}
              className="w-full accent-amber-400 bg-slate-800 cursor-pointer h-1.5 rounded"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Temperature (°C)</span>
              <span className="text-rose-400 font-bold">{simT.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="15"
              max="58"
              step="0.5"
              value={simT}
              onChange={(e) => handleApplySliders(simV, simI, Number(e.target.value))}
              className="w-full accent-rose-400 bg-slate-800 cursor-pointer h-1.5 rounded"
            />
          </div>
        </div>
      </div>

      {/* Wiring & Pinout Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span>Breadboard Hardware Schematic & Pinout Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs font-mono">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-2">1. INA219 Sensor</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• VCC → 3.3V / 5V</li>
              <li>• GND → Common Ground</li>
              <li>• SDA → ESP32 GPIO 21</li>
              <li>• SCL → ESP32 GPIO 22</li>
              <li>• VIN+ → Solar / Charger (+)</li>
              <li>• VIN- → Battery (+)</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-2">2. 1602 LCD (I2C)</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• VCC → 5V (from VIN)</li>
              <li>• GND → Common Ground</li>
              <li>• SDA → ESP32 GPIO 21</li>
              <li>• SCL → ESP32 GPIO 22</li>
              <li>• Address: 0x27 or 0x3F</li>
              <li>• Contrast: Rear potentiometer</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block mb-2">3. DS18B20 Temp Probe</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• VCC → 3.3V</li>
              <li>• GND → Common Ground</li>
              <li>• DQ (Data) → ESP32 GPIO 4</li>
              <li>• Pull-up: 4.7kΩ to 3.3V</li>
              <li>• Thermal contact on 18650 cell</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <span className="text-rose-400 font-bold block mb-2">4. Protection Relay & LED</span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>• Relay IN → ESP32 GPIO 18</li>
              <li>• Relay COM → Solar/Charger</li>
              <li>• Relay NO → Battery Circuit</li>
              <li>• Status LED → GPIO 2</li>
              <li>• Autonomous HW trip logic</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ESP32 Arduino C++ Firmware Code Viewer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Production Arduino IDE C++ Firmware</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Flash directly to ESP32 DevKit to stream live telemetry to this dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadIno}
              className="px-3 py-1.5 text-xs font-mono font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ino</span>
            </button>
          </div>
        </div>

        {/* Code Pre Box */}
        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
            {firmwareCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
