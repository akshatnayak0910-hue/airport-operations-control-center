import { Flight, Alert, GateEvent } from '../types';

export const exportIncidentLogsCSV = (alerts: Alert[], flights: Flight[]) => {
  const headers = ['Alert ID', 'Timestamp', 'Category', 'Severity', 'Message', 'Status'];
  const rows = alerts.map(a => [
    a.id,
    a.timestamp.toISOString(),
    a.category,
    a.severity,
    `"${a.message.replace(/"/g, '""')}"`,
    a.resolved ? 'RESOLVED' : 'ACTIVE'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `AOCC_Incident_Logs_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
};

export const exportFlightManifestJSON = (flights: Flight[], gateEvents: GateEvent[]) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalFlights: flights.length,
    flights: flights.map(f => ({
      flightId: f.flightId,
      airline: f.airline,
      route: `${f.origin}-${f.destination}`,
      scheduledDeparture: f.scheduledDeparture.toISOString(),
      actualDeparture: f.actualDeparture.toISOString(),
      gate: f.gate,
      status: f.status,
      delayMinutes: f.delayMinutes,
      loadFactor: f.loadFactor
    })),
    activeGateEvents: gateEvents.map(g => ({
      eventId: g.eventId,
      gate: g.gate,
      flightId: g.flightId,
      assignedStaff: g.assignedStaff,
      isConflict: g.isConflict
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `AOCC_Operational_Telemetry_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

