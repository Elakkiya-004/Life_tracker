import React, { useState } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  FileDown
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
    triggerCelebration
  } = useApp();

  const { currentUser } = useAuth();

  const [notificationMsg, setNotificationMsg] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Edit Modals State: 'calories' | 'micronutrients' | 'exercise' | 'sugar' | 'skincare' | 'bodycare' | 'haircare' | null
  const [activeModal, setActiveModal] = useState(null);
  
  // Temporary Form States for Modals
  const [formData, setFormData] = useState({});

  const protocol = healthProtocol || {};
  const meta = protocol.meta || {};
  const isCustomPlan = !!meta.isCustom;

  const calories = protocol.calories || {};
  const macros = Array.isArray(calories.macros) ? calories.macros : [];

  const micronutrients = Array.isArray(protocol.micronutrients) && protocol.micronutrients.length > 0 
    ? protocol.micronutrients 
    : [
        { id: 'iron', name: 'Iron', color: '#f43f5e', target: 'Bloating, fatigue, hair fall', sources: 'Dates, spinach, beetroot, jaggery' },
        { id: 'b12', name: 'Vitamin B12', color: '#8b5cf6', target: 'Mood swings, low energy', sources: 'Curd, paneer, fortified foods' },
        { id: 'vit_d', name: 'Vitamin D', color: '#f59e0b', target: 'Joint pain, low mood', sources: 'Sunlight + supplementation if deficient' },
        { id: 'magnesium', name: 'Magnesium', color: '#6366f1', target: 'Sleep, stress, cravings', sources: 'Pumpkin seeds, peanuts' },
        { id: 'zinc', name: 'Zinc', color: '#0ea5e9', target: 'Hair strength & skin healing', sources: 'Nuts, seeds, legumes' },
      ];

  const exerciseRoutine = protocol.exerciseRoutine || {
    morning: {
      title: '🌅 Morning Cardio (30–40 Mins)',
      activities: 'Cycling or brisk outdoor walking',
      benefits: 'Fat burning zone, insulin sensitivity & stimulates natural gut motility'
    },
    evening: {
      title: '💪 Evening Bodyweight Routine (20 Mins)',
      activities: 'Squats (3x15), Glute bridges (3x15), Wall push-ups (3x12), Planks (3x30s)',
      benefits: 'Tones glutes/core, improves posture, activates metabolism. Consistency > Intensity.'
    }
  };

  const sugarCutting = protocol.sugarCutting || {
    phases: [
      { week: 'Week 1', action: 'Remove added sugar from tea & coffee', status: 'Phase 1' },
      { week: 'Week 2', action: 'Replace sweets & bakery snacks with fresh fruits / dates', status: 'Phase 2' },
      { week: 'Week 3', action: 'Sugar strictly limited to festival / weekly cheat day', status: 'Phase 3' }
    ],
    cravingHack: '🧠 Craving Hack: Drink 1 glass warm water + take 5 slow deep breaths. Cravings fade in 90 seconds.'
  };
  
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

  // Export current protocol to Excel
  const handleExportExcel = () => {
    const res = exportHealthProtocolToExcel(protocol, currentUser?.name || 'My_Diet_Plan');
    if (res.success) {
      showToast(`📥 Exported: ${res.fileName}`);
    }
  };

  // Revert protocol to standard default template
  const handleRevertToDefault = () => {
    if (window.confirm('Are you sure you want to reset to the Standard Health & Care Protocol template?')) {
      resetHealthProtocolToDefault();
      showToast('🔄 Reverted back to Standard System Health Protocol.');
    }
  };

  // Clear/Delete entire protocol data
  const handleClearAllProtocol = () => {
    if (window.confirm('⚠️ Are you sure you want to DELETE/CLEAR all protocol targets and regimes?')) {
      updateHealthProtocol({
        meta: { isCustom: true, planName: 'Empty Protocol', uploadedAt: new Date().toISOString() },
        calories: {
          maintenance: 0,
          fatLossTarget: '0 kcal/day',
          expectedLoss: '0 kg/week',
          cheatDay: { target: '0 kcal', rules: '' },
          macros: []
        },
        micronutrients: [],
        skinCare: { daily: '', weeklySunday: '', weeklyTueFri: '', notes: '' },
        bodyCare: { sunday: '', tueFri: '', notes: '' },
        hairCare: { daily: '', weekly: '', biWeekly: '', notes: '' },
        exerciseRoutine: {
          morning: { title: '', activities: '', benefits: '' },
          evening: { title: '', activities: '', benefits: '' }
        },
        sugarCutting: { phases: [], cravingHack: '' }
      });
      showToast('🗑️ All protocol data has been cleared.');
    }
  };

  // --- 1. MACROS & CALORIES ACTIONS ---
  const handleOpenEditCalories = () => {
    setFormData({
      maintenance: calories.maintenance || 1850,
      fatLossTarget: calories.fatLossTarget || '1350–1450 kcal/day',
      expectedLoss: calories.expectedLoss || '0.5–0.7 kg/week (healthy & sustainable)',
      cheatTarget: calories.cheatDay?.target || '1800–1900 kcal',
      cheatRules: calories.cheatDay?.rules || 'No binge eating • Protein + Fiber first • Stop at 80% fullness',
      macros: macros.map(m => ({ ...m })),
    });
    setActiveModal('calories');
  };

  const handleAddMacroRow = () => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#0ea5e9'];
    setFormData(prev => ({
      ...prev,
      macros: [
        ...(prev.macros || []),
        {
          id: `macro-${Date.now()}`,
          name: '',
          amount: '',
          percentage: '',
          color: colors[(prev.macros?.length || 0) % colors.length],
          purpose: '',
          foods: ''
        }
      ]
    }));
  };

  const handleRemoveMacroRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      macros: prev.macros.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateMacroRow = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.macros];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, macros: updated };
    });
  };

  const handleSaveCalories = (e) => {
    e.preventDefault();
    const cleanMacros = (formData.macros || []).filter(m => m.name.trim() !== '');
    updateHealthProtocol(prev => ({
      ...prev,
      calories: {
        ...prev.calories,
        maintenance: Number(formData.maintenance) || 1850,
        fatLossTarget: formData.fatLossTarget,
        expectedLoss: formData.expectedLoss,
        cheatDay: {
          target: formData.cheatTarget,
          frequency: '1 day / week only',
          rules: formData.cheatRules,
        },
        macros: cleanMacros,
      }
    }));
    setActiveModal(null);
    showToast('✅ Calorie & Macro targets updated successfully!');
  };

  const handleDeleteMacroDirect = (macroName) => {
    if (window.confirm(`Delete "${macroName}" macronutrient target?`)) {
      const updatedMacros = macros.filter(m => m.name !== macroName);
      updateHealthProtocol(prev => ({
        ...prev,
        calories: {
          ...prev.calories,
          macros: updatedMacros
        }
      }));
      showToast(`🗑️ Removed "${macroName}" macro.`);
    }
  };

  // --- 2. MICRONUTRIENTS ACTIONS ---
  const handleOpenEditMicronutrients = () => {
    setFormData({
      items: micronutrients.map(item => ({ ...item })),
    });
    setActiveModal('micronutrients');
  };

  const handleAddMicronutrientRow = () => {
    const colors = ['#f43f5e', '#8b5cf6', '#f59e0b', '#6366f1', '#0ea5e9', '#10b981', '#ec4899'];
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `micro-${Date.now()}`,
          name: '',
          target: '',
          sources: '',
          color: colors[prev.items.length % colors.length],
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

  const handleDeleteMicronutrientDirect = (nutrientId, nutrientName) => {
    if (window.confirm(`Delete "${nutrientName}" from Micronutrients focus?`)) {
      const updated = micronutrients.filter(m => (m.id || m.name) !== (nutrientId || nutrientName));
      updateHealthProtocol(prev => ({
        ...prev,
        micronutrients: updated
      }));
      showToast(`🗑️ Removed "${nutrientName}" micronutrient.`);
    }
  };

  // --- 3. SKIN CARE ACTIONS ---
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

  const handleClearSkinCare = () => {
    if (window.confirm('Delete/Clear Skin Care regime details?')) {
      updateHealthProtocol(prev => ({
        ...prev,
        skinCare: { daily: '', weeklySunday: '', weeklyTueFri: '', notes: '' }
      }));
      showToast('🗑️ Skin care regime cleared.');
    }
  };

  // --- 4. BODY CARE ACTIONS ---
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

  const handleClearBodyCare = () => {
    if (window.confirm('Delete/Clear Body Care regime details?')) {
      updateHealthProtocol(prev => ({
        ...prev,
        bodyCare: { sunday: '', tueFri: '', notes: '' }
      }));
      showToast('🗑️ Body care regime cleared.');
    }
  };

  // --- 5. HAIR CARE ACTIONS ---
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

  const handleClearHairCare = () => {
    if (window.confirm('Delete/Clear Hair Care regime details?')) {
      updateHealthProtocol(prev => ({
        ...prev,
        hairCare: { daily: '', weekly: '', biWeekly: '', notes: '' }
      }));
      showToast('🗑️ Hair care regime cleared.');
    }
  };

  // --- 6. EXERCISE ACTIONS ---
  const handleOpenEditExercise = () => {
    setFormData({
      morningTitle: exerciseRoutine.morning?.title || '🌅 Morning Cardio (30–40 Mins)',
      morningActivities: exerciseRoutine.morning?.activities || '',
      morningBenefits: exerciseRoutine.morning?.benefits || '',
      eveningTitle: exerciseRoutine.evening?.title || '💪 Evening Bodyweight Routine (20 Mins)',
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

  const handleClearExercise = () => {
    if (window.confirm('Delete/Clear Exercise Routine details?')) {
      updateHealthProtocol(prev => ({
        ...prev,
        exerciseRoutine: {
          morning: { title: '', activities: '', benefits: '' },
          evening: { title: '', activities: '', benefits: '' }
        }
      }));
      showToast('🗑️ Exercise routine cleared.');
    }
  };

  // --- 7. SUGAR CUTTING ACTIONS ---
  const handleOpenEditSugar = () => {
    setFormData({
      phases: (sugarCutting.phases || []).map(p => ({ ...p })),
      cravingHack: sugarCutting.cravingHack || '🧠 Craving Hack: Drink 1 glass warm water + take 5 slow deep breaths. Cravings fade in 90 seconds.',
    });
    setActiveModal('sugar');
  };

  const handleAddSugarPhaseRow = () => {
    setFormData(prev => ({
      ...prev,
      phases: [
        ...(prev.phases || []),
        { week: `Week ${(prev.phases?.length || 0) + 1}`, action: '', status: `Phase ${(prev.phases?.length || 0) + 1}` }
      ]
    }));
  };

  const handleRemoveSugarPhaseRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateSugarPhaseRow = (idx, field, value) => {
    setFormData(prev => {
      const updated = [...prev.phases];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, phases: updated };
    });
  };

  const handleSaveSugar = (e) => {
    e.preventDefault();
    const cleanPhases = (formData.phases || []).filter(p => p.action.trim() !== '');
    updateHealthProtocol(prev => ({
      ...prev,
      sugarCutting: {
        phases: cleanPhases,
        cravingHack: formData.cravingHack,
      }
    }));
    setActiveModal(null);
    showToast('✅ Sugar cutting strategy updated!');
  };

  const handleDeleteSugarPhaseDirect = (idx) => {
    const updatedPhases = (sugarCutting.phases || []).filter((_, i) => i !== idx);
    updateHealthProtocol(prev => ({
      ...prev,
      sugarCutting: {
        ...prev.sugarCutting,
        phases: updatedPhases
      }
    }));
    showToast('🗑️ Removed sugar cutting phase.');
  };

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
                <span>⭐ CUSTOM PLAN: {meta.planName || meta.fileName || 'Personalized'}</span>
              </span>
            ) : (
              <span className="badge badge-success">
                <ShieldCheck size={14} />
                <span>🌿 STANDARD NUTRITION & CARE PROTOCOL</span>
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
              <span>Upload Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={downloadSampleDietTemplate}
              title="Download sample formatted Excel template"
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

            <button
              type="button"
              className="btn btn-ghost btn-sm text-amber"
              onClick={handleRevertToDefault}
              title="Reset back to standard template"
            >
              <RotateCcw size={14} />
              <span>Reset Template</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm text-danger"
              onClick={handleClearAllProtocol}
              title="Delete all protocol data"
            >
              <Trash2 size={14} />
              <span>Delete All Data</span>
            </button>
          </div>
        </div>

        <div className="hero-bottom-text">
          <h2 className="hero-heading">
            {isCustomPlan 
              ? `${currentUser?.name ? currentUser.name + "'s" : 'Personalized'} Nutrition & Wellness Protocol` 
              : 'Daily Calorie, Care & Nutrition Protocol'}
          </h2>
          <p className="hero-sub">
            Your structured targets for daily macros, essential micronutrients, workout routines, and dedicated Skin, Body & Hair care schedules.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Daily Calories & Macronutrient Targets */}
      {/* ========================================================================= */}
      <div className="section-container">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Flame size={20} className="text-amber" />
            <h3 className="section-title">1. Daily Calorie & Macronutrient Targets</h3>
          </div>
          <div className="title-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleOpenEditCalories}
            >
              <Edit3 size={14} />
              <span>Edit Calories & Macros</span>
            </button>
          </div>
        </div>

        {/* Calorie Stats Grid */}
        <div className="calories-stat-grid">
          <div className="card cal-card">
            <span className="cal-label">Maintenance Calories</span>
            <span className="cal-val">~{calories.maintenance || 1850} <small>kcal/day</small></span>
            <span className="cal-desc">Zero weight change baseline</span>
          </div>

          <div className="card cal-card highlight-card">
            <div className="card-top-tag">FAT LOSS TARGET</div>
            <span className="cal-label">Daily Calorie Target</span>
            <span className="cal-val text-primary">{calories.fatLossTarget || '1350–1450 kcal/day'}</span>
            <span className="cal-desc text-success">📉 Expected fat loss: {calories.expectedLoss || '0.5–0.7 kg/week (healthy & sustainable)'}</span>
          </div>

          <div className="card cal-card cheat-card">
            <div className="card-top-tag tag-amber">1 DAY / WEEK</div>
            <span className="cal-label">Cheat Day Budget</span>
            <span className="cal-val text-amber">{calories.cheatDay?.target || '1800–1900 kcal'}</span>
            <span className="cal-desc">{calories.cheatDay?.rules || 'No binge eating • Protein + Fiber first • Stop at 80% fullness'}</span>
          </div>
        </div>

        {/* Macros Breakdown Cards */}
        <div className="macros-grid">
          {macros.map((m) => (
            <div 
              key={m.id || m.name} 
              className="card macro-card"
              style={{ borderTopColor: m.color || 'var(--accent-primary)' }}
            >
              <div className="macro-header">
                <span className="macro-name" style={{ color: m.color || 'var(--accent-primary)' }}>{m.name}</span>
                <div className="macro-header-right">
                  <span className="macro-badge" style={{ backgroundColor: `${m.color || '#6366f1'}20`, color: m.color || 'var(--accent-primary)' }}>
                    {m.percentage}
                  </span>
                  <button
                    type="button"
                    className="btn-icon-sm btn-ghost text-danger delete-item-btn"
                    onClick={() => handleDeleteMacroDirect(m.name)}
                    title={`Delete ${m.name} macro`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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
      {/* 2. Micronutrients Focus */}
      {/* ========================================================================= */}
      <div className="section-container">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Apple size={20} className="text-emerald" />
            <h3 className="section-title">2. Micronutrients You Must Focus On</h3>
          </div>
          <div className="title-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={handleOpenEditMicronutrients}
            >
              <Edit3 size={14} />
              <span>Edit Micronutrients</span>
            </button>
          </div>
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
                <div className="micro-header-right">
                  <span className="micro-target-tag">{micro.target}</span>
                  <button
                    type="button"
                    className="btn-icon-sm btn-ghost text-danger delete-item-btn"
                    onClick={() => handleDeleteMicronutrientDirect(micro.id, micro.name)}
                    title={`Delete ${micro.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
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
      {/* 3. Skin, Body & Hair Care Regimes */}
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
              <div className="regime-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenEditSkinCare}
                  title="Edit Skin Care"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="btn-icon-sm btn-ghost text-danger"
                  onClick={handleClearSkinCare}
                  title="Clear Skin Care"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="regime-body">
              <div className="regime-item">
                <div className="regime-tag tag-daily">
                  <Clock size={12} />
                  <span>Daily</span>
                </div>
                <div className="regime-content">
                  <strong>AM & PM:</strong> {skinCare.daily || 'Not specified'}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Weekly</span>
                </div>
                <div className="regime-content">
                  <p>• <strong>Sunday:</strong> {skinCare.weeklySunday || 'Face shaving and scrub'}</p>
                  <p>• <strong>Tuesday & Friday:</strong> {skinCare.weeklyTueFri || 'Face pack'}</p>
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
              <div className="regime-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenEditBodyCare}
                  title="Edit Body Care"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="btn-icon-sm btn-ghost text-danger"
                  onClick={handleClearBodyCare}
                  title="Clear Body Care"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="regime-body">
              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Sunday</span>
                </div>
                <div className="regime-content">
                  <strong>Sunday Routine:</strong> {bodyCare.sunday || 'Oiling, scrub, shaving'}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Tue & Fri</span>
                </div>
                <div className="regime-content">
                  <strong>Tuesday & Friday:</strong> {bodyCare.tueFri || 'Exfoliating body wash'}
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
              <div className="regime-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={handleOpenEditHairCare}
                  title="Edit Hair Care"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="btn-icon-sm btn-ghost text-danger"
                  onClick={handleClearHairCare}
                  title="Clear Hair Care"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="regime-body">
              <div className="regime-item">
                <div className="regime-tag tag-daily">
                  <Clock size={12} />
                  <span>Daily</span>
                </div>
                <div className="regime-content">
                  <strong>Daily:</strong> {hairCare.daily || 'Serum and hair growth water'}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-weekly">
                  <Calendar size={12} />
                  <span>Weekly</span>
                </div>
                <div className="regime-content">
                  <strong>Weekly Routine:</strong> {hairCare.weekly || '3x Oiling, hair pack, hair wash'}
                </div>
              </div>

              <div className="regime-item">
                <div className="regime-tag tag-biweekly">
                  <Calendar size={12} />
                  <span>Two Weeks Once</span>
                </div>
                <div className="regime-content">
                  <strong>Bi-Weekly Cycle:</strong> {hairCare.biWeekly || 'Two weeks once: Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)'}
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
      {/* 4. Fitness & Sugar Protocols */}
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
            <div className="proto-actions">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleOpenEditExercise}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
              <button 
                type="button" 
                className="btn-icon-sm btn-ghost text-danger"
                onClick={handleClearExercise}
                title="Clear Exercise Routine"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="exercise-grid">
            <div className="exercise-card">
              <span className="exercise-title">{exerciseRoutine.morning?.title || '🌅 Morning Cardio (30–40 Mins)'}</span>
              <p className="exercise-activities"><strong>Activities:</strong> {exerciseRoutine.morning?.activities || 'Cycling or brisk outdoor walking'}</p>
              <span className="exercise-benefits">✨ {exerciseRoutine.morning?.benefits || 'Fat burning zone, insulin sensitivity & stimulates natural gut motility'}</span>
            </div>

            <div className="exercise-card">
              <span className="exercise-title">{exerciseRoutine.evening?.title || '💪 Evening Bodyweight Routine (20 Mins)'}</span>
              <p className="exercise-activities"><strong>Activities:</strong> {exerciseRoutine.evening?.activities || 'Squats (3x15), Glute bridges (3x15), Wall push-ups (3x12), Planks (3x30s)'}</p>
              <span className="exercise-benefits">✨ {exerciseRoutine.evening?.benefits || 'Tones glutes/core, improves posture, activates metabolism. Consistency > Intensity.'}</span>
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
            <div className="proto-actions">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleOpenEditSugar}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>
          </div>

          <div className="sugar-phases-list">
            {(sugarCutting.phases || []).map((p, i) => (
              <div key={i} className="phase-row">
                <span className="phase-badge">{p.week}</span>
                <span className="phase-action">{p.action}</span>
                <button
                  type="button"
                  className="btn-icon-sm btn-ghost text-danger delete-phase-btn"
                  onClick={() => handleDeleteSugarPhaseDirect(i)}
                  title={`Delete ${p.week}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {sugarCutting.cravingHack && (
              <div className="craving-hack-box">
                {sugarCutting.cravingHack}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT MODALS */}
      {/* ========================================================================= */}

      {/* 1. Edit Calories & Macros Modal */}
      {activeModal === 'calories' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
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

              {/* Editable Macros Sub-list */}
              <div className="modal-subsection">
                <div className="subsection-header">
                  <label className="label" style={{ marginBottom: 0 }}>Macronutrients Breakdown</label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddMacroRow}
                  >
                    <Plus size={13} />
                    <span>Add Macro</span>
                  </button>
                </div>

                <div className="modal-scroll-area">
                  {(formData.macros || []).map((m, idx) => (
                    <div key={idx} className="edit-macro-card">
                      <div className="macro-edit-row">
                        <input
                          type="text"
                          className="input flex-1"
                          placeholder="Macro (e.g. Protein)"
                          value={m.name}
                          onChange={(e) => handleUpdateMacroRow(idx, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="input"
                          style={{ width: '90px' }}
                          placeholder="Ratio %"
                          value={m.percentage}
                          onChange={(e) => handleUpdateMacroRow(idx, 'percentage', e.target.value)}
                        />
                        <input
                          type="text"
                          className="input"
                          style={{ width: '110px' }}
                          placeholder="Amount (g)"
                          value={m.amount}
                          onChange={(e) => handleUpdateMacroRow(idx, 'amount', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn-icon btn-ghost text-danger"
                          onClick={() => handleRemoveMacroRow(idx)}
                          title="Remove Macro"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <input
                        type="text"
                        className="input"
                        placeholder="Target Purpose (e.g. Hair strength, muscle renewal)"
                        value={m.purpose}
                        onChange={(e) => handleUpdateMacroRow(idx, 'purpose', e.target.value)}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="Top Food Sources (e.g. Paneer, curd, dal, sprouts)"
                        value={m.foods}
                        onChange={(e) => handleUpdateMacroRow(idx, 'foods', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Targets</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Micronutrients Modal */}
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
                        placeholder="Target symptoms (e.g. Bloating, fatigue, hair fall)"
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
                        placeholder="Food sources (e.g. Dates, spinach, beetroot, jaggery)"
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

      {/* 3. Edit Skin Care Modal */}
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
                  placeholder="e.g. AM and PM (Cleanse, hydrate, sunscreen AM, barrier repair PM)"
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
                  placeholder="e.g. Sunday: Face shaving and scrub"
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
                  placeholder="e.g. Tuesday & Friday: Face pack"
                  value={formData.weeklyTueFri}
                  onChange={(e) => setFormData({ ...formData, weeklyTueFri: e.target.value })}
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
                <button type="submit" className="btn btn-primary">Save Skin Care</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Body Care Modal */}
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
                  placeholder="e.g. Sunday: Oiling, scrub, shaving"
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
                  placeholder="e.g. Tuesday & Friday: Exfoliating body wash"
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

      {/* 5. Edit Hair Care Modal */}
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
                  placeholder="e.g. 3x Oiling, hair pack, hair wash"
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
                  placeholder="e.g. Two weeks once: Saturday henna and Sunday avari podi (In the next alternate: Hair growth serum)"
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

      {/* 6. Edit Exercise Modal */}
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

      {/* 7. Edit Sugar Modal */}
      {activeModal === 'sugar' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-panel" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Sugar Cutting Strategy</h3>
              <button type="button" className="btn-icon btn-ghost" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveSugar} className="modal-form">
              <div className="modal-scroll-area">
                {(formData.phases || []).map((p, idx) => (
                  <div key={idx} className="sugar-edit-row">
                    <input
                      type="text"
                      className="input"
                      style={{ width: '110px' }}
                      value={p.week}
                      onChange={(e) => handleUpdateSugarPhaseRow(idx, 'week', e.target.value)}
                      placeholder="e.g. Week 1"
                    />
                    <input
                      type="text"
                      className="input flex-1"
                      value={p.action}
                      onChange={(e) => handleUpdateSugarPhaseRow(idx, 'action', e.target.value)}
                      placeholder="Action step (e.g. Remove added sugar...)"
                      required
                    />
                    <button
                      type="button"
                      className="btn-icon btn-ghost text-danger"
                      onClick={() => handleRemoveSugarPhaseRow(idx)}
                      title="Remove Phase"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSugarPhaseRow}
                style={{ alignSelf: 'flex-start' }}
              >
                <Plus size={14} />
                <span>+ Add Phase</span>
              </button>

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
          gap: 1.75rem;
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

        .title-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Calories Stat Grid */
        .calories-stat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .calories-stat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .cal-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          position: relative;
        }

        .highlight-card {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .cheat-card {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.04);
        }

        .card-top-tag {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--accent-primary);
        }

        .tag-amber {
          color: var(--accent-warning);
        }

        .cal-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
        }

        .cal-val {
          font-size: 1.45rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .cal-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        /* Macros Grid */
        .macros-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .macros-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .macro-card {
          padding: 1.25rem;
          border-top-width: 4px;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          position: relative;
        }

        .macro-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .macro-header-right {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .macro-name {
          font-size: 1.05rem;
          font-weight: 800;
        }

        .macro-badge {
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 800;
        }

        .macro-amount {
          font-size: 1.35rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .macro-purpose {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .macro-sources {
          font-size: 0.76rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.5rem 0.65rem;
          border-radius: var(--radius-sm);
          line-height: 1.35;
        }

        /* Micronutrients Grid */
        .micronutrients-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
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
          padding: 1.15rem;
          border-left-width: 4px;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          position: relative;
        }

        .micro-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .micro-header-right {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .micro-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .micro-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .micro-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .micro-target-tag {
          font-size: 0.72rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
        }

        .micro-sources-box {
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .sources-label {
          font-weight: 700;
          color: var(--text-secondary);
          font-size: 0.72rem;
        }

        .sources-text {
          color: var(--text-primary);
          font-size: 0.82rem;
          line-height: 1.4;
        }

        /* Care Regimes Grid */
        .care-regimes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 900px) {
          .care-regimes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .regime-card {
          padding: 1.35rem;
          border-top-width: 4px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
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
          gap: 0.65rem;
        }

        .regime-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .regime-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .bg-pink { background: linear-gradient(135deg, #ec4899, #db2777); }
        .bg-amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .bg-purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .bg-cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .bg-rose { background: linear-gradient(135deg, #f43f5e, #e11d48); }

        .regime-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .regime-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
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
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          align-self: flex-start;
          text-transform: uppercase;
        }

        .tag-daily { background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); }
        .tag-weekly { background: rgba(245, 158, 11, 0.15); color: var(--accent-warning); }
        .tag-biweekly { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }

        .regime-content {
          font-size: 0.83rem;
          color: var(--text-primary);
          line-height: 1.45;
        }

        .regime-content p {
          margin-bottom: 0.2rem;
        }

        .regime-notes-box {
          font-size: 0.78rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          padding: 0.55rem 0.75rem;
          line-height: 1.4;
        }

        /* Fitness & Sugar Grid */
        .protocol-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        @media (min-width: 850px) {
          .protocol-cards-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .protocol-section-card {
          padding: 1.35rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .proto-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .proto-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .proto-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .proto-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .proto-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .proto-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .exercise-grid {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .exercise-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .exercise-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .exercise-activities {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .exercise-benefits {
          font-size: 0.78rem;
          color: #10b981;
          line-height: 1.35;
        }

        /* Sugar Strategy */
        .sugar-phases-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .phase-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
        }

        .phase-badge {
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .phase-action {
          font-size: 0.83rem;
          color: var(--text-primary);
          flex: 1;
        }

        .craving-hack-box {
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: var(--radius-sm);
          padding: 0.75rem 0.9rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Button & Icon Utilities */
        .btn-icon-sm {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .btn-icon-sm:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .delete-item-btn {
          opacity: 0.7;
        }

        .delete-item-btn:hover {
          opacity: 1;
        }

        /* Modals & Subsections */
        .modal-scroll-area {
          max-height: 380px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-right: 0.35rem;
        }

        .modal-subsection {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .subsection-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .edit-macro-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .macro-edit-row {
          display: flex;
          gap: 0.45rem;
          align-items: center;
        }

        .edit-micro-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .micro-edit-top {
          display: flex;
          gap: 0.45rem;
          align-items: center;
        }

        .micro-input-name {
          width: 140px;
        }

        .micro-input-target {
          flex: 1;
        }

        .sugar-edit-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};
