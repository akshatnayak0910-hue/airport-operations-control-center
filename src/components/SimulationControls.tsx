import React from 'react';
import { Play, Pause, RotateCcw, ShieldAlert, Wifi, CloudRain, Trash } from 'lucide-react';

interface SimulationControlsProps {
  simTime: Date;
  isPlaying: boolean;
  speed: number;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onReset: () => void;
  onTriggerAlert: (category: 'flight' | 'security' | 'baggage' | 'gate' | 'maintenance', message: string, severity: 'medium' | 'high' | 'critical') => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simTime,
  isPlaying,
  speed,
  onTogglePlay,
  onSetSpeed,
  onReset,
  onTriggerAlert
}) => {
  const speeds = [
    { label: 'Realtime (1x)', value: 1 },
    { label: '10x', value: 10 },
    { label: '60x (1m/s)', value: 60 },
    { label: '300x (5m/s)', value: 300 },
    { label: '1200x (20m/s)', value: 1200 }
  ];

  const formatSimTime = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl bg-slate-900/60 border-slate-700/50 backdrop-blur-md">
      {/* Simulation Clock */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${speed >= 300 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">Simulation Master Time</span>
            {speed >= 300 && (
              <span className="text-[9px] font-black font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">FAST-FORWARD</span>
            )}
          </div>
          <div className="text-xl font-black tracking-mono text-slate-100 font-mono">
            {formatSimTime(simTime)}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            isPlaying 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Resume
            </>
          )}
        </button>

        <div className="flex items-center border rounded-lg bg-slate-950 border-slate-700/60 p-0.5">
          {speeds.map(s => (
            <button
              key={s.value}
              onClick={() => onSetSpeed(s.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                speed === s.value
                  ? 'bg-slate-800 text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={onReset}
          title="Reset to Dataset Start"
          className="p-2 border rounded-lg bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* manual Incident Injection */}
      <div className="flex items-center gap-2 border-l border-slate-700/60 pl-4">
        <span className="text-xs font-semibold uppercase text-slate-400">Inject Incident:</span>
        <button
          onClick={() => onTriggerAlert('flight', 'ATC Ground Hold Ordered for Terminal 3 departures', 'high')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20"
        >
          <Wifi className="w-3.5 h-3.5" /> ATC Hold
        </button>
        <button
          onClick={() => onTriggerAlert('security', 'Alarm Triggered: Secondary inspection at Checkpoint 3', 'critical')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Security Alert
        </button>
        <button
          onClick={() => onTriggerAlert('baggage', 'Baggage Belt B5 system jam reported', 'medium')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
        >
          <Trash className="w-3.5 h-3.5" /> Belt Jam
        </button>
        <button
          onClick={() => onTriggerAlert('flight', 'Severe monsoon cell near airport. Landing delays expected.', 'high')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded bg-sky-500/10 border-sky-500/20 text-sky-300 hover:bg-sky-500/20"
        >
          <CloudRain className="w-3.5 h-3.5" /> Weather Cell
        </button>
      </div>
    </div>
  );
};
