import React, { useState } from 'react';
import { Alert } from '../types';
import { ShieldAlert, AlertTriangle, Radio, Flame, Wind, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

interface EmergencyDeckProps {
  alerts: Alert[];
  onTriggerAlert: (category: 'flight' | 'security' | 'baggage' | 'gate' | 'maintenance', message: string, severity: 'medium' | 'high' | 'critical') => void;
}

export const EmergencyDeck: React.FC<EmergencyDeckProps> = ({ alerts, onTriggerAlert }) => {
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [protocolLog, setProtocolLog] = useState<Array<{ id: string; time: string; name: string; status: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), name: 'Standard Baseline Security', status: 'ACTIVE' }
  ]);

  const handleActivateSOP = (name: string, category: 'flight' | 'security' | 'baggage' | 'gate' | 'maintenance', msg: string, severity: 'high' | 'critical') => {
    setActiveProtocol(name);
    onTriggerAlert(category, `[CRISIS PROTOCOL ACTIVE] ${msg}`, severity);
    setProtocolLog(prev => [
      { id: Math.random().toString(36).substring(2, 9), time: new Date().toLocaleTimeString(), name, status: 'ENGAGED' },
      ...prev
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden' }}>

      {/* Protocol Triggers (span 2) */}
      <div className="lg:col-span-2 flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-5 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              Emergency Preparedness & SOP Response Deck
            </h2>
          </div>
          {activeProtocol && (
            <span className="px-3 py-1 text-xs font-black font-mono bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg animate-pulse">
              ACTIVE: {activeProtocol.toUpperCase()}
            </span>
          )}
        </div>

        {/* Emergency SOP Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SOP 1: Severe Weather Hold */}
          <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sky-400 text-sm flex items-center gap-2">
                <Wind className="w-4 h-4" /> CODE BLUE: Severe Weather Ground Stop
              </span>
              <span className="text-[10px] font-mono text-slate-400">SOP-WX-01</span>
            </div>
            <p className="text-xs text-slate-400">
              Orders an immediate ground hold for all outbound Terminal 3 flights due to convective thunderstorm cells or dense fog.
            </p>
            <button
              onClick={() => handleActivateSOP('Code Blue (Weather Stop)', 'flight', 'Severe monsoon/fog cell detected. Ground stop ordered for all T3 departures.', 'high')}
              className="w-full py-2 text-xs font-bold font-mono rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Radio className="w-3.5 h-3.5" /> Execute Weather Ground Stop
            </button>
          </div>

          {/* SOP 2: Terminal Security Lockdown */}
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-red-400 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" /> CODE RED: Terminal Security Lockdown
              </span>
              <span className="text-[10px] font-mono text-slate-400">SOP-SEC-09</span>
            </div>
            <p className="text-xs text-slate-400">
              Freezes security checkpoint exit gates, escalates all active screenings to secondary inspection, and dispatches CISF armed response teams.
            </p>
            <button
              onClick={() => handleActivateSOP('Code Red (Lockdown)', 'security', 'Security perimeter breach suspect. Checkpoint exit doors locked.', 'critical')}
              className="w-full py-2 text-xs font-bold font-mono rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Trigger Security Lockdown
            </button>
          </div>

          {/* SOP 3: Baggage Sorting Bypass */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> CODE AMBER: Baggage Belt Jam Bypass
              </span>
              <span className="text-[10px] font-mono text-slate-400">SOP-BAG-04</span>
            </div>
            <p className="text-xs text-slate-400">
              Reroutes main sorter conveyor lines to auxiliary carousel C18 and alerts ground handling staff to manually offload overflow.
            </p>
            <button
              onClick={() => handleActivateSOP('Code Amber (Bag Bypass)', 'baggage', 'Primary baggage sorter jam. Rerouting to auxiliary carousel C18.', 'high')}
              className="w-full py-2 text-xs font-bold font-mono rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reroute Baggage Belts
            </button>
          </div>

          {/* SOP 4: Aircraft Hazmat Emergency */}
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-purple-400 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4" /> CODE HAZMAT: Airside Fire & Rescue Response
              </span>
              <span className="text-[10px] font-mono text-slate-400">SOP-ARFF-02</span>
            </div>
            <p className="text-xs text-slate-400">
              Dispatches Airport Rescue and Firefighting (ARFF) vehicles to active gate and clears taxiway vectors for emergency landing priority.
            </p>
            <button
              onClick={() => handleActivateSOP('Code Hazmat (ARFF Fire Dispatch)', 'maintenance', 'Airside emergency reported. ARFF vehicles deployed to Gate B08.', 'critical')}
              className="w-full py-2 text-xs font-bold font-mono rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Flame className="w-3.5 h-3.5" /> Dispatch ARFF Emergency Response
            </button>
          </div>

        </div>

        {/* Standard Operating Procedure (SOP) Reference Manual */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">SOP Operations Baseline Guidelines</div>
          <div className="text-slate-400 space-y-1 text-[11px]">
            <div>• <strong className="text-slate-200">Rule 1:</strong> All emergency protocols logged automatically with immutable timestamps for DGCA audit.</div>
            <div>• <strong className="text-slate-200">Rule 2:</strong> In-flight emergencies take precedence over scheduled departures on Runway 11L.</div>
            <div>• <strong className="text-slate-200">Rule 3:</strong> Security checkpoint secondary inspection threshold auto-lowers during Code Red.</div>
          </div>
        </div>
      </div>

      {/* Emergency Audit Log (span 1) */}
      <div className="flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-5 overflow-hidden">
        <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>SOP Engagement Audit Trail</span>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-xs pr-1">
          {protocolLog.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>{log.time}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">{log.status}</span>
              </div>
              <div className="font-bold text-slate-200">{log.name}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

