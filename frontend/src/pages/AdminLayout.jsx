import { useState } from 'react';
import { Menu } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import LiveAdminDashboard from '../components/LiveAdminDashboard';
import InventoryManagement from '../components/InventoryManagement';
import AIIntelligenceView from '../components/AIIntelligenceView';
import TransactionDashboard from '../components/TransactionDashboard';
import AccountSettings from '../components/SystemSetting';
import { getSession } from '../components/Login';

const TAB_META = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Real-time business performance and analytics overview.',
  },
  inventory: {
    title: 'Inventory',
    subtitle: 'Stock levels, optimization score, and AI promotion engine.',
  },
  'ai intelligence': {
    title: 'AI Intelligence',
    subtitle: 'AI-generated business insights and customer suggestions.',
  },
  transactions: {
    title: 'Transactions',
    subtitle: 'All customer rental activity and history.',
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Account, platform configuration, and staff management.',
  },
};

const AdminContent = () => {
  const [currentTab, onTabChange] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userRole = (() => {
    try {
      const session = getSession();
      return session?.role || 'Admin';
    } catch {
      return 'Admin';
    }
  })();

  const handleTabChange = (tab) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  const renderViewContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <LiveAdminDashboard />;
      case 'inventory':
        return <InventoryManagement />;
      case 'ai intelligence':
        return <AIIntelligenceView />;
      case 'transactions':
        return (
          <div className="w-full">
            <TransactionDashboard />
          </div>
        );
      case 'settings':
        return (
          <div className="w-full">
            <AccountSettings />
          </div>
        );
      default:
        return <LiveAdminDashboard />;
    }
  };

  const meta = TAB_META[currentTab] || TAB_META.dashboard;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 border-r border-gray-200 bg-white">
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} userRole={userRole} />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <Sidebar currentTab={currentTab} onTabChange={handleTabChange} userRole={userRole} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
          <div className="px-6 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-500">
                Admin Portal
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{meta.title}</h1>
                <p className="hidden md:block text-sm text-gray-400">{meta.subtitle}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
          {renderViewContent()}
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <ProtectedRoute allowedRoles={['Admin']}>
    <AdminContent />
  </ProtectedRoute>
);

export default AdminLayout;
