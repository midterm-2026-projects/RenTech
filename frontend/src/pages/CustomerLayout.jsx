import React, { useState, useEffect } from 'react';
import { Menu } from "lucide-react";
import Sidebar from '../components/Sidebar.jsx';
import SearchAndFilter from '../components/SearchAndFilter.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BookingForm from '../components/BookingForm.jsx';
import ChatAssistantWidget from '../components/ChatAssistantWidget.jsx';
import Transaction from '../components/Transaction.jsx';
import ProtectedRoute from '../components/ProtectedRoute';
import { getProducts } from '../services/inventoryApiClient';

function CustomerContent() {
  const [activeTab, setActiveTab] = useState("Collection");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [productsList, setProductsList] = useState(() => {
    const savedProducts = localStorage.getItem('customer_products_list');
    return savedProducts ? JSON.parse(savedProducts) : (ProductCard.products || []);
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getProducts({ limit: 100 })
      .then(result => {
        if (result.status === 'success' && Array.isArray(result.data)) {
          setProductsList(result.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('customer_products_list', JSON.stringify(productsList));
  }, [productsList]);

  const statusOrder = { Available: 0, Rented: 1 };
  const filteredProducts = productsList
    .filter((product) => {
      if (product.status === 'Maintenance' || product.status === 'Overdue') return false;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

  const handleBookingSuccess = (itemName) => {
    setProductsList(prevProducts =>
      prevProducts.map(product =>
        product.name === itemName
          ? { ...product, status: 'Rented' }
          : product
      )
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans antialiased overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 border-r border-gray-200 bg-white">
        <Sidebar
          variant="customer"
          currentTab={activeTab}
          onTabChange={handleTabChange}
        />
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
            <Sidebar
              variant="customer"
              currentTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      )}

      {/* Main content */}
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
                  Customer Portal
                </p>
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                  {activeTab === "Collection" ? "Collection" : "Transactions"}
                </h1>
              </div>
            </div>
            <p className="hidden md:block text-xs text-slate-400 truncate max-w-[320px] text-right ml-auto">
              {activeTab === "Collection"
                ? "Browse our premium formal wear collection."
                : "Track your active and past reservations."}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {activeTab === "Collection" ? (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6">
                <SearchAndFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                />
              </div>

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
        </main>
      </div>

      {/* Widgets & Overlays */}
      <ChatAssistantWidget products={productsList} />

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
    </div>
  );
};

const CustomerLayout = () => (
  <ProtectedRoute allowedRoles={['Customer', 'Staff']}>
    <CustomerContent />
  </ProtectedRoute>
);

export default CustomerLayout;