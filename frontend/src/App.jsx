import KPICards from './components/KPICards';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function App() {
  return (
    // A light gray background with some padding to make it look nice
    <div className="min-h-screen bg-gray-50 p-8">
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          RenTech Component Viewer
        </h1>

        {/* --- KPI Cards Section --- */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            1. KPI Cards Component
          </h2>
          {/* Rendering the component. It will use the default $0.00 placeholders */}
          <KPICards />
        </section>

        {/* --- Analytics Dashboard Section --- */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b pb-2">
            2. Analytics Dashboard Component
          </h2>
          {/* Rendering the component. It will use the hardcoded chart data */}
          <AnalyticsDashboard />
        </section>
        
      </div>
      
    </div>
  );
}

export default App;