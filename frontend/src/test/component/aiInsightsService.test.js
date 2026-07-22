import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateResponse, clearInsightsCache, getCacheTimestamp, generateReport } from "../../services/aiInsightsService";

vi.mock("../../services/analyticsApiClient", () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { insights: ["AI insight"], suggestions: [] } })),
  },
}));

beforeEach(() => {
  sessionStorage.clear();
});

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

  describe("caching", () => {
    it("clearInsightsCache removes cached data", () => {
      sessionStorage.setItem("ai_insights_cache", JSON.stringify({ data: { insights: ["test"] }, timestamp: Date.now() }));
      clearInsightsCache();
      expect(sessionStorage.getItem("ai_insights_cache")).toBeNull();
    });

    it("getCacheTimestamp returns null when no cache exists", () => {
      expect(getCacheTimestamp()).toBeNull();
    });

    it("getCacheTimestamp returns the cached timestamp", () => {
      const now = Date.now();
      sessionStorage.setItem("ai_insights_cache", JSON.stringify({ data: { insights: ["test"] }, timestamp: now }));
      expect(getCacheTimestamp()).toBe(now);
    });

    it("generateReport caches the result and returns cached on second call", async () => {
      const { default: api } = await import("../../services/analyticsApiClient");
      const mockPost = vi.mocked(api.post);

      const data = { kpis: { active_rentals: 5 } };

      const first = await generateReport(data);
      expect(first.insights).toEqual(["AI insight"]);
      expect(mockPost).toHaveBeenCalledTimes(1);

      const second = await generateReport(data);
      expect(second).toEqual(first);
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it("generateReport returns fallback when API fails and caches it", async () => {
      const { default: api } = await import("../../services/analyticsApiClient");
      const mockPost = vi.mocked(api.post);
      mockPost.mockRejectedValueOnce(new Error("fail"));

      clearInsightsCache();

      const result = await generateReport({ kpis: { active_rentals: 5 } });
      expect(result.insights).toBeDefined();
      expect(result.insights.length).toBeGreaterThan(0);

      const cached = JSON.parse(sessionStorage.getItem("ai_insights_cache"));
      expect(cached).not.toBeNull();
      expect(cached.data.insights).toEqual(result.insights);
    });
  });
});
