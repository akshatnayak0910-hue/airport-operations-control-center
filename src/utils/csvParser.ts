import { Flight, GateEvent, Passenger, Baggage, SecurityScreening, StaffShift, RetailTransaction, MaintenanceLog } from '../types';

// Helper to parse dates safely
const parseDate = (val: string): Date => {
  if (!val || val === 'nan' || val === 'None' || val === '') return new Date(0);
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

// Helper to split CSV row respecting potential double quotes (standard CSV tokenization)
const splitCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const parseFlightsCsv = (csvText: string): Flight[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  // Skip the header (which is index row 0,1,2,...)
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    const cols = splitCsvLine(line);
    return {
      flightId: cols[0] || '',
      airline: cols[1] || '',
      airlineCode: cols[2] || '',
      origin: cols[3] || '',
      destination: cols[4] || '',
      scheduledDeparture: parseDate(cols[5]),
      actualDeparture: parseDate(cols[6]),
      scheduledArrival: parseDate(cols[7]),
      actualArrival: parseDate(cols[8]),
      aircraftType: cols[9] || '',
      tailNumber: cols[10] || '',
      capacity: parseInt(cols[11]) || 150,
      bookedPassengers: parseInt(cols[12]) || 120,
      status: (cols[13] || 'On-Time') as Flight['status'],
      delayMinutes: parseInt(cols[14]) || 0,
      delayReason: cols[15] || 'None',
      terminal: cols[16] || 'T3',
      gate: cols[17] || 'B1',
      isInternational: cols[18] === 'True',
      fuelUploaded: parseFloat(cols[19]) || 0,
      cargoWeight: parseFloat(cols[20]) || 0,
      boardingTime: parseDate(cols[21]),
      isDelayed: cols[22] === 'True',
      delaySeverity: (cols[23] || 'On-Time') as Flight['delaySeverity'],
      loadFactor: parseFloat(cols[24]) || 0,
      turnaroundTime: parseInt(cols[25]) || 60,
      weatherRisk: parseFloat(cols[26]) || 0,
      timeOfDay: cols[27] || '',
      dayOfWeek: cols[28] || '',
      isHoliday: cols[29] === 'True',
      season: cols[30] || '',
      flightType: cols[31] || ''
    };
  });
};

export const parseGateEventsCsv = (csvText: string): GateEvent[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      eventId: cols[0] || '',
      flightId: cols[1] || '',
      gate: cols[2] || '',
      terminal: cols[3] || '',
      eventType: cols[4] || '',
      timestamp: parseDate(cols[5]),
      assignedStaff: cols[6] || '',
      duration: parseInt(cols[7]) || 0,
      status: cols[8] || '',
      isConflict: cols[9] === 'True',
      notes: cols[10] || '',
      updateTime: parseDate(cols[11]),
      eventStart: parseDate(cols[12]),
      eventEnd: parseDate(cols[13])
    };
  });
};

export const parsePassengersCsv = (csvText: string): Passenger[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      pnrCode: cols[0] || '',
      ticketNumber: cols[1] || '',
      passportNumber: cols[2] || '',
      firstName: cols[3] || '',
      lastName: cols[4] || '',
      nationality: cols[5] || '',
      dob: parseDate(cols[6]),
      gender: cols[7] || '',
      seatNumber: cols[8] || '',
      cabinClass: cols[9] || '',
      flightId: cols[10] || '',
      checkInTime: parseDate(cols[11]),
      securityClearedTime: parseDate(cols[12]),
      gate: cols[13] || '',
      baggageWeight: parseFloat(cols[14]) || 0,
      email: cols[18] || '',
      phone: cols[19] || '',
      travelClass: cols[25] || 'Economy',
      age: parseInt(cols[26]) || 30,
      ageGroup: cols[27] || 'Adult'
    };
  });
};

