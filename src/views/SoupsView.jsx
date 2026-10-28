import React, { useState, useMemo, useEffect } from 'react';
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

export const SoupsView = ({ initialCategory = 'soup' }) => {
  const { 
    activeTab,
    setActiveTab, 
    todayStr = new Date().toISOString().split('T')[0],
    healthProtocol = {},
    dailyMeals = [],
    todayCaloriesConsumed = 0,
    logDietItem,
    removeDietMeal,
    habits = []
  } = useApp();

  const [activeCategory, setActiveCategory] = useState(() => {
    if (initialCategory) return initialCategory;
    if (activeTab === 'juices' || activeTab === 'diet-juices') return 'juice';
    return 'soup';
  });

  const [isCalorieCalcOpen, setIsCalorieCalcOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync category state when initialCategory or activeTab changes
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    } else if (activeTab === 'juices' || activeTab === 'diet-juices') {
      setActiveCategory('juice');
    } else if (activeTab === 'soups' || activeTab === 'diet-soups') {
      setActiveCategory('soup');
    }
  }, [initialCategory, activeTab]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCategorySwitch = (category) => {
    setActiveCategory(category);
    if (category === 'soup' && setActiveTab) {
      setActiveTab('soups');
    } else if (category === 'juice' && setActiveTab) {
      setActiveTab('juices');
    } else if (category === 'all' && setActiveTab) {
      setActiveTab('soups-juices');
    }
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

  // Filter logged meals based on active segregation category
  const filteredMeals = useMemo(() => {
    if (activeCategory === 'soup') {
      return (dailyMeals || []).filter(m => m.type === 'soup' || m.mealType === 'dinner' || (m.tags && m.tags.includes('Soup')));
    }
    if (activeCategory === 'juice') {
      return (dailyMeals || []).filter(m => m.type === 'juice' || m.category === 'Fresh Juice' || (m.tags && m.tags.includes('Juice')));
    }
    return dailyMeals || [];
  }, [dailyMeals, activeCategory]);

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
      logDietItem({ item: fullJuice, isCompleted: false });
    }
    showToast(`🥤 "${juice.name}" (${fullJuice.calories} kcal) logged to Calorie Calculation! Added to Daily Habits (ready for manual tick)`);
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
            <span className="breadcrumb-curr">
              {activeCategory === 'juice' ? 'Fresh Diet Juices' : activeCategory === 'soup' ? 'Night Diet Soups' : 'Soups & Juices'}
            </span>
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

        {/* ========================================================================= */}
        {/* INTERACTIVE SEGREGATION PILL SWITCHER */}
        {/* ========================================================================= */}
        <div className="segregation-switcher-card">
          <div className="segregation-tabs">
            <button
              type="button"
              className={`segregation-tab-btn ${activeCategory === 'soup' ? 'active active-soup' : ''}`}
              onClick={() => handleCategorySwitch('soup')}
            >
              <Moon size={18} />
              <span className="tab-title">Night Diet Soups</span>
              <span className="count-badge count-soup">20</span>
            </button>

            <button
              type="button"
              className={`segregation-tab-btn ${activeCategory === 'juice' ? 'active active-juice' : ''}`}
              onClick={() => handleCategorySwitch('juice')}
            >
              <Droplets size={18} />
              <span className="tab-title">Fresh Diet Juices</span>
              <span className="count-badge count-juice">20</span>
            </button>

            <button
              type="button"
              className={`segregation-tab-btn ${activeCategory === 'all' ? 'active active-all' : ''}`}
              onClick={() => handleCategorySwitch('all')}
            >
              <Sparkles size={16} />
              <span className="tab-title">All Recipes</span>
              <span className="count-badge count-all">40</span>
            </button>
          </div>
        </div>

        {/* Dynamic Segregated Header Banner */}
        <div className="soups-header-title-box">
          <div className="soups-header-icon-bubble" style={{
            background: activeCategory === 'juice' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            borderColor: activeCategory === 'juice' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(99, 102, 241, 0.35)'
          }}>
            {activeCategory === 'juice' ? (
              <Droplets size={28} className="text-warning" />
            ) : (
              <Moon size={28} className="text-indigo" />
            )}
          </div>
          <div>
            {activeCategory === 'soup' ? (
              <>
                <div className="soup-section-tag-row">
                  <span className="badge badge-primary">🌙 20 NIGHT DIET SOUPS</span>
                  <span className="badge badge-success">🌿 100% OIL-FREE</span>
                  <span className="badge badge-info">🔥 95–190 KCAL</span>
                  <span className="badge badge-secondary">🥣 LIGHT DINNER REPLACEMENT</span>
                  <span className="badge badge-warning">🛡️ HIGH PROTEIN & FIBRE</span>
                </div>
                <h1 className="soups-page-title">20 Oil-Free Night Diet Dinner Soups</h1>
                <p className="soups-page-subtitle">
                  Engineered with Tamil Nadu local fresh ingredients, strictly measured dry portions, and zero cooking oil, ghee, or butter. 
                  Complete nutrient-dense dinner meals designed to keep you full overnight without bedtime hunger while preserving lean muscle and maintaining a sustainable fat-loss deficit.
                </p>
              </>
            ) : activeCategory === 'juice' ? (
              <>
                <div className="soup-section-tag-row">
                  <span className="badge badge-warning">🥤 20 FRESH DIET JUICES</span>
                  <span className="badge badge-success">🌿 100% RAW & ZERO ADDED SUGAR</span>
                  <span className="badge badge-info">🔥 35–85 KCAL</span>
                  <span className="badge badge-secondary">⚡ METABOLIC HYDRATION</span>
                  <span className="badge badge-primary">💧 ZERO FAT & HIGH POTASSIUM</span>
                </div>
                <h1 className="soups-page-title">20 Fresh Detox & Metabolic Diet Juices</h1>
                <p className="soups-page-subtitle">
                  Engineered with cold-pressed local ingredients, natural electrolytes, zero refined sugar, and zero artificial sweeteners. 
                  Designed for morning empty stomach cleansing, daytime metabolic hydration, liver detox, and steady metabolic energy between meals.
                </p>
              </>
            ) : (
              <>
                <div className="soup-section-tag-row">
                  <span className="badge badge-primary">🌙 20 NIGHT DIET SOUPS</span>
                  <span className="badge badge-warning">🥤 20 FRESH DIET JUICES</span>
                  <span className="badge badge-success">🌿 100% OIL-FREE & ZERO SUGAR</span>
                  <span className="badge badge-info">🔥 35–190 KCAL</span>
                  <span className="badge badge-secondary">🥣 40 RECIPES</span>
                </div>
                <h1 className="soups-page-title">40 Oil-Free Soups & Fresh Diet Juices</h1>
                <p className="soups-page-subtitle">
                  Segregated collection of 20 oil-free dinner soups and 20 cold fresh metabolic diet juices. 
                  Engineered with local fresh ingredients, strictly measured portions, zero cooking oil, and zero added refined sugar.
                </p>
              </>
            )}
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
                {activeCategory === 'soup' 
                  ? 'Night soups logged to dinner sync to Calorie Calculation & Daily Habits (Manual Tick)'
                  : activeCategory === 'juice'
                    ? 'Fresh diet juices logged sync to Calorie Calculation & Daily Habits (Manual Tick)'
                    : 'Logged soups & juices sync to Calorie Budget & Daily Habits (Manual Tick)'}
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
        {filteredMeals.length > 0 ? (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: '0.45rem' }}>
              {activeCategory === 'soup' 
                ? '🥣 Logged Night Soups Today (In Calorie Calculation & Daily Habits):'
                : activeCategory === 'juice'
                  ? '🥤 Logged Fresh Juices Today (In Calorie Calculation & Daily Habits):'
                  : '🍽️ Logged Items Today (In Calorie Calculation & Daily Habits):'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {filteredMeals.map((meal) => (
                <div 
                  key={meal.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: meal.type === 'juice' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    border: meal.type === 'juice' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    color: '#f8fafc'
                  }}
                >
                  <span>{meal.icon || (meal.type === 'juice' ? '🥤' : '🥣')}</span>
                  <span style={{ fontWeight: 600 }}>{meal.name}</span>
                  <span style={{ color: meal.type === 'juice' ? '#fbbf24' : '#38bdf8', fontWeight: 700 }}>+{meal.calories} kcal</span>
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
        ) : (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.6rem', fontSize: '0.8rem', color: '#64748b' }}>
            {activeCategory === 'soup' 
              ? '🌙 No night soup logged yet today. Choose from the 20 recipes below and click "+ Log to Today\'s Dinner"!'
              : activeCategory === 'juice'
                ? '🥤 No fresh juice logged yet today. Choose from the 20 recipes below and click "+ Log to Daily Meals"!'
                : '🥣 No soup or juice logged yet today.'}
          </div>
        )}
      </div>

      {/* 🥤 Alternate-Day Juice Routine Rotation Banner (ONLY for Juices or All) */}
      {(activeCategory === 'juice' || activeCategory === 'all') && juiceSchedule && (
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

      {/* Full Night Diet Soups & Fresh Juices Section with Category Filter */}
      <NightDietSoupsSection 
        compactMode={false}
        categoryFilter={activeCategory}
        onOpenCalorieCalculator={() => setIsCalorieCalcOpen(true)} 
      />
    </div>
  );
};
