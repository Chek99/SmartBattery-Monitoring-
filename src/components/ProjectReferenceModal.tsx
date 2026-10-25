import React from 'react';
import { X, FileText, ExternalLink, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface ProjectReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReferenceModal: React.FC<ProjectReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Engineering Project Specification</h2>
              <p className="text-xs text-slate-400">IoT Battery Health Monitoring Innovations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-300">
          {/* Project Title & Core Idea */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
              Final-Year Engineering Project
            </span>
            <h3 className="text-base font-bold text-white mb-2">
              IoT-Based Smart Solar Battery Health Monitoring and Predictive Maintenance System
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Core idea:</strong> Develop a system that monitors a solar battery in real time, estimates its health,
              detects abnormal conditions, and displays the information on a web dashboard with predictive analytics.
            </p>
          </div>

          {/* Prototype Relation */}
          <div>
            <h4 className="text-xs font-semibold uppercase font-mono text-slate-400 mb-2">
              User Prototype Hardware Setup
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
              <p>
                The physical prototype consists of an <strong>ESP32 microcontroller</strong>, an <strong>I2C 1602 LCD</strong>
                (displaying exact baseline values: <code className="text-cyan-300 font-mono">Power(mW): 184</code> and{' '}
                <code className="text-cyan-300 font-mono">V: 3.41  I: 054</code>), an <strong>INA219 / current-sensor module</strong>,
                an LED indicator, and an <strong>18650 Li-ion battery</strong>.
              </p>
              <p className="text-slate-400">
                This dashboard extends that setup by adding temperature sensing, live timestamped logging, capacity-based State of Health (SoH)
                estimation, and Remaining Useful Life (RUL) predictive modeling.
              </p>
            </div>
          </div>

          {/* 4-Stage Development Sequence */}
          <div>
            <h4 className="text-xs font-semibold uppercase font-mono text-slate-400 mb-3">
              Suggested 4-Stage Development Sequence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stage 1 — Sensor Integration</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Connect ESP32, calibrate voltage and current measurements with INA219, and verify temperature readings.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stage 2 — Monitoring & Logging</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Integrate compatible charge controller and build a live dashboard with continuous timestamped telemetry.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stage 3 — Health Assessment</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Implement state-of-charge estimation and conduct controlled capacity tests to calculate capacity-based SoH.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Stage 4 — Prediction & Evaluation</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Develop prediction model, test fault alerts, compare estimates with measured capacity, and document limitations.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Warning */}
          <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>Safety Specification Notice</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              Use a battery-compatible charge controller and protection circuit. Check sensor voltage/current ratings, polarity,
              and wiring before powering the setup. Do not rely on the ESP32 alone to prevent overcharge, over-discharge, or overheating.
            </p>
          </div>

          {/* Direct File Link */}
          <div className="pt-2 flex items-center justify-between">
            <a
              href="/assets/aistudio/IoT_Battery_Health_Monitoring_Innovations_70eaa6f1.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Original Research PDF</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium rounded-lg transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
