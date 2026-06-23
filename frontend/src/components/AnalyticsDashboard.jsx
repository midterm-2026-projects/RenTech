import { 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Acceptance Criteria: Hardcoded example data for Revenue
const hardcodedRevenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 2780 },
  { month: 'May', revenue: 1890 },
  { month: 'Jun', revenue: 2390 },
];

// Acceptance Criteria: Hardcoded example data for Demand Forecasting (SMA)
// Note: Future months lack 'actualDemand' to simulate projections
const hardcodedForecastData = [
  { month: 'Jan', actualDemand: 45, projectedSMA: 40 },
  { month: 'Feb', actualDemand: 52, projectedSMA: 46 },
  { month: 'Mar', actualDemand: 61, projectedSMA: 53 },
  { month: 'Apr', actualDemand: 48, projectedSMA: 55 },
  { month: 'May', actualDemand: null, projectedSMA: 60 }, // Future Projection
  { month: 'Jun', actualDemand: null, projectedSMA: 65 }, // Future Projection
];

const AnalyticsDashboard = ({ revenueData = hardcodedRevenueData, forecastData = hardcodedForecastData }) => {
  
  const hasRevenue = revenueData && revenueData.length > 0;
  const hasForecast = forecastData && forecastData.length > 0;

  // Acceptance Criteria: If all data is empty, show "No data available" message instead of a broken view
  if (!hasRevenue && !hasForecast) {
    return (
      <div className="w-full h-96 border rounded-lg shadow-sm bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- Revenue Trends Chart (Bar) --- */}
      {hasRevenue && (
        <div className="w-full h-96 p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Revenue Trends</h2>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Revenue (PHP)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `Php ${value}`} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="revenue" fill="#3b82f6" name="Monthly Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- Demand Forecasting SMA Chart (Line) --- */}
      {hasForecast && (
        <div className="w-full h-96 p-6 border rounded-lg shadow-sm bg-white">
          <h2 className="text-lg font-bold mb-6 text-gray-800">Demand Forecasting (SMA)</h2>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Rental Volume', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              {/* connectNulls ensures the line doesn't break if a month is missing actual data */}
              <Line type="monotone" dataKey="actualDemand" stroke="#10b981" name="Actual Demand" strokeWidth={3} connectNulls />
              {/* Dashed line to represent mathematical projection */}
              <Line type="monotone" dataKey="projectedSMA" stroke="#f59e0b" name="Projected Demand (SMA)" strokeDasharray="5 5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;