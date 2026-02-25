import type {
  TeamMember,
  Client,
  TimeEntry,
  RevenueEntry,
  ClientProfitabilityRow,
  TeamMemberUtilizationRow,
  DashboardFilters,
  BudgetEntry,
  ServiceProfitabilityRow,
} from "./types";

// ─── Static seed data (from Google Sheets) ───────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Michael Argento", role: "CFO", costRate: 70, status: "Active", capacityHoursPerMonth: 140, billingRate: 185, location: "Onshore" },
  { name: "Michelle Ratcliffe", role: "CFO", costRate: 72, status: "Active", capacityHoursPerMonth: 140, billingRate: 190, location: "Onshore" },
  { name: "Suzanna Neville", role: "Accounting Manager", costRate: 49, status: "Active", capacityHoursPerMonth: 140, billingRate: 125, location: "Onshore" },
  { name: "Tori Patriquin", role: "Accounting Manager", costRate: 39, status: "Active", capacityHoursPerMonth: 140, billingRate: 115, location: "Onshore" },
  { name: "Eloisa Ortega", role: "Bookkeeper", costRate: 18, status: "Active", capacityHoursPerMonth: 140, billingRate: 80, location: "Offshore" },
  { name: "Mikki Abragan", role: "Bookkeeper", costRate: 16, status: "Active", capacityHoursPerMonth: 140, billingRate: 80, location: "Offshore" },
  { name: "Jean Bodiongan", role: "Bookkeeper", costRate: 30, status: "Active", capacityHoursPerMonth: 140, billingRate: 85, location: "Offshore" },
  { name: "Temi Oluwatosin", role: "Bookkeeper", costRate: 36, status: "Inactive", capacityHoursPerMonth: 0, billingRate: 80, location: "Onshore" },
  { name: "Gabby Hergt", role: "Bookkeeper", costRate: 39, status: "Inactive", capacityHoursPerMonth: 0, billingRate: 80, location: "Onshore" },
  { name: "Jordy Guillon", role: "CFO", costRate: 46, status: "Inactive", capacityHoursPerMonth: 0, billingRate: 185, location: "Onshore" },
  { name: "Domenick Bartuccio", role: "CFO", costRate: 95, status: "Inactive", capacityHoursPerMonth: 0, billingRate: 185, location: "Onshore" },
  { name: "Rachel Brinac", role: "Accounting Manager", costRate: 49, status: "Inactive", capacityHoursPerMonth: 0, billingRate: 120, location: "Onshore" },
];

