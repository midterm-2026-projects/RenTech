import React, { useState } from "react";
import { LayoutGrid, ClipboardList, Clock, Sparkles, Settings, LogOut, X } from "lucide-react";

export default function Sidebar({ currentTab, onTabChange }) {
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const getButtonStyles = (tabName) => {
    const baseStyle = "w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-left text-xs";
    
    // Check using lowercase strings to match the routing state
    if (currentTab === tabName) {
      return `${baseStyle} bg-rose-50/60 text-rose-500`;
    }
    return `${baseStyle} text-gray-500 hover:bg-gray-50 hover:text-gray-900`;
  };

  const getIconStyles = (tabName) => {
    return currentTab === tabName ? "w-4 h-4 text-rose-500" : "w-4 h-4 text-gray-400";
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    alert("Signing out..."); 
  };

  return (
    <>
      {/* Container structured to fill the layout frame */}
      <aside className="w-full bg-white text-gray-700 p-3 flex flex-col justify-between font-sans h-full">
        <div>
          {/* Top Admin Profile Section */}
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-[#801818] flex items-center justify-center text-white text-[10px] font-serif">
                👗
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs leading-none">Admin</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Admin</p>
            </div>
          </div>

          {/* Sidebar Navigation Buttons */}
          <nav className="space-y-0.5">
            {/* Dashboard */}
            <button 
              onClick={() => onTabChange("dashboard")}
              className={getButtonStyles("dashboard")}
            >
              <LayoutGrid className={getIconStyles("dashboard")} />
              <span>Dashboard</span>
            </button>

            {/* Inventory */}
            <button 
              onClick={() => onTabChange("inventory")}
              className={getButtonStyles("inventory")}
            >
              <ClipboardList className={getIconStyles("inventory")} />
              <span>Inventory</span>
            </button>

            {/* Transactions */}
            <button 
              onClick={() => onTabChange("transactions")}
              className={getButtonStyles("transactions")}
            >
              <Clock className={getIconStyles("transactions")} />
              <span>Transactions</span>
            </button>

            {/* AI Intelligence */}
            <button 
              onClick={() => onTabChange("ai intelligence")}
              className={`${getButtonStyles("ai intelligence")} justify-between`}
            >
              <div className="flex items-center space-x-2.5">
                <Sparkles className={getIconStyles("ai intelligence")} />
                <span>AI Intelligence</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            </button>

            {/* System Settings */}
            <button 
              onClick={() => onTabChange("settings")}
              className={getButtonStyles("settings")}
            >
              <Settings className={getIconStyles("settings")} />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Status & Actions Container */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50">
                <div className="w-5 h-5 rounded-full bg-[#801818] flex items-center justify-center text-white text-[8px]">
                  👗
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 text-[10px] leading-none">Admin User</h5>
                <p className="text-[8px] text-gray-400 mt-0.5">Online</p>
              </div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200"></span>
          </div>

          {/* Sign Out Action Button */}
          <button 
            onClick={() => setShowSignOutModal(true)}
            className="w-full flex items-center space-x-2 px-3 py-1 text-gray-500 hover:text-rose-500 font-medium text-xs transition cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sign Out Confirmation Modal Overlay */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => setShowSignOutModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Sign Out</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to sign out? You will be returned to the landing page.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white shadow-sm shadow-rose-100 cursor-pointer transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}