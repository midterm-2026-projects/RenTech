import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Sidebar from '../components/Sidebar';
import LiveAdminDashboard from '../components/LiveAdminDashboard';
import AIBusinessInsights from '../components/AIBusinessInsights';

// Combined Sprint Component Imports
import TransactionDashboard from '../components/TransactionDashboard';
import AccountSettings from '../components/SystemSetting';
import StaffManagement from '../components/StaffManagement';

const mockInsights = [
  "Rental demand for winter coats is up 20% this week.",
  "Expect a surge in formal wear rentals next month due to prom season.",
];

const mockSuggestions = [
  "Recommend styling scarves to customers renting coats.",
  "Bundle evening gowns with matching jewelry for a 10% discount.",
];

const AdminContent = () => {
  const [currentTab, onTabChange] = useState('dashboard');
  const [existingStaff, setExistingStaff] = useState([
    { username: "staff1", password: "••••••" },
    { username: "staff2", password: "••••••" }
  ]);

  const handleAddStaff = (newStaff) => {
    setExistingStaff(prev => [...prev, { ...newStaff, password: "••••••" }]);
  };

  const handleDeleteStaff = (username) => {
    setExistingStaff(prev => prev.filter(staff => staff.username !== username));
  };

  const renderViewContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <LiveAdminDashboard />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">AI Business Insights</h2>
              <AIBusinessInsights insights={mockInsights} suggestions={mockSuggestions} />
            </div>
          </div>
        );
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
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <LiveAdminDashboard />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 shrink-0 border-r border-gray-200">
        <Sidebar currentTab={currentTab} onTabChange={onTabChange} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm shrink-0">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              Admin Portal - {currentTab}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8">
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