export const CLIENTS: Client[] = [
  { karbonName: "Intrigue Media Solutions Inc.", quickbooksName: "Intrigue Media Solutions Inc.", status: "Active" },
  { karbonName: "Protrack (12372169 Canada Inc)", quickbooksName: "12372169 Canada Inc. DBA Protrack Ltd.", status: "Active" },
  { karbonName: "9thCO Inc.", quickbooksName: "9thCO Inc.", status: "Active" },
  { karbonName: "Morweb CMS Inc.", quickbooksName: "Morweb CMS Inc.", status: "Active" },
  { karbonName: "Merging Workforce Inc.", quickbooksName: "Merging Workforce Inc.", status: "Active" },
  { karbonName: "Gotcha!", quickbooksName: "Gotcha!", status: "Active" },
  { karbonName: "Banch Marketing Ltd", quickbooksName: "Banch Marketing Ltd", status: "Active" },
  { karbonName: "MYDWARE IT Solutions Inc.", quickbooksName: "MYDWARE IT Solutions Inc.", status: "Active" },
  { karbonName: "Hyland Landscapes Ltd", quickbooksName: "Hyland Landscapes Ltd", status: "Active" },
  { karbonName: "Dealer Media", quickbooksName: "Dealer Media", status: "Active" },
  { karbonName: "1497202 Alberta Ltd (E-Patches & Crests)", quickbooksName: "1497202 Alberta Ltd (E-Patches & Crests)", status: "Active" },
  { karbonName: "Pixelbot Technology Inc.", quickbooksName: "Pixelbot Technology Inc.", status: "Active" },
  { karbonName: "Zen Ventures Inc.", quickbooksName: "Phil Kim", status: "Active" },
  { karbonName: "Sun Capital Corporate Construction (SCC Construction)", quickbooksName: "Phil Kim", status: "Active" },
  { karbonName: "0707892 BC Ltd Metropole Investments Limited Partnership", quickbooksName: "Phil Kim", status: "Active" },
  { karbonName: "Phil Kim", quickbooksName: "Phil Kim", status: "Active" },
  { karbonName: "Crowder Family Incorporated", quickbooksName: "Crowder Family Incorporated", status: "Active" },
  { karbonName: "Align Climate Solutions", quickbooksName: "Align Climate Solutions", status: "Active" },
  { karbonName: "Vandal Merch House Inc.", quickbooksName: "Vandal Merch House Inc.", status: "Active" },
  { karbonName: "Form Collective", quickbooksName: "Form Collective", status: "Active" },
  { karbonName: "Olive Technologies Inc", quickbooksName: "Olive Technologies Inc", status: "Active" },
  { karbonName: "The Canada Magazine", quickbooksName: "The Canada Magazine", status: "Active" },
  { karbonName: "Kykeon Analytics Ltd", quickbooksName: "Kykeon Analytics Ltd", status: "Active" },
  { karbonName: "West Coast Centre for Sex Therapy Ltd.", quickbooksName: "West Coast Centre for Sex Therapy Ltd.", status: "Active" },
  { karbonName: "Think Water Filtration Inc.", quickbooksName: "Think Water Filtration Inc.", status: "Active" },
  { karbonName: "Tommy Media Inc.", quickbooksName: "Tommy Media Inc.", status: "Active" },
  { karbonName: "1Up Digital Marketing", quickbooksName: "1Up Digital Marketing", status: "Active" },
  { karbonName: "42O Blaze Capital Corp.", quickbooksName: "Blaze Capital", status: "Active" },
  { karbonName: "Peter Zarkadas MD FRCSC Inc.", quickbooksName: "Peter Zarkadas MD FRCSC Inc.", status: "Active" },
  { karbonName: "JMB Ventures Inc.", quickbooksName: "JMB Ventures Inc.", status: "Active" },
  { karbonName: "Burnaby Grills", quickbooksName: "Burnaby Grills", status: "Active" },
  { karbonName: "Misim Modelling Inc", quickbooksName: "Misim Modelling Inc", status: "Active" },
  { karbonName: "Lyftlyfe Athletics Inc.", quickbooksName: "Lyftlyfe Athletics Inc.", status: "Active" },
  { karbonName: "Strength Connected Fitness Ltd.", quickbooksName: "Strength Connected Fitness Ltd.", status: "Active" },
  { karbonName: "1224746 B.C. Ltd. (Valley Vapes Inc.)", quickbooksName: "1224746 B.C. Ltd.", status: "Active" },
  { karbonName: "Bodypulse Fitness Studio Ltd.", quickbooksName: "BODYPULSE FITNESS STUDIO LTD", status: "Active" },
  { karbonName: "Cittabase Solutions Incorporated", quickbooksName: "Cittabase Solutions Incorporated", status: "Active" },
  { karbonName: "Bokuria Creative", quickbooksName: "Bokuria Creative", status: "Active" },
  { karbonName: "Hanson Land and Sea", quickbooksName: "Hanson Land and Sea", status: "Active" },
  { karbonName: "HL Networks Inc. (dba Davinci Technology Solutions)", quickbooksName: "DAVINCI TECHNOLOGY SOLUTIONS", status: "Active" },
  { karbonName: "TNB Plumbing Heating Air Conditioning Ltd.", quickbooksName: "TNB Plumbing Heating Air Conditioning Ltd.", status: "Active" },
  { karbonName: "Gibraltar Construction", quickbooksName: "Gibraltar Holdings Ltd.", status: "Active" },
  { karbonName: "B4 Networks Inc.", quickbooksName: "B4 Networks Inc.", status: "Active" },
  { karbonName: "BuildPilot Ltd.", quickbooksName: "BuildPilot Ltd.", status: "Active" },
  { karbonName: "Mash Strategy", quickbooksName: "Mash Strategy", status: "Active" },
];

