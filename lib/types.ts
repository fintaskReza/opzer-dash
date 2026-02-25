export interface TeamMember {
  name: string;
  role: string;
  costRate: number;
  status: "Active" | "Inactive";
  capacityHoursPerMonth?: number;
  billingRate?: number;
  location?: "Onshore" | "Offshore";
}

export interface Client {
  karbonName: string;
  quickbooksName: string;
  status: "Active" | "Inactive";
}

export interface TimeEntry {
  clientName: string;
  teamMember: string;
  hoursLogged: number;
  date: string;
  serviceTag: string;
  billable?: boolean;
}

export interface RevenueEntry {
  clientName: string;
  amount: number;
  date: string;
}

export interface BudgetEntry {
  clientName: string;
  budget: number;
}

export interface ClientProfitabilityRow {
  clientName: string;
  revenue: number;
  hours: number;
  costs: number;
  grossProfit: number;
  grossMargin: number;
  effectiveHourlyRate: number;
  wip?: number;
  realizationRate?: number;
  budget?: number;
  budgetVariance?: number;
  onshoreHours?: number;
  offshoreHours?: number;
}

export interface ServiceProfitabilityRow {
  serviceName: string;
  revenue: number;
  hours: number;
  costs: number;
  grossProfit: number;
  grossMargin: number;
  effectiveHourlyRate: number;
  wip: number;
  clientCount: number;
}

export interface RoleBreakdown {
  role: string;
  hours: number;
  cost: number;
}

export interface TeamMemberUtilizationRow {
  memberName: string;
  role: string;
  clientHours: number;
  internalHours: number;
  totalHours: number;
  capacityHours: number;
  utilizationPct: number;
  attributedRevenue: number;
  avgHourlyRate: number;
}

export type MetricKey =
  | "revenue"
  | "hours"
  | "costs"
  | "grossProfit"
  | "grossMargin"
  | "effectiveHourlyRate"
  | "wip"
  | "realizationRate"
  | "budget"
  | "budgetVariance"
  | "onshoreHours"
  | "offshoreHours";

export type UtilizationMetricKey =
  | "clientHours"
  | "internalHours"
  | "totalHours"
  | "capacityHours"
  | "utilizationPct"
  | "attributedRevenue"
  | "avgHourlyRate";

export type DataSourceType = "sheets" | "csv" | "quickbooks" | "xero" | "none";

export interface DataSource {
  type: DataSourceType;
  label: string;
  connected: boolean;
  lastSync?: string;
}

export interface DashboardFilters {
  dateFrom: string;
  dateTo: string;
  selectedClients: string[];
  activeOnly: boolean;
}

export interface OrgUser {
  id: number;
  orgId: number;
  email: string;
  name: string;
  role: "admin" | "member";
  createdAt: string;
}
