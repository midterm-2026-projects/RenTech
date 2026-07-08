import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AIBusinessInsights from '../components/AIBusinessInsights';

const mockInsights = [
  "Rental demand for winter coats is up 20% this week.",
  "Expect a surge in formal wear rentals next month due to prom season.",
];

const mockSuggestions = [
  "Recommend styling scarves to customers renting coats.",
  "Bundle evening gowns with matching jewelry for a 10% discount.",
];

const AdminContent = () => (
  <div className="flex h-screen bg-gray-50">
    <div className="w-64 shrink-0 border-r border-gray-200">
      <Sidebar />
    </div>
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <AnalyticsDashboard />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">AI Business Insights</h2>
            <AIBusinessInsights insights={mockInsights} suggestions={mockSuggestions} />
          </div>
        </div>
      </main>
    </div>
  </div>
);

const AdminLayout = () => (
  <ProtectedRoute allowedRoles={['Admin']}>
    <AdminContent />
  </ProtectedRoute>
);

export default AdminLayout;