export const TIME_ENTRIES: TimeEntry[] = [
  { clientName: "B4 Networks Inc.", teamMember: "Jean Bodiongan", hoursLogged: 1.02, date: "2025-07-30", serviceTag: "Bookkeeping" },
  { clientName: "Bodypulse Fitness Studio Ltd.", teamMember: "Michelle Ratcliffe", hoursLogged: 5.3, date: "2025-06-25", serviceTag: "CFO Advisory" },
  { clientName: "Pixelbot Technology Inc.", teamMember: "Mikki Abragan", hoursLogged: 9.11, date: "2025-07-30", serviceTag: "Bookkeeping" },
  { clientName: "0707892 BC Ltd Metropole Investments Limited Partnership", teamMember: "Suzanna Neville", hoursLogged: 2.36, date: "2025-06-15", serviceTag: "Controller / Accounting" },
  { clientName: "Think Water Filtration Inc.", teamMember: "Jean Bodiongan", hoursLogged: 8.08, date: "2025-06-18", serviceTag: "Bookkeeping" },
  { clientName: "TNB Plumbing Heating Air Conditioning Ltd.", teamMember: "Suzanna Neville", hoursLogged: 6.3, date: "2025-06-09", serviceTag: "Payroll" },
  { clientName: "Zen Ventures Inc.", teamMember: "Michelle Ratcliffe", hoursLogged: 2.77, date: "2025-08-02", serviceTag: "Financial Reporting" },
  { clientName: "Morweb CMS Inc.", teamMember: "Tori Patriquin", hoursLogged: 1.31, date: "2025-08-16", serviceTag: "Controller / Accounting" },
  { clientName: "Sun Capital Corporate Construction (SCC Construction)", teamMember: "Michael Argento", hoursLogged: 7.45, date: "2025-06-21", serviceTag: "CFO Advisory" },
  { clientName: "1224746 B.C. Ltd. (Valley Vapes Inc.)", teamMember: "Suzanna Neville", hoursLogged: 7.71, date: "2025-06-09", serviceTag: "Controller / Accounting" },
  { clientName: "Misim Modelling Inc", teamMember: "Michelle Ratcliffe", hoursLogged: 9.98, date: "2025-06-13", serviceTag: "CFO Advisory" },
  { clientName: "The Canada Magazine", teamMember: "Michael Argento", hoursLogged: 8.87, date: "2025-06-19", serviceTag: "CFO Advisory" },
  { clientName: "Phil Kim", teamMember: "Suzanna Neville", hoursLogged: 1.51, date: "2025-08-21", serviceTag: "Controller / Accounting" },
  { clientName: "Hanson Land and Sea", teamMember: "Michael Argento", hoursLogged: 3.65, date: "2025-07-27", serviceTag: "CFO Advisory" },
  { clientName: "Dealer Media", teamMember: "Michelle Ratcliffe", hoursLogged: 2.71, date: "2025-07-05", serviceTag: "Financial Reporting" },
  { clientName: "HL Networks Inc. (dba Davinci Technology Solutions)", teamMember: "Mikki Abragan", hoursLogged: 4.3, date: "2025-08-21", serviceTag: "Bookkeeping" },
  { clientName: "Merging Workforce Inc.", teamMember: "Mikki Abragan", hoursLogged: 14.74, date: "2025-07-09", serviceTag: "Bookkeeping" },
  { clientName: "Tommy Media Inc.", teamMember: "Jean Bodiongan", hoursLogged: 12.58, date: "2025-07-15", serviceTag: "Bookkeeping" },
  { clientName: "Cittabase Solutions Incorporated", teamMember: "Michelle Ratcliffe", hoursLogged: 12.38, date: "2025-07-10", serviceTag: "CFO Advisory" },
  { clientName: "Crowder Family Incorporated", teamMember: "Jean Bodiongan", hoursLogged: 9.41, date: "2025-07-08", serviceTag: "Bookkeeping" },
  { clientName: "Gibraltar Construction", teamMember: "Michael Argento", hoursLogged: 6.05, date: "2025-07-28", serviceTag: "CFO Advisory" },
  { clientName: "Bokuria Creative", teamMember: "Michael Argento", hoursLogged: 5.52, date: "2025-08-21", serviceTag: "CFO Advisory" },
  { clientName: "Align Climate Solutions", teamMember: "Michael Argento", hoursLogged: 1.29, date: "2025-08-11", serviceTag: "CFO Advisory" },
  { clientName: "Lyftlyfe Athletics Inc.", teamMember: "Jean Bodiongan", hoursLogged: 12.52, date: "2025-06-21", serviceTag: "Bookkeeping" },
  { clientName: "Strength Connected Fitness Ltd.", teamMember: "Tori Patriquin", hoursLogged: 4.62, date: "2025-08-10", serviceTag: "Payroll" },
  { clientName: "Olive Technologies Inc", teamMember: "Jean Bodiongan", hoursLogged: 12.03, date: "2025-06-26", serviceTag: "Bookkeeping" },
  { clientName: "Form Collective", teamMember: "Michelle Ratcliffe", hoursLogged: 1.99, date: "2025-07-29", serviceTag: "Financial Reporting" },
  { clientName: "Intrigue Media Solutions Inc.", teamMember: "Eloisa Ortega", hoursLogged: 8.46, date: "2025-06-02", serviceTag: "Bookkeeping" },
  { clientName: "Peter Zarkadas MD FRCSC Inc.", teamMember: "Domenick Bartuccio", hoursLogged: 1.37, date: "2025-08-31", serviceTag: "CFO Advisory" },
  { clientName: "Banch Marketing Ltd", teamMember: "Tori Patriquin", hoursLogged: 2.51, date: "2025-07-06", serviceTag: "Controller / Accounting" },
  { clientName: "Vandal Merch House Inc.", teamMember: "Michael Argento", hoursLogged: 11.22, date: "2025-07-04", serviceTag: "CFO Advisory" },
  { clientName: "1Up Digital Marketing", teamMember: "Michael Argento", hoursLogged: 1.3, date: "2025-06-06", serviceTag: "CFO Advisory" },
  { clientName: "Hyland Landscapes Ltd", teamMember: "Tori Patriquin", hoursLogged: 10.05, date: "2025-06-10", serviceTag: "Controller / Accounting" },
  { clientName: "9thCO Inc.", teamMember: "Domenick Bartuccio", hoursLogged: 6.21, date: "2025-06-27", serviceTag: "CFO Advisory" },
  { clientName: "42O Blaze Capital Corp.", teamMember: "Tori Patriquin", hoursLogged: 4.9, date: "2025-07-15", serviceTag: "Controller / Accounting" },
  { clientName: "Kykeon Analytics Ltd", teamMember: "Domenick Bartuccio", hoursLogged: 12.2, date: "2025-07-21", serviceTag: "CFO Advisory" },
  { clientName: "Burnaby Grills", teamMember: "Jean Bodiongan", hoursLogged: 3.54, date: "2025-06-14", serviceTag: "Bookkeeping" },
  { clientName: "West Coast Centre for Sex Therapy Ltd.", teamMember: "Mikki Abragan", hoursLogged: 3.88, date: "2025-07-12", serviceTag: "Bookkeeping" },
  { clientName: "BuildPilot Ltd.", teamMember: "Jean Bodiongan", hoursLogged: 12.67, date: "2025-07-18", serviceTag: "Bookkeeping" },
  { clientName: "MYDWARE IT Solutions Inc.", teamMember: "Domenick Bartuccio", hoursLogged: 1.6, date: "2025-06-01", serviceTag: "CFO Advisory" },
  { clientName: "JMB Ventures Inc.", teamMember: "Tori Patriquin", hoursLogged: 8.53, date: "2025-08-23", serviceTag: "Controller / Accounting" },
  { clientName: "Protrack (12372169 Canada Inc)", teamMember: "Domenick Bartuccio", hoursLogged: 12.8, date: "2025-07-07", serviceTag: "CFO Advisory" },
  { clientName: "Gotcha!", teamMember: "Tori Patriquin", hoursLogged: 1.28, date: "2025-08-20", serviceTag: "Controller / Accounting" },
  { clientName: "1497202 Alberta Ltd (E-Patches & Crests)", teamMember: "Suzanna Neville", hoursLogged: 14.78, date: "2025-06-28", serviceTag: "Payroll" },
];

