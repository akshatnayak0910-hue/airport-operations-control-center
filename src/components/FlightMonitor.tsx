import React, { useState } from 'react';
import { Flight } from '../types';
import { Search, Filter, PlaneTakeoff, Info, Edit, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FlightMonitorProps {
  flights: Flight[];
  onUpdateFlight: (flightId: string, updates: Partial<Flight>) => void;
}

type SortKey = 'flight' | 'airline' | 'destination' | 'time' | 'status' | 'load';
type SortDir = 'asc' | 'desc';

export const FlightMonitor: React.FC<FlightMonitorProps> = ({ flights, onUpdateFlight }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Editing state for the detail override
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<Flight['status']>('On-Time');
  const [editGate, setEditGate] = useState('');
  const [editDelay, setEditDelay] = useState(0);

  const filteredFlights = flights.filter(f => {
    const matchesSearch = f.flightId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.airline.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesType = typeFilter === 'All' || 
                        (typeFilter === 'Intl' && f.isInternational) || 
                        (typeFilter === 'Dom' && !f.isInternational);

    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'flight') cmp = a.flightId.localeCompare(b.flightId);
    else if (sortKey === 'airline') cmp = a.airline.localeCompare(b.airline);
    else if (sortKey === 'destination') cmp = a.destination.localeCompare(b.destination);
    else if (sortKey === 'time') cmp = a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime();
    else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortKey === 'load') cmp = a.loadFactor - b.loadFactor;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const getStatusBadge = (status: Flight['status']) => {
    const styles = {
      'On-Time': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Boarding': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Departed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Delayed': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'Cancelled': 'bg-slate-700/20 text-slate-400 border-slate-750'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles['On-Time']}`}>
        {status}
      </span>
    );
  };

  const handleOpenDetail = (f: Flight) => {
    setSelectedFlight(f);
    setEditStatus(f.status);
    setEditGate(f.gate);
    setEditDelay(f.delayMinutes);
    setIsEditing(false);
  };

  const handleSaveOverrides = () => {
    if (selectedFlight) {
      onUpdateFlight(selectedFlight.flightId, {
        status: editStatus,
        gate: editGate,
        delayMinutes: editDelay,
        isDelayed: editDelay > 0,
        delaySeverity: editDelay > 45 ? 'Severe' : editDelay > 0 ? 'Moderate' : 'On-Time'
      });
      // Update selected flight display local instance
      setSelectedFlight({
        ...selectedFlight,
        status: editStatus,
        gate: editGate,
        delayMinutes: editDelay,
        isDelayed: editDelay > 0,
        delaySeverity: editDelay > 45 ? 'Severe' : editDelay > 0 ? 'Moderate' : 'On-Time'
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-210px)] overflow-hidden">
      
      {/* Flight Board Grid */}
      <div className="lg:col-span-2 flex flex-col h-full border rounded-2xl bg-slate-900/40 border-slate-800/80 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/30 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search flight, destination, airline..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex gap-2">
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-slate-350 py-2 px-3 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="On-Time">On-Time</option>
              <option value="Boarding">Boarding</option>
              <option value="Departed">Departed</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Type Selector */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-slate-350 py-2 px-3 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="All">All Flights</option>
              <option value="Dom">Domestic</option>
              <option value="Intl">International</option>
            </select>
          </div>
        </div>

        {/* Board Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/40 text-xs text-slate-400 font-mono tracking-wider sticky top-0 uppercase border-b border-slate-800/80 select-none">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('flight')}>Flight {sortKey==='flight' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('airline')}>Carrier {sortKey==='airline' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('destination')}>Route {sortKey==='destination' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('time')}>Time {sortKey==='time' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="py-3.5 px-4">Gate</th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('status')}>Status {sortKey==='status' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th className="py-3.5 px-4 text-center cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('load')}>Load {sortKey==='load' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {sortedFlights.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    NO FLIGHTS REGISTERED IN CHOSEN SELECTIONS
                  </td>
                </tr>
              ) : (
                sortedFlights.map(f => (
                  <tr 
                    key={f.flightId}
                    onClick={() => handleOpenDetail(f)}
                    className={`hover:bg-slate-800/35 transition-colors cursor-pointer ${
                      selectedFlight?.flightId === f.flightId ? 'bg-slate-800/50 border-l-2 border-cyan-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-200">{f.flightId}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{f.airline}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-350">
                      {f.origin} → <span className="text-cyan-400">{f.destination}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-350">
                      {f.scheduledDeparture.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{f.gate}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(f.status)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className={f.loadFactor > 90 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        {Math.round(f.loadFactor)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flight Override & Details Panel */}
      <div className="flex flex-col h-full border rounded-2xl bg-slate-900/40 border-slate-800/80 overflow-y-auto p-5">
        {!selectedFlight ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Info className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-sm font-mono uppercase text-center">SELECT A FLIGHT TO DEPLOY OPERATIONS CONTROL</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  {selectedFlight.isInternational ? 'International' : 'Domestic'}
                </span>
                <span className="text-xs font-mono text-slate-400">{selectedFlight.tailNumber}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 font-mono mt-1">{selectedFlight.flightId}</h2>
              <div className="text-sm text-cyan-400 font-semibold">{selectedFlight.airline}</div>
            </div>

            {/* Flight Timeline */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Route</span>
                <span className="text-slate-200">{selectedFlight.origin} → {selectedFlight.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Dep</span>
                <span className="text-slate-250">
                  {selectedFlight.scheduledDeparture.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Boarding Time</span>
                <span className="text-slate-250">
                  {selectedFlight.boardingTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity / Booked</span>
                <span className="text-slate-200">{selectedFlight.capacity} / {selectedFlight.bookedPassengers}</span>
              </div>
              {selectedFlight.delayMinutes > 0 && (
                <div className="flex justify-between text-rose-400 font-semibold border-t border-rose-500/10 pt-2">
                  <span>Delay Incident</span>
                  <span>+{selectedFlight.delayMinutes}m ({selectedFlight.delayReason})</span>
                </div>
              )}
            </div>

            {/* Weather / Analytics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg border-slate-800/60 bg-slate-900/30 text-center">
                <div className="text-xxs font-mono uppercase text-slate-450">Load Factor</div>
                <div className="text-lg font-bold text-slate-200 font-mono mt-1">
                  {Math.round(selectedFlight.loadFactor)}%
                </div>
              </div>
              <div className="p-3 border rounded-lg border-slate-800/60 bg-slate-900/30 text-center">
                <div className="text-xxs font-mono uppercase text-slate-450">Weather Risk</div>
                <div className="text-lg font-bold text-slate-200 font-mono mt-1">
                  {Math.round(selectedFlight.weatherRisk * 100)}%
                </div>
              </div>
            </div>

            {/* Overrides Control Block */}
            <div className="border-t border-slate-800/60 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">AOCC Operational Overrides</h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 border border-slate-700 text-cyan-400 hover:bg-slate-700"
                  >
                    <Edit className="w-3 h-3" /> Override
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button 
                      onClick={handleSaveOverrides}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 text-slate-400 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3.5 text-xs">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Flight Status</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as Flight['status'])}
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded-lg text-slate-200 focus:outline-none"
                    >
                      <option value="On-Time">On-Time</option>
                      <option value="Boarding">Boarding</option>
                      <option value="Departed">Departed</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Gate Override */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Gate Allocation</label>
                    <input
                      type="text"
                      value={editGate}
                      onChange={e => setEditGate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded-lg text-slate-200 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Delay Input */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Delay Override (minutes)</label>
                    <input
                      type="number"
                      value={editDelay}
                      onChange={e => setEditDelay(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded-lg text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-850/60">
                    <span className="text-slate-450">Active Status</span>
                    <span className="text-slate-250 font-bold">{selectedFlight.status}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-850/60">
                    <span className="text-slate-450">Gate Assigned</span>
                    <span className="text-slate-250 font-bold">{selectedFlight.gate}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-450">Delay Offset</span>
                    <span className="text-slate-250 font-bold">{selectedFlight.delayMinutes} mins</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick security notice */}
            <div className="flex gap-2.5 p-3 rounded-lg border border-slate-800 bg-slate-950/20 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5" />
              <span>Any changes applied in this override panel propagate instantly through the simulation, update gate events, and notify gate staff shift allocations.</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
