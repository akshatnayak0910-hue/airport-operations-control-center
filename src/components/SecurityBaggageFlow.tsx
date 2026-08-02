import React from 'react';
import { SecurityScreening, Baggage } from '../types';
import { Shield, AlertTriangle, CheckCircle, Clock, Briefcase, Activity } from 'lucide-react';

interface SecurityBaggageFlowProps {
  security: SecurityScreening[];
  baggage: Baggage[];
}

export const SecurityBaggageFlow: React.FC<SecurityBaggageFlowProps> = ({ security, baggage }) => {
  // Aggregate security checkpoint stats (Checkpoints 1-4)
  const checkpoints = [1, 2, 3, 4];
  const getCheckpointStats = (cp: number) => {
    const cpScreenings = security.filter(s => s.checkpointNumber === cp);
    const total = cpScreenings.length;
    const avgTime = total > 0 
      ? Math.round(cpScreenings.reduce((acc, s) => acc + s.processingTimeSeconds, 0) / total) 
      : 0;
    const alarms = cpScreenings.filter(s => s.alarmTriggered).length;
    const flagged = cpScreenings.filter(s => s.status === 'Flagged').length;

    return { cp, total, avgTime, alarms, flagged };
  };

  // Aggregate baggage belt stats
  const belts = ['C10', 'C11', 'C12', 'C15', 'C18'];
  const getBeltStats = (belt: string) => {
    const beltBags = baggage.filter(b => b.beltLocation === belt);
    const total = beltBags.length;
    const statusCounts = {
      'Check-in': beltBags.filter(b => b.status === 'Check-in').length,
      'Loaded': beltBags.filter(b => b.status === 'Loaded').length,
      'In-Transit': beltBags.filter(b => b.status === 'In-Transit').length,
      'Claimed': beltBags.filter(b => b.status === 'Claimed').length,
      'Delayed': beltBags.filter(b => b.status === 'Delayed').length,
      'Offloaded': beltBags.filter(b => b.isOffloaded).length,
    };
    return { belt, total, statusCounts };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-210px)] overflow-y-auto pr-2">
      
      {/* Security Screening Queues */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span>Security Processing & Queues</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkpoints.map(cp => {
            const stats = getCheckpointStats(cp);
            const isHighCongestion = stats.avgTime > 60;

            return (
              <div 
                key={cp}
                className={`p-4 border rounded-xl transition-all ${
                  isHighCongestion 
                    ? 'border-orange-500/40 bg-orange-500/5' 
                    : 'border-slate-800 bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="font-bold text-slate-200">Checkpoint 0{cp}</span>
                  <span className={`px-2 py-0.5 text-xxs font-bold rounded ${
                    isHighCongestion ? 'bg-orange-500/20 text-orange-300' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isHighCongestion ? 'CONGESTION' : 'NORMAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-950/60 text-center">
                    <div className="text-slate-450 uppercase text-[9px] tracking-wider mb-0.5">Avg Processing</div>
                    <div className="text-sm font-bold text-slate-200">{stats.avgTime}s</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/60 text-center">
                    <div className="text-slate-450 uppercase text-[9px] tracking-wider mb-0.5">Total Screened</div>
                    <div className="text-sm font-bold text-slate-200">{stats.total}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/60 pt-2.5">
                  <span>Alarms Triggered: <span className="text-amber-400 font-bold">{stats.alarms}</span></span>
                  <span>Flagged: <span className="text-red-400 font-bold">{stats.flagged}</span></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Passenger Screening Log */}
        <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/30 flex flex-col h-[280px]">
          <div className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider font-mono">Real-time Checkpoint Events</div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {security.slice(-8).reverse().map((s, index) => (
              <div 
                key={index} 
                className={`p-2.5 rounded border flex justify-between items-center ${
                  s.status === 'Flagged' 
                    ? 'border-red-500/20 bg-red-500/5 text-red-300' 
                    : 'border-slate-850 bg-slate-950/30 text-slate-350'
                }`}
              >
                <div>
                  <span className="font-bold text-slate-200">{s.pnrCode}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span>Checkpoint {s.checkpointNumber}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span>{s.machineId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Wait: {s.processingTimeSeconds}s</span>
                  {s.status === 'Flagged' ? (
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold uppercase text-[9px]">FLAGGED</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[9px]">CLEAR</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Baggage sorting & Belts */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-400" />
          <span>Baggage Sortation & Carousel status</span>
        </h2>

        <div className="space-y-4">
          {belts.map(belt => {
            const stats = getBeltStats(belt);
            const totalDelayed = stats.statusCounts.Delayed + stats.statusCounts.Offloaded;

            return (
              <div 
                key={belt}
                className={`p-4 border rounded-xl ${
                  totalDelayed > 5 
                    ? 'border-rose-500/40 bg-rose-500/5' 
                    : 'border-slate-800 bg-slate-900/30'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">CAROUSEL {belt}</span>
                    <span className="text-slate-500 text-xs">({stats.total} Bags handled)</span>
                  </div>
                  {totalDelayed > 5 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> DELAY ALERT
                    </span>
                  )}
                </div>

                {/* Baggage statistics grid */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-950/40">
                    <div className="text-slate-450">Check-in</div>
                    <div className="text-sm font-bold text-slate-300 mt-0.5">{stats.statusCounts['Check-in']}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40">
                    <div className="text-slate-450">Loaded</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{stats.statusCounts['Loaded']}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40">
                    <div className="text-slate-450">In-Transit</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">{stats.statusCounts['In-Transit']}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40">
                    <div className="text-slate-450">Claimed</div>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">{stats.statusCounts['Claimed']}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40">
                    <div className="text-slate-450">Delayed</div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">{stats.statusCounts['Delayed']}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/40">
                    <div className="text-slate-450">Offloaded</div>
                    <div className="text-sm font-bold text-rose-450 mt-0.5">{stats.statusCounts['Offloaded']}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
