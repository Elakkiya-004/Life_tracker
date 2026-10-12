import React from 'react';
import { useApp } from '../context/AppContext';
import { WorkoutSection } from '../components/health/WorkoutSection';
import { 
  ArrowLeft, 
  HeartPulse, 
  Dumbbell, 
  Flame, 
  Clock, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const ExerciseView = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="exercise-page-view page-container">
      {/* Top Header / Breadcrumbs Bar */}
      <div className="exercise-page-header card">
        <div className="exercise-header-nav-row">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm btn-back-protocol"
            onClick={() => setActiveTab('protocol')}
            title="Return to Health & Diet Protocol"
          >
            <ArrowLeft size={16} />
            <span>Back to Health Protocol</span>
          </button>

          <div className="exercise-header-breadcrumbs">
            <button 
              type="button" 
              className="breadcrumb-link"
              onClick={() => setActiveTab('protocol')}
            >
              <HeartPulse size={14} className="text-emerald" />
              <span>Health Protocol</span>
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-curr">Exercise & Workout</span>
          </div>

          <div className="exercise-header-actions">
            <span className="badge badge-success">
              <ShieldCheck size={13} />
              <span>100% Joint Safe • Zero Jumping</span>
            </span>
          </div>
        </div>

        <div className="exercise-header-title-box">
          <div className="exercise-header-icon-bubble">
            <Dumbbell size={28} className="text-purple" />
          </div>
          <div>
            <div className="soup-section-tag-row">
              <span className="badge badge-primary">🏃 DEDICATED WORKOUT SUITE</span>
              <span className="badge badge-warning">⚡ 20 MIN / SESSION</span>
              <span className="badge badge-success">🛡️ LOW-IMPACT</span>
              <span className="badge badge-info">📅 6-DAY SPLIT</span>
            </div>
            <h1 className="exercise-page-title">6-Day Low-Impact 20-Min Workout Protocol</h1>
            <p className="exercise-page-subtitle">
              Engineered specifically for sustainable fat-loss, muscle toning, and functional joint strength without high-impact stress. 
              Features structured daily focuses, progressive work/rest intervals, animated exercise demos, and an interactive timer player.
            </p>
          </div>
        </div>
      </div>

      {/* Main 6-Day Workout Suite Component */}
      <WorkoutSection />
    </div>
  );
};
