import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { QuickAddModal } from '../common/QuickAddModal';

import { LoginView } from '../../views/LoginView';
import { AdminView } from '../../views/AdminView';
import { DashboardView } from '../../views/DashboardView';
import { RoadmapView } from '../../views/RoadmapView';
import { HabitsView } from '../../views/HabitsView';
import { WatchlistView } from '../../views/WatchlistView';
import { FinanceView } from '../../views/FinanceView';
import { HealthProtocolView } from '../../views/HealthProtocolView';
import { AnalyticsView } from '../../views/AnalyticsView';
import { SettingsView } from '../../views/SettingsView';

export const Layout = () => {
  const { currentUser } = useAuth();
  const { activeTab } = useApp();

  // If user is not logged in, show Login Portal
  if (!currentUser) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'admin':
        return currentUser.role === 'super_admin' ? <AdminView /> : <DashboardView />;
      case 'dashboard':
        return <DashboardView />;
      case 'watchlists':
      case 'mcu':
      case 'marvel':
        return <WatchlistView />;
      case 'roadmap':
      case 'career':
        return <RoadmapView />;
      case 'habits':
        return <HabitsView />;
      case 'protocol':
      case 'health':
        return <HealthProtocolView />;
      case 'finance':
      case 'budget':
        return <FinanceView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return currentUser.role === 'super_admin' && activeTab === 'admin' ? <AdminView /> : <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Laptop & Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <Header />
        <main className="page-wrapper">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mobile Slide-over Navigation Drawer */}
      <MobileDrawer />

      {/* Universal Quick Action Modal */}
      <QuickAddModal />
    </div>
  );
};
