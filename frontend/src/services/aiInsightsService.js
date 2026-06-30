
// Generates a mock AI response based on the user's input and available data.
// Replace this with a real API call later.

export const generateResponse = (input, insights = [], suggestions = []) => {
  const lower = String(input ?? "").toLowerCase();

  if (lower.includes("insight")) {
    return insights?.length
      ? `Here are key insights: ${insights.slice(0, 2).map(String).join(", ")}`
      : "No insights available right now.";
  }

  if (lower.includes("suggest")) {
    return suggestions?.length
      ? `Customer suggestions include: ${suggestions.slice(0, 2).map(String).join(", ")}`
      : "No suggestions available right now.";
  }

  return "I can help you understand insights, customer feedback, or business recommendations. Try asking about insights or suggestions.";
};