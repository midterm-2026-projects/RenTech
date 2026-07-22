import { useState } from 'react';
import { Menu } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import LiveAdminDashboard from '../components/LiveAdminDashboard';
import InventoryManagement from '../components/InventoryManagement';
import AIIntelligenceView from '../components/AIIntelligenceView';
import TransactionDashboard from '../components/TransactionDashboard';
import AccountSettings from '../components/SystemSetting';
import StaffManagement from '../components/StaffManagement';

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
    subtitle: 'Account and platform configuration.',
  },
  staff: {
    title: 'Staff Management',
    subtitle: 'Manage staff accounts and access permissions.',
  },
};

const AdminContent = () => {
  const [currentTab, onTabChange] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [existingStaff, setExistingStaff] = useState([
    { username: "staff1", password: "••••••" },
    { username: "staff2", password: "••••••" }
  ]);

  const handleTabChange = (tab) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  const handleAddStaff = (newStaff) => {
    setExistingStaff(prev => [...prev, { ...newStaff, password: "••••••" }]);
  };

  const handleDeleteStaff = (username) => {
    setExistingStaff(prev => prev.filter(staff => staff.username !== username));
  };

  const renderViewContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <LiveAdminDashboard onTabChange={onTabChange} />;
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
      case 'staff':
        return (
          <div className="w-full max-w-4xl mx-auto py-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
              <p className="text-gray-500 text-sm mt-1">Manage staff accounts and access permissions.</p>
            </div>
            <StaffManagement 
              onAddRole={handleAddStaff}
              onDeleteRole={handleDeleteStaff}
              existingRoles={existingStaff}
            />
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
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />
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
            <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-slate-800 to-slate-900 shrink-0">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-300 hover:bg-slate-700/50 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1 flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:block w-1 h-8 rounded-full bg-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Admin Portal
                </p>
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">{meta.title}</h1>
              </div>
            </div>
            <p className="hidden md:block text-xs text-slate-400 truncate max-w-[320px] text-right ml-auto">
              {meta.subtitle}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