export const BUDGET_ENTRIES: BudgetEntry[] = [
  { clientName: "Merging Workforce Inc.", budget: 8500 },
  { clientName: "Peter Zarkadas MD FRCSC Inc.", budget: 11000 },
  { clientName: "Pixelbot Technology Inc.", budget: 8000 },
  { clientName: "Burnaby Grills", budget: 9000 },
  { clientName: "West Coast Centre for Sex Therapy Ltd.", budget: 8500 },
  { clientName: "MYDWARE IT Solutions Inc.", budget: 6000 },
  { clientName: "9thCO Inc.", budget: 8500 },
  { clientName: "BuildPilot Ltd.", budget: 7000 },
  { clientName: "42O Blaze Capital Corp.", budget: 6500 },
  { clientName: "Lyftlyfe Athletics Inc.", budget: 7500 },
  { clientName: "HL Networks Inc. (dba Davinci Technology Solutions)", budget: 5500 },
  { clientName: "Bokuria Creative", budget: 7500 },
  { clientName: "Phil Kim", budget: 7500 },
  { clientName: "Intrigue Media Solutions Inc.", budget: 8000 },
  { clientName: "Vandal Merch House Inc.", budget: 5500 },
  { clientName: "1Up Digital Marketing", budget: 6000 },
  { clientName: "Think Water Filtration Inc.", budget: 7000 },
  { clientName: "Kykeon Analytics Ltd", budget: 2500 },
  { clientName: "Cittabase Solutions Incorporated", budget: 2000 },
  { clientName: "JMB Ventures Inc.", budget: 3000 },
  { clientName: "Misim Modelling Inc", budget: 5000 },
  { clientName: "Crowder Family Incorporated", budget: 5000 },
  { clientName: "Tommy Media Inc.", budget: 5500 },
  { clientName: "Strength Connected Fitness Ltd.", budget: 5500 },
  { clientName: "Gibraltar Construction", budget: 2500 },
  { clientName: "Hanson Land and Sea", budget: 1500 },
  { clientName: "Hyland Landscapes Ltd", budget: 2000 },
  { clientName: "Morweb CMS Inc.", budget: 3500 },
  { clientName: "The Canada Magazine", budget: 1200 },
  { clientName: "TNB Plumbing Heating Air Conditioning Ltd.", budget: 2500 },
  { clientName: "1497202 Alberta Ltd (E-Patches & Crests)", budget: 7000 },
  { clientName: "Dealer Media", budget: 2500 },
  { clientName: "B4 Networks Inc.", budget: 5500 },
  { clientName: "Form Collective", budget: 3500 },
  { clientName: "Olive Technologies Inc", budget: 4000 },
  { clientName: "Banch Marketing Ltd", budget: 5000 },
  { clientName: "Protrack (12372169 Canada Inc)", budget: 4500 },
  { clientName: "Gotcha!", budget: 5000 },
  { clientName: "Bodypulse Fitness Studio Ltd.", budget: 2500 },
  { clientName: "1224746 B.C. Ltd. (Valley Vapes Inc.)", budget: 2000 },
  { clientName: "Align Climate Solutions", budget: 5000 },
];