export const parseBaggageCsv = (csvText: string): Baggage[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      tagId: cols[0] || '',
      pnrCode: cols[1] || '',
      flightId: cols[2] || '',
      passportNumber: cols[3] || '',
      weight: parseFloat(cols[4]) || 0,
      dimensions: cols[5] || '',
      securityStatus: cols[6] || '',
      beltLocation: cols[7] || '',
      checkInTime: parseDate(cols[8]),
      loadedTime: parseDate(cols[9]),
      bagCount: parseInt(cols[10]) || 1,
      status: (cols[11] || 'Check-in') as Baggage['status'],
      specialHandling: cols[12] === 'True',
      delayCode: cols[13] || '',
      handlingAgent: cols[14] || '',
      updateTime: parseDate(cols[15]),
      isOffloaded: cols[16] === 'True'
    };
  });
};

export const parseSecurityScreeningCsv = (csvText: string): SecurityScreening[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      screeningId: cols[0] || '',
      passportNumber: cols[1] || '',
      pnrCode: cols[2] || '',
      checkpointNumber: parseInt(cols[3]) || 1,
      screeningTime: parseDate(cols[4]),
      queueEntryTime: parseDate(cols[5]),
      queueExitTime: parseDate(cols[6]),
      status: (cols[7] || 'Clear') as SecurityScreening['status'],
      flagReason: cols[8] || '',
      secondaryRequired: cols[9] === 'True',
      agentId: cols[10] || '',
      machineId: cols[11] || '',
      processingTimeSeconds: parseInt(cols[12]) || 60,
      alarmTriggered: cols[13] === 'True',
      patDownDone: cols[14] === 'True',
      shiftId: cols[15] || ''
    };
  });
};

export const parseStaffShiftsCsv = (csvText: string): StaffShift[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      staffId: cols[0] || '',
      staffName: cols[1] || '',
      department: cols[2] || '',
      role: cols[3] || '',
      date: cols[4] || '',
      shiftStart: parseDate(cols[5]),
      shiftEnd: parseDate(cols[6]),
      terminal: cols[7] || '',
      gate: cols[8] || '',
      shiftCode: cols[9] || '',
      durationHours: parseFloat(cols[10]) || 8,
      isOvertime: cols[11] === 'True',
      backupStaff: cols[12] || '',
      hireDate: cols[13] || '',
      languages: cols[14] || ''
    };
  });
};

export const parseRetailTransactionsCsv = (csvText: string): RetailTransaction[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      transactionId: cols[0] || '',
      outletId: cols[1] || '',
      outletName: cols[2] || '',
      category: cols[3] || '',
      passportNumber: cols[4] || '',
      flightId: cols[5] || '',
      transactionTime: parseDate(cols[6]),
      itemName: cols[7] || '',
      quantity: parseInt(cols[8]) || 1,
      amount: parseFloat(cols[9]) || 0,
      storeId: cols[10] || '',
      paymentMode: cols[11] || 'Cash',
      currency: cols[12] || 'INR',
      terminal: cols[14] || '',
      locationDesc: cols[15] || '',
      taxInvoiceGenerated: cols[16] === 'True'
    };
  });
};

export const parseMaintenanceLogsCsv = (csvText: string): MaintenanceLog[] => {
  const lines = csvText.split('\n').filter(l => l.trim());
  return lines.slice(1).map(line => {
    const cols = splitCsvLine(line);
    return {
      workOrderId: cols[0] || '',
      aircraftRegistration: cols[1] || '',
      flightId: cols[2] || '',
      maintenanceType: cols[3] || '',
      engineerId: cols[4] || '',
      loggedTime: parseDate(cols[5]),
      completedTime: parseDate(cols[6]),
      downtimeHours: parseFloat(cols[7]) || 0,
      costIndex: parseFloat(cols[8]) || 0,
      defectReported: cols[9] || '',
      actionTaken: cols[10] || '',
      severityLevel: parseInt(cols[11]) || 3,
      technicianName: cols[12] || '',
      isDeferred: cols[13] === 'True',
      partsReplaced: cols[14] === 'True'
    };
  });
};
