import { DollarSign, TrendingUp, Key, BarChart3, AlertCircle } from 'lucide-react';

const STYLES = {
  'Total Revenue': { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  'Forecast Revenue': { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  'Active Rentals': { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  'Utilization': { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  'Overdue Returns': { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
};

const KPICards = ({ metrics = {} }) => {
  const items = [
    { title: 'Total Revenue', value: metrics.totalRevenue || '₱0', Icon: DollarSign },
    { title: 'Forecast Revenue', value: metrics.forecastRevenue || '₱0', Icon: TrendingUp },
    { title: 'Active Rentals', value: metrics.activeRentals || '0', Icon: Key },
    { title: 'Utilization', value: metrics.utilization || '0%', Icon: BarChart3 },
    { title: 'Overdue Returns', value: metrics.overdueReturns || '0', Icon: AlertCircle },
  ];

  const SPANS = ['col-span-3 sm:col-span-1', 'col-span-3 sm:col-span-1', 'col-span-2 sm:col-span-1', 'col-span-2 sm:col-span-1', 'col-span-2 sm:col-span-1'];

  return (
    <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
      {items.map(({ title, value, Icon }, i) => {
        const s = STYLES[title];
        return (
          <div key={title} className={`${s.bg} ${s.border} border rounded-xl shadow-sm p-3 sm:p-5 flex flex-col justify-between ${SPANS[i]}`}>
            <div className="flex items-center justify-between gap-1">
              <p className="text-sm sm:text-base font-medium text-gray-500">{title}</p>
              <span className={`p-1 sm:p-1.5 rounded-lg shrink-0 ${s.iconBg}`}>
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s.iconColor}`} data-testid={`${title}-icon`} />
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800">{value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;