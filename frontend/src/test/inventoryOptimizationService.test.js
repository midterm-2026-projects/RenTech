import { describe, it, expect } from "vitest";
import {
  calculateOptimizationScore,
  generatePromotionRecommendations,
} from "../services/inventoryOptimizationService";

describe("inventoryOptimizationService", () => {
  describe("calculateOptimizationScore", () => {
    it("calculates a balanced score correctly", () => {
      const score = calculateOptimizationScore({
        totalSales: 600,
        lowStockItems: 2,
        inventoryTurnover: 50,
        rentedItems: ["Gown A"],
        notRentedItems: ["Gown B"],
      });

      expect(score).toBe(50);
    });

    it("returns the maximum score for excellent metrics", () => {
      const score = calculateOptimizationScore({
        totalSales: 2000,
        lowStockItems: 0,
        inventoryTurnover: 100,
        rentedItems: ["A", "B"],
        notRentedItems: ["C"],
      });

      expect(score).toBe(100);
    });

    it("returns the minimum score for poor metrics", () => {
      const score = calculateOptimizationScore({
        totalSales: 0,
        lowStockItems: 10,
        inventoryTurnover: 10,
        rentedItems: [],
        notRentedItems: ["X", "Y"],
      });

      expect(score).toBe(0);
    });

    it("uses default values when fields are missing", () => {
      expect(calculateOptimizationScore({})).toBe(25);
    });

    it("handles missing arrays gracefully", () => {
      expect(() =>
        calculateOptimizationScore({ totalSales: 600 })
      ).not.toThrow();

      expect(
        calculateOptimizationScore({ totalSales: 600 })
      ).toBe(45);
    });
  });

  describe("generatePromotionRecommendations", () => {
    it("returns a no-promotion message when there are no unrented items", () => {
      expect(generatePromotionRecommendations([])).toEqual([
        "All items are actively rented. No promotion needed.",
      ]);
    });

    it("generates a recommendation for each unrented item", () => {
      const recs = generatePromotionRecommendations([
        "Ivory Lace Gown",
        "Satin Ballgown",
      ]);

      expect(recs).toHaveLength(2);
      expect(recs[0]).toContain("Ivory Lace Gown");
      expect(recs[1]).toContain("Satin Ballgown");
    });

    it("handles null input gracefully", () => {
      expect(generatePromotionRecommendations(null)).toEqual([
        "All items are actively rented. No promotion needed.",
      ]);
    });
  });
});