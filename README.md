# ?? DEL AOCC — Airport Operations Control Center

> **Frontend Wars 2026 — Grand Finale Submission**
> *Airport Operations Control Center | Critical Systems & Real-Time Operations*

A production-quality, real-time Airport Operations Control Center built entirely on the frontend for **Indira Gandhi International Airport (DEL)**. Transforms the provided multi-table airport dataset into a unified, interactive operational interface simulating a live control room environment.

---

## ??? Technology Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Icons | Lucide React |
| Data | Static CSV files parsed via custom browser parser |
| Fonts | Inter + JetBrains Mono (Google Fonts) |

**No backend. No external database. No pre-built templates. 100% original work.**

---

## ?? Setup & Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/airport-control-center.git
cd airport-control-center
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

```bash
npm run build
```

---

## ?? Dataset Integration (8 / 8)

| Dataset | Integration |
|---------|-------------|
| flights.csv | Live flight board, real-time status sync, delay analysis, operational overrides |
| gate_events.csv | 24-gate visual terminal map, conflict detection, staff assignments |
| passengers.csv | Searchable manifest, cabin class breakdown, nationality heatmap, security cross-links |
| baggage.csv | Carousel belt monitoring, sortation status, delayed bag alerts |
| security_screening.csv | Checkpoint queue metrics, flagged passenger log |
| staff_shifts.csv | Active workforce roster filtered by simulation time, overtime badges |
| maintenance_logs.csv | Engineering defect queue, severity alerts, resolve controls |
| retail_transactions.csv | Revenue KPIs, outlet leaderboard, payment mode breakdown, live txn feed |

---

## ??? 9 Operational Modules

- **Dashboard**: KPI cards, live alert log, flight status mix bar, airline delay bar chart
- **Flights Board**: search, filter, column sorting, detail drawer, AOCC override panel
- **Gates Activity**: 24-gate visual grid, conflict detection, upcoming 2h departure forecast strip
- **Security & Bags**: checkpoint queues, carousel belt monitors
- **Workforce & Mtc**: defect queue with resolve, critical filter, active staff roster with OT badges
- **Passenger Intelligence**: manifest table, cabin distribution, nationality heatmap, profile drawer
- **Retail & Revenue**: revenue KPIs, category bar chart, outlet leaderboard, payment mode split
- **Terminal Radar Map**: interactive SVG airside blueprint, runway vectors, gate telemetry
- **Emergency SOP**: Code Blue / Red / Amber / Hazmat emergency protocol execution with audit trail

---

## ?? Complete Project Structure

```
airport-control-center/
+-- public/
¦   +-- dataset/                   ? All 8 CSV files (primary data source)
¦       +-- flights.csv
¦       +-- gate_events.csv
¦       +-- passengers.csv
¦       +-- baggage.csv
¦       +-- security_screening.csv
¦       +-- staff_shifts.csv
¦       +-- maintenance_logs.csv
¦       +-- retail_transactions.csv
+-- src/
¦   +-- types.ts                   ? Data interfaces
¦   +-- App.tsx                    ? Main router & simulation engine (9 tabs)
¦   +-- App.css
¦   +-- index.css
¦   +-- main.tsx
¦   +-- utils/
¦   ¦   +-- csvParser.ts           ? Custom browser CSV parser
¦   ¦   +-- logExporter.ts         ? Browser CSV/JSON export
¦   +-- components/
¦       +-- SimulationControls.tsx ? Master time controller
¦       +-- DashboardOverview.tsx   ? KPI + alert log + CSS bar charts
¦       +-- FlightMonitor.tsx        ? Flight board + column sorting + overrides
¦       +-- GateActivityBoard.tsx    ? Gate grid + upcoming forecast strip
¦       +-- SecurityBaggageFlow.tsx  ? Security & carousel belt monitoring
¦       +-- WorkforceMaintenance.tsx ? Defect queue + OT badges + dept summary
¦       +-- PassengerIntelligence.tsx ? Manifest + cabin/nationality charts
¦       +-- RetailAnalytics.tsx     ? Revenue KPIs + category/outlet breakdown
¦       +-- AirportTerminalMap.tsx  ? SVG Terminal 3 airside blueprint
¦       +-- EmergencyDeck.tsx       ? Emergency SOP crisis response deck
+-- index.html
+-- vite.config.ts
+-- tsconfig.json
+-- tsconfig.app.json
+-- tsconfig.node.json
+-- package.json
+-- README.md
```

---

*Built for Frontend Wars 2026 Grand Finale — Airport Operations Control Center challenge.*
