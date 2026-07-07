import { useState } from "react";
// 1. Import the Sidebar component
import Sidebar from "./components/Sidebar"; 

import KPICards from "./components/KPICards";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Catalog from "./components/Catalog";
import ProductCard from "./components/ProductCard";
import SearchAndFilter from "./components/SearchAndFilter";
import BookingForm from "./components/BookingForm";
import Signup from "./components/SignUp";
import Login from "./components/Login";
import StaffManagement from "./components/StaffManagement";
import AIBusinessInsights from "./components/AIBusinessInsights";
import SmartInventoryOptimization from "./components/SmartInventoryOptimization";
import CustomerChat from "./components/CustomerChat";
import Transaction from "./components/Transaction";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [isBookingOpen, setIsBookingOpen] = useState(true);
  const [extraUsers, setExtraUsers] = useState({});

  const myProducts = [
    {
      name: "Pink Gown",
      price: 5000,
      status: "Available",
      category: "Gowns",
      image: "https://images.unsplash.com/photo-1566699265033-ad62ebca60ee?q=80&w=869&auto=format&fit=crop",
    },
    {
      name: "Ivory White Bridal Gown",
      price: 10000,
      status: "Maintenance",
      category: "Gowns",
      image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=687&auto=format&fit=crop",
    },
    {
      name: "Midnight Blue Plaid Suit",
      price: 3500,
      status: "Overdue",
      category: "Suit",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=880&auto=format&fit=crop",
    },
    {
      name: "Forest Green Slim Fit Suit",
      price: 3200,
      status: "Rented",
      category: "Suit",
      image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=880&auto=format&fit=crop",
    },
  ];

  const filteredProducts = myProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = category === "All" || product.status === category;
    return matchesSearch && matchesStatus;
  });

  const mockInsights = [
    "Rental demand for winter coats is up 20% this week.",
    "Expect a surge in formal wear rentals next month due to prom season.",
  ];

  const mockSuggestions = [
    "Recommend styling scarves to customers renting coats.",
    "Bundle evening gowns with matching jewelry for a 10% discount.",
  ];

  const mockMetrics = {
    totalSales: 5240,
    lowStockItems: 8,
    optimizationScore: 92,
    topSellingItem: "Classic Black Tuxedo",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          rentech Component Viewer
        </h1>

        {!isBookingOpen && (
          <button
            onClick={() => setIsBookingOpen(true)}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition"
          >
            Open Booking Form Test
          </button>
        )}

        {/* 0. Standalone Sidebar Component Preview */}
        <section className="mb-10 bg-white p-4 rounded-xl border border-dashed border-gray-300">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            0. Sidebar Component Preview
          </h2>
          {/* Constraining its height to 400px so it doesn't take up the entire viewport on your test page */}
          <div className="w-64 border rounded-lg overflow-hidden h-[400px]">
            <Sidebar />
          </div>
        </section>

        {/* 1. KPI Cards */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            1. KPI Cards Component
          </h2>
          <KPICards />
        </section>

        {/* 2. Analytics Dashboard */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            2. Analytics Dashboard Component
          </h2>
          <AnalyticsDashboard />
        </section>

        {/* 3. Catalog */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            3. Catalog Component
          </h2>
          <Catalog />
        </section>

        {/* 5. Product Card Heading */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-600 border-b pb-2">
            5. Product Card Component
          </h2>
        </div>

        {/* Collection Grid Container */}
        <section className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Collection</h2>
              <p className="text-sm text-slate-500 mt-1">Browse our premium formal wear.</p>
            </div>
          </div>

          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                No products found matching your filter.
              </div>
            )}
          </div>
        </section>

        {/* 4. Booking Form */}
        {isBookingOpen && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
              4. Booking Form Component
            </h2>
            <BookingForm onClose={() => setIsBookingOpen(false)} />
          </section>
        )}

        {/* 6. Search & Filter */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            6. Search & Filter Component
          </h2>
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />
        </section>

        {/* 7. Login */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            7. Login Component
          </h2>
          <Login
            onLogin={(role) => console.log(`Logged in as ${role}`)}
            onBack={() => console.log("Back pressed")}
          />
        </section>

        {/* 8. Sign Up */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            8. Sign Up Component
          </h2>
          <Signup
            onLogin={(role) => console.log(`Logged in as ${role}`)}
            onBack={() => console.log("Back pressed")}
            onNavigateToLogin={() => console.log("Navigate to login")}
            extraUsers={extraUsers}
            setExtraUsers={setExtraUsers}
          />
        </section>

        {/* 9. AI Business Insights */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            9. Generative AI Business Insights
          </h2>
          <AIBusinessInsights insights={mockInsights} suggestions={mockSuggestions} />
        </section>

        {/* 10. Smart Inventory Optimization */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            10. Smart Inventory & Sales Optimization
          </h2>
          <SmartInventoryOptimization metrics={mockMetrics} />
        </section>

        {/* 11. Customer Chat */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            11. Customer Support Assistant
          </h2>
          <CustomerChat
            products={[
              { id: 1, name: "Ivory Lace Gown", category: "wedding", color: "ivory" },
              { id: 2, name: "Satin Ballgown", category: "evening", color: "navy" },
              { id: 3, name: "Velvet Cloak", category: "costume", color: "burgundy" },
              { id: 4, name: "Floral Maxi Dress", category: "casual", color: "multi" },
              { id: 5, name: "Red Carpet Gown", category: "evening", color: "red" },
            ]}
          />
        </section>

        {/* 12. Staff Management */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            12. Staff Management Component
          </h2>
          <StaffManagement />
        </section>

        {/* 13. Transaction Log */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            13. Transaction Log Component
          </h2>
          <div className="flex justify-center w-full">
            <div className="w-full max-w-7xl px-4">
              <Transaction />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;