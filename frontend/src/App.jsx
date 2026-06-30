import { useState } from "react";
import KPICards from "./components/KPICards";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import Catalog from "./components/Catalog";
import ProductCard from "./components/ProductCard";
import SearchAndFilter from "./components/SearchAndFilter";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

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
      </div>
    </div>
  );
}

export default App;