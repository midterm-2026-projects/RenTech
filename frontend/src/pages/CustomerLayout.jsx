import React, { useState, useEffect } from 'react';
import { LayoutGrid, Clock, LogOut, X } from "lucide-react";

import Catalog from '../components/Catalog.jsx';
import SearchAndFilter from '../components/SearchAndFilter.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ChatAssistantWidget from '../components/ChatAssistantWidget.jsx';
import Transaction from '../components/Transaction.jsx';

export default function CustomerLayout() {
  const [activeTab, setActiveTab] = useState("Collection");
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // 1. Initialize products from localStorage if available, otherwise fallback to ProductCard.products
  const [productsList, setProductsList] = useState(() => {
    const savedProducts = localStorage.getItem('customer_products_list');
    return savedProducts ? JSON.parse(savedProducts) : (ProductCard.products || []);
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 2. Save to localStorage whenever productsList changes so it persists on refresh
  useEffect(() => {
    localStorage.setItem('customer_products_list', JSON.stringify(productsList));
  }, [productsList]);

  const filteredProducts = productsList.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedCategory === "All" || product.status === selectedCategory;
    return matchesSearch && matchesStatus;
  });

  // 3. Automatically update the product status to 'Rented' once booking succeeds
  const handleBookingSuccess = (itemName) => {
    setProductsList(prevProducts =>
      prevProducts.map(product =>
        product.name === itemName
          ? { ...product, status: 'Rented' }
          : product
      )
    );
  };

  const getButtonStyles = (tabName) => {
    const baseStyle = "w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer text-left text-xs";
    if (activeTab === tabName) {
      return `${baseStyle} bg-rose-50/60 text-rose-500`;
    }
    return `${baseStyle} text-gray-500 hover:bg-gray-50 hover:text-gray-900`;
  };

  const getIconStyles = (tabName) => {
    return activeTab === tabName ? "w-4 h-4 text-rose-500" : "w-4 h-4 text-gray-400";
  };

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    alert("Signing out..."); 
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans antialiased">
      {/* Sidebar: Anchored identically to Admin Layout */}
      <aside className="w-56 bg-white border-r border-gray-100 p-3 flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-20">
        <div>
          {/* Profile Match Header */}
          <div className="flex items-center space-x-2.5 mb-4 pl-1">
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-[#801818] flex items-center justify-center text-white text-[10px]">
                👗
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs leading-none">Maria Santos</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Customer</p>
            </div>
          </div>

          {/* Nav Items Group */}
          <nav className="space-y-0.5">
            <button 
              onClick={() => setActiveTab("Collection")}
              className={getButtonStyles("Collection")}
            >
              <LayoutGrid className={getIconStyles("Collection")} />
              <span>Collection</span>
            </button>

            <button 
              onClick={() => setActiveTab("Transactions")}
              className={getButtonStyles("Transactions")}
            >
              <Clock className={getIconStyles("Transactions")} />
              <span>Transactions</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Status Frame */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden bg-gray-50">
                <div className="w-5 h-5 rounded-full bg-[#801818] flex items-center justify-center text-white text-[8px]">
                  👗
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 text-[10px] leading-none">Maria Santos</h5>
                <p className="text-[8px] text-gray-400 mt-0.5">Online</p>
              </div>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm"></span>
          </div>

          <button 
            onClick={() => setShowSignOutModal(true)}
            className="w-full flex items-center space-x-2 px-3 py-1 text-gray-500 hover:text-rose-500 font-medium text-xs transition cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container Viewport Panel Frame */}
      <div className="flex-1 pl-56">
        <div className="p-6 lg:p-8 max-w-[1400px]">
          
          {/* SWITCH RENDERING SYSTEM BASED ON ACTIVETAB */}
          {activeTab === "Collection" ? (
            <>
              {/* Header Content Alignment Admin */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Collection</h1>
                <p className="text-xs text-gray-500 mt-0.5">Browse our premium formal wear collection.</p>
              </div>

              {/* Controls Filter Elements Card Frame */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6">
                <SearchAndFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-sm text-gray-400 font-medium">
                  No items match your search filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onRentClick={(item) => setSelectedProduct(item)} 
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Transaction /> 
          )}

        </div>
      </div>

      {/* Widgets & Overlays */}
      <ChatAssistantWidget products={productsList} />

      {/* Booking Form Modal with dynamic data and success trigger */}
      {selectedProduct && (
        <BookingForm 
          itemName={selectedProduct.name}
          itemPrice={selectedProduct.price}
          onClose={() => setSelectedProduct(null)}
          onBookingSuccess={() => {
            handleBookingSuccess(selectedProduct.name);
            setSelectedProduct(null);
          }}
        />
      )}

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
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-semibold text-white shadow-sm transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}