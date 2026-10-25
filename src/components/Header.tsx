import React from 'react';
import { Activity, Download, FileText, Pause, Play, Wifi, BookOpen, HardDrive } from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'health' | 'thermal' | 'solar' | 'esp32';
  setActiveTab: (tab: 'overview' | 'health' | 'thermal' | 'solar' | 'esp32') => void;
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean | ((prev: boolean) => boolean)) => void;
  onExportCsv: () => void;
  onOpenProjectDossier: () => void;
  onOpenGuide: () => void;
  isHardwareLinked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  onExportCsv,
  onOpenProjectDossier,
  onOpenGuide,
  isHardwareLinked
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            AURA BATTERY IoT
          </span>
          {isHardwareLinked && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
              <HardDrive className="w-3 h-3" />
              <span>ESP32 Hardware Online</span>
            </span>
          )}
        </div>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'health'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Health & Prediction
          </button>
          <button
            onClick={() => setActiveTab('thermal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'thermal'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Thermal & Safety
          </button>
          <button
            onClick={() => setActiveTab('solar')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'solar'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Solar Optimizer
          </button>
          <button
            onClick={() => setActiveTab('esp32')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'esp32'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            ESP32 Bridge
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Telemetry Stream Control */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 rounded-md hover:bg-cyan-900/60 transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>How to Build It</span>
          </button>

          <button
            onClick={() => setIsStreaming((prev: boolean) => !prev)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md border transition-colors whitespace-nowrap ${
              isStreaming
                ? 'bg-slate-900 border-emerald-500/40 text-emerald-400 hover:bg-slate-800'
                : 'bg-slate-900 border-amber-500/40 text-amber-400 hover:bg-slate-800'
            }`}
            title={isStreaming ? 'Pause live stream' : 'Resume live stream'}
          >
            {isStreaming ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Feed</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Paused</span>
              </>
            )}
          </button>

          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap font-sans"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-900 overflow-x-auto scrollbar-none">
        {(['overview', 'health', 'thermal', 'solar', 'esp32'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'health' && 'Health & AI'}
            {tab === 'thermal' && 'Thermal'}
            {tab === 'solar' && 'Solar'}
            {tab === 'esp32' && 'ESP32 Bridge'}
          </button>
        ))}
      </div>
    </header>
  );
};
