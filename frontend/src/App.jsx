import { useState } from 'react';
import KPICards from './components/KPICards';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Catalog from './components/Catalog';
import ProductCard from './components/ProductCard';
import SearchAndFilter from './components/SearchAndFilter';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const myProducts = [
    {
      name: "Pink Gown",
      price: 5000,
      status: "Available",
      category: "Gowns",
      image: "https://images.unsplash.com/photo-1566699265033-ad62ebca60ee?q=80&w=869&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Ivory White Bridal Gown",
      price: 10000,
      status: "Maintenance",
      category: "Gowns",
      image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=687&auto=format&fit=crop"
    },
    {
      name: "Midnight Blue Plaid Suit",
      price: 3500,
      status: "Overdue",
      category: "Suit",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=880&auto=format&fit=crop"
    },
    {
      name: "Forest Green Slim Fit Suit",
      price: 3200,
      status: "Rented",
      category: "Suit",
      image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=880&auto=format&fit=crop"
    }
  ];

  const filteredProducts = myProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = category === "All" || product.status === category;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          RenTech Component Viewer
        </h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            1. KPI Cards Component
          </h2>
          <KPICards />
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            2. Analytics Dashboard Component
          </h2>
          <AnalyticsDashboard />
        </section>

        <Catalog />

        <section className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Collection</h2>
              <p className="text-sm text-slate-500 mt-1">Browse our premium formal wear.</p>
            </div>
            
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={category}
              onCategoryChange={setCategory}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      </div>
    </div>
  );
}

export default App;