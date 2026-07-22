import { describe, it, expect, vi } from "vitest";
import { buildSupabase } from '../helpers/mockSupabase.js';

const mockRows = [
  { id: "TX-1001", username: "ana rivera", item: "Vintage Gatsby Sequin Dress", price_per_day: 500, days_rented: 3, amount: 1500, status: "Active", date: "2026-05-01", created_at: "2026-05-01T00:00:00Z" },
  { id: "TX-1002", username: "carlos mendez", item: "Barong Tagalog", price_per_day: 400, days_rented: 2, amount: 800, status: "Active", date: "2026-05-02", created_at: "2026-05-02T00:00:00Z" },
  { id: "TX-1003", username: "liza santos", item: "Emerald Velvet Gown", price_per_day: 600, days_rented: 3, amount: 1800, status: "Active", date: "2026-05-03", created_at: "2026-05-03T00:00:00Z" },
  { id: "TX-1004", username: "daniel cruz", item: "Black Tuxedo", price_per_day: 700, days_rented: 2, amount: 1400, status: "Returned", date: "2026-05-04", created_at: "2026-05-04T00:00:00Z" },
  { id: "TX-1005", username: "isabel garcia", item: "Champagne Silk Gown", price_per_day: 850, days_rented: 2, amount: 1700, status: "Active", date: "2026-05-02", created_at: "2026-05-02T00:00:00Z" },
];

vi.mock('../../config/supabaseClient.js', () => ({
  getSupabase: () => buildSupabase(mockRows),
}));

const { getRentalHistory, getTransactionSummary } = await import('../../service/transactionMonitoring.service.js');

describe("RenTech Week 2 Day 2 - Transaction Monitoring Test Suite", () => {
  describe("Rental History API & Filter Database Logic", () => {
    it("should fetch all structured rental data records when no filter is applied", async () => {
      const records = await getRentalHistory();
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);
      expect(records[0]).toHaveProperty("id");
      expect(records[0]).toHaveProperty("totalCost");
    });

    it("should filter rental records accurately by username", async () => {
      const records = await getRentalHistory({ username: "carlos" });
      expect(records.length).toBe(1);
      expect(records[0].username).toBe("carlos mendez");
    });

    it("should filter rental records using case-insensitive partial matching for itemName", async () => {
      const records = await getRentalHistory({ itemName: "gown" });
      expect(records.length).toBeGreaterThan(0);
      records.forEach(record => {
        expect(record.itemName.toLowerCase()).toContain("gown");
      });
    });
  });

  describe("Transaction Summary Query Engine", () => {
    it("should calculate correct total numerical metrics from the database ledger", async () => {
      const summary = await getTransactionSummary();
      expect(summary.totalTransactions).toBe(5);
      expect(summary.totalRevenue).toBe(7200);
      expect(summary.statusCounts).toEqual({ Active: 4, Returned: 1 });
    });
  });

  describe("Rental History Backend Search - Functional Logic", () => {
    it("should filter rental records accurately by status", async () => {
      const records = await getRentalHistory({ status: "Returned" });
      expect(records.length).toBeGreaterThan(0);
      records.forEach(record => {
        expect(record.status.toLowerCase()).toBe("returned");
      });
    });

    it("should filter rental records using case-insensitive partial matching for itemName", async () => {
      const records = await getRentalHistory({ itemName: "gown" });
      expect(records.length).toBeGreaterThan(0);
      records.forEach(record => {
        expect(record.itemName.toLowerCase()).toContain("gown");
      });
    });
  });
});