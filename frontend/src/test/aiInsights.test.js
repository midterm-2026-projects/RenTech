import { describe, it, expect } from "vitest";
import { generateResponse } from "../services/aiInsights";

describe("aiInsights service", () => {
  const mockInsights = ["Rental demand up 20%", "Evening gowns sell best"];
  const mockSuggestions = ["Offer discount on accessories", "Extend rental period"];

  it("returns insights when user asks about insights", () => {
    const response = generateResponse("Tell me an insight", mockInsights, mockSuggestions);
    expect(response).toContain("Here are key insights");
    expect(response).toContain(mockInsights[0]);
  });

  it("returns suggestions when user asks about suggestions", () => {
    const response = generateResponse("Any suggestions?", mockInsights, mockSuggestions);
    expect(response).toContain("Customer suggestions include");
    expect(response).toContain(mockSuggestions[0]);
  });

  it("returns fallback message when no insights or suggestions available", () => {
    const response = generateResponse("insight", [], []);
    expect(response).toBe("No insights available right now.");
  });

  it("returns default help message for unrelated queries", () => {
    const response = generateResponse("What's the weather?", mockInsights, mockSuggestions);
    expect(response).toBe(
      "I can help you understand insights, customer feedback, or business recommendations. Try asking about insights or suggestions."
    );
  });

  it("handles missing insights and suggestions gracefully", () => {
    const response = generateResponse("suggest", undefined, []);
    expect(response).toBe("No suggestions available right now.");
  });

  it("is case‑insensitive when detecting keywords", () => {
    const response = generateResponse("INSIGHT", mockInsights, mockSuggestions);
    expect(response).toContain("Here are key insights");
  });
});