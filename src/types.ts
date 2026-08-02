export interface Flight {
  flightId: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  scheduledDeparture: Date;
  actualDeparture: Date;
  scheduledArrival: Date;
  actualArrival: Date;
  aircraftType: string;
  tailNumber: string;
  capacity: number;
  bookedPassengers: number;
  status: 'Departed' | 'On-Time' | 'Delayed' | 'Cancelled' | 'Boarding';
  delayMinutes: number;
  delayReason: string;
  terminal: string;
  gate: string;
  isInternational: boolean;
  fuelUploaded: number;
  cargoWeight: number;
  boardingTime: Date;
  isDelayed: boolean;
  delaySeverity: 'On-Time' | 'Moderate' | 'Severe';
  loadFactor: number;
  turnaroundTime: number;
  weatherRisk: number;
  timeOfDay: string;
  dayOfWeek: string;
  isHoliday: boolean;
  season: string;
  flightType: string;
}

export interface GateEvent {
  eventId: string;
  flightId: string;
  gate: string;
  terminal: string;
  eventType: string;
  timestamp: Date;
  assignedStaff: string;
  duration: number;
  status: string;
  isConflict: boolean;
  notes: string;
  updateTime: Date;
  eventStart: Date;
  eventEnd: Date;
}

export interface Passenger {
  pnrCode: string;
  ticketNumber: string;
  passportNumber: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: Date;
  gender: string;
  seatNumber: string;
  cabinClass: string;
  flightId: string;
  checkInTime: Date;
  securityClearedTime: Date;
  gate: string;
  baggageWeight: number;
  email: string;
  phone: string;
  travelClass: string;
  age: number;
  ageGroup: string;
}

export interface Baggage {
  tagId: string;
  pnrCode: string;
  flightId: string;
  passportNumber: string;
  weight: number;
  dimensions: string;
  securityStatus: string;
  beltLocation: string;
  checkInTime: Date;
  loadedTime: Date;
  bagCount: number;
  status: 'Check-in' | 'Loaded' | 'In-Transit' | 'Claimed' | 'Delayed' | 'Offloaded';
  specialHandling: boolean;
  delayCode: string;
  handlingAgent: string;
  updateTime: Date;
  isOffloaded: boolean;
}

export interface SecurityScreening {
  screeningId: string;
  passportNumber: string;
  pnrCode: string;
  checkpointNumber: number;
  screeningTime: Date;
  queueEntryTime: Date;
  queueExitTime: Date;
  status: 'Clear' | 'Flagged';
  flagReason: string;
  secondaryRequired: boolean;
  agentId: string;
  machineId: string;
  processingTimeSeconds: number;
  alarmTriggered: boolean;
  patDownDone: boolean;
  shiftId: string;
}

export interface StaffShift {
  staffId: string;
  staffName: string;
  department: string;
  role: string;
  date: string;
  shiftStart: Date;
  shiftEnd: Date;
  terminal: string;
  gate: string;
  shiftCode: string;
  durationHours: number;
  isOvertime: boolean;
  backupStaff: string;
  hireDate: string;
  languages: string;
}

export interface RetailTransaction {
  transactionId: string;
  outletId: string;
  outletName: string;
  category: string;
  passportNumber: string;
  flightId: string;
  transactionTime: Date;
  itemName: string;
  quantity: number;
  amount: number;
  storeId: string;
  paymentMode: string;
  currency: string;
  terminal: string;
  locationDesc: string;
  taxInvoiceGenerated: boolean;
}

export interface MaintenanceLog {
  workOrderId: string;
  aircraftRegistration: string;
  flightId: string;
  maintenanceType: string;
  engineerId: string;
  loggedTime: Date;
  completedTime: Date;
  downtimeHours: number;
  costIndex: number;
  defectReported: string;
  actionTaken: string;
  severityLevel: number;
  technicianName: string;
  isDeferred: boolean;
  partsReplaced: boolean;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'flight' | 'security' | 'baggage' | 'gate' | 'maintenance' | 'workforce';
  message: string;
  resolved: boolean;
  targetId?: string;
}
