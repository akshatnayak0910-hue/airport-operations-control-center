import { useState, useEffect, useRef } from 'react';
import { Flight, GateEvent, Passenger, Baggage, SecurityScreening, StaffShift, RetailTransaction, MaintenanceLog, Alert } from './types';
import {
  parseFlightsCsv,
  parseGateEventsCsv,
  parsePassengersCsv,
  parseBaggageCsv,
  parseSecurityScreeningCsv,
  parseStaffShiftsCsv,
  parseRetailTransactionsCsv,
  parseMaintenanceLogsCsv
} from './utils/csvParser';
import { SimulationControls } from './components/SimulationControls';
import { DashboardOverview } from './components/DashboardOverview';
import { FlightMonitor } from './components/FlightMonitor';
import { GateActivityBoard } from './components/GateActivityBoard';
import { SecurityBaggageFlow } from './components/SecurityBaggageFlow';
import { WorkforceMaintenance } from './components/WorkforceMaintenance';
import { PassengerIntelligence } from './components/PassengerIntelligence';
import { RetailAnalytics } from './components/RetailAnalytics';
import { AirportTerminalMap } from './components/AirportTerminalMap';
import { EmergencyDeck } from './components/EmergencyDeck';
import { TurnaroundGantt } from './components/TurnaroundGantt';
import { AirportAnalyticsDeck } from './components/AirportAnalyticsDeck';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { exportIncidentLogsCSV, exportFlightManifestJSON } from './utils/logExporter';
import { LayoutDashboard, Plane, LayoutGrid, Shield, Wrench, ShieldAlert, Users, ShoppingCart, Compass, Download, RefreshCcw, BarChart3, Search } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Raw dataset states
  const [flightsRaw, setFlightsRaw] = useState<Flight[]>([]);
  const [gateEventsRaw, setGateEventsRaw] = useState<GateEvent[]>([]);
  const [passengersRaw, setPassengersRaw] = useState<Passenger[]>([]);
  const [baggageRaw, setBaggageRaw] = useState<Baggage[]>([]);
  const [securityRaw, setSecurityRaw] = useState<SecurityScreening[]>([]);
  const [staffShiftsRaw, setStaffShiftsRaw] = useState<StaffShift[]>([]);
  const [retailRaw, setRetailRaw] = useState<RetailTransaction[]>([]);
  const [maintenanceRaw, setMaintenanceRaw] = useState<MaintenanceLog[]>([]);

  // Simulation parameters
  const [simTime, setSimTime] = useState<Date>(new Date('2024-11-11 12:00:00'));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(60); // 60x default: 1 minute simulation per 1 real second

  // Dynamic state computed based on simulation clock
  const [flights, setFlights] = useState<Flight[]>([]);
  const [gateEvents, setGateEvents] = useState<GateEvent[]>([]);
  const [baggage, setBaggage] = useState<Baggage[]>([]);
  const [security, setSecurity] = useState<SecurityScreening[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>([]);

  // System alerts list
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Simulation timer reference
  const lastUpdateRef = useRef<number>(Date.now());

  // Initialize and load datasets
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [
          resFlights,
          resGates,
          resPassengers,
          resBaggage,
          resSecurity,
          resShifts,
          resRetail,
          resMtc
        ] = await Promise.all([
          fetch('/dataset/flights.csv').then(r => r.text()),
          fetch('/dataset/gate_events.csv').then(r => r.text()),
          fetch('/dataset/passengers.csv').then(r => r.text()),
          fetch('/dataset/baggage.csv').then(r => r.text()),
          fetch('/dataset/security_screening.csv').then(r => r.text()),
          fetch('/dataset/staff_shifts.csv').then(r => r.text()),
          fetch('/dataset/retail_transactions.csv').then(r => r.text()),
          fetch('/dataset/maintenance_logs.csv').then(r => r.text())
        ]);

        const parsedFlights = parseFlightsCsv(resFlights);
        const parsedGates = parseGateEventsCsv(resGates);
        const parsedPassengers = parsePassengersCsv(resPassengers);
        const parsedBaggage = parseBaggageCsv(resBaggage);
        const parsedSecurity = parseSecurityScreeningCsv(resSecurity);
        const parsedShifts = parseStaffShiftsCsv(resShifts);
        const parsedRetail = parseRetailTransactionsCsv(resRetail);
        const parsedMtc = parseMaintenanceLogsCsv(resMtc);

        setFlightsRaw(parsedFlights);
        setGateEventsRaw(parsedGates);
        setPassengersRaw(parsedPassengers);
        setBaggageRaw(parsedBaggage);
        setSecurityRaw(parsedSecurity);
        setStaffShiftsRaw(parsedShifts);
        setRetailRaw(parsedRetail);
        setMaintenanceRaw(parsedMtc);

        // Find the earliest flight departure to start the simulation clock realistically
        if (parsedFlights.length > 0) {
          const sorted = [...parsedFlights].sort((a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime());
          setSimTime(sorted[0].scheduledDeparture);
        }
      } catch (err) {
        console.error('Failed to load dataset files:', err);
      }
    };

    loadAllData();
  }, []);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulation Clock Tick effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const realElapsedMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Add (real elapsed time in seconds * speed multiplier) to simulation clock
      setSimTime(prev => {
        const nextTime = new Date(prev.getTime() + (realElapsedMs * speed));
        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Update lastUpdateRef whenever isPlaying is toggled
  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = Date.now();
    }
  }, [isPlaying]);

  // Filter datasets according to the current simulation time
  useEffect(() => {
    if (flightsRaw.length === 0) return;

    // Flights: Active flights scheduled within a 24 hour window centered on simTime
    const simTimeMs = simTime.getTime();
    const windowStart = new Date(simTimeMs - 12 * 60 * 60 * 1000);
    const windowEnd = new Date(simTimeMs + 12 * 60 * 60 * 1000);

    const activeFlights = flightsRaw.filter(f => 
      f.scheduledDeparture >= windowStart && f.scheduledDeparture <= windowEnd
    );

    // Sync statuses based on current simulation clock
    const updatedFlights = activeFlights.map(f => {
      let status = f.status;
      // If time has passed actual departure, mark as Departed (unless cancelled/delayed override)
      if (simTime >= f.actualDeparture && f.status !== 'Cancelled') {
        status = 'Departed';
      } else if (simTime >= f.boardingTime && simTime < f.actualDeparture && f.status !== 'Cancelled') {
        status = 'Boarding';
      }
      return { ...f, status };
    });

    setFlights(updatedFlights);

    // Gate events active right now
    const activeGateEvents = gateEventsRaw.filter(e => 
      e.timestamp <= simTime && e.updateTime >= simTime
    );
    setGateEvents(activeGateEvents);

    // Baggage active right now
    const activeBaggage = baggageRaw.filter(b => 
      b.checkInTime <= simTime && b.updateTime >= simTime
    );
    setBaggage(activeBaggage);

    // Security active right now
    const activeSecurity = securityRaw.filter(s => 
      s.screeningTime <= simTime && s.queueExitTime >= simTime
    );
    setSecurity(activeSecurity);

    // Workforce shift assignments active right now
    const activeShifts = staffShiftsRaw.filter(s => 
      s.shiftStart <= simTime && s.shiftEnd >= simTime
    );
    setShifts(activeShifts);

    // Maintenance logged before now, and completed after now (or open)
    const activeMtc = maintenanceRaw.filter(m => 
      m.loggedTime <= simTime && (m.completedTime.getTime() === 0 || m.completedTime >= simTime)
    );
    setMaintenance(activeMtc);

  }, [simTime, flightsRaw, gateEventsRaw, baggageRaw, securityRaw, staffShiftsRaw, maintenanceRaw]);

  // Handle manual flight overrides
  const handleUpdateFlight = (flightId: string, updates: Partial<Flight>) => {
    setFlightsRaw(prev => prev.map(f => f.flightId === flightId ? { ...f, ...updates } : f));
  };

  // Handle resolving maintenance tasks
  const handleResolveMaintenance = (workOrderId: string, actionTaken: string) => {
    setMaintenanceRaw(prev => prev.map(m => 
      m.workOrderId === workOrderId 
        ? { ...m, completedTime: new Date(simTime), actionTaken } 
        : m
    ));
    // Trigger success alert
    handleTriggerAlert('maintenance', `Work Order ${workOrderId} completed and aircraft certified.`, 'low');
  };

  // Alert triggers
  const handleTriggerAlert = (
    category: Alert['category'],
    message: string,
    severity: Alert['severity']
  ) => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(simTime),
      severity,
      category,
      message,
      resolved: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const handleResetSimulation = () => {
    if (flightsRaw.length > 0) {
      const sorted = [...flightsRaw].sort((a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime());
      setSimTime(sorted[0].scheduledDeparture);
    }
    setAlerts([]);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      
      {/* Top operational header bar */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-wider uppercase text-slate-100 font-mono">DEL AOCC CONTROL DECK</h1>
            <p className="text-xxs text-slate-400 font-mono">INDIRA GANDHI INTERNATIONAL AIRPORT OPERATIONS CONTROL CENTER</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 border border-slate-800 bg-slate-950/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'flights' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plane className="w-3.5 h-3.5" /> Flights Board
          </button>
          <button
            onClick={() => setActiveTab('gates')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'gates' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Gates Activity
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'flow' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Security & Bags
          </button>
          <button
            onClick={() => setActiveTab('workforce')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'workforce' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Workforce & Mtc
          </button>
          <button
            onClick={() => setActiveTab('passengers')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'passengers' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Passengers
          </button>
          <button
            onClick={() => setActiveTab('retail')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'retail' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Retail & Revenue
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'map' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Terminal Radar
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'emergency' ? 'bg-rose-900/40 text-rose-400 font-bold border border-rose-500/30' : 'text-rose-400/70 hover:text-rose-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOP
          </button>
          <button
            onClick={() => setActiveTab('turnaround')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'turnaround' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Turnaround Gantt
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </button>
        </nav>

        {/* Global Search & Log Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
          >
            <Search className="w-3.5 h-3.5" /> Quick Search <kbd className="px-1.5 py-0.5 text-[9px] bg-slate-900 text-slate-400 rounded border border-slate-700">Ctrl+K</kbd>
          </button>
          <button
            onClick={() => exportIncidentLogsCSV(alerts, flights)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Export Incidents CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Logs CSV
          </button>
          <button
            onClick={() => exportFlightManifestJSON(flights, gateEvents)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
            title="Export Telemetry JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> JSON
          </button>
        </div>
      </header>

      {/* Simulation Master Controller Console */}
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/20">
        <SimulationControls
          simTime={simTime}
          isPlaying={isPlaying}
          speed={speed}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSetSpeed={setSpeed}
          onReset={handleResetSimulation}
          onTriggerAlert={handleTriggerAlert}
        />
      </div>

      {/* Main viewport area */}
      <main className="flex-1 p-6 overflow-hidden">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            flights={flights}
            gateEvents={gateEvents}
            baggage={baggage}
            security={security}
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'flights' && (
          <FlightMonitor
            flights={flights}
            onUpdateFlight={handleUpdateFlight}
          />
        )}
        {activeTab === 'gates' && (
          <GateActivityBoard
            flights={flights}
            gateEvents={gateEvents}
          />
        )}
        {activeTab === 'flow' && (
          <SecurityBaggageFlow
            security={security}
            baggage={baggage}
          />
        )}
        {activeTab === 'workforce' && (
          <WorkforceMaintenance
            maintenance={maintenance}
            shifts={shifts}
            onResolveMaintenance={handleResolveMaintenance}
          />
        )}
        {activeTab === 'passengers' && (
          <PassengerIntelligence
            passengers={passengersRaw}
            flights={flights}
            baggage={baggageRaw}
            security={securityRaw}
          />
        )}
        {activeTab === 'retail' && (
          <RetailAnalytics
            retail={retailRaw}
          />
        )}
        {activeTab === 'map' && (
          <AirportTerminalMap
            flights={flights}
            gateEvents={gateEvents}
          />
        )}
        {activeTab === 'emergency' && (
          <EmergencyDeck
            alerts={alerts}
            onTriggerAlert={handleTriggerAlert}
          />
        )}
        {activeTab === 'turnaround' && (
          <TurnaroundGantt
            flights={flights}
          />
        )}
        {activeTab === 'analytics' && (
          <AirportAnalyticsDeck
            flights={flights}
            passengers={passengersRaw}
            security={securityRaw}
            baggage={baggageRaw}
          />
        )}
      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        flights={flights}
        passengers={passengersRaw}
        baggage={baggageRaw}
        security={securityRaw}
        shifts={staffShiftsRaw}
        maintenance={maintenanceRaw}
        retail={retailRaw}
        onNavigateTab={setActiveTab}
      />

    </div>
  );
}

export default App;

