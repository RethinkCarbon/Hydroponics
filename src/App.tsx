import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { LoginModal } from '@/components/dashboard/LoginModal';
import { OverviewPage } from '@/components/dashboard/OverviewPage';
import { ClimatePage } from '@/components/dashboard/ClimatePage';
import { LightingPage } from '@/components/dashboard/LightingPage';
import { IrrigationPage } from '@/components/dashboard/IrrigationPage';
import { ECPage } from '@/components/dashboard/ECPage';
import { PHPage } from '@/components/dashboard/PHPage';
import { UVPage } from '@/components/dashboard/UVPage';
import { AlertsPage } from '@/components/dashboard/AlertsPage';
import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage';
import { SettingsPage } from '@/components/dashboard/SettingsPage';
import { BatchCertificationPage } from '@/components/dashboard/BatchCertificationPage';
import { MarketPricesPage } from '@/components/dashboard/MarketPricesPage';
import { SalesPage } from '@/components/dashboard/SalesPage';
import { EconomicsPage } from '@/components/dashboard/EconomicsPage';
import { InventoryPage } from '@/components/dashboard/InventoryPage';
import { useGreenhouseData } from '@/hooks/useGreenhouseData';
import type { UserRole } from '@/types/greenhouse';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('operator');
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { state, trendData, activeAlertsCount, criticalAlertsCount, actions } = useGreenhouseData();

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('operator');
    setActiveView('overview');
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewPage state={state} onViewChange={setActiveView} />;
      case 'climate':
        return <ClimatePage state={state} actions={actions} />;
      case 'lighting':
        return <LightingPage state={state} actions={actions} />;
      case 'irrigation':
        return <IrrigationPage state={state} actions={actions} />;
      case 'ec':
        return <ECPage state={state} actions={actions} />;
      case 'ph':
        return <PHPage state={state} actions={actions} />;
      case 'uv':
        return <UVPage state={state} actions={actions} />;
      case 'alerts':
        return <AlertsPage state={state} onViewChange={setActiveView} actions={actions} />;
      case 'analytics':
        return <AnalyticsPage trendData={trendData} />;
      case 'settings':
        return <SettingsPage userRole={userRole} />;
      // Workstreams
      case 'certification':
        return <BatchCertificationPage data={state.certification} />;
      case 'market':
        return <MarketPricesPage data={state.market} />;
      case 'sales':
        return <SalesPage data={state.sales} actions={actions} />;
      case 'economics':
        return <EconomicsPage data={state.economics} />;
      case 'inventory':
        return <InventoryPage data={state.inventory} actions={actions} />;
      default:
        return <OverviewPage state={state} onViewChange={setActiveView} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard-root flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        userRole={userRole}
        activeAlertsCount={activeAlertsCount}
        criticalAlertsCount={criticalAlertsCount}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="dashboard-main flex-1 min-w-0 overflow-y-auto custom-scrollbar">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 flex-shrink-0"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 capitalize truncate">
                  {activeView === 'overview' ? 'Dashboard' : activeView.replace(/_/g, ' ').replace(/-/g, ' ')}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-100">
                <div className="connection-online" />
                <span className="text-xs text-slate-600">Online</span>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Last Update</p>
                <p className="text-sm font-mono text-teal-600">
                  {state.lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-main-content min-h-[calc(100vh-80px)] bg-slate-50 px-3 py-4 sm:px-6 sm:py-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