// Revenue client names from Sheets sometimes differ from client Karbon names.
// Build a lookup: QuickBooks name → Karbon name (use first match)
function buildQBtoKarbonMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of CLIENTS) {
    const qb = c.quickbooksName.trim().toLowerCase();
    if (!map.has(qb)) map.set(qb, c.karbonName);
  }
  return map;
}

const QB_TO_KARBON = buildQBtoKarbonMap();

export const REVENUE_ENTRIES_RAW: RevenueEntry[] = [
  { clientName: "Cittabase Solutions Incorporated", amount: 1899.94, date: "2025-08-01" },
  { clientName: "DAVINCI TECHNOLOGY SOLUTIONS", amount: 6403.9, date: "2025-07-21" },
  { clientName: "Bokuria Creative", amount: 6746.96, date: "2025-07-05" },
  { clientName: "Phil Kim", amount: 6794.31, date: "2025-06-29" },
  { clientName: "Think Water Filtration Inc.", amount: 6522.41, date: "2025-06-23" },
  { clientName: "Intrigue Media Solutions Inc.", amount: 9000.76, date: "2025-07-09" },
  { clientName: "Gotcha!", amount: 5477.85, date: "2025-08-14" },
  { clientName: "JMB Ventures Inc.", amount: 2954.57, date: "2025-08-22" },
  { clientName: "Align Climate Solutions", amount: 4792.7, date: "2025-08-17" },
  { clientName: "Banch Marketing Ltd", amount: 5136.95, date: "2025-07-19" },
  { clientName: "Burnaby Grills", amount: 8891.05, date: "2025-06-28" },
  { clientName: "Kykeon Analytics Ltd", amount: 2153.52, date: "2025-06-25" },
  { clientName: "1Up Digital Marketing", amount: 6798.29, date: "2025-06-03" },
  { clientName: "Crowder Family Incorporated", amount: 4399.74, date: "2025-06-06" },
  { clientName: "Peter Zarkadas MD FRCSC Inc.", amount: 9811.6, date: "2025-08-25" },
  { clientName: "The Canada Magazine", amount: 1067.42, date: "2025-06-24" },
  { clientName: "TNB Plumbing Heating Air Conditioning Ltd.", amount: 2191.82, date: "2025-06-30" },
  { clientName: "Misim Modelling Inc", amount: 5993.64, date: "2025-07-01" },
  { clientName: "Hanson Land and Sea", amount: 1237.36, date: "2025-08-07" },
  { clientName: "Pixelbot Technology Inc.", amount: 9101.97, date: "2025-06-28" },
  { clientName: "B4 Networks Inc.", amount: 6161.74, date: "2025-08-25" },
  { clientName: "Blaze Capital", amount: 7608.18, date: "2025-06-07" },
  { clientName: "Strength Connected Fitness Ltd.", amount: 5073.34, date: "2025-08-24" },
  { clientName: "Hyland Landscapes Ltd", amount: 1822.77, date: "2025-08-24" },
  { clientName: "Form Collective", amount: 2951.76, date: "2025-06-13" },
  { clientName: "Olive Technologies Inc", amount: 4403.01, date: "2025-06-02" },
  { clientName: "Vandal Merch House Inc.", amount: 4699.4, date: "2025-08-25" },
  { clientName: "Tommy Media Inc.", amount: 6123.96, date: "2025-06-20" },
  { clientName: "1497202 Alberta Ltd (E-Patches & Crests)", amount: 6688.96, date: "2025-07-25" },
  { clientName: "West Coast Centre for Sex Therapy Ltd.", amount: 7415.2, date: "2025-06-20" },
  { clientName: "MYDWARE IT Solutions Inc.", amount: 7080.99, date: "2025-06-20" },
  { clientName: "Morweb CMS Inc.", amount: 3069.89, date: "2025-06-18" },
  { clientName: "9thCO Inc.", amount: 7442.19, date: "2025-07-03" },
  { clientName: "Lyftlyfe Athletics Inc.", amount: 6757.12, date: "2025-08-19" },
  { clientName: "1224746 B.C. Ltd.", amount: 2502.55, date: "2025-08-26" },
  { clientName: "Gibraltar Holdings Ltd.", amount: 2143.95, date: "2025-06-11" },
  { clientName: "Merging Workforce Inc.", amount: 9993.03, date: "2025-06-15" },
  { clientName: "12372169 Canada Inc. DBA Protrack Ltd.", amount: 4983.49, date: "2025-08-20" },
  { clientName: "BODYPULSE FITNESS STUDIO LTD", amount: 2185.41, date: "2025-08-11" },
  { clientName: "Dealer Media", amount: 2103.99, date: "2025-06-15" },
  { clientName: "BuildPilot Ltd.", amount: 7350.93, date: "2025-07-26" },
];

