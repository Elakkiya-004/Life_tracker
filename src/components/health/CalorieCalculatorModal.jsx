import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Target, 
  Calculator, 
  Utensils, 
  Activity, 
  Droplets, 
  Scale, 
  Check, 
  Sparkles, 
  Plus, 
  Trash2, 
  Search, 
  RotateCcw, 
  Info,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  HeartPulse,
  Camera,
  Image as ImageIcon,
  Loader2,
  Key,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  X,
  Send
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  FOOD_DATABASE,
  calculateNutritionPlan,
  calculateBMI,
  MEAL_TYPES,
} from '../../services/calorieCalculatorUtils';
import {
  analyzeMealWithOpenAI,
  getMealTargetCalories,
  getOpenAiApiKey,
  saveOpenAiApiKey,
  MEAL_CALORIE_DISTRIBUTION,
} from '../../services/aiCalorieService';

export const CalorieCalculatorModal = ({ isOpen, onClose, onApplySuccess }) => {
  const { healthProtocol, updateHealthProtocol, todayStr } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('ai_scanner'); // 'target' | 'ai_scanner' | 'tracker'
  
  // --- 1. Target & TDEE Calculator State ---
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' (kg, cm) | 'imperial' (lbs, ft+in)
  const [gender, setGender] = useState('female');
  const [age, setAge] = useState(25);
  const [weightKg, setWeightKg] = useState(60);
  const [weightLbs, setWeightLbs] = useState(132);
  const [heightCm, setHeightCm] = useState(162);
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(4);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [selectedGoal, setSelectedGoal] = useState('fat_loss_steady');
  const [appliedNotification, setAppliedNotification] = useState(false);

  // Sync unit values when switching systems
  const handleUnitSystemChange = (system) => {
    if (system === 'imperial' && unitSystem === 'metric') {
      const lbs = Math.round(weightKg * 2.20462);
      setWeightLbs(lbs);
      const totalInches = heightCm / 2.54;
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(Math.round(totalInches % 12));
    } else if (system === 'metric' && unitSystem === 'imperial') {
      const kg = Math.round(weightLbs / 2.20462);
      setWeightKg(kg);
      const cm = Math.round((heightFeet * 12 + heightInches) * 2.54);
      setHeightCm(cm);
    }
    setUnitSystem(system);
  };

  // Standardized metric values for computation
  const effectiveWeightKg = useMemo(() => {
    return unitSystem === 'metric' ? parseFloat(weightKg) || 60 : Math.round((parseFloat(weightLbs) || 132) / 2.20462);
  }, [unitSystem, weightKg, weightLbs]);

  const effectiveHeightCm = useMemo(() => {
    if (unitSystem === 'metric') return parseFloat(heightCm) || 160;
    const totalInches = (parseFloat(heightFeet) || 5) * 12 + (parseFloat(heightInches) || 0);
    return Math.round(totalInches * 2.54);
  }, [unitSystem, heightCm, heightFeet, heightInches]);

  // Compute full nutrition plan
  const plan = useMemo(() => {
    return calculateNutritionPlan({
      gender,
      weightKg: effectiveWeightKg,
      heightCm: effectiveHeightCm,
      ageYears: age,
      activityLevel,
      goalId: selectedGoal,
    });
  }, [gender, effectiveWeightKg, effectiveHeightCm, age, activityLevel, selectedGoal]);

  // Target calories to compare against: from calculation or from existing healthProtocol
  const activeCalorieTarget = useMemo(() => {
    if (plan?.targetCalories) return plan.targetCalories;
    const protoTarget = healthProtocol?.calories?.fatLossTarget;
    if (protoTarget) {
      const match = String(protoTarget).match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 1450;
  }, [plan, healthProtocol]);

  // --- 2. AI Meal Scanner State ---
  const [aiMealType, setAiMealType] = useState('lunch');
  const [aiText, setAiText] = useState('');
  const [aiImageBase64, setAiImageBase64] = useState(null);
  const [aiImagePreview, setAiImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getOpenAiApiKey());
  const fileInputRef = useRef(null);

  // Target calories specifically for the active meal
  const activeMealTargetKcal = useMemo(() => {
    return getMealTargetCalories(activeCalorieTarget, aiMealType);
  }, [activeCalorieTarget, aiMealType]);

  // Handle image upload & base64 conversion
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setAiImageBase64(base64Data);
      setAiImagePreview(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setAiImageBase64(null);
    setAiImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run AI Analysis
  const handleRunAiAnalysis = async (customPrompt = null) => {
    const textToAnalyze = customPrompt || aiText;
    if (!aiImageBase64 && (!textToAnalyze || !textToAnalyze.trim())) {
      alert('Please upload a food photo or enter ingredients / meal description.');
      return;
    }

    setIsAnalyzing(true);
    setAiResult(null);

    try {
      const result = await analyzeMealWithOpenAI({
        imageBase64: aiImageBase64,
        textDescription: textToAnalyze,
        mealType: aiMealType,
        dailyTargetCalories: activeCalorieTarget,
        mealTargetCalories: activeMealTargetKcal,
      });

      setAiResult(result);
    } catch (err) {
      console.error('AI Analysis failed:', err);
      alert('Analysis failed. Please check your network or API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save new API key
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    saveOpenAiApiKey(apiKeyInput);
    setShowApiKeySetting(false);
    alert('API key updated successfully!');
  };

  // --- 3. Meal & Food Calorie Tracker State ---
  const currentUserId = currentUser?.uid || 'default_user';
  const trackerStorageKey = `life_tracker_meals_${currentUserId}_${todayStr || new Date().toISOString().split('T')[0]}`;

  const [loggedMeals, setLoggedMeals] = useState(() => {
    try {
      const saved = localStorage.getItem(trackerStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reload when date or user switches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(trackerStorageKey);
      if (saved) setLoggedMeals(JSON.parse(saved));
      else setLoggedMeals([]);
    } catch {
      setLoggedMeals([]);
    }
  }, [trackerStorageKey]);

  // Save changes to storage
  const saveMealsToStorage = (updated) => {
    setLoggedMeals(updated);
    try {
      localStorage.setItem(trackerStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save meal log:', e);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    grams: 100,
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Filtered food catalog
  const filteredFoods = useMemo(() => {
    return FOOD_DATABASE.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            f.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Add item from food database
  const handleAddFoodFromDB = (foodItem) => {
    const newEntry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      mealType: selectedMealType,
      name: foodItem.name,
      icon: foodItem.icon,
      servingGrams: foodItem.servingGrams,
      servingLabel: foodItem.unit,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fats: foodItem.fats,
      multiplier: 1,
    };
    saveMealsToStorage([...loggedMeals, newEntry]);
  };

  // Add custom manual food
  const handleAddCustomFood = (e) => {
    e.preventDefault();
    if (!customFoodForm.name.trim() || !customFoodForm.calories) return;

    const newEntry = {
      id: `custom-meal-${Date.now()}`,
      mealType: selectedMealType,
      name: customFoodForm.name.trim(),
      icon: '🍽️',
      servingGrams: Number(customFoodForm.grams) || 100,
      servingLabel: `${customFoodForm.grams || 100}g`,
      calories: Math.round(Number(customFoodForm.calories) || 0),
      protein: parseFloat(Number(customFoodForm.protein || 0).toFixed(1)),
      carbs: parseFloat(Number(customFoodForm.carbs || 0).toFixed(1)),
      fats: parseFloat(Number(customFoodForm.fats || 0).toFixed(1)),
      multiplier: 1,
    };

    saveMealsToStorage([...loggedMeals, newEntry]);
    setCustomFoodForm({ name: '', calories: '', protein: '', carbs: '', fats: '', grams: 100 });
    setShowCustomForm(false);
  };

  // Import analyzed AI meal directly into today's logged meals
  const handleLogAiMealToPlate = () => {
    if (!aiResult) return;

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {}

    const newEntries = (aiResult.items || []).map((item, idx) => ({
      id: `ai-meal-${Date.now()}-${idx}`,
      mealType: aiMealType,
      name: item.name,
      icon: '🍽️',
      servingLabel: item.portion || '1 serving',
      calories: Math.round(item.calories || 0),
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fats: item.fats || 0,
      multiplier: 1,
    }));

    saveMealsToStorage([...loggedMeals, ...newEntries]);
    setActiveTab('tracker');
  };

  // Remove logged food
  const handleRemoveLoggedMeal = (id) => {
    saveMealsToStorage(loggedMeals.filter(m => m.id !== id));
  };

  // Clear today's logged meals
  const handleClearAllMeals = () => {
    if (window.confirm("Are you sure you want to clear today's food calorie log?")) {
      saveMealsToStorage([]);
    }
  };

  // Calculate totals from logged meals
  const trackerTotals = useMemo(() => {
    return loggedMeals.reduce((acc, item) => {
      const mult = item.multiplier || 1;
      return {
        calories: acc.calories + Math.round((item.calories || 0) * mult),
        protein: parseFloat((acc.protein + (item.protein || 0) * mult).toFixed(1)),
        carbs: parseFloat((acc.carbs + (item.carbs || 0) * mult).toFixed(1)),
        fats: parseFloat((acc.fats + (item.fats || 0) * mult).toFixed(1)),
      };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [loggedMeals]);

  const caloriesRemaining = Math.max(0, activeCalorieTarget - trackerTotals.calories);
  const caloriesOver = trackerTotals.calories > activeCalorieTarget ? trackerTotals.calories - activeCalorieTarget : 0;
  const progressPercent = Math.min(100, Math.round((trackerTotals.calories / activeCalorieTarget) * 100)) || 0;

  // --- Apply Plan to Active Health Protocol ---
  const handleApplyToProtocol = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    const updatedMacros = [
      {
        id: 'protein',
        name: 'Protein',
        amount: `${plan.macros.protein.grams} g`,
        percentage: `${plan.macros.protein.percentage}%`,
        color: '#ef4444',
        purpose: 'Muscle preservation, metabolism, satiety & tissue repair',
        foods: 'Paneer, curd, eggs, chicken breast, dal, sprouts, tofu'
      },
      {
        id: 'carbs',
        name: 'Carbohydrates',
        amount: `${plan.macros.carbs.grams} g`,
        percentage: `${plan.macros.carbs.percentage}%`,
        color: '#f59e0b',
        purpose: 'Sustained daily energy, workout stamina & brain focus',
        foods: 'Cooked rice, oats, whole wheat roti, fruits, vegetables'
      },
      {
        id: 'fats',
        name: 'Healthy Fats',
        amount: `${plan.macros.fats.grams} g`,
        percentage: `${plan.macros.fats.percentage}%`,
        color: '#10b981',
        purpose: 'Hormonal balance, cellular protection & vitamin absorption',
        foods: 'Almonds, walnuts, chia seeds, pure ghee, olive oil'
      }
    ];

    updateHealthProtocol(prev => {
      const base = prev || {};
      const baseCalories = base.calories || {};
      return {
        ...base,
        meta: {
          ...(base.meta || {}),
          isCustom: true,
          planName: `${FITNESS_GOALS[selectedGoal]?.shortLabel || 'Custom'} (${plan.targetCalories} kcal)`,
          uploadedAt: new Date().toISOString()
        },
        calories: {
          ...baseCalories,
          maintenance: plan.tdee,
          fatLossTarget: `${plan.targetCalories} kcal/day`,
          expectedLoss: plan.expectedLoss,
          cheatDay: baseCalories.cheatDay || {
            target: `${Math.round(plan.tdee * 1.05)} kcal`,
            frequency: '1 day / week only',
            rules: 'No binge eating • Protein + Fiber first • Stop at 80% fullness'
          },
          macros: updatedMacros,
        }
      };
    });

    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 4000);
    if (onApplySuccess) onApplySuccess(plan);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="cal-modal-header-title">
          <div className="cal-title-icon-box">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="cal-main-heading">AI Calorie & Nutrition Intelligence</h3>
            <p className="cal-sub-heading">Upload food photo, type ingredients, or calculate daily targets</p>
          </div>
        </div>
      }
      maxWidth="880px"
    >
      <div className="calorie-calc-container">
        {/* Navigation Tabs (3 Tabs) */}
        <div className="calc-tab-nav">
          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'ai_scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_scanner')}
          >
            <Sparkles size={16} className="text-amber" />
            <span>1. AI Food Scanner & Target Check</span>
          </button>

          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'target' ? 'active' : ''}`}
            onClick={() => setActiveTab('target')}
          >
            <Target size={16} />
            <span>2. TDEE & Target Calculator</span>
          </button>

          <button
            type="button"
            className={`calc-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            <Utensils size={16} />
            <span>3. Daily Meal Plate</span>
            {loggedMeals.length > 0 && (
              <span className="tab-counter-badge">{trackerTotals.calories} kcal</span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: AI FOOD SCANNER & PER-MEAL TARGET CHECK */}
        {/* ========================================================================= */}
        {activeTab === 'ai_scanner' && (
          <div className="calc-ai-scanner-view">
            {/* Meal Target Requirement Ribbon */}
            <div className="ai-target-ribbon card">
              <div className="ribbon-col">
                <span className="ribbon-lbl">SELECTED MEAL</span>
                <div className="meal-pill-row">
                  {MEAL_TYPES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`ribbon-meal-pill ${aiMealType === m.id ? 'active' : ''}`}
                      onClick={() => setAiMealType(m.id)}
                    >
                      {m.id === 'breakfast' && <Sun size={13} />}
                      {m.id === 'lunch' && <Utensils size={13} />}
                      {m.id === 'snacks' && <Coffee size={13} />}
                      {m.id === 'dinner' && <Moon size={13} />}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ribbon-col target-summary-col">
                <span className="ribbon-lbl">PER-MEAL TARGET REQUIREMENT</span>
                <div className="target-num-row">
                  <span className="target-num text-primary">{activeMealTargetKcal} <small>kcal</small></span>
                  <span className="target-sub-pct">
                    ({Math.round((MEAL_CALORIE_DISTRIBUTION[aiMealType]?.percent || 0.25) * 100)}% of daily {activeCalorieTarget} kcal)
                  </span>
                </div>
              </div>
            </div>

            {/* Input Section: Image Upload & Ingredient Input */}
            <div className="ai-input-grid">
              {/* Image Upload Box */}
              <div className="ai-upload-box card">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="meal-image-upload"
                />

                {aiImagePreview ? (
                  <div className="image-preview-container">
                    <img src={aiImagePreview} alt="Uploaded meal" className="uploaded-meal-img" />
                    <button
                      type="button"
                      className="btn-clear-img"
                      onClick={handleClearImage}
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                    <span className="image-ready-tag">📸 Photo Ready for AI Analysis</span>
                  </div>
                ) : (
                  <label htmlFor="meal-image-upload" className="upload-dropzone">
                    <div className="dropzone-icon-circle">
                      <Camera size={26} className="text-primary" />
                    </div>
                    <span className="dropzone-title">Upload Food Photo</span>
                    <span className="dropzone-sub">Click to browse or take a meal photo</span>
                    <span className="dropzone-badge">GPT-4o Vision Powered</span>
                  </label>
                )}
              </div>

              {/* Text Ingredients Input Box */}
              <div className="ai-text-box card">
                <div className="text-box-header">
                  <span className="calc-label">Tell Ingredients or Describe Your Meal</span>
                  <span className="text-hint">Natural language supported</span>
                </div>

                <textarea
                  className="ai-textarea"
                  rows={4}
                  placeholder="e.g. 2 boiled eggs, 1 slice whole wheat bread with butter, and black coffee... or 150g rice with 1 cup dal and paneer"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                />

                {/* Quick Examples */}
                <div className="quick-example-chips">
                  <span className="chips-label">Quick test:</span>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      setAiText('2 boiled eggs, 1 whole wheat toast, and 1 cup black coffee');
                      setAiMealType('breakfast');
                    }}
                  >
                    🥚 Eggs & Toast
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      setAiText('1 cup cooked white rice, 1 bowl moong dal, 100g paneer, and cucumber salad');
                      setAiMealType('lunch');
                    }}
                  >
                    🍚 Rice, Dal & Paneer
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      setAiText('2 steamed idlis with coconut chutney and sambar');
                      setAiMealType('breakfast');
                    }}
                  >
                    🥞 Idli & Sambar
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      setAiText('1 scoop whey protein, 1 banana, and 1 tbsp peanut butter');
                      setAiMealType('snacks');
                    }}
                  >
                    🥤 Protein Smoothie
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis CTA Button */}
            <div className="ai-cta-row">
              <button
                type="button"
                className="btn btn-primary btn-run-ai"
                onClick={() => handleRunAiAnalysis()}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Analyzing Ingredients & Calculating Calories...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Calculate Calories & Check Meal Requirement</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Results Output Container */}
            {aiResult && (
              <div className="ai-result-card card">
                {aiResult.notice && (
                  <div className="ai-notice-banner">
                    <Info size={16} />
                    <span>{aiResult.notice}</span>
                  </div>
                )}

                {/* Top Verdict Banner */}
                <div className={`meal-verdict-banner ${aiResult.targetComparison?.status || 'within_target'}`}>
                  <div className="verdict-icon-col">
                    {aiResult.targetComparison?.status === 'within_target' ? (
                      <CheckCircle size={28} className="text-success" />
                    ) : aiResult.targetComparison?.status === 'under_target' ? (
                      <AlertCircle size={28} className="text-amber" />
                    ) : (
                      <AlertTriangle size={28} className="text-danger" />
                    )}
                  </div>

                  <div className="verdict-text-col">
                    <h4 className="verdict-headline">{aiResult.targetComparison?.headline}</h4>
                    <p className="verdict-desc">{aiResult.targetComparison?.verdict}</p>
                    {aiResult.targetComparison?.proteinVerdict && (
                      <span className="verdict-protein-tag">
                        🍗 {aiResult.targetComparison.proteinVerdict}
                      </span>
                    )}
                  </div>

                  <div className="verdict-score-col">
                    <span className="score-val">{aiResult.totalCalories}</span>
                    <span className="score-lbl">MEAL KCAL</span>
                    <span className="score-target">Target: {aiResult.targetComparison?.mealTargetCalories} kcal</span>
                  </div>
                </div>

                {/* Macro Summary Row */}
                <div className="ai-macro-summary-grid">
                  <div className="ai-macro-box protein">
                    <span className="amb-lbl">🥩 Protein</span>
                    <span className="amb-val">{aiResult.totalProtein}g</span>
                    <span className="amb-kcal">{Math.round(aiResult.totalProtein * 4)} kcal</span>
                  </div>
                  <div className="ai-macro-box carbs">
                    <span className="amb-lbl">🍚 Carbohydrates</span>
                    <span className="amb-val">{aiResult.totalCarbs}g</span>
                    <span className="amb-kcal">{Math.round(aiResult.totalCarbs * 4)} kcal</span>
                  </div>
                  <div className="ai-macro-box fats">
                    <span className="amb-lbl">🥑 Healthy Fats</span>
                    <span className="amb-val">{aiResult.totalFats}g</span>
                    <span className="amb-kcal">{Math.round(aiResult.totalFats * 9)} kcal</span>
                  </div>
                  <div className="ai-macro-box fiber">
                    <span className="amb-lbl">🌾 Fiber</span>
                    <span className="amb-val">{aiResult.totalFiber || 3}g</span>
                    <span className="amb-kcal">Digestion</span>
                  </div>
                </div>

                {/* Detected Ingredients Breakdown Table */}
                <div className="detected-items-section">
                  <span className="dis-title">Detected Food Items & Estimated Portions</span>
                  <div className="detected-items-list">
                    {(aiResult.items || []).map((item, idx) => (
                      <div key={idx} className="detected-item-row">
                        <div className="dir-name-col">
                          <span className="dir-name">{item.name}</span>
                          <span className="dir-portion">{item.portion}</span>
                        </div>
                        <div className="dir-macros">
                          <span className="dir-pcf">
                            P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g
                          </span>
                        </div>
                        <div className="dir-cal">
                          <strong>{item.calories}</strong> kcal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Nutritional Suggestions */}
                {aiResult.targetComparison?.suggestions?.length > 0 && (
                  <div className="ai-suggestions-box">
                    <span className="sugg-title">💡 Dietitian's Recommendations to Hit Target</span>
                    <ul className="sugg-list">
                      {aiResult.targetComparison.suggestions.map((sugg, i) => (
                        <li key={i}>{sugg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action CTA: Log directly into Today's Meal Plate */}
                <div className="ai-result-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-log-ai-meal"
                    onClick={handleLogAiMealToPlate}
                  >
                    <Plus size={16} />
                    <span>Log This Meal to Today's {aiMealType.toUpperCase()} Plate</span>
                  </button>
                </div>
              </div>
            )}

            {/* Subtle API Key Management Accordion */}
            <div className="api-key-accordion">
              <button
                type="button"
                className="btn-toggle-key-view"
                onClick={() => setShowApiKeySetting(!showApiKeySetting)}
              >
                <Key size={13} />
                <span>OpenAI Vision API Configuration</span>
                <ChevronRight size={13} className={`chevron-icon ${showApiKeySetting ? 'rotate' : ''}`} />
              </button>

              {showApiKeySetting && (
                <form onSubmit={handleSaveApiKey} className="api-key-form card">
                  <label className="calc-label">OpenAI API Key (Saved securely in your browser)</label>
                  <div className="key-input-row">
                    <input
                      type="password"
                      placeholder="sk-proj-..."
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="calc-input key-input"
                    />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      Save Key
                    </button>
                  </div>
                  <span className="key-hint">
                    Key is used to power GPT-4o-mini multi-modal food photo recognition.
                  </span>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TDEE & TARGET CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'target' && (
          <div className="calc-target-view">
            {appliedNotification && (
              <div className="calc-applied-banner">
                <Sparkles size={16} />
                <span>
                  <strong>Success!</strong> Targets applied directly to your Health & Diet Protocol.
                </span>
              </div>
            )}

            <div className="calc-two-col-layout">
              {/* Left Column: Interactive Inputs */}
              <div className="calc-inputs-pane card">
                <div className="pane-header-row">
                  <span className="pane-title">Your Biometric Profile</span>
                  
                  {/* Metric / Imperial Toggle */}
                  <div className="unit-toggle-pill">
                    <button
                      type="button"
                      className={`unit-toggle-btn ${unitSystem === 'metric' ? 'active' : ''}`}
                      onClick={() => handleUnitSystemChange('metric')}
                    >
                      Metric (kg/cm)
                    </button>
                    <button
                      type="button"
                      className={`unit-toggle-btn ${unitSystem === 'imperial' ? 'active' : ''}`}
                      onClick={() => handleUnitSystemChange('imperial')}
                    >
                      Imperial (lbs/ft)
                    </button>
                  </div>
                </div>

                {/* Gender Selector */}
                <div className="calc-form-group">
                  <label className="calc-label">Gender (Metabolic Formula)</label>
                  <div className="gender-toggle-row">
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'female' ? 'active female' : ''}`}
                      onClick={() => setGender('female')}
                    >
                      👩 Female
                    </button>
                    <button
                      type="button"
                      className={`gender-btn ${gender === 'male' ? 'active male' : ''}`}
                      onClick={() => setGender('male')}
                    >
                      👨 Male
                    </button>
                  </div>
                </div>

                {/* Age & Weight Grid */}
                <div className="calc-row-2col">
                  <div className="calc-form-group">
                    <label className="calc-label">Age (years)</label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Math.max(12, parseInt(e.target.value) || 20))}
                      className="calc-input"
                    />
                  </div>

                  <div className="calc-form-group">
                    <label className="calc-label">
                      Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
                    </label>
                    {unitSystem === 'metric' ? (
                      <input
                        type="number"
                        min="30"
                        max="250"
                        step="0.5"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value) || 60)}
                        className="calc-input"
                      />
                    ) : (
                      <input
                        type="number"
                        min="60"
                        max="550"
                        step="1"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 132)}
                        className="calc-input"
                      />
                    )}
                  </div>
                </div>

                {/* Height Field */}
                <div className="calc-form-group">
                  <label className="calc-label">Height</label>
                  {unitSystem === 'metric' ? (
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        min="100"
                        max="250"
                        value={heightCm}
                        onChange={(e) => setHeightCm(parseFloat(e.target.value) || 160)}
                        className="calc-input"
                      />
                      <span className="input-suffix">cm</span>
                    </div>
                  ) : (
                    <div className="height-ft-in-row">
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          min="3"
                          max="8"
                          value={heightFeet}
                          onChange={(e) => setHeightFeet(parseInt(e.target.value) || 5)}
                          className="calc-input"
                        />
                        <span className="input-suffix">ft</span>
                      </div>
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                          className="calc-input"
                        />
                        <span className="input-suffix">in</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Level */}
                <div className="calc-form-group">
                  <label className="calc-label">Daily Activity Level</label>
                  <div className="activity-options-list">
                    {Object.values(ACTIVITY_LEVELS).map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        className={`activity-select-btn ${activityLevel === lvl.id ? 'active' : ''}`}
                        onClick={() => setActivityLevel(lvl.id)}
                      >
                        <div className="act-top">
                          <span className="act-name">{lvl.label}</span>
                          <span className="act-tag">{lvl.tag}</span>
                        </div>
                        <span className="act-desc">{lvl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Fitness Goal */}
                <div className="calc-form-group">
                  <label className="calc-label">Primary Fitness Goal</label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="calc-select"
                  >
                    {Object.values(FITNESS_GOALS).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.badge} {g.label} ({g.expectedWeeklyKg})
                      </option>
                    ))}
                  </select>
                  <p className="calc-help-text">
                    {FITNESS_GOALS[selectedGoal]?.desc}
                  </p>
                </div>
              </div>

              {/* Right Column: Real-Time Results & Actions */}
              <div className="calc-results-pane">
                {/* Hero Target Card */}
                <div className="calc-hero-card">
                  <div className="hero-target-top">
                    <span className="hero-target-badge">
                      <Flame size={14} className="text-amber" />
                      YOUR DAILY CALORIE GOAL
                    </span>
                    <span className="hero-target-tag">
                      {FITNESS_GOALS[selectedGoal]?.shortLabel}
                    </span>
                  </div>

                  <div className="hero-target-val-row">
                    <h2 className="hero-target-val">{plan.targetCalories}</h2>
                    <span className="hero-target-unit">kcal / day</span>
                  </div>

                  <div className="hero-target-meta">
                    {plan.deficitAmount < 0 ? (
                      <span className="meta-pill deficit">
                        <TrendingDown size={14} />
                        {Math.abs(plan.deficitAmount)} kcal Deficit
                      </span>
                    ) : plan.deficitAmount > 0 ? (
                      <span className="meta-pill surplus">
                        <TrendingUp size={14} />
                        +{plan.deficitAmount} kcal Surplus
                      </span>
                    ) : (
                      <span className="meta-pill maintain">
                        <Scale size={14} />
                        Zero Deficit (Maintenance)
                      </span>
                    )}

                    <span className="meta-pill rate">
                      ⚖️ {plan.expectedLoss}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="calc-metrics-grid">
                  <div className="metric-box card">
                    <span className="metric-lbl">TDEE (Maintenance)</span>
                    <span className="metric-val">{plan.tdee} <small>kcal</small></span>
                    <span className="metric-sub">Zero weight change</span>
                  </div>

                  <div className="metric-box card">
                    <span className="metric-lbl">BMR (Basal Rate)</span>
                    <span className="metric-val">{plan.bmr} <small>kcal</small></span>
                    <span className="metric-sub">Burned at complete rest</span>
                  </div>

                  <div className="metric-box card">
                    <span className="metric-lbl">BMI Index</span>
                    <span className="metric-val" style={{ color: plan.bmiInfo.color }}>
                      {plan.bmiInfo.bmi}
                    </span>
                    <span className="metric-sub" style={{ color: plan.bmiInfo.color }}>
                      {plan.bmiInfo.category}
                    </span>
                  </div>

                  <div className="metric-box card">
                    <span className="metric-lbl">Water Hydration</span>
                    <span className="metric-val text-primary">
                      {plan.waterLiters} <small>L/day</small>
                    </span>
                    <span className="metric-sub">Daily minimum intake</span>
                  </div>
                </div>

                {/* Macronutrient Split */}
                <div className="calc-macros-card card">
                  <div className="macros-header">
                    <span className="macros-title">Daily Macronutrient Targets</span>
                    <span className="macros-total-cal">{plan.targetCalories} Total kcal</span>
                  </div>

                  {/* Proportional Progress Bar */}
                  <div className="macro-proportion-bar">
                    <div
                      className="bar-segment protein"
                      style={{ width: `${plan.macros.protein.percentage}%` }}
                      title={`Protein ${plan.macros.protein.percentage}%`}
                    />
                    <div
                      className="bar-segment carbs"
                      style={{ width: `${plan.macros.carbs.percentage}%` }}
                      title={`Carbs ${plan.macros.carbs.percentage}%`}
                    />
                    <div
                      className="bar-segment fats"
                      style={{ width: `${plan.macros.fats.percentage}%` }}
                      title={`Fats ${plan.macros.fats.percentage}%`}
                    />
                  </div>

                  {/* Macros Detail List */}
                  <div className="macro-cards-row">
                    <div className="macro-card-sm protein-bg">
                      <div className="mc-top">
                        <span className="mc-name">🥩 Protein</span>
                        <span className="mc-pct">{plan.macros.protein.percentage}%</span>
                      </div>
                      <span className="mc-grams">{plan.macros.protein.grams} g</span>
                      <span className="mc-kcal">{plan.macros.protein.calories} kcal</span>
                    </div>

                    <div className="macro-card-sm carbs-bg">
                      <div className="mc-top">
                        <span className="mc-name">🍚 Carbs</span>
                        <span className="mc-pct">{plan.macros.carbs.percentage}%</span>
                      </div>
                      <span className="mc-grams">{plan.macros.carbs.grams} g</span>
                      <span className="mc-kcal">{plan.macros.carbs.calories} kcal</span>
                    </div>

                    <div className="macro-card-sm fats-bg">
                      <div className="mc-top">
                        <span className="mc-name">🥑 Fats</span>
                        <span className="mc-pct">{plan.macros.fats.percentage}%</span>
                      </div>
                      <span className="mc-grams">{plan.macros.fats.grams} g</span>
                      <span className="mc-kcal">{plan.macros.fats.calories} kcal</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  className="btn btn-primary w-full btn-apply-protocol"
                  onClick={handleApplyToProtocol}
                >
                  <Sparkles size={16} />
                  <span>Apply Directly to My Health Protocol</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MEAL & FOOD CALORIE TRACKER */}
        {/* ========================================================================= */}
        {activeTab === 'tracker' && (
          <div className="calc-tracker-view">
            {/* Daily Progress Dashboard Banner */}
            <div className="tracker-progress-banner card">
              <div className="banner-top-stats">
                <div className="prog-stat">
                  <span className="prog-lbl">CALORIES CONSUMED</span>
                  <span className="prog-val text-primary">{trackerTotals.calories} <small>kcal</small></span>
                </div>

                <div className="prog-stat">
                  <span className="prog-lbl">TARGET BUDGET</span>
                  <span className="prog-val">{activeCalorieTarget} <small>kcal</small></span>
                </div>

                <div className="prog-stat">
                  <span className="prog-lbl">
                    {caloriesOver > 0 ? 'BUDGET EXCEEDED' : 'REMAINING'}
                  </span>
                  <span className={`prog-val ${caloriesOver > 0 ? 'text-danger' : 'text-success'}`}>
                    {caloriesOver > 0 ? `+${caloriesOver}` : caloriesRemaining} <small>kcal</small>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="tracker-bar-track">
                <div 
                  className={`tracker-bar-fill ${caloriesOver > 0 ? 'over-limit' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Macro Tally Pills */}
              <div className="tracker-macros-pills">
                <span className="macro-pill protein">
                  🥩 Protein: <strong>{trackerTotals.protein}g</strong> / {plan?.macros?.protein?.grams || 80}g
                </span>
                <span className="macro-pill carbs">
                  🍚 Carbs: <strong>{trackerTotals.carbs}g</strong> / {plan?.macros?.carbs?.grams || 150}g
                </span>
                <span className="macro-pill fats">
                  🥑 Fats: <strong>{trackerTotals.fats}g</strong> / {plan?.macros?.fats?.grams || 45}g
                </span>
              </div>
            </div>

            <div className="calc-two-col-layout tracker-layout">
              {/* Left Column: Food Database Search & Adder */}
              <div className="food-catalog-pane card">
                {/* Meal Slot Selection */}
                <div className="meal-slot-selector">
                  <span className="calc-label">Adding to Meal:</span>
                  <div className="meal-type-btns">
                    {MEAL_TYPES.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        className={`meal-slot-btn ${selectedMealType === m.id ? 'active' : ''}`}
                        onClick={() => setSelectedMealType(m.id)}
                      >
                        {m.id === 'breakfast' && <Sun size={14} />}
                        {m.id === 'lunch' && <Utensils size={14} />}
                        {m.id === 'snacks' && <Coffee size={14} />}
                        {m.id === 'dinner' && <Moon size={14} />}
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="search-filter-row">
                  <div className="search-input-box">
                    <Search size={15} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search foods (e.g. egg, paneer, rice, oats)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowCustomForm(!showCustomForm)}
                  >
                    <Plus size={14} />
                    <span>Custom</span>
                  </button>
                </div>

                {/* Categories */}
                <div className="category-chips">
                  {['All', 'Night Diet Soups', 'Protein', 'Carbs', 'Fats', 'Produce'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === 'Night Diet Soups' ? '🍲 Night Diet Soups (20)' : cat}
                    </button>
                  ))}
                </div>

                {/* Custom Food Form */}
                {showCustomForm && (
                  <form onSubmit={handleAddCustomFood} className="custom-food-card card">
                    <span className="custom-food-title">Add Custom Food Item</span>
                    <div className="custom-inputs-grid">
                      <input
                        type="text"
                        placeholder="Food name (e.g. Protein Shake)"
                        value={customFoodForm.name}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, name: e.target.value })}
                        className="calc-input"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Portion (g/ml)"
                        value={customFoodForm.grams}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, grams: e.target.value })}
                        className="calc-input"
                      />
                      <input
                        type="number"
                        placeholder="Calories (kcal)"
                        value={customFoodForm.calories}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, calories: e.target.value })}
                        className="calc-input"
                        required
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Protein (g)"
                        value={customFoodForm.protein}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, protein: e.target.value })}
                        className="calc-input"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Carbs (g)"
                        value={customFoodForm.carbs}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, carbs: e.target.value })}
                        className="calc-input"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Fats (g)"
                        value={customFoodForm.fats}
                        onChange={(e) => setCustomFoodForm({ ...customFoodForm, fats: e.target.value })}
                        className="calc-input"
                      />
                    </div>
                    <div className="custom-form-actions">
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Plus size={14} /> Add to Meal
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowCustomForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Food Catalog List */}
                <div className="food-items-scroll">
                  {filteredFoods.map(food => (
                    <div key={food.id} className="food-catalog-item">
                      <div className="food-icon-box">{food.icon}</div>
                      <div className="food-info-col">
                        <span className="food-name">{food.name}</span>
                        <span className="food-serving">{food.unit}</span>
                      </div>
                      <div className="food-macros-badge">
                        <span className="food-cal">{food.calories} kcal</span>
                        <span className="food-pcf">
                          P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm btn-add-food"
                        onClick={() => handleAddFoodFromDB(food)}
                        title={`Add ${food.name} to ${selectedMealType}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Today's Logged Items */}
              <div className="logged-meals-pane card">
                <div className="pane-header-row">
                  <div>
                    <span className="pane-title">Today's Meal Plate</span>
                    <span className="pane-sub-info">
                      {loggedMeals.length} item{loggedMeals.length === 1 ? '' : 's'} recorded
                    </span>
                  </div>

                  {loggedMeals.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={handleClearAllMeals}
                      title="Clear today's meal log"
                    >
                      <Trash2 size={14} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {loggedMeals.length === 0 ? (
                  <div className="empty-meals-placeholder">
                    <Utensils size={32} className="text-sub opacity-50" />
                    <p className="empty-title">No meals logged for today yet</p>
                    <p className="empty-desc">
                      Select a food item from the catalog or use the AI Scanner to start tracking your daily calories and macros.
                    </p>
                  </div>
                ) : (
                  <div className="logged-meals-list">
                    {MEAL_TYPES.map(mealType => {
                      const itemsInMeal = loggedMeals.filter(m => m.mealType === mealType.id);
                      if (itemsInMeal.length === 0) return null;
                      const subTotalKcal = itemsInMeal.reduce((s, i) => s + (i.calories || 0), 0);

                      return (
                        <div key={mealType.id} className="meal-group-section">
                          <div className="meal-group-header">
                            <span className="mgh-title" style={{ color: mealType.color }}>
                              {mealType.label}
                            </span>
                            <span className="mgh-subtotal">{subTotalKcal} kcal</span>
                          </div>

                          <div className="meal-group-items">
                            {itemsInMeal.map(item => (
                              <div key={item.id} className="logged-item-row">
                                <span className="item-icon">{item.icon || '🍽️'}</span>
                                <div className="item-details">
                                  <span className="item-name">{item.name}</span>
                                  <span className="item-portion">{item.servingLabel}</span>
                                </div>
                                <div className="item-metrics">
                                  <span className="item-cal">{item.calories} kcal</span>
                                  <span className="item-macros">
                                    P: {item.protein}g | C: {item.carbs}g | F: {item.fats}g
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="btn-icon-sm btn-ghost text-danger"
                                  onClick={() => handleRemoveLoggedMeal(item.id)}
                                  title="Remove item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="calc-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close Calculator
          </button>
        </div>
      </div>
    </Modal>
  );
};
