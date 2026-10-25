import React, { useState } from 'react';
import { X, CheckCircle2, ChevronRight, Terminal, Wrench, Wifi, BookOpen, Layers, Cpu, ShieldAlert, Copy, Check } from 'lucide-react';

interface ImplementationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
}

export const ImplementationGuideModal: React.FC<ImplementationGuideModalProps> = ({
  isOpen,
  onClose,
  apiEndpoint
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const curlExample = `curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{"voltage": 3.41, "current": 54, "power": 184, "temperature": 26.8}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How to Make This System Real: Practical Implementation Blueprint</h2>
              <p className="text-xs text-slate-400">Step-by-step instructions to turn your ESP32 prototype into this live monitoring & predictive system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs font-medium shrink-0">
          {[
            { step: 1, label: '1. Bill of Materials' },
            { step: 2, label: '2. Circuit Wiring' },
            { step: 3, label: '3. Flashing Firmware' },
            { step: 4, label: '4. Cloud & API Link' },
            { step: 5, label: '5. The 4 Project Stages' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeStep === item.step
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* STEP 1: BILL OF MATERIALS */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-cyan-400">
                1. Required Hardware Components (Bill of Materials)
              </h3>
              <p className="text-xs text-slate-400">
                All components are standard, widely available, and directly compatible with your breadboard prototype setup:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block text-sm">1. ESP32 DevKit V1 (30 or 38 pins)</span>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    Core microcontroller with built-in Wi-Fi and Bluetooth. Handles sensor reads, LCD updates, and HTTP/MQTT telemetry publishing.
                  </p>
                  <span className="text-[11px] text-cyan-400 mt-2 block">Typical cost: ~$4 - $6</span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block text-sm">2. INA219 Bi-Directional DC Sensor</span>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    I2C voltage, current, and power monitor (up to 26V, ±3.2A with 0.1Ω shunt). Exact sensor matching the prototype.
                  </p>
                  <span className="text-[11px] text-cyan-400 mt-2 block">Typical cost: ~$2 - $3</span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block text-sm">3. 1602 LCD Display with I2C Backpack</span>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    16x2 HD44780 character LCD with PCF8574 I2C daughterboard (requires only 2 ESP32 data pins: SDA/SCL).
                  </p>
                  <span className="text-[11px] text-cyan-400 mt-2 block">Typical cost: ~$2.50</span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block text-sm">4. DS18B20 Temperature Sensor</span>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    Digital 1-Wire temperature probe (-55°C to +125°C). Attached directly to the 18650 cell surface with thermal tape.
                  </p>
                  <span className="text-[11px] text-cyan-400 mt-2 block">Typical cost: ~$1.50 + 4.7kΩ resistor</span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block text-sm">5. 18650 Li-ion Battery & Holder</span>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    Standard 3.7V nominal, 2600 mAh Li-ion rechargeable cell with secure single/multi-cell battery cradle.
                  </p>
                  <span className="text-[11px] text-cyan-400 mt-2 block">Typical cost: ~$4 - $6</span>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block text-sm">6. 5V Optocoupled Relay Module</span>
                  <p className="text-slate-400 text-xs mt-1 font-sans">
                    Independent hardware disconnect protection switch. Trips immediately on overvoltage, undervoltage, or thermal fault.
                  </p>
                  <span className="text-[11px] text-cyan-400 mt-2 block">Typical cost: ~$1.20</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CIRCUIT WIRING */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-cyan-400">
                2. Step-by-Step Circuit Wiring Guide
              </h3>
              <p className="text-xs text-slate-400">
                Follow this exact wire routing on your breadboard:
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
                <div>
                  <h4 className="text-cyan-300 font-bold mb-1">A. Shared I2C Sensor Bus (GPIO 21 & GPIO 22)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>ESP32 <strong className="text-white">GPIO 21 (SDA)</strong> ➔ INA219 SDA pin <strong>AND</strong> 1602 LCD SDA pin</li>
                    <li>ESP32 <strong className="text-white">GPIO 22 (SCL)</strong> ➔ INA219 SCL pin <strong>AND</strong> 1602 LCD SCL pin</li>
                    <li>ESP32 <strong className="text-white">GND</strong> ➔ Common Breadboard Ground rail (-)</li>
                    <li>ESP32 <strong className="text-white">VIN (5V)</strong> ➔ LCD VCC (LCD operates best at 5V for backlight contrast)</li>
                    <li>ESP32 <strong className="text-white">3.3V</strong> ➔ INA219 VCC</li>
                  </ul>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <h4 className="text-amber-300 font-bold mb-1">B. INA219 Current & Voltage Measurement Loop</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>INA219 <strong className="text-white">VIN+</strong> ➔ Solar Controller / Charger Output (+)</li>
                    <li>INA219 <strong className="text-white">VIN-</strong> ➔ Relay Common (COM) pin</li>
                    <li>Relay <strong className="text-white">Normally Open (NO)</strong> ➔ 18650 Battery (+) Terminal</li>
                    <li>18650 Battery (-) Terminal ➔ Common Ground rail (-)</li>
                  </ul>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <h4 className="text-rose-300 font-bold mb-1">C. DS18B20 Temperature Probe & Protection Relay</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>DS18B20 <strong className="text-white">DQ (Data)</strong> ➔ ESP32 <strong>GPIO 4</strong></li>
                    <li>Place a <strong className="text-white">4.7kΩ pull-up resistor</strong> between GPIO 4 and 3.3V</li>
                    <li>Relay Control <strong className="text-white">IN pin</strong> ➔ ESP32 <strong>GPIO 18</strong></li>
                    <li>Onboard Status LED ➔ ESP32 <strong>GPIO 2</strong> (blinks during WiFi transmission)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FLASHING FIRMWARE */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-cyan-400">
                3. Flashing Firmware Using Arduino IDE
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block mb-1">Step 3.1: Install Required Arduino Libraries</span>
                  <p className="text-slate-400 mb-2">Open Arduino IDE ➔ <em>Sketch ➔ Include Library ➔ Manage Libraries</em>, and search & install:</p>
                  <ul className="list-disc list-inside space-y-1 font-mono text-cyan-300">
                    <li>Adafruit INA219 (by Adafruit)</li>
                    <li>LiquidCrystal I2C (by Frank de Brabander or Marco Schwartz)</li>
                    <li>OneWire (by Paul Stoffregen)</li>
                    <li>DallasTemperature (by Miles Burton)</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block mb-1">Step 3.2: Configure WiFi & Endpoint</span>
                  <p className="text-slate-400 mb-2">
                    In the code provided in the dashboard's <strong>ESP32 Bridge</strong> tab, update these two lines:
                  </p>
                  <pre className="p-2.5 bg-slate-900 rounded font-mono text-slate-200 overflow-x-auto">
{`const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverEndpoint = "${apiEndpoint}";`}
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-bold text-white block mb-1">Step 3.3: Select Board & Flash</span>
                  <p className="text-slate-400 font-sans">
                    Select <strong>Tools ➔ Board ➔ ESP32 Arduino ➔ ESP32 Dev Module</strong>, choose your COM port, and click <strong>Upload</strong>.
                    Once uploaded, the 1602 LCD will display <code className="text-cyan-300 font-mono">Power(mW): 184</code> and <code className="text-cyan-300 font-mono">V: 3.41  I: 054</code> just like in your prototype photograph!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CLOUD & API LINK */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-cyan-400">
                4. Live Cloud Ingestion & Testing Endpoint
              </h3>
              <p className="text-xs text-slate-400">
                This dashboard includes a full-stack backend running at this exact URL. Your ESP32 simply performs an HTTP POST request to:
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs flex items-center justify-between">
                <span className="text-cyan-300 select-all">{apiEndpoint}</span>
                <span className="text-[11px] text-emerald-400 shrink-0 font-sans">POST (JSON)</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">Test Immediately from Your Terminal (curl):</span>
                  <button
                    onClick={handleCopyCurl}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedCurl ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy curl command</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{curlExample}</pre>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Run this command right now in your Mac/Linux/Windows terminal to see the dashboard immediately update with your live test packet!
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: THE 4 PROJECT STAGES */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-cyan-400">
                5. The 4-Stage Development Sequence (From Your Research Paper)
              </h3>
              <p className="text-xs text-slate-400">
                Here is the roadmap to complete your engineering final-year project successfully:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stage 1 — Sensor Integration & Calibration</span>
                  </div>
                  <p className="text-slate-300">
                    Verify INA219 current reading with a digital multimeter in series. Adjust calibration shunt multiplier in code if needed. Verify DS18B20 temperature reads room temperature correctly (±0.5°C).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stage 2 — Monitoring, Logging & Solar Controller Integration</span>
                  </div>
                  <p className="text-slate-300">
                    Connect the solar charge controller (e.g. CN3791 MPPT or TP4056 with solar panel). Stream data to the dashboard and use the <strong>Export CSV</strong> button to log full charge/discharge cycle logs with timestamps.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stage 3 — Controlled Capacity Testing & State of Health (SoH)</span>
                  </div>
                  <p className="text-slate-300">
                    Fully charge the 18650 cell to 4.20V. Discharge through a known resistor or dummy load down to 3.00V while integrating current:
                    <code className="text-cyan-300 font-mono block my-1">Capacity (mAh) = ∫ I(t) dt</code>
                    Compute State of Health: <code className="text-cyan-300 font-mono">SoH = (Measured Capacity / 2600 mAh) × 100%</code>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Stage 4 — Machine-Learning Prediction Model & Evaluation</span>
                  </div>
                  <p className="text-slate-300">
                    Train a Random Forest or Polynomial Arrhenius regression model on the exported CSV cycle data. Validate the model against measured capacity degradation and evaluate Remaining Useful Life (RUL) accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Step {activeStep} of 5</span>
          </div>
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
              >
                Previous
              </button>
            )}
            {activeStep < 5 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-4 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors flex items-center gap-1"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors"
              >
                Ready to Build
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