// Normalise revenue entries so client names match TIME_ENTRIES / CLIENTS
export const REVENUE_ENTRIES: RevenueEntry[] = REVENUE_ENTRIES_RAW.map((r) => {
  const mapped = QB_TO_KARBON.get(r.clientName.trim().toLowerCase());
  return { ...r, clientName: mapped ?? r.clientName };
});

// ─── Calculation helpers ──────────────────────────────────────────────────────

function costRateFor(memberName: string): number {
  return TEAM_MEMBERS.find((m) => m.name === memberName)?.costRate ?? 0;
}

function billingRateFor(memberName: string): number {
  return TEAM_MEMBERS.find((m) => m.name === memberName)?.billingRate ?? 0;
}

function locationFor(memberName: string): "Onshore" | "Offshore" {
  return TEAM_MEMBERS.find((m) => m.name === memberName)?.location ?? "Onshore";
}

/** Filter entries by date range (inclusive, YYYY-MM-DD strings) */
function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function computeClientProfitability(
  filters: DashboardFilters,
  timeEntries: TimeEntry[] = TIME_ENTRIES,
  revenueEntries: RevenueEntry[] = REVENUE_ENTRIES
): ClientProfitabilityRow[] {
  const { dateFrom, dateTo, selectedClients, activeOnly } = filters;

  // Filter active clients
  const allowedClients = new Set(
    CLIENTS.filter((c) => !activeOnly || c.status === "Active").map((c) => c.karbonName)
  );

  // Aggregate revenue per client
  const revenueMap = new Map<string, number>();
  for (const r of revenueEntries) {
    if (!inRange(r.date, dateFrom, dateTo)) continue;
    if (!allowedClients.has(r.clientName)) continue;
    revenueMap.set(r.clientName, (revenueMap.get(r.clientName) ?? 0) + r.amount);
  }

  // Aggregate hours, costs, wip, onshore/offshore per client
  const hoursMap = new Map<string, number>();
  const costsMap = new Map<string, number>();
  const wipMap = new Map<string, number>();
  const onshoreHoursMap = new Map<string, number>();
  const offshoreHoursMap = new Map<string, number>();

  for (const t of timeEntries) {
    if (!inRange(t.date, dateFrom, dateTo)) continue;
    if (!allowedClients.has(t.clientName)) continue;
    const hours = t.hoursLogged;
    const cost = hours * costRateFor(t.teamMember);
    const wip = hours * billingRateFor(t.teamMember);
    const loc = locationFor(t.teamMember);
    hoursMap.set(t.clientName, (hoursMap.get(t.clientName) ?? 0) + hours);
    costsMap.set(t.clientName, (costsMap.get(t.clientName) ?? 0) + cost);
    wipMap.set(t.clientName, (wipMap.get(t.clientName) ?? 0) + wip);
    if (loc === "Onshore") {
      onshoreHoursMap.set(t.clientName, (onshoreHoursMap.get(t.clientName) ?? 0) + hours);
    } else {
      offshoreHoursMap.set(t.clientName, (offshoreHoursMap.get(t.clientName) ?? 0) + hours);
    }
  }

  // Build budget lookup
  const budgetMap = new Map<string, number>();
  for (const b of BUDGET_ENTRIES) {
    budgetMap.set(b.clientName, b.budget);
  }

  // Union of all clients with any data
  const clientSet = new Set([...revenueMap.keys(), ...hoursMap.keys()]);

  const rows: ClientProfitabilityRow[] = [];
  for (const clientName of clientSet) {
    if (selectedClients.length > 0 && !selectedClients.includes(clientName)) continue;
    const revenue = revenueMap.get(clientName) ?? 0;
    const hours = hoursMap.get(clientName) ?? 0;
    const costs = costsMap.get(clientName) ?? 0;
    const wip = wipMap.get(clientName) ?? 0;
    const onshoreHours = onshoreHoursMap.get(clientName) ?? 0;
    const offshoreHours = offshoreHoursMap.get(clientName) ?? 0;
    const grossProfit = revenue - costs;
    const grossMargin = revenue > 0 ? grossProfit / revenue : 0;
    const effectiveHourlyRate = hours > 0 ? revenue / hours : 0;
    const realizationRate = wip > 0 ? revenue / wip : 0;
    const budget = budgetMap.get(clientName);
    const budgetVariance = budget !== undefined ? revenue - budget : undefined;

    rows.push({
      clientName,
      revenue,
      hours,
      costs,
      grossProfit,
      grossMargin,
      effectiveHourlyRate,
      wip,
      realizationRate,
      budget,
      budgetVariance,
      onshoreHours,
      offshoreHours,
    });
  }

  return rows.sort((a, b) => b.revenue - a.revenue);
}

