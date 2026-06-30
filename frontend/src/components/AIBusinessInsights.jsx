const AIBusinessInsights = ({ insights = [], suggestions = [] }) => {
  const hasData = insights?.length > 0 || suggestions?.length > 0;

  if (!hasData) {
    return (
      <div className="p-4 bg-gray-50 border rounded-md" data-testid="ai-fallback">
        <p className="text-gray-500 italic">
          No AI insights or suggestions available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="ai-insights-container p-6 bg-white shadow rounded-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Generative AI Business Insights</h2>

        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          Business Insights
        </h3>
        {insights?.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1" data-testid="insights-list">
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No insights available.</p>
        )}

        <h3 className="text-lg font-semibold text-green-700 mt-4 mb-2">
          Customer Suggestions
        </h3>
        {suggestions?.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1" data-testid="suggestions-list">
            {suggestions.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No suggestions available.</p>
        )}
      </div>
    </div>
  );
};

export default AIBusinessInsights;