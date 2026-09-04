import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, 
  Flame, 
  Sparkles, 
  Sun, 
  Shield, 
  ShieldCheck,
  Dumbbell, 
  Apple,
  Edit3,
  Plus,
  Trash2,
  Calendar,
  Sparkle,
  Clock,
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Droplets,
  Utensils,
  Check,
  Share2,
  FileDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  exportHealthProtocolToExcel, 
  downloadSampleDietTemplate 
} from '../services/excelProtocolParser';
import { ExcelUploadModal } from '../components/health/ExcelUploadModal';

export const HealthProtocolView = () => {
  const { 
    healthProtocol, 
    updateHealthProtocol, 
    importHealthProtocolFromExcel,
    resetHealthProtocolToDefault,
    todayStr,
    triggerCelebration
  } = useApp();

  const { currentUser } = useAuth();

  const [notificationMsg, setNotificationMsg] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Daily Water Tracker state (Persisted in localStorage per day & user)
  const waterStorageKey = `life_tracker_water_${currentUser?.uid || 'user'}_${todayStr}`;
  const [waterGlasses, setWaterGlasses] = useState(() => {
    try {
      const saved = localStorage.getItem(waterStorageKey);
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(waterStorageKey, String(waterGlasses));
    } catch {
      // Ignore storage errors
    }
  }, [waterGlasses, waterStorageKey]);

  // Daily Completed Meals Tracker state
  const mealStorageKey = `life_tracker_meals_done_${currentUser?.uid || 'user'}_${todayStr}`;
  const [completedMeals, setCompletedMeals] = useState(() => {
    try {
      const saved = localStorage.getItem(mealStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(mealStorageKey, JSON.stringify(completedMeals));
    } catch {
      // Ignore storage errors
    }
  }, [completedMeals, mealStorageKey]);

  // Edit Modals State
  const [activeModal, setActiveModal] = useState(null); // 'calories' | 'micronutrients' | 'exercise' | 'sugar' | 'skincare' | 'bodycare' | 'haircare' | 'meals' | 'fasting' | null
  
  // Temporary Form States
  const [formData, setFormData] = useState({});

  const protocol = healthProtocol || {};
  const meta = protocol.meta || {};
  const isCustomPlan = !!meta.isCustom;

  const calories = protocol.calories || {};
  const macros = calories.macros || [];
  const mealSchedule = Array.isArray(protocol.mealSchedule) && protocol.mealSchedule.length > 0
    ? protocol.mealSchedule
    : [];

  const fastingAndWater = protocol.fastingAndWater || {
    fastingProtocol: '16:8 Intermittent Fasting',
    fastingWindow: 'Fasting 8:00 PM to 12:00 PM next day',
    waterTargetLiters: 3.5,
    waterTargetGlasses: 14,
    electrolyteHack: 'Morning warm water + pink Himalayan salt + lemon',
    fastingNotes: 'Water, black coffee, plain green tea allowed during fast'
  };

  const micronutrients = Array.isArray(protocol.micronutrients) && protocol.micronutrients.length > 0 
    ? protocol.micronutrients 
    : [
        { id: 'iron', name: 'Iron', color: '#f43f5e', target: 'Bloating, fatigue, hair fall', sources: 'Dates, spinach, beetroot, jaggery' },
        { id: 'b12', name: 'Vitamin B12', color: '#8b5cf6', target: 'Mood swings, low energy', sources: 'Curd, paneer, fortified foods' },
        { id: 'vit_d', name: 'Vitamin D', color: '#f59e0b', target: 'Joint pain, low mood', sources: 'Sunlight + supplementation if deficient' },
        { id: 'magnesium', name: 'Magnesium', color: '#6366f1', target: 'Sleep, stress, cravings', sources: 'Pumpkin seeds, peanuts' },
        { id: 'zinc', name: 'Zinc', color: '#0ea5e9', target: 'Hair strength & skin healing', sources: 'Nuts, seeds, legumes' },
      ];

  const exerciseRoutine = protocol.exerciseRoutine || {};
  const sugarCutting = protocol.sugarCutting || {};
  
  const skinCare = protocol.skinCare || {
    daily: 'AM and PM (Cleanse, hydrate, sunscreen AM, barrier repair PM)',
    weeklySunday: 'Sunday: Face shaving and scrub',
    weeklyTueFri: 'Tuesday & Friday: Face pack',
    notes: 'Gentle circular motion for scrub; use soothing gel after face shaving.'
  };

  const bodyCare = protocol.bodyCare || {
    sunday: 'Sunday: Oiling, scrub, shaving',
    tueFri: 'Tuesday & Friday: Exfoliating body wash',
    notes: 'Warm oil before bath on Sundays; gentle loofah with exfoliating wash on Tue/Fri.'
  };

  const hairCare = protocol.hairCare || {
    daily: 'Serum and hair growth water',
    weekly: '3x Oiling, hair pack, hair wash',
    biWeekly: 'Two weeks once: Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)',
    notes: 'Air dry naturally, wide-tooth detangling comb, warm oil massage.'
  };

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Water Increment / Decrement
  const handleAddWater = () => {
    const next = waterGlasses + 1;
    setWaterGlasses(next);
    if (next === (fastingAndWater.waterTargetGlasses || 14)) {
      triggerCelebration();
      showToast('🎉 Awesome! Daily water goal completed (3.5L)!');
    }
  };

  const handleSubWater = () => {
    setWaterGlasses(prev => Math.max(0, prev - 1));
  };

  // Toggle Meal Completion
  const handleToggleMeal = (mealId) => {
    setCompletedMeals(prev => {
      const isDone = prev.includes(mealId);
      const updated = isDone ? prev.filter(id => id !== mealId) : [...prev, mealId];
      if (!isDone && mealSchedule.length > 0 && updated.length === mealSchedule.length) {
        triggerCelebration();
        showToast('🌟 All daily protocol meals completed! Super disciplined!');
      }
      return updated;
    });
  };

  // Export current protocol to Excel
  const handleExportExcel = () => {
    const res = exportHealthProtocolToExcel(protocol, currentUser?.name || 'My_Diet_Plan');
    if (res.success) {
      showToast(`📥 Exported: ${res.fileName}`);
    }
  };

  // Revert protocol to standard default
  const handleRevertToDefault = () => {
    if (window.confirm('Are you sure you want to revert to the Standard System Health Protocol? Your custom uploaded sheets will be reset to defaults.')) {
      resetHealthProtocolToDefault();
      showToast('🔄 Reverted back to Standard System Health Protocol.');
    }
  };

  // --- CALORIE & MACRO EDITING ---
  const handleOpenEditCalories = () => {
    setFormData({
      maintenance: calories.maintenance || 1850,
      fatLossTarget: calories.fatLossTarget || '1350–1450 kcal/day',
      expectedLoss: calories.expectedLoss || '0.5–0.7 kg/week',
      cheatTarget: calories.cheatDay?.target || '1800–1900 kcal',
      cheatRules: calories.cheatDay?.rules || '',
      macros: macros.map(m => ({ ...m })),
    });
    setActiveModal('calories');
  };

  const handleSaveCalories = (e) => {
    e.preventDefault();
    updateHealthProtocol(prev => ({
      ...prev,
      calories: {
        ...prev.calories,
        maintenance: Number(formData.maintenance) || 1850,
        fatLossTarget: formData.fatLossTarget,
        expectedLoss: formData.expectedLoss,
        cheatDay: {
          ...prev.calories?.cheatDay,
          target: formData.cheatTarget,
          rules: formData.cheatRules,
        },
        macros: formData.macros,
      }
    }));
    setActiveModal(null);
    showToast('✅ Calorie & Macro targets updated successfully!');
  };

  // --- FASTING & WATER EDITING ---
  const handleOpenEditFasting = () => {
    setFormData({
      fastingProtocol: fastingAndWater.fastingProtocol || '16:8 Intermittent Fasting',
      fastingWindow: fastingAndWater.fastingWindow || 'Fasting 8:00 PM to 12:00 PM next day',
      waterTargetLiters: fastingAndWater.waterTargetLiters || 3.5,
      electrolyteHack: fastingAndWater.electrolyteHack || '',
      fastingNotes: fastingAndWater.fastingNotes || ''
    });
    setActiveModal('fasting');
  };

  const handleSaveFasting = (e) => {
    e.preventDefault();
    const liters = parseFloat(formData.waterTargetLiters) || 3.5;
    updateHealthProtocol(prev => ({
      ...prev,
      fastingAndWater: {
        ...prev.fastingAndWater,
        fastingProtocol: formData.fastingProtocol,
        fastingWindow: formData.fastingWindow,
        waterTargetLiters: liters,
        waterTargetGlasses: Math.round(liters * 4),
        electrolyteHack: formData.electrolyteHack,
        fastingNotes: formData.fastingNotes
      }
    }));
    setActiveModal(null);
    showToast('✅ Fasting & Hydration targets updated!');
  };

  // --- MICRONUTRIENTS EDITING ---
  const handleOpenEditMicronutrients = () => {
    setFormData({
      items: micronutrients.map(item => ({ ...item })),
    });
    setActiveModal('micronutrients');
  };

  const handleAddMicronutrientRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `micro-${Date.now()}`,
          name: '',
          target: '',
          sources: '',
          color: '#10b981',
        }
      ]
    }));
  };

  const handleRemoveMicronutrientRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateMicronutrientRow = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const handleSaveMicronutrients = (e) => {
    e.preventDefault();
    const cleanItems = formData.items.filter(item => item.name.trim() !== '');
    updateHealthProtocol(prev => ({
      ...prev,
      micronutrients: cleanItems,
    }));
    setActiveModal(null);
    showToast('✅ Micronutrients updated successfully!');
  };

  // --- EXERCISE EDITING ---
  const handleOpenEditExercise = () => {
    setFormData({
      morningTitle: exerciseRoutine.morning?.title || '',
      morningActivities: exerciseRoutine.morning?.activities || '',
      morningBenefits: exerciseRoutine.morning?.benefits || '',
      eveningTitle: exerciseRoutine.evening?.title || '',
      eveningActivities: exerciseRoutine.evening?.activities || '',
      eveningBenefits: exerciseRoutine.evening?.benefits || '',
    });
    setActiveModal('exercise');
  };

  const handleSaveExercise = (e) => {
    e.preventDefault();
    updateHealthProtocol(prev => ({
      ...prev,
      exerciseRoutine: {
        morning: {
          title: formData.morningTitle,
          activities: formData.morningActivities,
          benefits: formData.morningBenefits,
        },
        evening: {
          title: formData.eveningTitle,
          activities: formData.eveningActivities,
          benefits: formData.eveningBenefits,
        }
      }
    }));
    setActiveModal(null);
    showToast('✅ Exercise routine updated!');
  };

  // --- SUGAR CUTTING EDITING ---
  const handleOpenEditSugar = () => {
    setFormData({
      week1: sugarCutting.phases?.[0]?.action || '',
      week2: sugarCutting.phases?.[1]?.action || '',
      week3: sugarCutting.phases?.[2]?.action || '',
      cravingHack: sugarCutting.cravingHack || '',
    });
    setActiveModal('sugar');
  };

  const handleSaveSugar = (e) => {
    e.preventDefault();
    updateHealthProtocol(prev => ({
      ...prev,
      sugarCutting: {
        phases: [
          { week: 'Week 1', action: formData.week1, status: 'Phase 1' },
          { week: 'Week 2', action: formData.week2, status: 'Phase 2' },
          { week: 'Week 3', action: formData.week3, status: 'Phase 3' },
        ],
        cravingHack: formData.cravingHack,
      }
    }));
    setActiveModal(null);
    showToast('✅ Sugar cutting strategy updated!');
  };

  // --- SKIN CARE EDITING ---
  const handleOpenEditSkinCare = () => {
    setFormData({
      daily: skinCare.daily || '',
      weeklySunday: skinCare.weeklySunday || '',
      weeklyTueFri: skinCare.weeklyTueFri || '',
      notes: skinCare.notes || '',
    });
    setActiveModal('skincare');
  };

  const handleSaveSkinCare = (e) => {
    e.preventDefault();
    updateHealthProtocol(prev => ({
      ...prev,
      skinCare: {
        daily: formData.daily,
        weeklySunday: formData.weeklySunday,
        weeklyTueFri: formData.weeklyTueFri,
        notes: formData.notes,
      }
    }));
    setActiveModal(null);
    showToast('✅ Skin care regime updated!');
  };

  // --- BODY CARE EDITING ---
  const handleOpenEditBodyCare = () => {
    setFormData({
      sunday: bodyCare.sunday || '',
      tueFri: bodyCare.tueFri || '',
      notes: bodyCare.notes || '',
    });
    setActiveModal('bodycare');
  };

  const handleSaveBodyCare = (e) => {
    e.preventDefault();
    updateHealthProtocol(prev => ({
      ...prev,
      bodyCare: {
        sunday: formData.sunday,
        tueFri: formData.tueFri,
        notes: formData.notes,
      }
    }));
    setActiveModal(null);
    showToast('✅ Body care regime updated!');
  };

  // --- HAIR CARE EDITING ---
  const handleOpenEditHairCare = () => {
    setFormData({
      daily: hairCare.daily || '',
      weekly: hairCare.weekly || '',
      biWeekly: hairCare.biWeekly || '',
      notes: hairCare.notes || '',
    });
    setActiveModal('haircare');
  };

  const handleSaveHairCare = (e) => {
    e.preventDefault();
    updateHealthProtocol(prev => ({
      ...prev,
      hairCare: {
        daily: formData.daily,
        weekly: formData.weekly,
        biWeekly: formData.biWeekly,
        notes: formData.notes,
      }
    }));
    setActiveModal(null);
    showToast('✅ Hair care regime updated!');
  };

  const waterTargetGlasses = fastingAndWater.waterTargetGlasses || 14;
  const waterPercent = Math.min(100, Math.round((waterGlasses / waterTargetGlasses) * 100));

  return (
    <div className="health-protocol-view">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="protocol-toast">
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Excel Upload & Live Preview Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onApply={(newProto, stats) => {
          importHealthProtocolFromExcel(newProto, stats);
          showToast('🎉 Diet Plan successfully updated from Excel sheet!');
        }}
        targetUserName={currentUser?.name}
      />

      {/* Hero Banner with Plan Badge & Dynamic Actions */}
      <div className="protocol-hero card">
        <div className="hero-top-bar">
          <div className="hero-badge-row">
            <span className="badge badge-primary">
              <HeartPulse size={14} />
              <span>HEALTH, DIET & BODY REGIME</span>
            </span>

            {isCustomPlan ? (
              <span className="badge badge-custom-plan">
                <Sparkles size={14} />
                <span>⭐ CUSTOM PLAN: {meta.planName || meta.fileName || 'Personalized Excel'}</span>
              </span>
            ) : (
              <span className="badge badge-success">
                <ShieldCheck size={14} />
                <span>🌿 STANDARD AYURVEDIC & FITNESS PROTOCOL</span>
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="hero-action-buttons">
            <button
              type="button"
              className="btn btn-primary btn-sm btn-upload-excel"
              onClick={() => setIsExcelModalOpen(true)}
            >
              <UploadCloud size={15} />
              <span>Upload Diet Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={downloadSampleDietTemplate}
              title="Download empty pre-formatted Excel template"
            >
              <Download size={15} />
              <span>Sample Template</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportExcel}
              title="Export current active protocol to Excel"
            >
              <FileDown size={15} />
              <span>Export Plan</span>
            </button>

            {isCustomPlan && (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger"
                onClick={handleRevertToDefault}
                title="Reset back to standard protocol"
              >
                <RotateCcw size={14} />
                <span>Reset to Standard</span>
              </button>
            )}
          </div>
        </div>

        <div className="hero-bottom-text">
          <h2 className="hero-heading">
            {isCustomPlan 
              ? `${currentUser?.name ? currentUser.name + "'s" : 'Personalized'} Custom Nutrition & Wellness Protocol` 
              : 'Nutrition, Self-Care & Body Wellness Protocol'}
          </h2>
          <p className="hero-sub">
            {isCustomPlan && meta.uploadedAt 
              ? `Custom timetable loaded from spreadsheet on ${new Date(meta.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Updates are isolated to your profile.`
              : 'Your personalized regime for daily meals, macros, hydration, workout timing, and dedicated Skin, Body & Hair care routines.'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 0. INTERACTIVE FASTING & DAILY MEAL SCHEDULE (Excel-Driven Timetable) */}
      {/* ========================================================================= */}
      <div className="section-container">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Utensils size={20} className="text-primary" />
            <h3 className="section-title">Daily Meal Timetable & Fasting Protocol</h3>
          </div>
          <div className="title-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleOpenEditFasting}
            >
              <Edit3 size={14} />
              <span>Edit Fasting & Water</span>
            </button>
          </div>
        </div>

        {/* Fasting & Water Dual Row */}
        <div className="fasting-water-grid">
          {/* Fasting Card */}
          <div className="card fasting-card">
            <div className="fasting-header">
              <div className="fasting-icon-wrap">
                <Clock size={20} />
              </div>
              <div>
                <span className="fasting-badge">{fastingAndWater.fastingProtocol}</span>
                <h4 className="fasting-title">{fastingAndWater.fastingWindow}</h4>
              </div>
            </div>
            <div className="fasting-details">
              <p className="fasting-notes">
                <strong>Rules:</strong> {fastingAndWater.fastingNotes}
              </p>
              {fastingAndWater.electrolyteHack && (
                <div className="electrolyte-tip">
                  ⚡ <strong>Morning Hack:</strong> {fastingAndWater.electrolyteHack}
                </div>
              )}
            </div>
          </div>

          {/* Water Intake Interactive Card */}
          <div className="card water-card">
            <div className="water-header">
              <div className="water-icon-wrap">
                <Droplets size={22} />
              </div>
              <div className="water-header-text">
                <div className="water-title-row">
                  <h4 className="water-title">Daily Hydration Counter</h4>
                  <span className="water-goal-badge">{fastingAndWater.waterTargetLiters || 3.5} Litres Goal</span>
                </div>
                <span className="water-sub">
                  {waterGlasses} of {waterTargetGlasses} glasses logged today ({(waterGlasses * 0.25).toFixed(2)}L)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="water-progress-track">
              <div 
                className="water-progress-fill" 
                style={{ width: `${waterPercent}%` }}
              />
            </div>

            {/* Quick Logging Buttons */}
            <div className="water-actions-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSubWater}
                disabled={waterGlasses === 0}
              >
                - 1 Glass
              </button>
              <span className="water-percent-tag">{waterPercent}%</span>
              <button
                type="button"
                className="btn btn-primary btn-sm btn-water-add"
                onClick={handleAddWater}
              >
                <Plus size={15} />
                <span>+ 1 Glass (250ml)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Meal Timetable Schedule List */}
        {mealSchedule.length > 0 && (
          <div className="meal-schedule-list">
            {mealSchedule.map((meal, idx) => {
              const isDone = completedMeals.includes(meal.id || `meal-${idx}`);
              return (
                <div 
                  key={meal.id || idx} 
                  className={`card meal-schedule-card ${isDone ? 'meal-completed' : ''}`}
                >
                  <div className="meal-card-top">
                    <button
                      type="button"
                      className={`meal-check-btn ${isDone ? 'checked' : ''}`}
                      onClick={() => handleToggleMeal(meal.id || `meal-${idx}`)}
                      title={isDone ? 'Mark uncompleted' : 'Mark meal done for today'}
                    >
                      {isDone ? <Check size={16} /> : <div className="meal-check-circle" />}
                    </button>

                    <div className="meal-time-tag">
                      <Clock size={13} />
                      <span>{meal.time}</span>
                    </div>

                    <h4 className="meal-name">{meal.name}</h4>

                    <div className="meal-macros-pills">
                      {meal.calories > 0 && (
                        <span className="meal-cal-pill">
                          <Flame size={12} />
                          <span>{meal.calories} kcal</span>
                        </span>
                      )}
                      {meal.protein && (
                        <span className="meal-protein-pill">
                          <span>{meal.protein} protein</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="meal-card-content">
                    <div className="meal-dishes-box">
                      <span className="dishes-label">🥗 Ingredients / Dishes:</span>
                      <span className="dishes-text">{meal.dishes}</span>
                    </div>

                    {meal.hairSkinBenefits && (
                      <div className="meal-benefits-box">
                        <Sparkles size={14} className="text-pink" />
                        <span><strong>Hair & Skin Benefits:</strong> {meal.hairSkinBenefits}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. Daily Calories & Macronutrients (Editable) */}
      {/* ========================================================================= */}
      <div className="section-container">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Flame size={20} className="text-amber" />
            <h3 className="section-title">1. Daily Calorie & Macronutrient Targets</h3>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleOpenEditCalories}
          >
            <Edit3 size={14} />
            <span>Edit Calories & Macros</span>
          </button>
        </div>

        {/* Calorie Stats Grid */}
        <div className="calories-stat-grid">
          <div className="card cal-card">
            <span className="cal-label">Maintenance Calories</span>
            <span className="cal-val">~{calories.maintenance} <small>kcal/day</small></span>
            <span className="cal-desc">Zero weight change baseline</span>
          </div>

          <div className="card cal-card highlight-card">
            <div className="card-top-tag">FAT LOSS TARGET</div>
            <span className="cal-label">Daily Calorie Target</span>
            <span className="cal-val text-primary">{calories.fatLossTarget}</span>
            <span className="cal-desc text-success">📉 Expected fat loss: {calories.expectedLoss}</span>
          </div>

          <div className="card cal-card cheat-card">
            <div className="card-top-tag tag-amber">1 DAY / WEEK</div>
            <span className="cal-label">Cheat Day Budget</span>
            <span className="cal-val text-amber">{calories.cheatDay?.target}</span>
            <span className="cal-desc">{calories.cheatDay?.rules}</span>
          </div>
        </div>

        {/* Macros Breakdown Cards */}
        <div className="macros-grid">
          {macros.map((m) => (
            <div 
              key={m.name} 
              className="card macro-card"
              style={{ borderTopColor: m.color }}
            >
              <div className="macro-header">
                <span className="macro-name" style={{ color: m.color }}>{m.name}</span>
                <span className="macro-badge" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
                  {m.percentage}
                </span>
              </div>
              <div className="macro-amount">{m.amount}</div>
              <div className="macro-purpose">
                <strong>Target:</strong> {m.purpose}
              </div>
              <div className="macro-sources">
                <strong>Top Sources:</strong> {m.foods}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Micronutrients Focus (Editable) */}
      {/* ========================================================================= */}
      <div className="section-container">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Apple size={20} className="text-emerald" />
            <h3 className="section-title">2. Micronutrients You Must Focus On</h3>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleOpenEditMicronutrients}
          >
            <Edit3 size={14} />
            <span>Edit Micronutrients</span>
          </button>
        </div>

        <div className="micronutrients-grid">
          {micronutrients.map((micro) => (
            <div 
              key={micro.id || micro.name} 
              className="card micro-card"
              style={{ borderLeftColor: micro.color || 'var(--accent-primary)' }}
            >
              <div className="micro-header">
                <div className="micro-title-wrap">
                  <span className="micro-dot" style={{ backgroundColor: micro.color || 'var(--accent-primary)' }} />
                  <span className="micro-name">{micro.name}</span>
                </div>
                <span className="micro-target-tag">{micro.target}</span>
              </div>
              <div className="micro-sources-box">
                <span className="sources-label">Sources:</span>
                <span className="sources-text">{micro.sources}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Skin, Body & Hair Care Regimes (Editable) */}
      {/* ========================================================================= */}
      <div className="section-container">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Sparkles size={20} className="text-pink" />
            <h3 className="section-title">3. Skin, Body & Hair Care Regime</h3>
          </div>
          <span className="text-muted text-xs">Customized daily, weekly & bi-weekly schedule</span>
        </div>

        <div className="care-regimes-grid">
          {/* Skin Care Card */}
          <div className="card regime-card border-top-pink">
            <div className="regime-header">
              <div className="regime-title-wrap">
                <div className="regime-icon-wrap bg-pink">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="regime-title">Skin Care</h4>
                  <span className="regime-sub">Glow & Barrier Repair</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleOpenEditSkinCare}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
            </div>

            <div className="regime-body">
              <div className="regime-item">
                <div className="regime-tag tag-daily">
                  <Clock size={12} />
                  <span>Daily</span>
                </div>
                <div className="regime-content">
                  <strong>AM & PM:</strong> {skinCare.daily}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Weekly</span>
                </div>
                <div className="regime-content">
                  <p>• <strong>Sunday:</strong> {skinCare.weeklySunday}</p>
                  <p>• <strong>Tuesday & Friday:</strong> {skinCare.weeklyTueFri}</p>
                </div>
              </div>

              {skinCare.notes && (
                <div className="regime-notes-box">
                  💡 {skinCare.notes}
                </div>
              )}
            </div>
          </div>

          {/* Body Care Card */}
          <div className="card regime-card border-top-amber">
            <div className="regime-header">
              <div className="regime-title-wrap">
                <div className="regime-icon-wrap bg-amber">
                  <Sun size={20} />
                </div>
                <div>
                  <h4 className="regime-title">Body Care</h4>
                  <span className="regime-sub">Smooth & Nourished Skin</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleOpenEditBodyCare}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
            </div>

            <div className="regime-body">
              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Sunday</span>
                </div>
                <div className="regime-content">
                  <strong>Sunday Routine:</strong> {bodyCare.sunday}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Tue & Fri</span>
                </div>
                <div className="regime-content">
                  <strong>Tuesday & Friday:</strong> {bodyCare.tueFri}
                </div>
              </div>

              {bodyCare.notes && (
                <div className="regime-notes-box">
                  🛁 {bodyCare.notes}
                </div>
              )}
            </div>
          </div>

          {/* Hair Care Card */}
          <div className="card regime-card border-top-purple">
            <div className="regime-header">
              <div className="regime-title-wrap">
                <div className="regime-icon-wrap bg-purple">
                  <Sparkle size={20} />
                </div>
                <div>
                  <h4 className="regime-title">Hair Care</h4>
                  <span className="regime-sub">Length, Volume & Strength</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleOpenEditHairCare}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
            </div>

            <div className="regime-body">
              <div className="regime-item">
                <div className="regime-tag tag-daily">
                  <Clock size={12} />
                  <span>Daily</span>
                </div>
                <div className="regime-content">
                  <strong>Daily:</strong> {hairCare.daily}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Weekly</span>
                </div>
                <div className="regime-content">
                  <strong>Weekly Routine:</strong> {hairCare.weekly}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-biweekly">
                  <Calendar size={12} />
                  <span>Two Weeks Once</span>
                </div>
                <div className="regime-content">
                  <strong>Bi-Weekly Cycle:</strong> {hairCare.biWeekly}
                </div>
              </div>

              {hairCare.notes && (
                <div className="regime-notes-box">
                  💆 {hairCare.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Fitness & Sugar Protocols (Editable) */}
      {/* ========================================================================= */}
      <div className="protocol-cards-grid">
        {/* Exercise Routine */}
        <div className="card protocol-section-card">
          <div className="proto-card-header">
            <div className="proto-header-left">
              <div className="proto-icon-wrap bg-cyan">
                <Dumbbell size={22} />
              </div>
              <div>
                <h4 className="proto-title">Exercise Routine</h4>
                <span className="proto-sub">Consistency over intensity</span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleOpenEditExercise}
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
          </div>

          <div className="exercise-grid">
            <div className="exercise-card">
              <span className="exercise-title">{exerciseRoutine.morning?.title}</span>
              <p className="exercise-activities"><strong>Activities:</strong> {exerciseRoutine.morning?.activities}</p>
              <span className="exercise-benefits">✨ {exerciseRoutine.morning?.benefits}</span>
            </div>

            <div className="exercise-card">
              <span className="exercise-title">{exerciseRoutine.evening?.title}</span>
              <p className="exercise-activities"><strong>Activities:</strong> {exerciseRoutine.evening?.activities}</p>
              <span className="exercise-benefits">✨ {exerciseRoutine.evening?.benefits}</span>
            </div>
          </div>
        </div>

        {/* Sugar Cutting Strategy */}
        <div className="card protocol-section-card">
          <div className="proto-card-header">
            <div className="proto-header-left">
              <div className="proto-icon-wrap bg-rose">
                <Shield size={22} />
              </div>
              <div>
                <h4 className="proto-title">Sugar Cutting Strategy</h4>
                <span className="proto-sub">3-Week Sustainable Progression</span>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleOpenEditSugar}
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
          </div>

          <div className="sugar-phases-list">
            {(sugarCutting.phases || []).map((p, i) => (
              <div key={i} className="phase-row">
                <span className="phase-badge">{p.week}</span>
                <span className="phase-action">{p.action}</span>
              </div>
            ))}
            <div className="craving-hack-box">
              {sugarCutting.cravingHack}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT MODALS */}
      {/* ========================================================================= */}

      {/* 1. Edit Calories Modal */}
      {activeModal === 'calories' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Calorie & Macro Targets</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCalories} className="modal-form">
              <div className="form-row">
                <div className="input-group flex-1">
                  <label className="label">Maintenance Calories (kcal)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.maintenance}
                    onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                  />
                </div>
                <div className="input-group flex-1">
                  <label className="label">Fat Loss Target (kcal/day)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.fatLossTarget}
                    onChange={(e) => setFormData({ ...formData, fatLossTarget: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group flex-1">
                  <label className="label">Expected Loss</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.expectedLoss}
                    onChange={(e) => setFormData({ ...formData, expectedLoss: e.target.value })}
                  />
                </div>
                <div className="input-group flex-1">
                  <label className="label">Cheat Day Target (kcal)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.cheatTarget}
                    onChange={(e) => setFormData({ ...formData, cheatTarget: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Cheat Day Rules</label>
                <input
                  type="text"
                  className="input"
                  value={formData.cheatRules}
                  onChange={(e) => setFormData({ ...formData, cheatRules: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Targets</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Fasting Modal */}
      {activeModal === 'fasting' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Fasting & Hydration Targets</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveFasting} className="modal-form">
              <div className="input-group">
                <label className="label">Fasting Protocol</label>
                <input
                  type="text"
                  className="input"
                  value={formData.fastingProtocol}
                  onChange={(e) => setFormData({ ...formData, fastingProtocol: e.target.value })}
                  placeholder="e.g. 16:8 Intermittent Fasting"
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Fasting Window (Timing)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.fastingWindow}
                  onChange={(e) => setFormData({ ...formData, fastingWindow: e.target.value })}
                  placeholder="e.g. Fasting 8:00 PM to 12:00 PM next day"
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Daily Water Target (Litres)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={formData.waterTargetLiters}
                  onChange={(e) => setFormData({ ...formData, waterTargetLiters: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Morning Electrolyte Hack</label>
                <input
                  type="text"
                  className="input"
                  value={formData.electrolyteHack}
                  onChange={(e) => setFormData({ ...formData, electrolyteHack: e.target.value })}
                  placeholder="e.g. Warm lemon water + pink Himalayan salt"
                />
              </div>

              <div className="input-group">
                <label className="label">Fasting Guidelines & Permitted Drinks</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.fastingNotes}
                  onChange={(e) => setFormData({ ...formData, fastingNotes: e.target.value })}
                  placeholder="e.g. Water, black coffee, plain green tea allowed"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Targets</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Micronutrients Modal */}
      {activeModal === 'micronutrients' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Micronutrients Focus</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveMicronutrients} className="modal-form">
              <div className="modal-scroll-area">
                {(formData.items || []).map((item, idx) => (
                  <div key={idx} className="edit-micro-card">
                    <div className="micro-edit-top">
                      <input
                        type="text"
                        className="input micro-input-name"
                        placeholder="Nutrient Name (e.g. Iron)"
                        value={item.name}
                        onChange={(e) => handleUpdateMicronutrientRow(idx, 'name', e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="input micro-input-target"
                        placeholder="Symptoms / Target (e.g. bloating, fatigue, hair fall)"
                        value={item.target}
                        onChange={(e) => handleUpdateMicronutrientRow(idx, 'target', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-icon btn-ghost text-danger"
                        onClick={() => handleRemoveMicronutrientRow(idx)}
                        title="Remove nutrient"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="micro-edit-bottom">
                      <input
                        type="text"
                        className="input"
                        placeholder="Food sources (e.g. dates, spinach, beetroot, jaggery)"
                        value={item.sources}
                        onChange={(e) => handleUpdateMicronutrientRow(idx, 'sources', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddMicronutrientRow}
                style={{ alignSelf: 'flex-start' }}
              >
                <Plus size={15} />
                <span>+ Add Another Micronutrient</span>
              </button>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Micronutrients</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Skin Care Modal */}
      {activeModal === 'skincare' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Skin Care Regime</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveSkinCare} className="modal-form">
              <div className="input-group">
                <label className="label">Daily AM & PM Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. AM and PM"
                  value={formData.daily}
                  onChange={(e) => setFormData({ ...formData, daily: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Weekly - Sunday Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Sunday face shaving and scrub"
                  value={formData.weeklySunday}
                  onChange={(e) => setFormData({ ...formData, weeklySunday: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Weekly - Tuesday & Friday Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Tuesday and friday face pack"
                  value={formData.weeklyTueFri}
                  onChange={(e) => setFormData({ ...formData, weeklyTueFri: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Notes / Special Instructions</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Skin Care</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Body Care Modal */}
      {activeModal === 'bodycare' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Body Care Regime</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveBodyCare} className="modal-form">
              <div className="input-group">
                <label className="label">Sunday Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Sunday oiling , scrub ,shaving"
                  value={formData.sunday}
                  onChange={(e) => setFormData({ ...formData, sunday: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Tuesday & Friday Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Tuesday friday exfoliating body wash"
                  value={formData.tueFri}
                  onChange={(e) => setFormData({ ...formData, tueFri: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Notes / Guidelines</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Body Care</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Hair Care Modal */}
      {activeModal === 'haircare' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Hair Care Regime</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveHairCare} className="modal-form">
              <div className="input-group">
                <label className="label">Daily Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Serum and hair growth water"
                  value={formData.daily}
                  onChange={(e) => setFormData({ ...formData, daily: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Weekly Routine</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 3 oiling , hair pack hair wash"
                  value={formData.weekly}
                  onChange={(e) => setFormData({ ...formData, weekly: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Two Weeks Once (Bi-Weekly Cycle)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. saturday henna and sunday avari podi in the next alternate : hair growth serum"
                  value={formData.biWeekly}
                  onChange={(e) => setFormData({ ...formData, biWeekly: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Notes / Guidelines</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Hair Care</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Exercise Modal */}
      {activeModal === 'exercise' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Exercise Routine</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveExercise} className="modal-form">
              <div className="input-group">
                <label className="label">Morning Cardio Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.morningTitle}
                  onChange={(e) => setFormData({ ...formData, morningTitle: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Morning Activities</label>
                <input
                  type="text"
                  className="input"
                  value={formData.morningActivities}
                  onChange={(e) => setFormData({ ...formData, morningActivities: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Morning Benefits / Notes</label>
                <input
                  type="text"
                  className="input"
                  value={formData.morningBenefits}
                  onChange={(e) => setFormData({ ...formData, morningBenefits: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="label">Evening Routine Title</label>
                <input
                  type="text"
                  className="input"
                  value={formData.eveningTitle}
                  onChange={(e) => setFormData({ ...formData, eveningTitle: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Evening Activities</label>
                <input
                  type="text"
                  className="input"
                  value={formData.eveningActivities}
                  onChange={(e) => setFormData({ ...formData, eveningActivities: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Evening Benefits / Notes</label>
                <input
                  type="text"
                  className="input"
                  value={formData.eveningBenefits}
                  onChange={(e) => setFormData({ ...formData, eveningBenefits: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Routine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Edit Sugar Modal */}
      {activeModal === 'sugar' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Sugar Cutting Strategy</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveSugar} className="modal-form">
              <div className="input-group">
                <label className="label">Week 1 Action</label>
                <input
                  type="text"
                  className="input"
                  value={formData.week1}
                  onChange={(e) => setFormData({ ...formData, week1: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Week 2 Action</label>
                <input
                  type="text"
                  className="input"
                  value={formData.week2}
                  onChange={(e) => setFormData({ ...formData, week2: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Week 3 Action</label>
                <input
                  type="text"
                  className="input"
                  value={formData.week3}
                  onChange={(e) => setFormData({ ...formData, week3: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Craving Hack</label>
                <input
                  type="text"
                  className="input"
                  value={formData.cravingHack}
                  onChange={(e) => setFormData({ ...formData, cravingHack: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Strategy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .health-protocol-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
        }

        .protocol-toast {
          position: sticky;
          top: 1rem;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
          color: #ffffff;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .protocol-hero {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.12));
          border-color: rgba(99, 102, 241, 0.3);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hero-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .hero-badge-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .badge-custom-plan {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
          font-weight: 800;
        }

        .hero-action-buttons {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-upload-excel {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          color: white;
          font-weight: 800;
        }

        .btn-upload-excel:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
        }

        .hero-heading {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
        }

        .hero-sub {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .section-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        /* Fasting & Water Grid */
        .fasting-water-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .fasting-water-grid {
            grid-template-columns: 1fr 1.25fr;
          }
        }

        .fasting-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          border-left: 4px solid var(--accent-primary);
          background: rgba(99, 102, 241, 0.03);
        }

        .fasting-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .fasting-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fasting-badge {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--accent-primary);
          text-transform: uppercase;
        }

        .fasting-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .fasting-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .fasting-notes {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .electrolyte-tip {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          color: var(--accent-warning);
          line-height: 1.35;
        }

        .water-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-left: 4px solid var(--accent-cyan);
          background: rgba(14, 165, 233, 0.03);
        }

        .water-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .water-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: rgba(14, 165, 233, 0.15);
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .water-header-text {
          flex: 1;
        }

        .water-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .water-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .water-goal-badge {
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(14, 165, 233, 0.15);
          color: var(--accent-cyan);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .water-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .water-progress-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .water-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0ea5e9, #38bdf8);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .water-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .water-percent-tag {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent-cyan);
        }

        .btn-water-add {
          background: rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(14, 165, 233, 0.4);
          color: var(--accent-cyan);
          font-weight: 700;
        }

        .btn-water-add:hover {
          background: rgba(14, 165, 233, 0.3);
        }

        /* Meal Schedule List */
        .meal-schedule-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .meal-schedule-card {
          padding: 1.15rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-left: 4px solid var(--accent-primary);
          transition: all 0.2s ease;
        }

        .meal-schedule-card.meal-completed {
          opacity: 0.85;
          border-left-color: var(--accent-success);
          background: rgba(16, 185, 129, 0.04);
        }

        .meal-card-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .meal-check-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .meal-check-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.25);
          transition: border-color 0.2s;
        }

        .meal-check-circle:hover {
          border-color: var(--accent-primary);
        }

        .meal-check-btn.checked {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent-success);
          color: white;
        }

        .meal-time-tag {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
        }

        .meal-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          flex: 1;
        }

        .meal-macros-pills {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .meal-cal-pill {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .meal-protein-pill {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .meal-card-content {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding-left: 2rem;
        }

        .meal-dishes-box {
          font-size: 0.85rem;
          line-height: 1.45;
          color: var(--text-primary);
        }

        .dishes-label {
          font-weight: 700;
          color: var(--text-muted);
          margin-right: 0.35rem;
        }

        .meal-benefits-box {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: #ec4899;
          background: rgba(236, 72, 153, 0.08);
          border: 1px solid rgba(236, 72, 153, 0.2);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.65rem;
          align-self: flex-start;
        }

        .calories-stat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 640px) {
          .calories-stat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .cal-card {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 1.25rem;
          position: relative;
        }

        .card-top-tag {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
        }

        .tag-amber {
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning);
        }

        .cal-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .cal-val {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .cal-val small {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .cal-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .macros-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        @media (min-width: 768px) {
          .macros-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .macro-card {
          border-top: 4px solid var(--accent-primary);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .macro-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .macro-name {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .macro-badge {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .macro-amount {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .macro-purpose, .macro-sources {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Micronutrients Grid */
        .micronutrients-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .micronutrients-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .micronutrients-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .micro-card {
          border-left: 4px solid var(--accent-primary);
          padding: 1rem 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .micro-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.04);
        }

        .micro-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .micro-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .micro-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .micro-name {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .micro-target-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent-warning);
          background: rgba(245, 158, 11, 0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .micro-sources-box {
          font-size: 0.8rem;
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .sources-label {
          font-weight: 700;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .sources-text {
          color: var(--text-primary);
        }

        /* Care Regimes Grid */
        .care-regimes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .care-regimes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .regime-card {
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          border-top: 4px solid var(--accent-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .border-top-pink { border-top-color: #ec4899; }
        .border-top-amber { border-top-color: #f59e0b; }
        .border-top-purple { border-top-color: #8b5cf6; }

        .regime-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .regime-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .regime-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-pink { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
        .bg-amber { background: rgba(245, 158, 11, 0.15); color: var(--accent-warning); }
        .bg-purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .bg-cyan { background: rgba(14, 165, 233, 0.15); color: var(--accent-cyan); }
        .bg-rose { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }

        .regime-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .regime-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .regime-body {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .regime-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .regime-tag {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .tag-daily {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-success);
        }

        .tag-weekly {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
        }

        .tag-biweekly {
          background: rgba(236, 72, 153, 0.15);
          color: #ec4899;
        }

        .regime-content {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.45;
        }

        .regime-content p {
          margin: 0.2rem 0;
        }

        .regime-notes-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .edit-micro-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 0.75rem;
        }

        .micro-edit-top {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .micro-input-name {
          width: 140px;
          flex-shrink: 0;
        }

        .micro-input-target {
          flex: 1;
        }

        .modal-scroll-area {
          max-height: 55vh;
          overflow-y: auto;
          padding-right: 0.35rem;
        }

        .protocol-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .protocol-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .protocol-section-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .proto-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .proto-header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .proto-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .proto-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .proto-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .exercise-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        .exercise-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .exercise-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--accent-cyan);
        }

        .exercise-activities {
          font-size: 0.82rem;
          color: var(--text-primary);
        }

        .exercise-benefits {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .sugar-phases-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .phase-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .phase-badge {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          flex-shrink: 0;
        }

        .phase-action {
          font-size: 0.82rem;
          color: var(--text-primary);
        }

        .craving-hack-box {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          font-size: 0.82rem;
          color: var(--accent-success);
          font-weight: 600;
          line-height: 1.4;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          width: 100%;
          max-width: 520px;
          padding: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .modal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .flex-1 {
          flex: 1;
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
      `}</style>
    </div>
  );
};
