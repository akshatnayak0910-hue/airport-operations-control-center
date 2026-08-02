import React from 'react';
import { Flight, GateEvent, Baggage, SecurityScreening, Alert } from '../types';
import { Plane, AlertTriangle, CheckCircle, Clock, Shield, Briefcase, LayoutGrid, CheckSquare } from 'lucide-react';

interface DashboardOverviewProps {
  flights: Flight[];
  gateEvents: GateEvent[];
  baggage: Baggage[];
  security: SecurityScreening[];
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  flights,
  gateEvents,
  baggage,
  security,
  alerts,
  onResolveAlert,
  onNavigate
}) => {
  // Compute metrics based on currently loaded state
  const totalFlights = flights.length;
  const departedCount = flights.filter(f => f.status === 'Departed').length;
  const delayedCount = flights.filter(f => f.status === 'Delayed').length;
  const boardingCount = flights.filter(f => f.status === 'Boarding').length;
  
  // Gate occupancy rate (unique gates active in events vs a set capacity of 50 gates)
  const totalGates = 50;
  const occupiedGates = new Set(gateEvents.map(e => e.gate)).size;
  const gateOccupancyPercent = Math.min(Math.round((occupiedGates / totalGates) * 100), 100);

  // Security stats: Average processing time of clear vs flagged, and queue size
  const totalScreened = security.length;
  const avgProcessingTime = totalScreened > 0
    ? Math.round(security.reduce((acc, s) => acc + s.processingTimeSeconds, 0) / totalScreened)
    : 0;
  const flaggedCount = security.filter(s => s.status === 'Flagged').length;

  // Baggage stats
  const totalBags = baggage.length;
  const loadedBags = baggage.filter(b => b.status === 'Loaded').length;
  const delayedBags = baggage.filter(b => b.status === 'Delayed').length;

  // Active alerts (unresolved)
  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Flights Monitor Card */}
        <div 
          onClick={() => onNavigate('flights')}
          className="p-5 border rounded-2xl bg-slate-900/40 border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">Flights Operations</span>
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">{totalFlights}</div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">{departedCount} Dep</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{boardingCount} Brd</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{delayedCount} Dly</span>
          </div>
        </div>

        {/* Gate Occupancy Card */}
        <div 
          onClick={() => onNavigate('gates')}
          className="p-5 border rounded-2xl bg-slate-900/40 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">Gate Allocations</span>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">{gateOccupancyPercent}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${gateOccupancyPercent}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 font-mono mt-2">
            {occupiedGates} / {totalGates} Active Gates
          </div>
        </div>

        {/* Security Processing Card */}
        <div 
          onClick={() => onNavigate('flow')}
          className="p-5 border rounded-2xl bg-slate-900/40 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">Security Checkpoint</span>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">{avgProcessingTime}s</div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-mono">
            <span className="text-slate-300">{totalScreened} Screened</span>
            <span>•</span>
            <span className="text-red-400 font-semibold">{flaggedCount} Flagged</span>
          </div>
        </div>

        {/* Baggage Handling Card */}
        <div 
          onClick={() => onNavigate('flow')}
          className="p-5 border rounded-2xl bg-slate-900/40 border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400 group-hover:text-purple-400 transition-colors">Baggage Lifecycle</span>
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">{totalBags}</div>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">{loadedBags} Loaded</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{delayedBags} Delayed</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Alerts List & Live Operations Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts Log Queue */}
        <div className="lg:col-span-2 p-6 border rounded-2xl bg-slate-900/40 border-slate-800/80 flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Live Incident & Alert Logs</h2>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 font-mono">
              {activeAlerts.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <CheckCircle className="w-12 h-12 text-emerald-500/30 mb-2" />
                <p className="text-sm">All operations functioning within baseline parameters.</p>
              </div>
            ) : (
              activeAlerts.map(alert => {
                const severityColors = {
                  low: 'border-slate-700 bg-slate-800/20 text-slate-300',
                  medium: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
                  high: 'border-orange-500/30 bg-orange-500/5 text-orange-300',
                  critical: 'border-red-500/40 bg-red-500/5 text-red-300 animate-pulse'
                };

                return (
                  <div 
                    key={alert.id}
                    className={`flex items-start justify-between p-4 border rounded-xl transition-all ${severityColors[alert.severity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <AlertTriangle className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{alert.message}</div>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {alert.timestamp.toLocaleTimeString()} | Category: {alert.category.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-slate-850 hover:bg-slate-750 text-slate-300 transition-colors border border-slate-700/50"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Resolve
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Airport Quick Status Telemetry */}
        <div className="p-6 border rounded-2xl bg-slate-900/40 border-slate-800/80 flex flex-col h-[480px]">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Operations Telemetry</span>
          </h2>
          <div className="flex-1 space-y-5 text-sm font-mono overflow-y-auto">

            {/* Flight Status Visual Strip */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flight Status Mix</div>
              <div className="flex gap-1 h-5 rounded overflow-hidden">
                {(['On-Time', 'Boarding', 'Departed', 'Delayed', 'Cancelled'] as const).map(s => {
                  const count = flights.filter(f => f.status === s).length;
                  const pct = totalFlights > 0 ? (count / totalFlights) * 100 : 0;
                  const colors: Record<string, string> = {
                    'On-Time': 'bg-cyan-500', 'Boarding': 'bg-amber-500',
                    'Departed': 'bg-emerald-500', 'Delayed': 'bg-rose-500', 'Cancelled': 'bg-slate-600'
                  };
                  return pct > 0 ? (
                    <div key={s} title={`${s}: ${count}`}
                      className={`${colors[s]} transition-all duration-500`}
                      style={{ width: pct + '%' }} />
                  ) : null;
                })}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
                {[['cyan-400','On-Time'],['amber-400','Boarding'],['emerald-400','Departed'],['rose-400','Delayed']].map(([c,s]) => (
                  <span key={s} className={`text-${c}`}>{s}: {flights.filter(f=>f.status===s).length}</span>
                ))}
              </div>
            </div>

            {/* Top Airlines by Delay — CSS bar chart */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Delay by Airline</div>
              {(() => {
                const airlineDelays: Record<string, number> = {};
                flights.filter(f => f.delayMinutes > 0).forEach(f => {
                  airlineDelays[f.airline] = (airlineDelays[f.airline] || 0) + f.delayMinutes;
                });
                const sorted = Object.entries(airlineDelays).sort((a,b) => b[1]-a[1]).slice(0, 5);
                const maxDelay = sorted.length > 0 ? sorted[0][1] : 1;
                return sorted.map(([airline, mins]) => (
                  <div key={airline}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-slate-300 truncate">{airline}</span>
                      <span className="text-rose-400">{mins}m</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full overflow-hidden" style={{ height: '4px' }}>
                      <div className="h-full rounded-full bg-rose-500 transition-all duration-500"
                        style={{ width: `${(mins / maxDelay) * 100}%` }} />
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Resource metrics */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resource Snapshot</div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">High Weather Risk Flights</span>
                <span className="text-rose-400 font-bold">{flights.filter(f => f.weatherRisk > 0.7).length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">High Load Factor (&gt;90%)</span>
                <span className="text-cyan-400 font-bold">{flights.filter(f => f.loadFactor > 90).length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Gate Conflict Flags</span>
                <span className="text-amber-400 font-bold">{gateEvents.filter(g => g.isConflict).length}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Security Alarms Today</span>
                <span className="text-red-400 font-bold">{security.filter(s => s.alarmTriggered).length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
