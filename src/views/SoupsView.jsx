import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NightDietSoupsSection } from '../components/health/NightDietSoupsSection';
import { CalorieCalculatorModal } from '../components/health/CalorieCalculatorModal';
import { getJuiceSchedule } from '../services/careProtocolUtils';
import { HEALTHY_DIET_JUICES } from '../services/nightDietSoupData';
import { 
  ArrowLeft, 
  HeartPulse, 
  Moon, 
  Calculator, 
  Sparkles, 
  Droplets,
  Calendar,
  CheckCheck,
  Plus,
  Flame,
  Check
} from 'lucide-react';

export const SoupsView = () => {
  const { 
    setActiveTab, 
    todayStr = new Date().toISOString().split('T')[0],
    healthProtocol = {},
    dailyMeals = [],
    todayCaloriesConsumed = 0,
    logDietItem,
    removeDietMeal,
    habits = []
  } = useApp();

  const [isCalorieCalcOpen, setIsCalorieCalcOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Target calorie budget from health protocol
  const activeCalorieTarget = useMemo(() => {
    const rawTarget = healthProtocol?.calories?.fatLossTarget;
    if (typeof rawTarget === 'string') {
      const match = rawTarget.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return 1400;
  }, [healthProtocol]);

  const caloriesRemaining = Math.max(0, activeCalorieTarget - todayCaloriesConsumed);

  // Alternate-Day Juice Routine Schedule (Today, Tomorrow, Rotation)
  const juiceSchedule = useMemo(() => {
    return getJuiceSchedule(todayStr, healthProtocol?.juiceProtocol);
  }, [todayStr, healthProtocol]);

  // Check if a juice is already logged in today's meals or habits
  const isScheduledJuiceLogged = (juiceName) => {
    if (!juiceName) return false;
    const clean = juiceName.toLowerCase();
    const inMeals = (dailyMeals || []).some(m => m.name && m.name.toLowerCase().includes(clean));
    const inHabits = (habits || []).some(h => 
      h.name && h.name.toLowerCase().includes(clean) && 
      Array.isArray(h.completedDates) && h.completedDates.includes(todayStr)
    );
    return inMeals || inHabits;
  };

  // 1-Click Log Juice from Schedule Banner
  const handleQuickLogJuice = (juice) => {
    if (!juice) return;
    const fullJuice = HEALTHY_DIET_JUICES.find(j => 
      (j.id && j.id === juice.id) || 
      (j.name && j.name.toLowerCase() === juice.name.toLowerCase())
    ) || {
      ...juice,
      type: 'juice',
      calories: 65,
      protein: 1.5,
      carbs: 14,
      fats: 0.1,
      fibre: 3.5,
      servingSize: '1 glass (~300 ml)',
    };

    if (logDietItem) {
      logDietItem({ item: fullJuice });
    }
    showToast(`🥤 "${juice.name}" (${fullJuice.calories} kcal) logged! Reflected in Daily Habits (✓ Done) & Calorie Calculation (+${fullJuice.calories} kcal)`);
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
              <span className="badge badge-primary">🌙 20 NIGHT DIET SOUPS</span>
              <span className="badge badge-warning">🥤 20 FRESH DIET JUICES</span>
              <span className="badge badge-success">🌿 100% OIL-FREE & ZERO SUGAR</span>
              <span className="badge badge-info">🔥 35–190 KCAL</span>
              <span className="badge badge-secondary">🥣 40 RECIPES</span>
            </div>
            <h1 className="soups-page-title">40 Oil-Free Soups & Fresh Diet Juices</h1>
            <p className="soups-page-subtitle">
              Engineered with local fresh ingredients, strictly measured portions, zero cooking oil, and zero added refined sugar. 
              Designed as nutrient-dense, calorie-controlled dinner meals and metabolic hydration drinks to maintain sustainable fat-loss deficits, gut motility, and daytime vitality.
            </p>
          </div>
        </div>
      </div>

      {/* 📊 Live Today's Calorie Calculation & Daily Habits Integration Card */}
      <div className="card soups-live-status-card" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Today's Calorie Calculation & Habit Tracker
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Logged soups & juices automatically sync to Daily Habits & Calorie Budget
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCalorieCalcOpen(true)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <Calculator size={14} />
              <span>Full Calorie Suite</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-sub"
              onClick={() => setActiveTab('habits')}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <span>View Habits Checklist</span>
            </button>
          </div>
        </div>

        {/* Calorie Progress Meter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Consumed Today</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
              {todayCaloriesConsumed} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#94a3b8' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
              From {dailyMeals.length} logged item(s)
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Daily Calorie Target</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              {activeCalorieTarget} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#94a3b8' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.15rem' }}>
              Deficit for fat loss
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Remaining Deficit</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: caloriesRemaining > 0 ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
              {caloriesRemaining} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#94a3b8' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
              {caloriesRemaining > 0 ? 'Within target deficit' : 'Target exceeded'}
            </div>
          </div>
        </div>

        {/* Today's Logged Items Badges Row */}
        {dailyMeals.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: '0.45rem' }}>
              🍽️ Logged Today (Included in Calorie Calculation & Daily Habits):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {dailyMeals.map((meal) => (
                <div 
                  key={meal.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    color: '#f8fafc'
                  }}
                >
                  <span>{meal.icon || '🥣'}</span>
                  <span style={{ fontWeight: 600 }}>{meal.name}</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>+{meal.calories} kcal</span>
                  <span style={{ fontSize: '0.68rem', background: '#10b98125', color: '#10b981', padding: '0.1rem 0.35rem', borderRadius: '8px' }}>
                    ✓ In Habits
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (removeDietMeal) removeDietMeal(meal.id);
                      showToast(`🗑️ Removed ${meal.name} from today's log`);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1rem',
                      lineHeight: 1
                    }}
                    title="Remove item from today's log"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🥤 Alternate-Day Juice Routine Rotation Banner */}
      {juiceSchedule && (
        <div className={`card juice-live-banner ${juiceSchedule.isJuiceDayToday ? 'banner-active-day' : 'banner-rest-day'}`} style={{ marginBottom: '1.5rem' }}>
          <div className="juice-live-left">
            <div 
              className="juice-live-icon-wrap" 
              style={{ 
                backgroundColor: juiceSchedule.isJuiceDayToday && juiceSchedule.todayJuice 
                  ? `${juiceSchedule.todayJuice.color || '#f97316'}25` 
                  : 'rgba(99, 102, 241, 0.15)' 
              }}
            >
              <span style={{ fontSize: '1.85rem', lineHeight: 1 }}>
                {juiceSchedule.isJuiceDayToday && juiceSchedule.todayJuice ? juiceSchedule.todayJuice.emoji : '🥤'}
              </span>
            </div>
            <div className="juice-live-details">
              <div className="juice-live-tag-row">
                <span className={`live-pill ${juiceSchedule.isJuiceDayToday ? 'pill-green' : 'pill-purple'}`}>
                  {juiceSchedule.isJuiceDayToday ? "✨ TODAY'S SCHEDULED JUICE" : '🌿 TODAY IS A REST DAY'}
                </span>
                <span className="live-cadence-pill">Alternate-Days Cadence • 20 Fresh Recipes</span>
              </div>
              {juiceSchedule.isJuiceDayToday && juiceSchedule.todayJuice ? (
                <>
                  <h4 className="juice-live-name">{juiceSchedule.todayJuice.name}</h4>
                  <p className="juice-live-desc">
                    <strong>Benefits:</strong> {juiceSchedule.todayJuice.benefits} • <strong>Ingredients:</strong> {juiceSchedule.todayJuice.ingredients}
                  </p>
                </>
              ) : (
                <>
                  <h4 className="juice-live-name">Rest & Hydrate Today</h4>
                  <p className="juice-live-desc">
                    Rest day from juices. Drink plenty of fresh water & herbal teas. Your next scheduled juice is ready for tomorrow!
                  </p>
                </>
              )}
              <div className="juice-live-tomorrow">
                <Calendar size={13} className="text-sub" />
                <span>
                  <strong>Tomorrow:</strong>{' '}
                  {juiceSchedule.isJuiceDayTomorrow && juiceSchedule.tomorrowJuice ? (
                    <span className="text-primary font-bold">
                      {juiceSchedule.tomorrowJuice.emoji} {juiceSchedule.tomorrowJuice.name} ({juiceSchedule.tomorrowJuice.benefits})
                    </span>
                  ) : (
                    <span className="text-sub">Rest day (Next up: {juiceSchedule.nextJuice ? `${juiceSchedule.nextJuice.emoji} ${juiceSchedule.nextJuice.name}` : 'Next Scheduled Juice'})</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="juice-live-actions">
            {juiceSchedule.isJuiceDayToday && juiceSchedule.todayJuice ? (
              isScheduledJuiceLogged(juiceSchedule.todayJuice.name) ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#10b98122', border: '1px solid #10b98155', borderRadius: '10px', padding: '0.45rem 0.85rem' }}>
                  <CheckCheck size={16} className="text-success" />
                  <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Logged & In Habits Today</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: juiceSchedule.todayJuice.color || '#f97316', borderColor: juiceSchedule.todayJuice.color || '#f97316' }}
                  onClick={() => handleQuickLogJuice(juiceSchedule.todayJuice)}
                >
                  <Plus size={14} />
                  <span>Log to Habits & Calories</span>
                </button>
              )
            ) : (
              juiceSchedule.tomorrowJuice && (
                isScheduledJuiceLogged(juiceSchedule.tomorrowJuice.name) ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#10b98122', border: '1px solid #10b98155', borderRadius: '10px', padding: '0.45rem 0.85rem' }}>
                    <CheckCheck size={16} className="text-success" />
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Logged Today</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleQuickLogJuice(juiceSchedule.tomorrowJuice)}
                    title="Drink this juice today instead"
                  >
                    <span>Drink & Log Today Anyway</span>
                  </button>
                )
              )
            )}
          </div>
        </div>
      )}

      {/* Calorie Calculator Suite Modal */}
      <CalorieCalculatorModal
        isOpen={isCalorieCalcOpen}
        onClose={() => setIsCalorieCalcOpen(false)}
        onApplySuccess={() => showToast('🎉 Calorie targets updated from Calculator!')}
      />

      {/* Full Night Diet Soups & Fresh Juices Component (40 Recipes) */}
      <NightDietSoupsSection 
        compactMode={false}
        onOpenCalorieCalculator={() => setIsCalorieCalcOpen(true)} 
      />
    </div>
  );
};

