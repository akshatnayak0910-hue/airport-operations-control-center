import React, { useState } from 'react';
import { Flight, GateEvent } from '../types';
import { Radar, Plane, Shield, Navigation, Compass, AlertCircle } from 'lucide-react';

interface AirportTerminalMapProps {
  flights: Flight[];
  gateEvents: GateEvent[];
}

export const AirportTerminalMap: React.FC<AirportTerminalMapProps> = ({ flights, gateEvents }) => {
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  // Gate coordinates on 800x500 SVG grid for Terminal 3 concourses
  const concourseAGates = Array.from({ length: 12 }, (_, i) => ({
    id: `B${i + 1}`,
    x: 140 + i * 45,
    y: 180,
    terminal: 'T3 Concourse A'
  }));

  const concourseBGates = Array.from({ length: 12 }, (_, i) => ({
    id: `B${i + 13}`,
    x: 140 + (i) * 45,
    y: 320,
    terminal: 'T3 Concourse B'
  }));

  const allGates = [...concourseAGates, ...concourseBGates];

  const getGateStatus = (gateId: string) => {
    const flight = flights.find(f => f.gate === gateId && f.status !== 'Departed' && f.status !== 'Cancelled');
    const isConflict = gateEvents.some(g => g.gate === gateId && g.isConflict);
    return { flight, isConflict };
  };

  const activeSelected = selectedGate ? getGateStatus(selectedGate) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden' }}>

      {/* SVG Interactive Radar & Map (span 2) */}
      <div className="lg:col-span-2 border rounded-2xl bg-slate-950 border-slate-800/80 p-4 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 z-10">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
              DEL Terminal 3 Airside & Radar Telemetry Blueprint
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Boarding</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> On-Time</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Delayed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Vacant</span>
          </div>
        </div>

        {/* SVG Blueprint Canvas */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
          <svg viewBox="0 0 800 500" className="w-full h-full select-none">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.5)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#grid)" />

            {/* Runways */}
            <g opacity="0.7">
              {/* Runway 11/29 Main */}
              <rect x="50" y="60" width="700" height="30" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />
              <line x1="60" y1="75" x2="740" y2="75" stroke="#fbbf24" strokeWidth="2" strokeDasharray="15,10" />
              <text x="70" y="80" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">RWY 11L/29R</text>

              {/* Runway 09/27 Secondary */}
              <rect x="50" y="420" width="700" height="30" fill="#0f172a" stroke="#334155" strokeWidth="2" rx="4" />
              <line x1="60" y1="435" x2="740" y2="435" stroke="#fbbf24" strokeWidth="2" strokeDasharray="15,10" />
              <text x="70" y="440" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">RWY 09R/27L</text>
            </g>

            {/* Terminal Building Base Outline */}
            <path
              d="M 100 150 L 700 150 L 700 350 L 100 350 Z"
              fill="rgba(15, 23, 42, 0.8)"
              stroke="#1e293b"
              strokeWidth="3"
            />

            {/* Central Terminal Core / Security Zone */}
            <rect x="320" y="210" width="160" height="80" fill="rgba(30, 27, 75, 0.6)" stroke="#6366f1" strokeWidth="2" rx="8" />
            <text x="400" y="245" fill="#818cf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">SECURITY & CENTRAL CORE</text>
            <text x="400" y="265" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">4 CHECKPOINTS ACTIVE</text>

            {/* Concourse Connecting Pier */}
            <rect x="120" y="240" width="560" height="20" fill="#0f172a" stroke="#334155" strokeWidth="1" />

            {/* Gate Nodes */}
            {allGates.map(g => {
              const { flight, isConflict } = getGateStatus(g.id);
              const isSelected = selectedGate === g.id;

              let nodeColor = '#334155'; // Vacant
              if (isConflict) nodeColor = '#f43f5e'; // Red
              else if (flight?.status === 'Boarding') nodeColor = '#f59e0b'; // Amber
              else if (flight?.status === 'On-Time') nodeColor = '#06b6d4'; // Cyan
              else if (flight?.status === 'Delayed') nodeColor = '#f43f5e';

              return (
                <g key={g.id} className="cursor-pointer" onClick={() => setSelectedGate(g.id)}>
                  {/* Gate Connection Line */}
                  <line
                    x1={g.x} y1={g.y > 250 ? 260 : 240}
                    x2={g.x} y2={g.y}
                    stroke={nodeColor}
                    strokeWidth={isSelected ? "3" : "1.5"}
                    strokeDasharray={flight ? "none" : "3,3"}
                  />
                  {/* Gate Node Circle */}
                  <circle
                    cx={g.x} cy={g.y} r={isSelected ? "16" : "13"}
                    fill={isSelected ? '#0f172a' : '#020617'}
                    stroke={nodeColor}
                    strokeWidth={isSelected ? "3" : "2"}
                    className="transition-all hover:r-16"
                  />
                  {/* Gate Label */}
                  <text
                    x={g.x} y={g.y + 4}
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {g.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Gate Telemetry & Radar Info Panel */}
      <div className="flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-5 overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2 mb-4">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Airside Gate Telemetry</span>
        </h3>

        {!selectedGate ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 font-mono text-center">
            <Navigation className="w-10 h-10 text-slate-700 mb-2" />
            <p className="text-xs uppercase">CLICK ANY GATE NODE ON THE BLUEPRINT TO INSPECT TELEMETRY</p>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs">
            {/* Gate ID Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Selected Node</span>
                <span className="text-2xl font-black text-slate-100">GATE {selectedGate}</span>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded ${
                activeSelected?.isConflict ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                activeSelected?.flight ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'
              }`}>
                {activeSelected?.isConflict ? 'CONFLICT' : activeSelected?.flight ? 'OCCUPIED' : 'VACANT'}
              </span>
            </div>

            {/* Active Flight Info */}
            {activeSelected?.flight ? (
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Flight ID</span>
                  <span className="text-cyan-400 font-bold text-sm">{activeSelected.flight.flightId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Airline</span>
                  <span className="text-slate-200">{activeSelected.flight.airline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination</span>
                  <span className="text-slate-200">{activeSelected.flight.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Departure</span>
                  <span className="text-slate-200">
                    {activeSelected.flight.scheduledDeparture.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aircraft Tail</span>
                  <span className="text-slate-200">{activeSelected.flight.tailNumber} ({activeSelected.flight.aircraftType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Load Factor</span>
                  <span className="text-emerald-400 font-bold">{Math.round(activeSelected.flight.loadFactor)}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Current Status</span>
                  <span className={`font-bold ${
                    activeSelected.flight.status === 'Delayed' ? 'text-rose-400' :
                    activeSelected.flight.status === 'Boarding' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {activeSelected.flight.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-center">
                No aircraft currently assigned to Gate {selectedGate}.
              </div>
            )}

            {/* Airside Alert Notice */}
            {activeSelected?.isConflict && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Gate Conflict Flagged: Two overlapping ground events assigned to this gate position.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

