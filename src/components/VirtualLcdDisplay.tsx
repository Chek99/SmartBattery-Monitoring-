import React, { useState } from 'react';
import { Sparkles, Sun, Cpu } from 'lucide-react';

interface VirtualLcdDisplayProps {
  voltage: number;
  current: number; // in mA
  power: number; // in mW
  temperature: number;
  relayClosed: boolean;
}

export const VirtualLcdDisplay: React.FC<VirtualLcdDisplayProps> = ({
  voltage,
  current,
  power,
  temperature,
  relayClosed
}) => {
  const [backlightTheme, setBacklightTheme] = useState<'blue' | 'yellowGreen'>('blue');
  const [showAltScreen, setShowAltScreen] = useState(false);

  // Format line 1: Exactly matching the prototype photo: "Power(mW):184"
  const line1 = showAltScreen
    ? `Temp:${temperature.toFixed(1)}C ${relayClosed ? 'OK' : 'TRIP'}`.padEnd(16, ' ')
    : `Power(mW):${Math.round(power)}`.padEnd(16, ' ');

  // Format line 2: Exactly matching prototype photo: "V:3.41  I:054"
  const currentFormatted = Math.round(Math.abs(current)).toString().padStart(3, '0');
  const line2 = showAltScreen
    ? `Relay:${relayClosed ? 'ARMED' : 'OPEN'} 18650`.padEnd(16, ' ')
    : `V:${voltage.toFixed(2)}  I:${currentFormatted}`.padEnd(16, ' ');

  const themeClasses = backlightTheme === 'blue'
    ? {
        screenBg: 'bg-blue-600 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6),0_0_20px_rgba(37,99,235,0.25)]',
        charColor: 'text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]',
        frame: 'border-slate-800 bg-slate-900',
        label: 'Classic 1602 Blue'
      }
    : {
        screenBg: 'bg-emerald-500 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.25)]',
        charColor: 'text-emerald-950 font-bold',
        frame: 'border-slate-800 bg-slate-900',
        label: 'Retro Yellow-Green'
      };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">ESP32 Onboard 1602 LCD</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAltScreen(!showAltScreen)}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
            title="Toggle between Power/VI screen and Temp/Relay screen"
          >
            {showAltScreen ? 'Screen: Temp/Relay' : 'Screen: V / I / Power'}
          </button>
          <button
            onClick={() => setBacklightTheme(backlightTheme === 'blue' ? 'yellowGreen' : 'blue')}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1"
            title="Toggle LCD Backlight color"
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span>{backlightTheme === 'blue' ? 'Blue' : 'Green'}</span>
          </button>
        </div>
      </div>

      {/* Virtual 16x2 LCD Chassis replicating user's prototype breadboard module */}
      <div className="my-4">
        {/* PCB Board bezel */}
        <div className="p-3 bg-emerald-950/70 border-2 border-emerald-800/80 rounded-lg relative overflow-hidden shadow-inner">
          {/* Solder mounting holes in 4 corners */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full border border-amber-600 bg-slate-900" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-amber-600 bg-slate-900" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full border border-amber-600 bg-slate-900" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full border border-amber-600 bg-slate-900" />

          {/* Metal Display Bezel with top screws */}
          <div className="bg-slate-900 border border-slate-700 rounded p-2.5 shadow-md">
            {/* The Backlit Liquid Crystal Matrix Display */}
            <div className={`p-4 rounded transition-all duration-300 ${themeClasses.screenBg} font-mono select-none`}>
              <div className="space-y-1.5">
                {/* Row 1 */}
                <div className={`text-base sm:text-lg tracking-[0.25em] font-mono font-bold leading-none ${themeClasses.charColor} whitespace-pre`}>
                  {line1}
                </div>
                {/* Row 2 */}
                <div className={`text-base sm:text-lg tracking-[0.25em] font-mono font-bold leading-none ${themeClasses.charColor} whitespace-pre`}>
                  {line2}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle notes matching documentation */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <span className="truncate">Hardware match: ESP32 + INA219 + HD44780 I2C (0x27)</span>
        <span className="font-mono text-[11px] text-cyan-400 shrink-0">I2C: 100 kHz</span>
      </div>
    </div>
  );
};
