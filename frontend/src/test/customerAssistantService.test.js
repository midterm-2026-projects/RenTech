import { describe, it, expect } from "vitest";
import { generateCustomerResponse } from "../services/customerAssistantService";

describe("customerAssistantService", () => {
  const mockProducts = [
    { id: 1, name: "Ivory Lace Gown", category: "wedding", color: "ivory" },
    { id: 2, name: "Satin Ballgown", category: "evening", color: "navy" },
    { id: 3, name: "Velvet Cloak", category: "costume", color: "burgundy" },
    { id: 4, name: "Floral Maxi Dress", category: "casual", color: "multi" },
    { id: 5, name: "Red Carpet Gown", category: "evening", color: "red" },
  ];

  describe("FAQ responses", () => {
    it("returns the return policy", () => {
      const response = generateCustomerResponse(
        "How do I return my gown?",
        [],
        mockProducts
      );

      expect(response).toContain("return policy allows returns within 14 days");
    });

    it("returns sizing information", () => {
      const response = generateCustomerResponse(
        "Do you have a size guide?",
        [],
        mockProducts
      );

      expect(response).toContain("size guide on each product page");
    });

    it("returns discount information", () => {
      const response = generateCustomerResponse(
        "Any promo codes?",
        [],
        mockProducts
      );

      expect(response).toContain("10% off your first order");
    });
  });

  describe("recommendations", () => {
    it("recommends products based on category", () => {
      const response = generateCustomerResponse(
        "Recommend a wedding gown",
        [],
        mockProducts
      );

      expect(response).toContain("Ivory Lace Gown");
      expect(response).not.toContain("Velvet Cloak");
    });

    it("falls back to color matching when no category matches", () => {
      const response = generateCustomerResponse(
        "red gown",
        [],
        mockProducts
      );

      expect(response).toContain("Red Carpet Gown");
    });

    it("falls back to the default recommendations when nothing matches", () => {
      const response = generateCustomerResponse(
        "something stylish",
        [],
        mockProducts
      );

      expect(response).toContain("Ivory Lace Gown");
      expect(response).toContain("Satin Ballgown");
      expect(response).toContain("Velvet Cloak");
    });

    it("uses a custom product list when provided", () => {
      const custom = [
        { id: 10, name: "Custom Gown", category: "evening" },
      ];

      const response = generateCustomerResponse(
        "evening gown",
        [],
        custom
      );

      expect(response).toContain("Custom Gown");
      expect(response).not.toContain("Ivory Lace Gown");
    });
  });

  describe("fallbacks", () => {
    it("returns the default help message for unrelated queries", () => {
      expect(
        generateCustomerResponse(
          "What's the weather?",
          [],
          mockProducts
        )
      ).toBe(
        "I can help with returns, sizing, discounts, or finding the perfect gown. What would you like to know?"
      );
    });

    it("handles null products gracefully", () => {
      expect(() =>
        generateCustomerResponse("wedding gown", [], null)
      ).not.toThrow();

      expect(
        generateCustomerResponse("wedding gown", [], null)
      ).toContain("Ivory Lace Gown");
    });
  });
});