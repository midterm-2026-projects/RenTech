import { describe, it, expect } from "vitest";
import {
  calculateOptimizationScore,
  generatePromotionRecommendations,
} from "../services/inventoryOptimization";

describe("inventoryOptimization service (gown rental boutique)", () => {
  describe("calculateOptimizationScore", () => {
    it("returns baseline score when all metrics are average (net zero adjustments)", () => {
      // Choose values that produce net zero change from baseline 50
      const score = calculateOptimizationScore({
        totalSales: 600,          // +10 (since >500, <=1000)
        lowStockItems: 2,         // 0 (not 0, not >5)
        inventoryTurnover: 50,    // 0 (between 30 and 70)
        rentedItems: ["Gown A"],  // rented count = 1
        notRentedItems: ["Gown B"], // notRented count = 1 → equal => -10
      });
      // 50 +10 +0 +0 -10 = 50
      expect(score).toBe(50);
    });

    it("rewards high sales and full stock, but penalizes low turnover and underutilized rental inventory", () => {
      const score = calculateOptimizationScore({
        totalSales: 1500,        // +20
        lowStockItems: 0,        // +10 (all gowns in stock)
        inventoryTurnover: 20,   // -15 (slow rotation)
        rentedItems: ["Gown A"], // rented fewer than notRented → -10
        notRentedItems: ["Gown B", "Gown C"],
      });
      // 50 +20 +10 -15 -10 = 55
      expect(score).toBe(55);
    });

    it("caps the score between 0 and 100 (never below 0 or above 100)", () => {
      const high = calculateOptimizationScore({
        totalSales: 2000,
        lowStockItems: 0,
        inventoryTurnover: 100,
        rentedItems: ["A", "B", "C"],
        notRentedItems: [],
      });
      expect(high).toBe(100);

      const low = calculateOptimizationScore({
        totalSales: 0,
        lowStockItems: 10,
        inventoryTurnover: 0,
        rentedItems: [],
        notRentedItems: ["X", "Y"],
      });
      // baseline 50 -10 -15 -15 -10 = 0
      expect(low).toBe(0);
    });

    it("applies sensible defaults when fields are missing", () => {
      // With all defaults: totalSales=0 → -10, lowStockItems=0 → +10,
      // inventoryTurnover=0 → -15, rented=[], notRented=[] → -10
      // Net: -10 +10 -15 -10 = -25; 50 - 25 = 25
      const score = calculateOptimizationScore({});
      expect(score).toBe(25);
    });
  });

  describe("generatePromotionRecommendations", () => {
    it("returns a 'no promotion needed' message when all gowns or items are already rented", () => {
      const recs = generatePromotionRecommendations([]);
      expect(recs).toEqual([
        "All items are actively rented. No promotion needed.",
      ]);
    });

    it("generates a promotion suggestion for each unrented gown or items", () => {
      const gowns = ["Ivory Lace Gown", "Satin Ballgown"];
      const recs = generatePromotionRecommendations(gowns);
      expect(recs).toHaveLength(2);
      expect(recs[0]).toContain("Ivory Lace Gown");
      expect(recs[1]).toContain("Satin Ballgown");
    });

    it("gracefully handles null or undefined inputs", () => {
      const recs = generatePromotionRecommendations(null);
      expect(recs).toEqual([
        "All items are actively rented. No promotion needed.",
      ]);
    });
  });
});