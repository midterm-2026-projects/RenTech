import { DollarSign, Key, CalendarCheck, TrendingUp, Package, AlertCircle, BarChart3 } from 'lucide-react';

const KPICards = ({ metrics = {} }) => {
  const data = {
    totalRevenue: metrics.totalRevenue || '₱0',
    activeRentals: metrics.activeRentals || '0',
    reservations: metrics.reservations || '0',
    forecastRevenue: metrics.forecastRevenue || '₱0',
    inventoryItems: metrics.inventoryItems || '0',
    overdueReturns: metrics.overdueReturns || '0',
    utilization: metrics.utilization || '0%',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      <Card title="Total Revenue" value={data.totalRevenue} Icon={DollarSign} />
      <Card title="Active Rentals" value={data.activeRentals} Icon={Key} />
      <Card title="Reservations" value={data.reservations} Icon={CalendarCheck} />
      <Card title="Forecast Revenue" value={data.forecastRevenue} Icon={TrendingUp} />
      <Card title="Inventory Items" value={data.inventoryItems} Icon={Package} />
      <Card title="Overdue Returns" value={data.overdueReturns} Icon={AlertCircle} />
      <Card title="Utilization" value={data.utilization} Icon={BarChart3} />
    </div>
  );
};

const Card = ({ title, value, Icon }) => (
  <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-white flex items-center justify-between">
    <div>
      <h3 className="text-gray-500 text-xs font-medium">{title}</h3>
      <p className="text-lg font-bold mt-1 text-gray-800">{value}</p>
    </div>
    <div className="p-2 bg-blue-50 rounded-full">
      <Icon className="text-blue-600 w-5 h-5" data-testid={`${title}-icon`} />
    </div>
  </div>
);

export default KPICards;