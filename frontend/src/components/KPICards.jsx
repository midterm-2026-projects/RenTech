import { DollarSign, Key, CalendarCheck, TrendingUp, Package } from 'lucide-react';

const KPICards = ({ metrics = {} }) => {
  // Acceptance Criteria: Default placeholder values if no numbers are given
  const data = {
    totalRevenue: metrics.totalRevenue || 'Php0.00',
    activeRentals: metrics.activeRentals || '0',
    reservations: metrics.reservations || '0',
    forecastRevenue: metrics.forecastRevenue || 'Php0.00',
    inventoryItems: metrics.inventoryItems || '0'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
      <Card title="Total Revenue" value={data.totalRevenue} Icon={DollarSign} />
      <Card title="Active Rentals" value={data.activeRentals} Icon={Key} />
      <Card title="Reservations" value={data.reservations} Icon={CalendarCheck} />
      <Card title="Forecast Revenue" value={data.forecastRevenue} Icon={TrendingUp} />
      <Card title="Inventory Items" value={data.inventoryItems} Icon={Package} />
    </div>
  );
};

// Acceptance Criteria: Each card must display a title, numeric placeholder, and small icon
const Card = ({ title, value, Icon }) => (
  <div className="p-6 border rounded-lg shadow-sm bg-white flex items-center justify-between">
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
    </div>
    <div className="p-3 bg-blue-50 rounded-full">
      <Icon className="text-blue-600 w-6 h-6" data-testid={`${title}-icon`} />
    </div>
  </div>
);

export default KPICards;