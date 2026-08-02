import React from 'react';
import { Flight, GateEvent } from '../types';
import { AlertCircle, User, Clock, CheckCircle2 } from 'lucide-react';

interface GateActivityBoardProps {
  flights: Flight[];
  gateEvents: GateEvent[];
}

export const GateActivityBoard: React.FC<GateActivityBoardProps> = ({ flights, gateEvents }) => {
  // Define terminal gates DEL has (Terminal 3 gates B1-B30 are common)
  const gates = Array.from({ length: 24 }, (_, i) => `B${i + 1}`);

  // Find active flight at each gate based on flight status (Boarding or On-Time are at gates, Departed has left)
  const getGateDetails = (gate: string) => {
    // Find flight assigned to this gate that hasn't departed yet
    const activeFlight = flights.find(f => f.gate === gate && f.status !== 'Departed' && f.status !== 'Cancelled');
    
    // Find if there is any active gate event for this gate
    const gateEvent = gateEvents.find(e => e.gate === gate && e.status === 'Routine');
    const isConflict = gateEvents.some(e => e.gate === gate && e.isConflict);

    const upcomingFlights = flights.filter(f => f.gate === gate && f.scheduledDeparture > (activeFlight?.actualDeparture || new Date(0)))
      .sort((a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime())
      .slice(0, 2);

    return {
      flight: activeFlight,
      event: gateEvent,
      isConflict,
      upcoming: upcomingFlights
    };
  };

  return (
    <div className="space-y-6 h-[calc(100vh-210px)] overflow-y-auto pr-2">
      {/* Overview stats bar */}
      <div className="flex gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
        <div className="text-xs font-mono text-slate-400">
          Total Gates Monitored: <span className="text-slate-100 font-bold">24</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Occupied: <span className="text-amber-400 font-bold">{gates.filter(g => getGateDetails(g).flight).length}</span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Conflicts: <span className="text-rose-400 font-bold">{gates.filter(g => getGateDetails(g).isConflict).length}</span>
        </div>
      </div>

      {/* Gates Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {gates.map(gate => {
          const { flight, event, isConflict } = getGateDetails(gate);

          return (
            <div 
              key={gate}
              className={`p-5 rounded-2xl border transition-all ${
                isConflict 
                  ? 'border-red-500/40 bg-red-500/5 animate-pulse'
                  : flight 
                    ? 'border-cyan-500/40 bg-slate-900/40' 
                    : 'border-slate-800 bg-slate-950/20 border-dashed'
              }`}
            >
              {/* Gate Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-lg font-black text-slate-200 font-mono">GATE {gate}</span>
                {isConflict ? (
                  <span className="flex items-center gap-1 text-xxs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertCircle className="w-3 h-3" /> CONFLICT
                  </span>
                ) : flight ? (
                  <span className="px-2 py-0.5 text-xxs font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                    OCCUPIED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xxs font-semibold rounded bg-slate-800 text-slate-450 border border-slate-700/30">
                    VACANT
                  </span>
                )}
              </div>

              {/* Gate Content */}
              {flight ? (
                <div className="space-y-4">
                  {/* Flight Info */}
                  <div>
                    <div className="text-xs text-slate-450 font-semibold">{flight.airline}</div>
                    <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
                      {flight.flightId} → <span className="text-cyan-400">{flight.destination}</span>
                    </div>
                  </div>

                  {/* Operational Timeline */}
                  <div className="space-y-2 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Dep: {flight.scheduledDeparture.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                    {event?.assignedStaff && (
                      <div className="flex items-center gap-1.5 text-slate-350">
                        <User className="w-3.5 h-3.5 text-slate-450" />
                        <span>Staff: {event.assignedStaff}</span>
                      </div>
                    )}
                  </div>

                  {/* Flight Status display */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-455 font-mono">Flight Status:</span>
                    <span className={`font-bold ${
                      flight.status === 'Delayed' ? 'text-rose-400' : 
                      flight.status === 'Boarding' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {flight.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-slate-600 font-mono">
                  <CheckCircle2 className="w-6 h-6 text-slate-800 mb-1" />
                  <span className="text-[10px] uppercase">Vacant / Ready</span>
                </div>
              )}

              {/* Upcoming Forecast Strip */}
              {getGateDetails(gate).upcoming.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/50 text-[10px] font-mono text-slate-500">
                  <span className="uppercase text-[9px] font-bold text-slate-600 block mb-1">Next Up:</span>
                  {getGateDetails(gate).upcoming.map(u => (
                    <div key={u.flightId} className="flex justify-between text-slate-400 py-0.5">
                      <span className="font-bold text-slate-300">{u.flightId} ({u.destination})</span>
                      <span>{u.scheduledDeparture.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
