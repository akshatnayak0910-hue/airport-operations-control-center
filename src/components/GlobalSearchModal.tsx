import React, { useState, useMemo } from 'react';
import { Flight, Passenger, Baggage, SecurityScreening, StaffShift, MaintenanceLog, RetailTransaction } from '../types';
import { Search, X, Plane, Users, Briefcase, Shield, Wrench, ShoppingCart, UserCheck, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  flights: Flight[];
  passengers: Passenger[];
  baggage: Baggage[];
  security: SecurityScreening[];
  shifts: StaffShift[];
  maintenance: MaintenanceLog[];
  retail: RetailTransaction[];
  onNavigateTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  flights,
  passengers,
  baggage,
  security,
  shifts,
  maintenance,
  retail,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedFlights = flights.filter(f =>
      f.flightId.toLowerCase().includes(q) ||
      f.airline.toLowerCase().includes(q) ||
      f.destination.toLowerCase().includes(q) ||
      f.gate.toLowerCase().includes(q) ||
      f.tailNumber.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedPax = passengers.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.pnrCode.toLowerCase().includes(q) ||
      p.passportNumber.toLowerCase().includes(q) ||
      p.flightId.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedBaggage = baggage.filter(b =>
      b.tagId.toLowerCase().includes(q) ||
      b.pnrCode.toLowerCase().includes(q) ||
      b.flightId.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedSecurity = security.filter(s =>
      s.pnrCode.toLowerCase().includes(q) ||
      s.passportNumber.toLowerCase().includes(q) ||
      s.checkpointNumber.toString().includes(q)
    ).slice(0, 4);

    const matchedStaff = shifts.filter(s =>
      s.staffName.toLowerCase().includes(q) ||
      s.staffId.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedMtc = maintenance.filter(m =>
      m.workOrderId.toLowerCase().includes(q) ||
      m.aircraftRegistration.toLowerCase().includes(q) ||
      m.defectReported.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedRetail = retail.filter(r =>
      r.outletName.toLowerCase().includes(q) ||
      r.itemName.toLowerCase().includes(q) ||
      r.flightId.toLowerCase().includes(q)
    ).slice(0, 4);

    const totalCount = matchedFlights.length + matchedPax.length + matchedBaggage.length +
                       matchedSecurity.length + matchedStaff.length + matchedMtc.length + matchedRetail.length;

    return {
      flights: matchedFlights,
      passengers: matchedPax,
      baggage: matchedBaggage,
      security: matchedSecurity,
      staff: matchedStaff,
      maintenance: matchedMtc,
      retail: matchedRetail,
      totalCount
    };
  }, [query, flights, passengers, baggage, security, shifts, maintenance, retail]);

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    onNavigateTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 px-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">

        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Global Search: Type PNR, Passport #, Flight ID, Staff ID, Workorder, Gate..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="px-2.5 py-1 text-xs font-mono bg-slate-800 text-slate-400 rounded hover:bg-slate-700">
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 font-mono text-xs">
          {!query.trim() ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-700 mb-2" />
              <p>Type to search across all 8 airport datasets in real-time.</p>
              <div className="flex justify-center gap-2 pt-2 text-[10px] text-slate-600">
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">Flight: AI-302</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">PNR: PNR-8402</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">Passport: P-9082</span>
              </div>
            </div>
          ) : searchResults && searchResults.totalCount === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No matching records found for "{query}".
            </div>
          ) : (
            searchResults && (
              <div className="space-y-5">
                {/* Flights */}
                {searchResults.flights.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-cyan-400 mb-2 flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5" /> Flights ({searchResults.flights.length})
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.flights.map(f => (
                        <div
                          key={f.flightId}
                          onClick={() => handleSelect('flights')}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{f.flightId}</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-slate-300">{f.airline}</span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-cyan-400">{f.origin} → {f.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Gate {f.gate}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Passengers */}
                {searchResults.passengers.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Passengers ({searchResults.passengers.length})
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.passengers.map(p => (
                        <div
                          key={p.pnrCode}
                          onClick={() => handleSelect('passengers')}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{p.firstName} {p.lastName}</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-emerald-400 font-bold">PNR: {p.pnrCode}</span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-slate-400">{p.nationality}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{p.flightId} (Seat {p.seatNumber})</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Baggage */}
                {searchResults.baggage.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Baggage ({searchResults.baggage.length})
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.baggage.map(b => (
                        <div
                          key={b.tagId}
                          onClick={() => handleSelect('flow')}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200">TAG: {b.tagId}</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-slate-300">PNR: {b.pnrCode}</span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-amber-400">Carousel {b.beltLocation}</span>
                          </div>
                          <span className="font-bold text-slate-300">{b.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff */}
                {searchResults.staff.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-2 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" /> Staff Shifts ({searchResults.staff.length})
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.staff.map(s => (
                        <div
                          key={s.staffId}
                          onClick={() => handleSelect('workforce')}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{s.staffName}</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-indigo-400">{s.role}</span>
                          </div>
                          <span className="text-slate-400">Dept: {s.department}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintenance */}
                {searchResults.maintenance.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" /> Maintenance Workorders ({searchResults.maintenance.length})
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.maintenance.map(m => (
                        <div
                          key={m.workOrderId}
                          onClick={() => handleSelect('workforce')}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{m.workOrderId}</span>
                            <span className="text-slate-500 mx-2">•</span>
                            <span className="text-purple-400">{m.aircraftRegistration}</span>
                            <span className="text-slate-500 mx-2">|</span>
                            <span className="text-slate-300">{m.defectReported}</span>
                          </div>
                          <span className="text-amber-400 font-bold">Lvl {m.severityLevel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

