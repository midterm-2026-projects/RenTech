import { Sparkles, TrendingUp, PackageX, Award, BarChart3, Megaphone } from 'lucide-react';
import {
  calculateOptimizationScore,
  generatePromotionRecommendations,
} from "../services/inventoryOptimizationService";

const SmartInventoryOptimization = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl" data-testid="inventory-fallback">
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

  const STAT_STYLES = {
    'Active Rental Value': { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
    'Low Stock Items': { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    'Optimization Score': { bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    'Top Performing Item': { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-6 py-3 overflow-hidden rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="p-1 sm:p-1.5 rounded-lg bg-white/20">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white">Smart Inventory & Rental Optimization</h2>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Active Rental Value', value: `₱${Number(totalSales).toLocaleString('en-PH')}`, icon: TrendingUp },
            { label: 'Low Stock Items', value: lowStockItems, icon: PackageX },
            { label: 'Optimization Score', value: `${displayScore}%`, icon: Award },
            { label: 'Top Performing Item', value: displayTopItem, icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => {
            const s = STAT_STYLES[label];
            const isItem = label === 'Top Performing Item';
            return (
              <div key={label} className={`${s.bg} ${s.border} border rounded-xl shadow-sm p-3 sm:p-5 flex flex-col justify-between`}>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <p className="text-sm sm:text-base font-medium text-gray-500">{label}</p>
                  <span className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${s.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconColor}`} />
                  </span>
                </div>
                <p className={`font-bold text-gray-800 ${isItem ? 'text-sm sm:text-base' : 'text-xl sm:text-3xl'}`} data-testid={
                  label === 'Active Rental Value' ? 'active-rental-value' :
                  label === 'Low Stock Items' ? 'low-stock' :
                  label === 'Optimization Score' ? 'opt-score' :
                  'top-item'
                }>
                  {value}
                  {label === 'Optimization Score' && (
                    <span className="block text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                      Inventory health: {displayScore}%
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-5 py-3 overflow-hidden rounded-t-xl">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <h3 className="text-sm sm:text-base font-bold text-white">Rental Utilization Insight</h3>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-sm sm:text-base text-gray-600" data-testid="rental-insight">
              <span className="font-semibold text-gray-800">Rented Items:</span> {rentedItems.length}<br />
              <span className="font-semibold text-gray-800">Not Rented Items:</span> {notRentedItems.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-5 py-3 overflow-hidden rounded-t-xl">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <h3 className="text-sm sm:text-base font-bold text-white">Promotion Recommendations</h3>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <ul className="space-y-2">
              {suggestions.map((rec, idx) => (
                <li key={idx} className="text-sm sm:text-base text-gray-600 flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartInventoryOptimization;