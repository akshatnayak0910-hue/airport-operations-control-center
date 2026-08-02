import React, { useState, useMemo } from 'react';
import { MaintenanceLog, StaffShift } from '../types';
import { Wrench, Users, ShieldAlert, Check, Clock } from 'lucide-react';

interface WorkforceMaintenanceProps {
  maintenance: MaintenanceLog[];
  shifts: StaffShift[];
  onResolveMaintenance: (workOrderId: string, action: string) => void;
}

export const WorkforceMaintenance: React.FC<WorkforceMaintenanceProps> = ({
  maintenance,
  shifts,
  onResolveMaintenance
}) => {
  const [mtcFilter, setMtcFilter] = useState<'all' | 'critical'>('all');
  // Severity rendering
  const getSeverityBadge = (level: number) => {
    if (level >= 4) {
      return (
        <span className="px-2 py-0.5 rounded text-xxs font-bold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
          CRITICAL (Lvl {level})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xxs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
        MODERATE (Lvl {level})
      </span>
    );
  };

  const deptSummary = useMemo(() => {
    const map: Record<string, number> = {};
    shifts.forEach(s => { map[s.department] = (map[s.department] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [shifts]);

  const filteredMtc = mtcFilter === 'critical'
    ? maintenance.filter(m => m.severityLevel >= 4)
    : maintenance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-210px)] overflow-hidden">
      
      {/* Maintenance Log Queue (left side, span 2) */}
      <div className="lg:col-span-2 flex flex-col h-full border rounded-2xl bg-slate-900/40 border-slate-800/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/30 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <Wrench className="w-4.5 h-4.5 text-cyan-400" />
            <span>Aircraft Engineering & Defects Queue</span>
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setMtcFilter('all')}
              className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                mtcFilter === 'all' ? 'bg-slate-800 text-cyan-400 border-slate-700' : 'text-slate-500 border-slate-800 hover:text-slate-300'
              }`}>All</button>
            <button onClick={() => setMtcFilter('critical')}
              className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                mtcFilter === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'text-slate-500 border-slate-800 hover:text-slate-300'
              }`}>Critical Only</button>
            <span className="text-xs font-mono text-slate-400">
              {filteredMtc.filter(m => !m.completedTime || m.completedTime.getTime() === 0).length} Open
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {filteredMtc.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs uppercase">
              No outstanding maintenance requests logged.
            </div>
          ) : (
            filteredMtc.map(log => {
              const isOpen = !log.completedTime || log.completedTime.getTime() === 0;

              return (
                <div 
                  key={log.workOrderId} 
                  className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                    isOpen ? 'bg-slate-950/15' : 'bg-transparent text-slate-500'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-black text-sm text-slate-200">{log.workOrderId}</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-xs font-bold text-cyan-400">{log.aircraftRegistration}</span>
                      <span>{getSeverityBadge(log.severityLevel)}</span>
                    </div>

                    <div className="text-sm font-medium text-slate-350">
                      Defect: <span className="text-slate-200 font-bold">{log.defectReported || 'Inspection scheduled'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>Tech: {log.technicianName}</span>
                      <span>•</span>
                      <span>Logged: {log.loggedTime.toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <button
                        onClick={() => onResolveMaintenance(log.workOrderId, 'Inspected and certified flight-ready.')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Resolve
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                        <Check className="w-3.5 h-3.5" /> RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Workforce Roster shifts list (right side, span 1) */}
      <div className="flex flex-col h-full border rounded-2xl bg-slate-900/40 border-slate-800/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800/60 bg-slate-900/30 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-indigo-400" />
            <span>Operational Staffing</span>
          </h2>
          <span className="text-xs font-mono text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded">
            {shifts.length} Active
          </span>
        </div>
        {/* Department Summary */}
        {deptSummary.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-800/40 flex flex-wrap gap-1.5">
            {deptSummary.map(([dept, count]) => (
              <span key={dept} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {dept.slice(0, 8)}: {count}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {shifts.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              No staff active in current shift period.
            </div>
          ) : (
            shifts.map((staff, idx) => (
              <div 
                key={idx}
                className="p-3 border border-slate-850 rounded-xl bg-slate-950/20 hover:border-slate-800 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-200">{staff.staffName}</div>
                    <div className="text-[10px] text-slate-450 mt-0.5">{staff.role} | ID: {staff.staffId}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {staff.isOvertime && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">OT</span>
                    )}
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-350">
                      {staff.department.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-450">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Duration: {staff.durationHours} hrs</span>
                  </span>
                  <span>Terminal {staff.terminal}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
