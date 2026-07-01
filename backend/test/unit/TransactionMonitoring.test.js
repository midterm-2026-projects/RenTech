import { describe, it, expect, beforeEach } from "vitest";
import { assignUserRole, getRentalHistory, getTransactionSummary } from "../../service/transactionMonitoring.service.js"; 

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
      const records = await getRentalHistory({ username: "customer" });
      records.forEach(record => {
        expect(record.username).toBe("customer");
      });
    });

    it("should filter rental records using case-insensitive partial matching for itemName", async () => {
      const records = await getRentalHistory({ itemName: "lap" });
      expect(records.length).toBeGreaterThan(0);
      records.forEach(record => {
        expect(record.itemName.toLowerCase()).toContain("lap");
      });
    });
  });

  describe("Transaction Summary Query Engine", () => {
    it("should calculate correct total numerical metrics for the entire system", async () => {
      const summary = await getTransactionSummary();
      expect(summary.totalTransactions).toBe(3);
      expect(summary.totalRevenue).toBe(320); // 100 + 70 + 150
    });
  });
});