export function computeServiceProfitability(
  filters: DashboardFilters,
  timeEntries: TimeEntry[] = TIME_ENTRIES,
  revenueEntries: RevenueEntry[] = REVENUE_ENTRIES
): ServiceProfitabilityRow[] {
  const { dateFrom, dateTo, activeOnly } = filters;

  const allowedClients = new Set(
    CLIENTS.filter((c) => !activeOnly || c.status === "Active").map((c) => c.karbonName)
  );

  // Filter time entries in range
  const filteredTime = timeEntries.filter(
    (t) => inRange(t.date, dateFrom, dateTo) && allowedClients.has(t.clientName)
  );

  // Total hours per client (for revenue weighting)
  const totalClientHoursMap = new Map<string, number>();
  for (const t of filteredTime) {
    totalClientHoursMap.set(t.clientName, (totalClientHoursMap.get(t.clientName) ?? 0) + t.hoursLogged);
  }

  // Revenue per client in range
  const clientRevenueMap = new Map<string, number>();
  for (const r of revenueEntries) {
    if (!inRange(r.date, dateFrom, dateTo)) continue;
    if (!allowedClients.has(r.clientName)) continue;
    clientRevenueMap.set(r.clientName, (clientRevenueMap.get(r.clientName) ?? 0) + r.amount);
  }

  // Group by service tag
  const serviceMap = new Map<string, {
    hours: number;
    costs: number;
    wip: number;
    revenueShare: number;
    clients: Set<string>;
  }>();

  for (const t of filteredTime) {
    const tag = t.serviceTag || "Uncategorized";
    if (!serviceMap.has(tag)) {
      serviceMap.set(tag, { hours: 0, costs: 0, wip: 0, revenueShare: 0, clients: new Set() });
    }
    const svc = serviceMap.get(tag)!;
    const hours = t.hoursLogged;
    const cost = hours * costRateFor(t.teamMember);
    const wip = hours * billingRateFor(t.teamMember);
    const totalClientHours = totalClientHoursMap.get(t.clientName) ?? 0;
    const clientRevenue = clientRevenueMap.get(t.clientName) ?? 0;
    const revenueShare = totalClientHours > 0 ? (hours / totalClientHours) * clientRevenue : 0;

    svc.hours += hours;
    svc.costs += cost;
    svc.wip += wip;
    svc.revenueShare += revenueShare;
    svc.clients.add(t.clientName);
  }

  const rows: ServiceProfitabilityRow[] = [];
  for (const [serviceName, data] of serviceMap.entries()) {
    const revenue = data.revenueShare;
    const grossProfit = revenue - data.costs;
    const grossMargin = revenue > 0 ? grossProfit / revenue : 0;
    const effectiveHourlyRate = data.hours > 0 ? revenue / data.hours : 0;
    rows.push({
      serviceName,
      revenue,
      hours: data.hours,
      costs: data.costs,
      grossProfit,
      grossMargin,
      effectiveHourlyRate,
      wip: data.wip,
      clientCount: data.clients.size,
    });
  }

  return rows.sort((a, b) => b.revenue - a.revenue);
}

