import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, ClipboardList, Clock, Sparkles, Settings, LogOut, X, User } from "lucide-react";
import { clearSession } from "./Login";

export default function Sidebar({ currentTab, onTabChange }) {
  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const getButtonStyles = (tabName) => {
    const baseStyle = "w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg font-medium transition cursor-pointer text-left text-sm";
    
    // Check using lowercase strings to match the routing state
    if (currentTab === tabName) {
      return `${baseStyle} bg-rose-50/50 text-rose-600`;
    }
    return `${baseStyle} text-gray-600 hover:bg-rose-50/50 hover:text-rose-600`;
  };

  const getIconStyles = (tabName) => {
    return currentTab === tabName ? "w-4 h-4 text-rose-500" : "w-4 h-4 text-gray-400";
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    clearSession();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Container structured to fill the layout frame */}
      <aside className="w-full bg-gradient-to-b from-rose-50/50 to-white rounded-2xl border border-rose-100/50 text-gray-700 px-5 py-6 flex flex-col justify-between font-sans h-full shadow-md">
        <div>
          {/* Top Admin Profile Section */}
          <div className="flex items-center space-x-3 mb-5 px-1">
            <div className="w-10 h-10 rounded-full border border-rose-100/50 flex items-center justify-center overflow-hidden bg-rose-50 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-base leading-none">Admin</h4>
              <p className="text-xs text-rose-500 mt-0.5">Administrator</p>
            </div>
          </div>

          {/* Sidebar Navigation Buttons */}
          <nav className="space-y-1.5">
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
        <div className="space-y-3 pt-4 border-t border-gray-100/60">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full border border-rose-100/50 flex items-center justify-center overflow-hidden bg-rose-50">
                <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 text-sm leading-none">Admin User</h5>
                <p className="text-xs text-rose-500 mt-0.5">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200/50"></span>
              <span className="text-[11px] text-emerald-600 font-medium">Active</span>
            </div>
          </div>

          {/* Sign Out Action Button */}
          <button 
            onClick={() => setShowSignOutModal(true)}
            className="group w-full flex items-center space-x-2.5 px-3 py-2.5 text-gray-600 hover:bg-rose-50/60 hover:text-rose-600 rounded-lg transition-all duration-200 cursor-pointer text-left font-medium text-sm"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
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