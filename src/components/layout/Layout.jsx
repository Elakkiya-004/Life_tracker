import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';
import { QuickAddModal } from '../common/QuickAddModal';
import { ProfileModal } from '../profile/ProfileModal';

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
  const { currentUser, isMenuVisible, isSuperAdmin, isProfileModalOpen, setIsProfileModalOpen } = useAuth();
  const { activeTab } = useApp();

  // If user is not logged in, show Login Portal
  if (!currentUser) {
    return <LoginView />;
  }

  const renderView = () => {
    if (activeTab === 'admin') {
      return isSuperAdmin ? <AdminView /> : <DashboardView />;
    }

    // Guard disabled modules for regular users
    const mapTabToMenuId = {
      dashboard: 'dashboard',
      habits: 'habits',
      protocol: 'protocol',
      health: 'protocol',
      roadmap: 'roadmap',
      career: 'roadmap',
      watchlists: 'watchlists',
      mcu: 'watchlists',
      marvel: 'watchlists',
      finance: 'finance',
      budget: 'finance',
      analytics: 'analytics',
      settings: 'settings',
    };

    const menuId = mapTabToMenuId[activeTab] || activeTab;
    if (!isSuperAdmin && !isMenuVisible(menuId)) {
      return <DashboardView />;
    }

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
        return isSuperAdmin && activeTab === 'admin' ? <AdminView /> : <DashboardView />;
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

      {/* User & Admin Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
