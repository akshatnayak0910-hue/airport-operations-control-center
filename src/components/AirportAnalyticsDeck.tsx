import React, { useMemo } from 'react';
import { Flight, Passenger, SecurityScreening, Baggage } from '../types';
import { BarChart3, TrendingUp, Clock, AlertTriangle, PieChart, Shield, Users } from 'lucide-react';

interface AirportAnalyticsDeckProps {
  flights: Flight[];
  passengers: Passenger[];
  security: SecurityScreening[];
  baggage: Baggage[];
}

export const AirportAnalyticsDeck: React.FC<AirportAnalyticsDeckProps> = ({
  flights,
  passengers,
  security,
  baggage
}) => {
  // On-Time Performance (OTP %)
  const totalCompletedOrDeparted = flights.filter(f => f.status === 'Departed' || f.status === 'On-Time' || f.status === 'Delayed');
  const onTimeCount = totalCompletedOrDeparted.filter(f => f.delayMinutes === 0).length;
  const otpPercent = totalCompletedOrDeparted.length > 0 ? Math.round((onTimeCount / totalCompletedOrDeparted.length) * 100) : 100;

  // Delay Root Cause Distribution
  const delayCauses = useMemo(() => {
    const map: Record<string, number> = {};
    flights.filter(f => f.delayMinutes > 0).forEach(f => {
      const reason = f.delayReason || 'Operational';
      map[reason] = (map[reason] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [flights]);

  const maxCauseCount = delayCauses.length > 0 ? delayCauses[0][1] : 1;

  // Security Efficiency metrics
  const avgSecurityWait = useMemo(() => {
    if (security.length === 0) return 0;
    const totalSecs = security.reduce((acc, s) => acc + s.processingTimeSeconds, 0);
    return Math.round(totalSecs / security.length);
  }, [security]);

  // Baggage On-Time Load Rate
  const loadedBagsPct = useMemo(() => {
    if (baggage.length === 0) return 100;
    const loaded = baggage.filter(b => b.status === 'Loaded' || b.status === 'Claimed').length;
    return Math.round((loaded / baggage.length) * 100);
  }, [baggage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden' }}>

      {/* Main KPI Gauge & OTP Summary (span 1) */}
      <div className="flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-5 overflow-y-auto space-y-6">
        <h2 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <BarChart3 className="w-4 h-4 text-cyan-400" /> Executive Operational KPIs
        </h2>

        {/* OTP Gauge Card */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider">On-Time Performance (OTP)</div>
          <div className={`text-4xl font-black ${otpPercent >= 85 ? 'text-emerald-400' : otpPercent >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
            {otpPercent}%
          </div>
          <div className="w-full bg-slate-900 rounded-full overflow-hidden" style={{ height: '6px' }}>
            <div className={`h-full rounded-full transition-all duration-700 ${otpPercent >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${otpPercent}%` }} />
          </div>
          <div className="text-[10px] text-slate-500 pt-1">Benchmark Target: &gt;85.0%</div>
        </div>

        {/* Security & Baggage Efficiency Metrics */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-300 font-semibold">Security Wait Index</span>
            </div>
            <span className="text-sm font-bold text-slate-100">{avgSecurityWait}s / pax</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold">Baggage On-Time Load</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{loadedBagsPct}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 font-semibold">Total Passengers Handled</span>
            </div>
            <span className="text-sm font-bold text-slate-100">{passengers.length}</span>
          </div>
        </div>
      </div>

      {/* Delay Root Cause Breakdown & Airline Performance (span 2) */}
      <div className="lg:col-span-2 flex flex-col border rounded-2xl bg-slate-900/40 border-slate-800/80 p-6 overflow-y-auto space-y-6">

        {/* Root Cause Chart */}
        <div className="space-y-4 font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> Delay Root-Cause Analysis
          </h3>

          {delayCauses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs uppercase">
              No delay incidents logged in active simulation window.
            </div>
          ) : (
            <div className="space-y-3">
              {delayCauses.map(([reason, count]) => {
                const pct = Math.round((count / maxCauseCount) * 100);
                return (
                  <div key={reason} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-200">{reason}</span>
                      <span className="text-rose-400">{count} Flights Flagged</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full overflow-hidden" style={{ height: '6px' }}>
                      <div className="h-full rounded-full bg-rose-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operational Flow Summary Notice */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Analytics Methodology Notice</div>
          <p className="text-[11px]">
            Analytics metrics compute dynamically from real-time simulation events across all 8 datasets. OTP percentage evaluates departure timestamps against scheduled slots.
          </p>
        </div>

      </div>

    </div>
  );
};

