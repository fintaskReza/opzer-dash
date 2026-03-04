import { describe, it, expect } from "vitest";
import {
  computeClientProfitability,
  computeTeamUtilization,
  computeServiceProfitability,
  TIME_ENTRIES,
  REVENUE_ENTRIES,
} from "@/lib/data";
import type { DashboardFilters } from "@/lib/types";

const FILTERS: DashboardFilters = {
  dateFrom: "2025-06-01",
  dateTo: "2025-08-31",
  selectedClients: [],
  activeOnly: true,
};

describe("computeClientProfitability", () => {
  it("returns an array sorted by revenue descending", () => {
    const rows = computeClientProfitability(FILTERS);
    expect(Array.isArray(rows)).toBe(true);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].revenue).toBeGreaterThanOrEqual(rows[i].revenue);
    }
  });

  it("calculates grossProfit = revenue - costs", () => {
    const rows = computeClientProfitability(FILTERS);
    for (const r of rows) {
      expect(r.grossProfit).toBeCloseTo(r.revenue - r.costs, 5);
    }
  });

  it("calculates grossMargin = grossProfit / revenue", () => {
    const rows = computeClientProfitability(FILTERS);
    for (const r of rows) {
      if (r.revenue > 0) {
        expect(r.grossMargin).toBeCloseTo(r.grossProfit / r.revenue, 5);
      }
    }
  });

  it("calculates EHR = revenue / hours", () => {
    const rows = computeClientProfitability(FILTERS);
    for (const r of rows) {
      if (r.hours > 0) {
        expect(r.effectiveHourlyRate).toBeCloseTo(r.revenue / r.hours, 5);
      }
    }
  });

  it("filters by selectedClients", () => {
    const rows = computeClientProfitability({
      ...FILTERS,
      selectedClients: ["Merging Workforce Inc."],
    });
    expect(rows.length).toBe(1);
    expect(rows[0].clientName).toBe("Merging Workforce Inc.");
  });

  it("accepts custom time and revenue entries", () => {
    // Use an existing client name so computeClientProfitability's allowedClients filter passes
    const clientName = "Merging Workforce Inc.";
    const time = [{ clientName, teamMember: "Michael Argento", hoursLogged: 10, date: "2025-06-15", serviceTag: "CFO Advisory" }];
    const revenue = [{ clientName, amount: 5000, date: "2025-06-15" }];
    const rows = computeClientProfitability(FILTERS, time, revenue);
    const row = rows.find((r) => r.clientName === clientName);
    expect(row).toBeDefined();
    expect(row!.revenue).toBe(5000);
    expect(row!.hours).toBe(10);
  });
});

describe("computeTeamUtilization", () => {
  it("returns only active team members", () => {
    const rows = computeTeamUtilization(FILTERS);
    expect(rows.length).toBeGreaterThan(0);
    // All rows should correspond to Active members — no Inactive names
    const inactiveNames = ["Temi Oluwatosin", "Gabby Hergt", "Jordy Guillon", "Domenick Bartuccio", "Rachel Brinac"];
    for (const r of rows) {
      expect(inactiveNames).not.toContain(r.memberName);
    }
  });

  it("calculates utilizationPct = clientHours / capacityHours", () => {
    const rows = computeTeamUtilization(FILTERS);
    for (const r of rows) {
      if (r.capacityHours > 0) {
        expect(r.utilizationPct).toBeCloseTo(r.clientHours / r.capacityHours, 5);
      }
    }
  });

  it("calculates avgHourlyRate = attributedRevenue / clientHours", () => {
    const rows = computeTeamUtilization(FILTERS);
    for (const r of rows) {
      if (r.clientHours > 0) {
        expect(r.avgHourlyRate).toBeCloseTo(r.attributedRevenue / r.clientHours, 5);
      }
    }
  });

  it("returns rows sorted by utilizationPct descending", () => {
    const rows = computeTeamUtilization(FILTERS);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].utilizationPct).toBeGreaterThanOrEqual(rows[i].utilizationPct);
    }
  });
});

describe("computeServiceProfitability", () => {
  it("groups entries by serviceTag", () => {
    const rows = computeServiceProfitability(FILTERS);
    const names = rows.map((r) => r.serviceName);
    expect(names).toContain("Bookkeeping");
    expect(names).toContain("CFO Advisory");
  });

  it("calculates grossProfit = revenue - costs per service", () => {
    const rows = computeServiceProfitability(FILTERS);
    for (const r of rows) {
      expect(r.grossProfit).toBeCloseTo(r.revenue - r.costs, 5);
    }
  });

  it("sorts by revenue descending", () => {
    const rows = computeServiceProfitability(FILTERS);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].revenue).toBeGreaterThanOrEqual(rows[i].revenue);
    }
  });
});
