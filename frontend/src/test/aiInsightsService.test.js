import { describe, it, expect } from "vitest";
import { generateResponse } from "../services/aiInsightsService";

describe("aiInsights service", () => {
  const mockInsights = [
    "Rental demand up 20%",
    "Evening gowns sell best",
    "Winter coats in high demand",
  ];

  const mockSuggestions = [
    "Offer discount on accessories",
    "Extend rental period",
    "Bundle with cleaning service",
  ];

  describe("keyword detection", () => {
    it("returns insights when asked", () => {
      const response = generateResponse(
        "Tell me an insight",
        mockInsights,
        mockSuggestions
      );

      expect(response).toContain("Here are key insights");
      expect(response).toContain(mockInsights[0]);
    });

    it("returns suggestions when asked", () => {
      const response = generateResponse(
        "Any suggestions?",
        mockInsights,
        mockSuggestions
      );

      expect(response).toContain("Customer suggestions include");
      expect(response).toContain(mockSuggestions[0]);
    });

    it("prioritizes insights when both keywords appear", () => {
      const response = generateResponse(
        "insight and suggest",
        mockInsights,
        mockSuggestions
      );

      expect(response).toContain("Here are key insights");
      expect(response).not.toContain("Customer suggestions include");
    });

    it("is case-insensitive", () => {
      const response = generateResponse(
        "INSIGHT",
        mockInsights,
        mockSuggestions
      );

      expect(response).toContain("Here are key insights");
    });
  });

  describe("fallbacks", () => {
    it("returns a fallback when no insights are available", () => {
      expect(generateResponse("insight", [], mockSuggestions)).toBe(
        "No insights available right now."
      );
    });

    it("returns a fallback when no suggestions are available", () => {
      expect(generateResponse("suggest", mockInsights, [])).toBe(
        "No suggestions available right now."
      );
    });

    it("returns the default help message for unrelated queries", () => {
      expect(
        generateResponse(
          "What's the weather?",
          mockInsights,
          mockSuggestions
        )
      ).toBe(
        "I can help you understand insights, customer feedback, or business recommendations. Try asking about insights or suggestions."
      );
    });
  });

  describe("response formatting", () => {
    it("shows only the first two insights", () => {
      const response = generateResponse("insight", mockInsights, []);

      expect(response).toContain(mockInsights[0]);
      expect(response).toContain(mockInsights[1]);
      expect(response).not.toContain(mockInsights[2]);
    });

    it("shows only the first two suggestions", () => {
      const response = generateResponse("suggest", [], mockSuggestions);

      expect(response).toContain(mockSuggestions[0]);
      expect(response).toContain(mockSuggestions[1]);
      expect(response).not.toContain(mockSuggestions[2]);
    });
  });

  describe("robustness", () => {
    it("handles null or undefined arrays gracefully", () => {
      expect(() =>
        generateResponse("insight", null, undefined)
      ).not.toThrow();

      expect(generateResponse("insight", null, undefined)).toBe(
        "No insights available right now."
      );
    });

    it("always returns a string", () => {
      expect(
        typeof generateResponse(undefined, undefined, undefined)
      ).toBe("string");
    });
  });
});