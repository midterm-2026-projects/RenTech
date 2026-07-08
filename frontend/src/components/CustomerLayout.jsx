import ChatAssistantWidget from './ChatAssistantWidget';

const sampleProducts = [
  { id: 1, name: "Ivory Lace Gown", category: "wedding", color: "ivory" },
  { id: 2, name: "Satin Ballgown", category: "evening", color: "navy" },
  { id: 3, name: "Velvet Cloak", category: "costume", color: "burgundy" },
  { id: 4, name: "Floral Maxi Dress", category: "casual", color: "multi" },
  { id: 5, name: "Red Carpet Gown", category: "evening", color: "red" },
];

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">RenTech</h1>
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="/catalog" className="hover:text-gray-900 transition-colors">Catalog</a>
            <a href="/bookings" className="hover:text-gray-900 transition-colors">My Bookings</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to RenTech</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Browse our collection of premium rental wear and book your perfect outfit.
          </p>
        </div>
      </main>
      <ChatAssistantWidget products={sampleProducts} />
    </div>
  );
};

export default CustomerLayout;
