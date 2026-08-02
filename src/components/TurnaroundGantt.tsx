import React, { useState } from 'react';
import { Flight } from '../types';
import { Clock, Fuel, CheckCircle, AlertTriangle, ArrowRight, RefreshCcw } from 'lucide-react';

interface TurnaroundGanttProps {
  flights: Flight[];
}

export const TurnaroundGantt: React.FC<TurnaroundGanttProps> = ({ flights }) => {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  // Active flights at gate currently undergoing or preparing for turnaround
  const turnaroundFlights = flights.filter(f => f.status === 'On-Time' || f.status === 'Boarding' || f.status === 'Delayed').slice(0, 10);
  const activeFlight = flights.find(f => f.flightId === selectedFlightId) || turnaroundFlights[0];

  // Ground turnaround milestone steps
  const getTurnaroundPhases = (flight: Flight) => {
    const isDelayed = flight.status === 'Delayed';
    const isBoarding = flight.status === 'Boarding';

    return [
      { name: 'Deboarding & Offloading', duration: 15, pct: 100, status: 'DONE' },
      { name: 'Aircraft Refueling', duration: 20, pct: isBoarding ? 100 : 75, status: isBoarding ? 'DONE' : 'IN_PROGRESS' },
      { name: 'Catering & Cabin Cleaning', duration: 25, pct: isBoarding ? 100 : 60, status: isBoarding ? 'DONE' : 'IN_PROGRESS' },
      { name: 'Safety & Security Sweep', duration: 10, pct: isBoarding ? 100 : 30, status: isBoarding ? 'DONE' : 'PENDING' },
      { name: 'Passenger Gate Boarding', duration: 30, pct: isBoarding ? 80 : 0, status: isBoarding ? 'IN_PROGRESS' : 'PENDING' },
      { name: 'Cargo Lashing & Door Closure', duration: 10, pct: isDelayed ? 10 : 0, status: isDelayed ? 'DELAYED' : 'PENDING' },
    ];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden' }}>

      {/* Flight Selector List (span 1) */}
      <div className="flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-cyan-400" /> Ground Turnarounds
          </h2>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            {turnaroundFlights.length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
          {turnaroundFlights.map(f => {
            const isSelected = activeFlight?.flightId === f.flightId;
            return (
              <div
                key={f.flightId}
                onClick={() => setSelectedFlightId(f.flightId)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/50 bg-slate-800/60'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-100 text-sm">{f.flightId}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    f.status === 'Delayed' ? 'bg-rose-500/20 text-rose-300' :
                    f.status === 'Boarding' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between mt-1">
                  <span>Gate {f.gate} ({f.destination})</span>
                  <span>Turnaround: {f.turnaroundTime || 45}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Turnaround Gantt & Phase Details (span 2) */}
      {activeFlight ? (
        <div className="lg:col-span-2 flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-6 overflow-y-auto space-y-6">

          {/* Active Flight Header */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Active Turnaround Tracking</div>
              <div className="text-2xl font-black text-slate-100">{activeFlight.flightId} <span className="text-cyan-400 font-semibold text-base">({activeFlight.airline})</span></div>
              <div className="text-xs text-slate-400 mt-0.5">Route: {activeFlight.origin} → {activeFlight.destination} | Gate: {activeFlight.gate} | Tail: {activeFlight.tailNumber}</div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <div className="text-slate-500 text-[10px] uppercase">Fuel Upload</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{activeFlight.fuelUploaded || 12500} L</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                <div className="text-slate-500 text-[10px] uppercase">Cargo Weight</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{activeFlight.cargoWeight || 3400} kg</div>
              </div>
            </div>
          </div>

          {/* Gantt Timeline Bar Section */}
          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Ground Operations Progress Gantt
            </h3>

            <div className="space-y-3">
              {getTurnaroundPhases(activeFlight).map((phase, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{phase.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{phase.duration} mins</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        phase.status === 'DONE' ? 'bg-emerald-500/20 text-emerald-400' :
                        phase.status === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-300 animate-pulse' :
                        phase.status === 'DELAYED' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {phase.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full overflow-hidden" style={{ height: '7px' }}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        phase.status === 'DONE' ? 'bg-emerald-500' :
                        phase.status === 'IN_PROGRESS' ? 'bg-cyan-400' :
                        phase.status === 'DELAYED' ? 'bg-rose-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${phase.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};

