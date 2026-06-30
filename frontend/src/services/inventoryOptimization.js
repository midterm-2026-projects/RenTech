// Calculates a smart inventory optimization score (0–100)
// based on sales, stock, turnover, and rental utilization.

export const calculateOptimizationScore = ({
  totalSales = 0,
  lowStockItems = 0,
  inventoryTurnover = 0,
  rentedItems = [],
  notRentedItems = [],
}) => {
  let score = 50; // baseline

  // Sales performance
  if (totalSales > 1000) score += 20;
  else if (totalSales > 500) score += 10;
  else score -= 10;

  // Stock health
  if (lowStockItems === 0) score += 10;
  else if (lowStockItems > 5) score -= 15;

  // Turnover efficiency
  if (inventoryTurnover > 70) score += 20;
  else if (inventoryTurnover < 30) score -= 15;

  // Rental utilization (new factor)
  if (rentedItems.length > notRentedItems.length) {
    score += 15;
  } else {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
};


// Generates promotion recommendations for items that are not rented.
// Returns an array of suggestion strings.
export const generatePromotionRecommendations = (notRentedItems = []) => {
  if (!notRentedItems || notRentedItems.length === 0) {
    return ["All items are actively rented. No promotion needed."];
  }

  return notRentedItems.map((item) => {
    return `Promote "${item}" with discount or bundle offer to increase rental activity.`;
  });
};