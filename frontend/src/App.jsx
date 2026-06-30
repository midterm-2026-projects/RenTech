import { useState } from "react";
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

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [isBookingOpen, setIsBookingOpen] = useState(true);

  const myProducts = [
    {
      name: "Pink Gown",
      price: 5000,
      status: "Available",
      category: "Gowns",
      image:
        "https://images.unsplash.com/photo-1566699265033-ad62ebca60ee?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      name: "Ivory White Bridal Gown",
      price: 10000,
      status: "Maintenance",
      category: "Gowns",
      image:
        "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=687&auto=format&fit=crop",
    },
    {
      name: "Midnight Blue Plaid Suit",
      price: 3500,
      status: "Overdue",
      category: "Suit",
      image:
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=880&auto=format&fit=crop",
    },
    {
      name: "Forest Green Slim Fit Suit",
      price: 3200,
      status: "Rented",
      category: "Suit",
      image:
        "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=880&auto=format&fit=crop",
    },
  ];

  const filteredProducts = myProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      category === "All" || product.status === category;

    return matchesSearch && matchesStatus;
  });

  const [extraUsers, setExtraUsers] = useState({});

  // Mock data for AI components
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
          RenTech Component Viewer
        </h1>

        {!isBookingOpen && (
          <button
            onClick={() => setIsBookingOpen(true)}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition"
          >
            Open Booking Form Test
          </button>
        )}

        {/* KPI Cards */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            1. KPI Cards Component
          </h2>
          <KPICards />
        </section>

        {/* Analytics Dashboard */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            2. Analytics Dashboard Component
          </h2>
          <AnalyticsDashboard />
        </section>

        {/* Catalog */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            3. Catalog Component
          </h2>
          <Catalog />
        </section>

        {/* Collection with Product Cards */}
        <section className="mb-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Collection
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Browse our premium formal wear.
              </p>
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

        {/* Booking Form */}
        {isBookingOpen && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
              4. Booking Form Component
            </h2>
            <BookingForm onClose={() => setIsBookingOpen(false)} />
          </section>
        )}

        {/* Product Card */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            5. Product Card Component
          </h2>
          <ProductCard
            product={{
              name: "Pink Gown",
              price: 5000,
              status: "Available",
              category: "Gowns",
              image:
                "https://images.unsplash.com/photo-1566699265033-ad62ebca60ee?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
          />
        </section>

        {/* Search & Filter */}
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

        {/* Login */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            7. Login Component
          </h2>
          <Login
            onLogin={(role) => console.log(`Logged in as ${role}`)}
            onBack={() => console.log("Back pressed")}
          />
        </section>

        {/* Sign Up */}
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

        {/* AI Business Insights */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            9. Generative AI Business Insights
          </h2>
          <AIBusinessInsights
            insights={mockInsights}
            suggestions={mockSuggestions}
          />
        </section>

        {/* Smart Inventory Optimization */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            10. Smart Inventory & Sales Optimization
          </h2>
          <SmartInventoryOptimization metrics={mockMetrics} />
        </section>

        {/* Customer Chat */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            11. Customer Support Assistant
          </h2>
          <CustomerChat
            products={[
              {
                id: 1,
                name: "Ivory Lace Gown",
                category: "wedding",
                color: "ivory",
              },
              {
                id: 2,
                name: "Satin Ballgown",
                category: "evening",
                color: "navy",
              },
              {
                id: 3,
                name: "Velvet Cloak",
                category: "costume",
                color: "burgundy",
              },
              {
                id: 4,
                name: "Floral Maxi Dress",
                category: "casual",
                color: "multi",
              },
              {
                id: 5,
                name: "Red Carpet Gown",
                category: "evening",
                color: "red",
              },
            ]}
          />
        </section>

        {/* Staff Management */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            12. Staff Management Component
          </h2>
          <StaffManagement />
        </section>
      </div>
    </div>
  );
}

export default App;