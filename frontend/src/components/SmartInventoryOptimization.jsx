import {
  calculateOptimizationScore,
  generatePromotionRecommendations,
} from "../services/inventoryOptimizationService";

const SmartInventoryOptimization = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-4 bg-gray-50 border rounded-md" data-testid="inventory-fallback">
        <p className="text-gray-500 italic">
          Inventory and sales data unavailable.
        </p>
      </div>
    );
  }

  const {
    totalSales = 0,
    lowStockItems = 0,
    topSellingItem = "N/A",
    rentedItems = [],
    notRentedItems = [],
    inventoryTurnover = 0,
    optimizationScore: propOptimizationScore,
    promotionSuggestions: propPromotionSuggestions,
  } = metrics;

  // Use pre‑computed values if provided, otherwise compute on the fly
  const displayScore =
    propOptimizationScore !== undefined && propOptimizationScore !== null
      ? propOptimizationScore
      : calculateOptimizationScore({
          totalSales,
          lowStockItems,
          inventoryTurnover,
          rentedItems,
          notRentedItems,
        });

  const suggestions =
    propPromotionSuggestions || generatePromotionRecommendations(notRentedItems);

  const displayTopItem = topSellingItem || "N/A";

  return (
    <div className="inventory-optimization-container p-6 bg-white shadow rounded-lg">

      <h2 className="text-xl font-bold mb-4">
        Smart Inventory & Rental Optimization
      </h2>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 border rounded bg-blue-50">
          <h4 className="text-sm font-semibold text-gray-600">Total Sales</h4>
          <p className="text-2xl font-bold" data-testid="total-sales">
            {totalSales}
          </p>
        </div>

        <div className="p-4 border rounded bg-red-50">
          <h4 className="text-sm font-semibold text-gray-600">Low Stock Items</h4>
          <p className="text-2xl font-bold text-red-600" data-testid="low-stock">
            {lowStockItems}
          </p>
        </div>

        <div className="p-4 border rounded bg-green-50">
          <h4 className="text-sm font-semibold text-gray-600">
            Optimization Score
          </h4>
          <p className="text-2xl font-bold text-green-600" data-testid="opt-score">
            {displayScore}%
            <br />
            <span className="text-sm text-gray-500">
              AI-adjusted: {displayScore}%
            </span>
          </p>
        </div>

        <div className="p-4 border rounded bg-purple-50">
          <h4 className="text-sm font-semibold text-gray-600">
            Top Performing Item
          </h4>
          <p className="text-lg font-bold" data-testid="top-item">
            {displayTopItem}
          </p>
        </div>

      </div>

      {/* RENTAL INSIGHTS */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-2">
          Rental Utilization Insight
        </h3>

        <p className="text-sm">
          Rented Items: {rentedItems.length} <br />
          Not Rented Items: {notRentedItems.length}
        </p>
      </div>

      {/* PROMOTION ENGINE */}
      <div className="mt-6 p-4 border rounded bg-yellow-50">
        <h3 className="font-semibold text-yellow-700 mb-2">
          AI Promotion Recommendations
        </h3>

        <ul className="list-disc pl-5 space-y-1">
          {suggestions.map((rec, idx) => (
            <li key={idx} className="text-sm">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmartInventoryOptimization;