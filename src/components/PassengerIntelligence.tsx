import React, { useState, useMemo } from 'react';
import { Passenger, Flight, Baggage, SecurityScreening } from '../types';
import { Users, Search, UserCheck, Globe, Briefcase, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PassengerIntelligenceProps {
  passengers: Passenger[];
  flights: Flight[];
  baggage: Baggage[];
  security: SecurityScreening[];
}

type SortKey = 'name' | 'flight' | 'cabin' | 'checkin';
type SortDir = 'asc' | 'desc';

const CABIN_COLOR: Record<string, string> = {
  'Business': 'bg-amber-500',
  'First': 'bg-purple-500',
  'Economy': 'bg-cyan-600',
  'Premium Economy': 'bg-teal-500',
};

export const PassengerIntelligence: React.FC<PassengerIntelligenceProps> = ({
  passengers, flights, baggage, security
}) => {
  const [search, setSearch] = useState('');
  const [flightFilter, setFlightFilter] = useState('All');
  const [cabinFilter, setCabinFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('checkin');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedPax, setSelectedPax] = useState<Passenger | null>(null);

  const uniqueFlights = useMemo(() => Array.from(new Set(passengers.map(p => p.flightId))).sort(), [passengers]);
  const cabinClasses = useMemo(() => Array.from(new Set(passengers.map(p => p.cabinClass))).sort(), [passengers]);

  const filtered = useMemo(() => {
    let result = passengers.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.firstName.toLowerCase().includes(q) || p.lastName.toLowerCase().includes(q) ||
        p.pnrCode.toLowerCase().includes(q) || p.passportNumber.toLowerCase().includes(q) ||
        p.flightId.toLowerCase().includes(q);
      const matchFlight = flightFilter === 'All' || p.flightId === flightFilter;
      const matchCabin = cabinFilter === 'All' || p.cabinClass === cabinFilter;
      return matchSearch && matchFlight && matchCabin;
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
      else if (sortKey === 'flight') cmp = a.flightId.localeCompare(b.flightId);
      else if (sortKey === 'cabin') cmp = a.cabinClass.localeCompare(b.cabinClass);
      else if (sortKey === 'checkin') cmp = a.checkInTime.getTime() - b.checkInTime.getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [passengers, search, flightFilter, cabinFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const totalPax = passengers.length;
  const checkedIn = passengers.filter(p => p.checkInTime.getTime() > 0).length;
  const securityCleared = passengers.filter(p => p.securityClearedTime.getTime() > 0).length;

  const cabinBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    passengers.forEach(p => { counts[p.cabinClass] = (counts[p.cabinClass] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [passengers]);

  const topNationalities = useMemo(() => {
    const counts: Record<string, number> = {};
    passengers.forEach(p => { counts[p.nationality] = (counts[p.nationality] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [passengers]);

  const paxBaggage = selectedPax ? baggage.filter(b => b.pnrCode === selectedPax.pnrCode) : [];
  const paxSecurity = selectedPax ? security.filter(s => s.pnrCode === selectedPax.pnrCode) : [];
  const paxFlight = selectedPax ? flights.find(f => f.flightId === selectedPax.flightId) : null;

  const SortArrow = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown className="w-3 h-3 opacity-20 inline" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-cyan-400 inline" />
      : <ChevronDown className="w-3 h-3 text-cyan-400 inline" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden' }}>

      {/* LEFT — KPIs + table */}
      <div className="lg:col-span-2 flex flex-col gap-5 overflow-hidden">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-4 flex-shrink-0">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 text-center">
            <div className="text-2xl font-black font-mono text-slate-100">{totalPax}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Total Passengers</div>
          </div>
          <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 text-center">
            <div className="text-2xl font-black font-mono text-emerald-400">{checkedIn}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Checked-In</div>
          </div>
          <div className="p-4 rounded-2xl border border-indigo-500/25 bg-indigo-500/5 text-center">
            <div className="text-2xl font-black font-mono text-indigo-400">{securityCleared}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Security Cleared</div>
          </div>
        </div>

        {/* Filters + Manifest Table */}
        <div className="flex flex-col flex-1 border rounded-2xl bg-slate-900/40 border-slate-800/80 overflow-hidden">
          <div className="flex flex-wrap gap-3 p-4 border-b border-slate-800/60 bg-slate-900/30 flex-shrink-0">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input type="text" placeholder="PNR, passport, name, flight..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50" />
            </div>
            <select value={flightFilter} onChange={e => setFlightFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-lg focus:outline-none">
              <option value="All">All Flights</option>
              {uniqueFlights.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
            <select value={cabinFilter} onChange={e => setCabinFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-lg focus:outline-none">
              <option value="All">All Cabins</option>
              {cabinClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-xs font-mono text-slate-500 self-center">{filtered.length} records</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800/80">
                <tr>
                  <th className="py-3 px-4 cursor-pointer hover:text-cyan-400 select-none" onClick={() => toggleSort('name')}>
                    Name <SortArrow k="name" />
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-cyan-400 select-none" onClick={() => toggleSort('flight')}>
                    Flight <SortArrow k="flight" />
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-cyan-400 select-none" onClick={() => toggleSort('cabin')}>
                    Cabin <SortArrow k="cabin" />
                  </th>
                  <th className="py-3 px-4">Seat</th>
                  <th className="py-3 px-4">Nationality</th>
                  <th className="py-3 px-4 cursor-pointer hover:text-cyan-400 select-none" onClick={() => toggleSort('checkin')}>
                    Check-in <SortArrow k="checkin" />
                  </th>
                  <th className="py-3 px-4 text-center">Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 font-mono">NO PASSENGERS FOUND</td>
                  </tr>
                ) : filtered.map(p => {
                  const secRecord = security.find(s => s.pnrCode === p.pnrCode);
                  const isFlagged = !!secRecord && secRecord.status === 'Flagged';
                  const isCleared = !!secRecord && secRecord.status === 'Clear';
                  return (
                    <tr key={p.pnrCode} onClick={() => setSelectedPax(p)}
                      className={`cursor-pointer transition-colors hover:bg-slate-800/30 ${selectedPax?.pnrCode === p.pnrCode ? 'bg-slate-800/50' : ''}`}
                      style={selectedPax?.pnrCode === p.pnrCode ? { borderLeft: '2px solid #22d3ee' } : {}}>
                      <td className="py-3 px-4 font-semibold text-slate-200">{p.firstName} {p.lastName}</td>
                      <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{p.flightId}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-white font-bold ${CABIN_COLOR[p.cabinClass] || 'bg-slate-600'}`} style={{ fontSize: '10px' }}>
                          {p.cabinClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{p.seatNumber}</td>
                      <td className="py-3 px-4 text-slate-400">{p.nationality}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {p.checkInTime.getTime() > 0
                          ? p.checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isFlagged
                          ? <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30" style={{ fontSize: '10px' }}>FLAGGED</span>
                          : isCleared
                          ? <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold" style={{ fontSize: '10px' }}>CLEARED</span>
                          : <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400" style={{ fontSize: '10px' }}>PENDING</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT — Stats + Detail */}
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        {/* Cabin Distribution */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Cabin Distribution
          </h3>
          <div className="space-y-3">
            {cabinBreakdown.map(([cabin, count]) => {
              const pct = Math.round((count / Math.max(totalPax, 1)) * 100);
              return (
                <div key={cabin}>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-300 font-semibold">{cabin}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full overflow-hidden" style={{ height: '6px' }}>
                    <div className={`h-full rounded-full transition-all duration-500 ${CABIN_COLOR[cabin] || 'bg-slate-500'}`}
                      style={{ width: pct + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Nationalities */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" /> Passenger Origins
          </h3>
          <div className="space-y-2.5">
            {topNationalities.map(([nat, count]) => {
              const pct = Math.round((count / Math.max(totalPax, 1)) * 100);
              return (
                <div key={nat} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-20 text-slate-300 truncate">{nat}</span>
                  <div className="flex-1 bg-slate-800 rounded-full overflow-hidden" style={{ height: '6px' }}>
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: pct + '%' }} />
                  </div>
                  <span className="text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passenger Detail */}
        {selectedPax ? (
          <div className="p-5 rounded-2xl border border-cyan-500/25 bg-slate-900/50 flex-shrink-0 space-y-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">Passenger Profile</div>
              <div className="text-xl font-black text-slate-100">{selectedPax.firstName} {selectedPax.lastName}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                PNR: {selectedPax.pnrCode} | {selectedPax.gender} | Age {selectedPax.age}
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">{selectedPax.nationality}</div>
            </div>

            {paxFlight && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Flight</span>
                  <span className="text-cyan-400 font-bold">{paxFlight.flightId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route</span>
                  <span className="text-slate-200">{paxFlight.origin} → {paxFlight.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-bold ${paxFlight.status === 'Delayed' ? 'text-rose-400' : paxFlight.status === 'Boarding' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {paxFlight.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seat</span>
                  <span className="text-slate-200">{selectedPax.seatNumber} ({selectedPax.cabinClass})</span>
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Baggage ({paxBaggage.length} bags)
              </div>
              {paxBaggage.length === 0
                ? <div className="text-xs text-slate-600 font-mono">No baggage records found</div>
                : paxBaggage.map(b => (
                  <div key={b.tagId} className="flex justify-between text-xs font-mono py-1.5 border-b border-slate-800/40">
                    <span className="text-slate-300">{b.tagId} ({b.weight}kg)</span>
                    <span className={`font-bold ${b.status === 'Delayed' ? 'text-amber-400' : b.status === 'Loaded' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {b.status}
                    </span>
                  </div>
                ))
              }
            </div>

            {paxSecurity.length > 0 && paxSecurity.map(s => (
              <div key={s.screeningId} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50 text-xs font-mono space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">Security Record</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Checkpoint</span>
                  <span className="text-slate-200">{s.checkpointNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing</span>
                  <span className="text-slate-200">{s.processingTimeSeconds}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Result</span>
                  <span className={`font-bold ${s.status === 'Flagged' ? 'text-red-400' : 'text-emerald-400'}`}>{s.status}</span>
                </div>
                {s.flagReason && (
                  <div className="flex items-center gap-1 text-rose-400 pt-1">
                    <AlertCircle className="w-3 h-3" /> {s.flagReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20 text-center text-slate-600 text-xs font-mono">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-800" />
            SELECT A PASSENGER FOR FULL PROFILE
          </div>
        )}
      </div>
    </div>
  );
};

