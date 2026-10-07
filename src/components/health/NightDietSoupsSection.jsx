import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Moon, 
  Plus, 
  Check, 
  Search, 
  Sparkles, 
  Calculator, 
  ShieldCheck, 
  Droplets, 
  Calendar, 
  Info, 
  Table, 
  LayoutGrid, 
  Apple,
  Award,
  BookOpen,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { 
  NIGHT_DIET_SOUPS, 
  WEEKLY_SOUP_ROTATION, 
  SOUP_WEIGHT_LOSS_TIPS,
  getTodaySoupRotation,
  logSoupToDailyMeals
} from '../../services/nightDietSoupData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const NightDietSoupsSection = ({ onOpenCalorieCalculator }) => {
  const { todayStr = new Date().toISOString().split('T')[0] } = useApp();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid || 'default_user';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedSoupModal, setSelectedSoupModal] = useState(null);
  const [justLoggedId, setJustLoggedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedDayTab, setSelectedDayTab] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  });

  // Today's suggested soup based on weekly rotation
  const todayRotation = useMemo(() => {
    return getTodaySoupRotation(todayStr);
  }, [todayStr]);

  // Selected day's rotation
  const currentDayRotation = useMemo(() => {
    const rot = WEEKLY_SOUP_ROTATION.find(r => r.day === selectedDayTab) || WEEKLY_SOUP_ROTATION[0];
    const primary = NIGHT_DIET_SOUPS.find(s => s.id === rot.soupId);
    const vegAlt = NIGHT_DIET_SOUPS.find(s => s.id === rot.vegAltId);
    return { rot, primary, vegAlt };
  }, [selectedDayTab]);

  // Filtered soups
  const filteredSoups = useMemo(() => {
    return NIGHT_DIET_SOUPS.filter(soup => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        soup.name.toLowerCase().includes(q) ||
        soup.tamilName.toLowerCase().includes(q) ||
        soup.categoryTag.toLowerCase().includes(q) ||
        soup.description.toLowerCase().includes(q) ||
        soup.ingredients.some(i => i.item.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Under 130 kcal') return soup.calories <= 130;
      if (selectedFilter === 'High Protein') return soup.protein >= 8.0;
      if (selectedFilter === 'Vegetarian') return soup.category === 'Vegetarian';
      if (selectedFilter === 'Greens / Keerai') return soup.tags.includes('Greens / Keerai');
      if (selectedFilter === 'Non-Veg & Egg') return soup.category === 'Non-Vegetarian' || soup.category === 'Eggetarian';
      if (selectedFilter === 'Traditional Kollu') return soup.tags.includes('Traditional Kollu');

      return true;
    });
  }, [searchQuery, selectedFilter]);

  // Quick Log Soup to Dinner in Calorie Tracker
  const handleLogSoup = (soup, e) => {
    if (e) e.stopPropagation();
    const result = logSoupToDailyMeals(soup, 'dinner', todayStr, currentUserId);
    if (result.success) {
      setJustLoggedId(soup.id);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
      
      setToastMessage(`🥣 "${soup.name}" (${soup.calories} kcal) logged to Today's Dinner in Calorie Tracker!`);
      setTimeout(() => {
        setJustLoggedId(null);
        setToastMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="section-container night-diet-soups-section">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="soup-toast-banner">
          <Sparkles size={16} className="text-amber" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="section-title-row">
        <div className="title-with-icon">
          <Moon size={22} className="text-indigo" />
          <div>
            <div className="soup-section-tag-row">
              <span className="badge badge-primary">🌙 NIGHT DIET PROTOCOL</span>
              <span className="badge badge-success">🌿 100% OIL-FREE</span>
              <span className="badge badge-warning">🔥 95–190 KCAL</span>
            </div>
            <h3 className="section-title">20 Oil-Free Night Diet Soups for Weight Management</h3>
          </div>
        </div>

        <div className="title-actions">
          <div className="view-toggle-btns">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Cards Grid View"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Macro Table View"
            >
              <Table size={14} />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onOpenCalorieCalculator}
            title="Open Calorie Tracker & Meal Plate"
          >
            <Calculator size={14} />
            <span>Calorie Calculator</span>
          </button>
        </div>
      </div>

      <p className="soup-section-subtitle">
        Tamil Nadu Local-Market Ingredients • Measured Portions • Calorie-Tracker Friendly • Zero Cooking Oil, Ghee, or Butter. 
        Engineered as complete light dinner meals to maintain sustainable fat-loss calorie deficits without bedtime hunger.
      </p>

      {/* Highlights Grid */}
      <div className="soup-stats-summary-grid">
        <div className="card soup-stat-card">
          <div className="soup-stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Moon size={18} />
          </div>
          <div>
            <span className="soup-stat-val">20 Recipes</span>
            <span className="soup-stat-lbl">Local Tamil Nadu market staples</span>
          </div>
        </div>

        <div className="card soup-stat-card highlight">
          <div className="soup-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Flame size={18} />
          </div>
          <div>
            <span className="soup-stat-val">95 – 190 kcal</span>
            <span className="soup-stat-lbl">Predictable, measured portions</span>
          </div>
        </div>

        <div className="card soup-stat-card">
          <div className="soup-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="soup-stat-val">0g Added Oil</span>
            <span className="soup-stat-lbl">No ghee, butter, cream, or cubes</span>
          </div>
        </div>

        <div className="card soup-stat-card">
          <div className="soup-stat-icon-wrap" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
            <Award size={18} />
          </div>
          <div>
            <span className="soup-stat-val">Up to 29g Protein</span>
            <span className="soup-stat-lbl">High overnight muscle preservation</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TODAY'S RECOMMENDED NIGHT DIET SOUP BANNER */}
      {/* ========================================================================= */}
      {todayRotation && todayRotation.primarySoup && (
        <div className="today-soup-feature-card card">
          <div className="feature-top-badge">
            <Calendar size={13} />
            <span>TODAY'S SUGGESTED NIGHT DIET SOUP ({todayRotation.dayName.toUpperCase()})</span>
          </div>

          <div className="feature-main-content">
            <div className="feature-left-info">
              <div className="feature-avatar-box">
                <span className="feature-emoji">{todayRotation.primarySoup.emoji}</span>
              </div>
              <div className="feature-titles">
                <div className="feature-tag-line">
                  <span className="feature-cat-tag">{todayRotation.primarySoup.categoryTag}</span>
                  <span className="feature-tamil-tag">{todayRotation.primarySoup.tamilName}</span>
                </div>
                <h4 className="feature-title">{todayRotation.primarySoup.name}</h4>
                <p className="feature-desc">{todayRotation.primarySoup.description}</p>
              </div>
            </div>

            {/* Macro Summary Pill Box */}
            <div className="feature-macros-cluster">
              <div className="feature-macro-badge cal">
                <span className="macro-num">{todayRotation.primarySoup.calories}</span>
                <span className="macro-unit">kcal</span>
              </div>
              <div className="feature-macro-badge">
                <span className="macro-num">{todayRotation.primarySoup.protein}g</span>
                <span className="macro-unit">Protein</span>
              </div>
              <div className="feature-macro-badge">
                <span className="macro-num">{todayRotation.primarySoup.carbs}g</span>
                <span className="macro-unit">Carbs</span>
              </div>
              <div className="feature-macro-badge">
                <span className="macro-num">{todayRotation.primarySoup.fibre}g</span>
                <span className="macro-unit">Fibre</span>
              </div>
            </div>

            <div className="feature-actions">
              <button
                type="button"
                className={`btn btn-primary btn-log-feature ${justLoggedId === todayRotation.primarySoup.id ? 'btn-logged' : ''}`}
                onClick={(e) => handleLogSoup(todayRotation.primarySoup, e)}
              >
                {justLoggedId === todayRotation.primarySoup.id ? <Check size={16} /> : <Plus size={16} />}
                <span>{justLoggedId === todayRotation.primarySoup.id ? 'Logged to Dinner!' : 'Log to Today\'s Dinner'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedSoupModal(todayRotation.primarySoup)}
                title="Open Recipe & Cooking Method in Modal"
              >
                <BookOpen size={14} />
                <span>Recipe & Method</span>
              </button>
            </div>
          </div>

          {/* Quick Veg Alternative Note if applicable */}
          {todayRotation.vegAltSoup && (
            <div className="feature-alt-footer">
              <span className="alt-label">🌱 Vegetarian Alternative:</span>
              <span className="alt-name">{todayRotation.vegAltSoup.name} ({todayRotation.vegAltSoup.calories} kcal, {todayRotation.vegAltSoup.protein}g protein)</span>
              <button
                type="button"
                className="btn-link-action"
                onClick={() => setSelectedSoupModal(todayRotation.vegAltSoup)}
              >
                View Veg Recipe
              </button>
              <button
                type="button"
                className="btn-link-action"
                onClick={(e) => handleLogSoup(todayRotation.vegAltSoup, e)}
              >
                + Log Veg Alternative
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* WEEKLY DINNER ROTATION SCHEDULE STRIP */}
      {/* ========================================================================= */}
      <div className="card weekly-soup-schedule-card">
        <div className="schedule-header">
          <div className="schedule-title-left">
            <Calendar size={16} className="text-primary" />
            <span className="schedule-title">7-Day Night Diet Dinner Rotation</span>
          </div>
          <span className="schedule-note">Rotate weekly for balanced macronutrients, greens & micronutrients</span>
        </div>

        <div className="schedule-day-tabs">
          {WEEKLY_SOUP_ROTATION.map(r => (
            <button
              key={r.day}
              type="button"
              className={`schedule-day-tab ${selectedDayTab === r.day ? 'active' : ''}`}
              onClick={() => setSelectedDayTab(r.day)}
            >
              <span className="day-name">{r.day.slice(0, 3)}</span>
              <span className="day-soup-hint">{r.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Selected Day Preview Banner */}
        <div className="schedule-selected-preview">
          <div className="sel-day-meta">
            <span className="sel-day-tag">{currentDayRotation.rot.day} Focus:</span>
            <span className="sel-focus-text">{currentDayRotation.rot.focus}</span>
          </div>

          <div className="sel-soups-row">
            {currentDayRotation.primary && (
              <div className="sel-soup-item">
                <span className="sel-role">Primary Choice:</span>
                <span className="sel-soup-name">{currentDayRotation.primary.emoji} {currentDayRotation.primary.name}</span>
                <span className="sel-soup-cals">{currentDayRotation.primary.calories} kcal • {currentDayRotation.primary.protein}g protein</span>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => setSelectedSoupModal(currentDayRotation.primary)}
                    title="View Recipe in Modal"
                  >
                    <BookOpen size={11} />
                    <span>Recipe</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-xs"
                    onClick={(e) => handleLogSoup(currentDayRotation.primary, e)}
                  >
                    + Log
                  </button>
                </div>
              </div>
            )}

            {currentDayRotation.vegAlt && (
              <div className="sel-soup-item veg-alt">
                <span className="sel-role">🌱 Veg / Alternate:</span>
                <span className="sel-soup-name">{currentDayRotation.vegAlt.emoji} {currentDayRotation.vegAlt.name}</span>
                <span className="sel-soup-cals">{currentDayRotation.vegAlt.calories} kcal • {currentDayRotation.vegAlt.protein}g protein</span>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => setSelectedSoupModal(currentDayRotation.vegAlt)}
                    title="View Recipe in Modal"
                  >
                    <BookOpen size={11} />
                    <span>Recipe</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={(e) => handleLogSoup(currentDayRotation.vegAlt, e)}
                  >
                    + Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH & FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="soup-filter-toolbar">
        <div className="soup-search-wrap">
          <Search size={15} className="soup-search-icon" />
          <input
            type="text"
            placeholder="Search by ingredient or name (e.g. kollu, keerai, chicken, pumpkin, chow chow)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="soup-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="soup-filter-chips">
          {[
            'All',
            'Under 130 kcal',
            'High Protein',
            'Vegetarian',
            'Greens / Keerai',
            'Non-Veg & Egg',
            'Traditional Kollu',
          ].map(f => (
            <button
              key={f}
              type="button"
              className={`soup-filter-chip ${selectedFilter === f ? 'active' : ''}`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="soup-results-meta">
        <span>Showing {filteredSoups.length} of {NIGHT_DIET_SOUPS.length} oil-free recipes</span>
        {selectedFilter !== 'All' && (
          <span className="active-filter-badge">Filter: {selectedFilter}</span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CARDS GRID */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="soups-cards-grid">
          {filteredSoups.map(soup => {
            const isJustLogged = justLoggedId === soup.id;

            return (
              <div 
                key={soup.id} 
                className="card soup-recipe-card"
              >
                {/* Top Card Bar */}
                <div className="soup-card-top">
                  <div className="soup-card-left">
                    <span className="soup-card-emoji">{soup.emoji}</span>
                    <div>
                      <div className="soup-card-category-line">
                        <span className="soup-category-pill">{soup.categoryTag}</span>
                        {soup.isLowCalorie && <span className="soup-low-cal-pill">&lt;100 kcal</span>}
                        {soup.isHighProtein && <span className="soup-protein-pill">High Protein</span>}
                      </div>
                      <h4 className="soup-card-title">{soup.name}</h4>
                      <span className="soup-tamil-subtitle">{soup.tamilName}</span>
                    </div>
                  </div>

                  <div className="soup-card-right-cal">
                    <span className="card-cal-num">{soup.calories}</span>
                    <span className="card-cal-lbl">kcal</span>
                  </div>
                </div>

                <p className="soup-card-desc">{soup.description}</p>

                {/* Macros Badges Row */}
                <div className="soup-macros-row">
                  <div className="soup-m-pill protein">
                    <span className="m-val">{soup.protein}g</span>
                    <span className="m-lbl">Protein</span>
                  </div>
                  <div className="soup-m-pill carbs">
                    <span className="m-val">{soup.carbs}g</span>
                    <span className="m-lbl">Carbs</span>
                  </div>
                  <div className="soup-m-pill fibre">
                    <span className="m-val">{soup.fibre}g</span>
                    <span className="m-lbl">Fibre</span>
                  </div>
                  <div className="soup-m-pill fat">
                    <span className="m-val">0g</span>
                    <span className="m-lbl">Oil</span>
                  </div>
                </div>

                {/* Serving Size Info */}
                <div className="soup-portion-indicator">
                  <Droplets size={12} className="text-sub" />
                  <span>Serving: {soup.servingSize} ({soup.waterMl} ml water)</span>
                </div>

                {/* Card Actions */}
                <div className="soup-card-actions">
                  <button
                    type="button"
                    className={`btn btn-primary btn-sm btn-log-soup ${isJustLogged ? 'btn-logged' : ''}`}
                    onClick={(e) => handleLogSoup(soup, e)}
                    title="Log directly to Today's Dinner in Calorie Tracker"
                  >
                    {isJustLogged ? <Check size={14} /> : <Plus size={14} />}
                    <span>{isJustLogged ? 'Logged to Dinner!' : '+ Log to Dinner'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedSoupModal(soup)}
                    title="View measured ingredients and step-by-step cooking method in modal"
                  >
                    <BookOpen size={14} />
                    <span>Recipe & Method</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CALORIE & MACRO COMPARISON TABLE */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="card soup-table-card">
          <div className="table-responsive">
            <table className="soup-macro-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Soup Name</th>
                  <th>Category</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fibre</th>
                  <th>Portion</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSoups.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-sub font-mono">{idx + 1}</td>
                    <td>
                      <div className="tbl-soup-name-cell">
                        <span className="tbl-emoji">{s.emoji}</span>
                        <div>
                          <strong className="tbl-title">{s.name}</strong>
                          <span className="tbl-tamil">{s.tamilName}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="tbl-cat-badge">{s.categoryTag}</span>
                    </td>
                    <td>
                      <span className="tbl-cal-bold">{s.calories} kcal</span>
                    </td>
                    <td>
                      <span className="tbl-protein-pill">{s.protein}g</span>
                    </td>
                    <td>
                      <span className="tbl-stat">{s.carbs}g</span>
                    </td>
                    <td>
                      <span className="tbl-stat">{s.fibre}g</span>
                    </td>
                    <td className="text-sub text-xs">
                      {s.servingSize}
                    </td>
                    <td>
                      <div className="tbl-actions-cell" style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => setSelectedSoupModal(s)}
                          title="View Recipe & Cooking Method in Modal"
                        >
                          <BookOpen size={12} />
                          <span>Recipe</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={(e) => handleLogSoup(s, e)}
                          title="Add to today's dinner log"
                        >
                          <Plus size={12} />
                          <span>Log</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRACTICAL WEIGHT MANAGEMENT & TRACKER ENTRY GUIDE */}
      {/* ========================================================================= */}
      <div className="soup-guide-box card">
        <div className="guide-header-line">
          <Info size={16} className="text-primary" />
          <h4 className="guide-title">Practical Weight Management & Calorie Tracker Guidelines</h4>
        </div>

        <div className="guide-cards-grid">
          {SOUP_WEIGHT_LOSS_TIPS.map((tip, i) => (
            <div key={i} className="guide-card">
              <h5 className="guide-card-title">
                <Check size={14} className="text-success" />
                <span>{tip.title}</span>
              </h5>
              <p className="guide-card-desc">{tip.desc}</p>
            </div>
          ))}
        </div>

        <div className="guide-entry-note">
          <strong>Calorie Tracker Entry Rule:</strong> Weigh dry ingredients before cooking for maximum tracking precision. 
          When logging from our built-in Calorie Calculator, select <em>Night Diet Soups</em> to log the complete 1-serving recipe in a single click!
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECIPE & METHOD MODAL (CLEAN POPUP DIALOG - NOT DROPDOWN) */}
      {/* ========================================================================= */}
      {selectedSoupModal && (
        <Modal
          isOpen={!!selectedSoupModal}
          onClose={() => setSelectedSoupModal(null)}
          maxWidth="640px"
          title={
            <div className="soup-modal-title-bar">
              <span className="soup-modal-title-emoji">{selectedSoupModal.emoji}</span>
              <div className="soup-modal-title-texts">
                <div className="soup-modal-title-main">{selectedSoupModal.name}</div>
                <div className="soup-modal-title-tamil">{selectedSoupModal.tamilName}</div>
              </div>
            </div>
          }
        >
          <div className="soup-recipe-modal-body">
            {/* Top Macro Summary Strip */}
            <div className="modal-macro-strip">
              <div className="modal-macro-badge cal">
                <span className="m-val">{selectedSoupModal.calories}</span>
                <span className="m-lbl">kcal</span>
              </div>
              <div className="modal-macro-badge protein">
                <span className="m-val">{selectedSoupModal.protein}g</span>
                <span className="m-lbl">Protein</span>
              </div>
              <div className="modal-macro-badge carbs">
                <span className="m-val">{selectedSoupModal.carbs}g</span>
                <span className="m-lbl">Carbs</span>
              </div>
              <div className="modal-macro-badge fibre">
                <span className="m-val">{selectedSoupModal.fibre}g</span>
                <span className="m-lbl">Fibre</span>
              </div>
              <div className="modal-macro-badge oil">
                <span className="m-val">0g</span>
                <span className="m-lbl">Oil / Ghee</span>
              </div>
            </div>

            {/* Badges Row */}
            <div className="modal-meta-row">
              <span className="badge badge-primary">{selectedSoupModal.categoryTag}</span>
              <span className="badge badge-success">🌿 100% Oil-Free</span>
              <span className="badge badge-warning">🥣 {selectedSoupModal.servingSize}</span>
              <span className="badge badge-info">💧 {selectedSoupModal.waterMl} ml Water</span>
            </div>

            {/* Description */}
            <p className="modal-soup-description">
              {selectedSoupModal.description}
            </p>

            {/* Section 1: Measured Ingredients */}
            <div className="modal-section-box">
              <div className="modal-section-header">
                <Utensils size={16} className="text-primary" />
                <h5 className="modal-section-heading">Measured Ingredients (1 Complete Serving)</h5>
              </div>
              <div className="modal-ingredients-grid">
                {selectedSoupModal.ingredients.map((ing, i) => (
                  <div key={i} className="modal-ing-card">
                    <span className="modal-ing-bullet">•</span>
                    <span className="modal-ing-name">{ing.item}</span>
                    <span className="modal-ing-amount">{ing.amount}</span>
                  </div>
                ))}
              </div>
              <div className="modal-water-note">
                <Droplets size={13} className="text-info" />
                <span>Base Cooking Liquid: <strong>{selectedSoupModal.waterMl} ml fresh drinking water</strong> (no cooking oil, ghee, butter, or stock cubes).</span>
              </div>
            </div>

            {/* Section 2: Step-by-Step Cooking Method */}
            <div className="modal-section-box">
              <div className="modal-section-header">
                <Flame size={16} className="text-warning" />
                <h5 className="modal-section-heading">Step-by-Step Cooking Method</h5>
              </div>
              <div className="modal-method-steps">
                {selectedSoupModal.method.split('. ').filter(Boolean).map((step, idx) => (
                  <div key={idx} className="modal-step-row">
                    <div className="step-number-bubble">{idx + 1}</div>
                    <div className="step-text">{step.endsWith('.') ? step : `${step}.`}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Zero-Oil Seasoning & Spices */}
            <div className="modal-section-box highlight-spices">
              <div className="modal-section-header">
                <Sparkles size={16} className="text-amber" />
                <h5 className="modal-section-heading">Zero-Oil Seasoning & Tamil Nadu Market Spices</h5>
              </div>
              <p className="modal-seasoning-text">
                {selectedSoupModal.seasoning}
              </p>
            </div>

            {/* Modal Actions Footer */}
            <div className="modal-footer-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedSoupModal(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={`btn btn-primary btn-modal-log ${justLoggedId === selectedSoupModal.id ? 'btn-logged' : ''}`}
                onClick={(e) => handleLogSoup(selectedSoupModal, e)}
              >
                {justLoggedId === selectedSoupModal.id ? <Check size={16} /> : <Plus size={16} />}
                <span>
                  {justLoggedId === selectedSoupModal.id 
                    ? 'Logged to Dinner in Calorie Tracker!' 
                    : `Log to Today's Dinner (${selectedSoupModal.calories} kcal)`}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .soup-modal-title-bar {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .soup-modal-title-emoji {
          font-size: 2.1rem;
          line-height: 1;
        }
        .soup-modal-title-texts {
          display: flex;
          flex-direction: column;
        }
        .soup-modal-title-main {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .soup-modal-title-tamil {
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 500;
        }
        .soup-recipe-modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .modal-macro-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }
        .modal-macro-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 0.5rem 0.35rem;
        }
        .modal-macro-badge.cal {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.35);
        }
        .modal-macro-badge.cal .m-val { color: #fbbf24; }
        .modal-macro-badge.protein .m-val { color: #34d399; }
        .modal-macro-badge.carbs .m-val { color: #38bdf8; }
        .modal-macro-badge.fibre .m-val { color: #a78bfa; }
        .modal-macro-badge.oil .m-val { color: #f43f5e; }
        .modal-macro-badge .m-val {
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.1;
        }
        .modal-macro-badge .m-lbl {
          font-size: 0.62rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 600;
          margin-top: 0.2rem;
        }
        .modal-meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .modal-soup-description {
          font-size: 0.84rem;
          color: #cbd5e1;
          line-height: 1.5;
          margin: 0;
          background: rgba(30, 41, 59, 0.35);
          border-left: 3px solid #6366f1;
          padding: 0.6rem 0.85rem;
          border-radius: 0 8px 8px 0;
        }
        .modal-section-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .modal-section-box.highlight-spices {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(15, 23, 42, 0.7) 100%);
          border-color: rgba(245, 158, 11, 0.25);
        }
        .modal-section-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .modal-section-heading {
          font-size: 0.82rem;
          font-weight: 700;
          color: #f8fafc;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0;
        }
        .modal-ingredients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.45rem;
        }
        .modal-ing-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 0.4rem 0.65rem;
          font-size: 0.78rem;
        }
        .modal-ing-bullet {
          color: #6366f1;
          margin-right: 0.35rem;
          font-weight: 800;
        }
        .modal-ing-name {
          color: #e2e8f0;
          flex: 1;
        }
        .modal-ing-amount {
          font-weight: 700;
          color: #38bdf8;
          margin-left: 0.5rem;
        }
        .modal-water-note {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.74rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          padding-top: 0.4rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
        }
        .modal-method-steps {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .modal-step-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .step-number-bubble {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid #818cf8;
          color: #a5b4fc;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .step-text {
          font-size: 0.8rem;
          color: #cbd5e1;
          line-height: 1.45;
          flex: 1;
        }
        .modal-seasoning-text {
          font-size: 0.8rem;
          color: #fbbf24;
          line-height: 1.45;
          margin: 0;
        }
        .modal-footer-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-modal-log {
          padding: 0.55rem 1.25rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        @media (max-width: 600px) {
          .modal-macro-strip {
            grid-template-columns: repeat(3, 1fr);
          }
          .modal-ingredients-grid {
            grid-template-columns: 1fr;
          }
          .modal-footer-actions {
            flex-direction: column-reverse;
          }
          .modal-footer-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