export function computeTeamUtilization(
  filters: DashboardFilters,
  timeEntries: TimeEntry[] = TIME_ENTRIES,
  revenueEntries: RevenueEntry[] = REVENUE_ENTRIES
): TeamMemberUtilizationRow[] {
  const { dateFrom, dateTo } = filters;

  // Number of months in range (approximate, for capacity)
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const months = Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1);

  // Aggregate hours per team member
  const clientHoursMap = new Map<string, number>();
  for (const t of timeEntries) {
    if (!inRange(t.date, dateFrom, dateTo)) continue;
    clientHoursMap.set(t.teamMember, (clientHoursMap.get(t.teamMember) ?? 0) + t.hoursLogged);
  }

  const rows: TeamMemberUtilizationRow[] = [];
  for (const m of TEAM_MEMBERS) {
    if (m.status === "Inactive") continue;

    const clientHours = clientHoursMap.get(m.name) ?? 0;
    const internalHours = 0; // no internal time entries in current dataset
    const totalHours = clientHours + internalHours;
    const capacityHours = (m.capacityHoursPerMonth ?? 140) * months;
    const utilizationPct = capacityHours > 0 ? clientHours / capacityHours : 0;

    // Attributed revenue: sum of revenue for clients this member worked on, weighted by their share of hours
    let attributedRevenue = 0;
    const memberEntries = timeEntries.filter(
      (t) => t.teamMember === m.name && inRange(t.date, dateFrom, dateTo)
    );
    for (const entry of memberEntries) {
      // Find total hours on this client in period
      const totalClientHours = timeEntries
        .filter((t) => t.clientName === entry.clientName && inRange(t.date, dateFrom, dateTo))
        .reduce((s, t) => s + t.hoursLogged, 0);
      const clientRevenue = revenueEntries
        .filter((r) => r.clientName === entry.clientName && inRange(r.date, dateFrom, dateTo))
        .reduce((s, r) => s + r.amount, 0);
      if (totalClientHours > 0) {
        attributedRevenue += (entry.hoursLogged / totalClientHours) * clientRevenue;
      }
    }

    const avgHourlyRate = clientHours > 0 ? attributedRevenue / clientHours : 0;

    rows.push({
      memberName: m.name,
      role: m.role,
      clientHours,
      internalHours,
      totalHours,
      capacityHours,
      utilizationPct,
      attributedRevenue,
      avgHourlyRate,
    });
  }

  return rows.sort((a, b) => b.utilizationPct - a.utilizationPct);
}

/** Re-key CSV rows from original headers to canonical field names using a mapping */
export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: Record<string, string>, // canonical field → CSV header
  _type: "time" | "revenue"
): Record<string, string>[] {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const [canonical, csvCol] of Object.entries(mapping)) {
      if (csvCol && csvCol !== "__none__") out[canonical] = row[csvCol] ?? "";
    }
    return out;
  });
}

/** Parse CSV rows into TimeEntry or RevenueEntry arrays */
export function parseTimeEntriesCSV(rows: Record<string, string>[]): TimeEntry[] {
  return rows.map((r) => ({
    clientName: r["clientName"] ?? r["Client Name"] ?? r["client_name"] ?? "",
    teamMember: r["teamMember"] ?? r["Team Member"] ?? r["team_member"] ?? "",
    hoursLogged: parseFloat(r["hours"] ?? r["Time Tracked (hrs)"] ?? r["hrs"] ?? "0") || 0,
    date: r["date"] ?? r["Date"] ?? "",
    serviceTag: r["serviceTag"] ?? r["Service"] ?? r["service_tag"] ?? "Uncategorized",
  }));
}

export function parseRevenueCSV(rows: Record<string, string>[]): RevenueEntry[] {
  return rows.map((r) => ({
    clientName: r["clientName"] ?? r["Client Name"] ?? r["client_name"] ?? "",
    amount: parseFloat(r["amount"] ?? r["Amount"] ?? "0") || 0,
    date: r["date"] ?? r["month"] ?? r["Date"] ?? "",
  }));
}
