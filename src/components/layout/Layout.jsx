import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { QuickAddModal } from '../common/QuickAddModal';

import { DashboardView } from '../../views/DashboardView';
import { RoadmapView } from '../../views/RoadmapView';
import { HabitsView } from '../../views/HabitsView';
import { WatchlistView } from '../../views/WatchlistView';
import { FinanceView } from '../../views/FinanceView';
import { HealthProtocolView } from '../../views/HealthProtocolView';
import { AnalyticsView } from '../../views/AnalyticsView';
import { SettingsView } from '../../views/SettingsView';

export const Layout = () => {
  const { activeTab } = useApp();

  const renderView = () => {
    switch (activeTab) {
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
        return <DashboardView />;
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
