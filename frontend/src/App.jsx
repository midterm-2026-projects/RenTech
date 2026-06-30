import { useState } from "react";
import KPICards from "./components/KPICards";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Catalog from "./components/Catalog";
import ProductCard from "./components/ProductCard";
import SearchAndFilter from "./components/SearchAndFilter";
import AIBusinessInsights from "./components/AIBusinessInsights";
import SmartInventoryOptimization from "./components/SmartInventoryOptimization";
import CustomerChat from "./components/CustomerChat";
import StaffManagement from "./components/StaffManagement";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  // --- Mock Data for the New Components ---
  const mockInsights = [
    "Rental demand for winter coats is up 20% this week.",
    "Expect a surge in formal wear rentals next month due to prom season."
  ];
  
  const mockSuggestions = [
    "Recommend styling scarves to customers renting coats.",
    "Bundle evening gowns with matching jewelry for a 10% discount."
  ];

  const mockMetrics = {
    totalSales: 5240,
    lowStockItems: 8,
    optimizationScore: 92,
    topSellingItem: 'Classic Black Tuxedo'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          RenTech Component Viewer
        </h1>

        {/* KPI Cards Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            1. KPI Cards Component
          </h2>
          <KPICards />
        </section>

        {/* Analytics Dashboard Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            2. Analytics Dashboard Component
          </h2>
          <AnalyticsDashboard />
        </section>

        {/* Catalog Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            3. Catalog Component
          </h2>
          <Catalog />
        </section>

        {/* Product Card Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            4. Product Card Component
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

        {/* Search & Filter Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            5. Search & Filter Component
          </h2>
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />
        </section>

        {/* --- NEW COMPONENTS ADDED BELOW --- */}

        {/* Generative AI Business Insights Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            6. Generative AI Business Insights
          </h2>
          <AIBusinessInsights 
            insights={mockInsights} 
            suggestions={mockSuggestions} 
          />
        </section>

        {/* Smart Inventory Optimization Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            7. Smart Inventory & Sales Optimization
          </h2>
          <SmartInventoryOptimization 
            metrics={mockMetrics} 
          />
        </section>

        {/* Customer Chat Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            8. Customer Support Assistant
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

        {/* Staff Management Section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            9. Staff Management
          </h2>
          <StaffManagement />
        </section>

      </div>
    </div>
  );
}

export default App;