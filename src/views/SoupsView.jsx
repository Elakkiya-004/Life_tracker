import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NightDietSoupsSection } from '../components/health/NightDietSoupsSection';
import { CalorieCalculatorModal } from '../components/health/CalorieCalculatorModal';
import { 
  ArrowLeft, 
  HeartPulse, 
  Moon, 
  Calculator, 
  Sparkles, 
  Utensils 
} from 'lucide-react';

export const SoupsView = () => {
  const { setActiveTab } = useApp();
  const [isCalorieCalcOpen, setIsCalorieCalcOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="soups-page-view page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="protocol-toast">
          <div className="toast-content">
            <Sparkles size={16} />
            <span>{toastMessage}</span>
          </div>
          <button 
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Top Header / Breadcrumbs Bar */}
      <div className="soups-page-header card">
        <div className="soups-header-nav-row">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm btn-back-protocol"
            onClick={() => setActiveTab('protocol')}
            title="Return to Health & Diet Protocol"
          >
            <ArrowLeft size={16} />
            <span>Back to Health Protocol</span>
          </button>

          <div className="soups-header-breadcrumbs">
            <button 
              type="button" 
              className="breadcrumb-link"
              onClick={() => setActiveTab('protocol')}
            >
              <HeartPulse size={14} className="text-emerald" />
              <span>Health Protocol</span>
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-curr">Soups & Juices</span>
          </div>

          <div className="soups-header-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsCalorieCalcOpen(true)}
            >
              <Calculator size={15} />
              <span>Calorie Calculator</span>
            </button>
          </div>
        </div>

        <div className="soups-header-title-box">
          <div className="soups-header-icon-bubble">
            <Moon size={28} className="text-indigo" />
          </div>
          <div>
            <div className="soup-section-tag-row">
              <span className="badge badge-primary">🌙 NIGHT DIET SOUPS</span>
              <span className="badge badge-warning">🥤 FRESH DIET JUICES</span>
              <span className="badge badge-success">🌿 100% OIL-FREE & ZERO SUGAR</span>
              <span className="badge badge-info">🔥 38–190 KCAL</span>
              <span className="badge badge-secondary">🥣 30 RECIPES</span>
            </div>
            <h1 className="soups-page-title">30 Oil-Free Soups & Fresh Diet Juices</h1>
            <p className="soups-page-subtitle">
              Engineered with local fresh ingredients, strictly measured portions, zero cooking oil, and zero added refined sugar. 
              Designed as nutrient-dense, calorie-controlled dinner meals and metabolic hydration drinks to maintain sustainable fat-loss deficits, gut motility, and daytime vitality.
            </p>
          </div>
        </div>
      </div>

      {/* Calorie Calculator Suite Modal */}
      <CalorieCalculatorModal
        isOpen={isCalorieCalcOpen}
        onClose={() => setIsCalorieCalcOpen(false)}
        onApplySuccess={() => showToast('🎉 Calorie targets updated from Calculator!')}
      />

      {/* Full Night Diet Soups Component */}
      <NightDietSoupsSection 
        compactMode={false}
        onOpenCalorieCalculator={() => setIsCalorieCalcOpen(true)} 
      />
    </div>
  );
};
