import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Check, 
  Trash2, 
  Smile, 
  Zap, 
  Coffee, 
  Moon, 
  Heart, 
  ShieldAlert, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MOOD_OPTIONS = [
  { id: 'energized', label: 'Energized', icon: '⚡', color: '#10b981' },
  { id: 'productive', label: 'Productive', icon: '🔥', color: '#6366f1' },
  { id: 'focused', label: 'Focused', icon: '🎯', color: '#0ea5e9' },
  { id: 'calm', label: 'Calm & Steady', icon: '🧘', color: '#8b5cf6' },
  { id: 'tired', label: 'Low Energy', icon: '😴', color: '#f59e0b' },
  { id: 'recovery', label: 'Recovery / Rest', icon: '🩹', color: '#ec4899' },
];

const QUICK_PROMPTS = [
  { label: '🏆 Daily Win', text: '🏆 Daily Win: ' },
  { label: '🎯 Focus Area', text: '🎯 Focus: ' },
  { label: '💧 Hydration & Diet', text: '💧 Nutrition: ' },
  { label: '💪 Workout Feeling', text: '💪 Workout: ' },
  { label: '⚠️ Obstacle / Fix', text: '⚠️ Challenge: ' },
];

export const DailyHabitNoteCard = ({ currentDateStr = null }) => {
  const { 
    todayStr, 
    dailyHabitNotes = {}, 
    saveHabitDailyNote, 
    deleteHabitDailyNote 
  } = useApp();

  const activeDate = currentDateStr || todayStr;
  const existingNote = dailyHabitNotes[activeDate] || {};

  const [noteText, setNoteText] = useState(existingNote.note || '');
  const [selectedMood, setSelectedMood] = useState(existingNote.mood || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [showRecentNotes, setShowRecentNotes] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Sync state if activeDate changes or note from storage changes
  useEffect(() => {
    const current = dailyHabitNotes[activeDate] || {};
    setNoteText(current.note || '');
    setSelectedMood(current.mood || '');
  }, [activeDate, dailyHabitNotes]);

  // Debounced Auto-Save
  const saveTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setNoteText(text);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveHabitDailyNote(activeDate, { note: text, mood: selectedMood });
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    }, 800);
  };

  const handleMoodSelect = (moodId) => {
    const nextMood = selectedMood === moodId ? '' : moodId;
    setSelectedMood(nextMood);
    saveHabitDailyNote(activeDate, { note: noteText, mood: nextMood });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveHabitDailyNote(activeDate, { note: noteText, mood: selectedMood });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleInsertPrompt = (promptText) => {
    setNoteText(prev => {
      const separator = prev.trim() ? '\n' : '';
      const updated = `${prev}${separator}${promptText}`;
      saveHabitDailyNote(activeDate, { note: updated, mood: selectedMood });
      return updated;
    });
  };

  const handleClearNote = () => {
    if (window.confirm("Clear today's note?")) {
      deleteHabitDailyNote(activeDate);
      setNoteText('');
      setSelectedMood('');
    }
  };

  // Format today date nicely (e.g., Thursday, 24 Sep)
  const formattedDayTitle = (() => {
    try {
      const parts = activeDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }
      return activeDate;
    } catch {
      return activeDate;
    }
  })();

  // Filter other days with notes
  const pastDaysWithNotes = Object.keys(dailyHabitNotes)
    .filter(d => d !== activeDate && dailyHabitNotes[d]?.note?.trim())
    .sort()
    .reverse()
    .slice(0, 5);

  return (
    <div className="card daily-habit-note-card">
      {/* Header Bar */}
      <div className="dhnc-header">
        <div className="dhnc-title-wrap">
          <div className="dhnc-icon-badge">
            <FileText size={18} />
          </div>
          <div>
            <div className="dhnc-title-row">
              <h4 className="dhnc-title">Daily Habit Note & Reflection</h4>
              <span className="dhnc-date-tag">{formattedDayTitle}</span>
            </div>
            <p className="dhnc-subtitle">Record your mood, daily habit thoughts, wins, and reflections for today</p>
          </div>
        </div>

        <div className="dhnc-header-actions">
          {isSavedRecently && (
            <span className="dhnc-saved-indicator">
              <Check size={13} />
              <span>Saved</span>
            </span>
          )}

          <button
            type="button"
            className="btn-icon btn-ghost btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse note' : 'Expand note'}
            aria-label="Toggle note card"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="dhnc-body">
          {/* Mood / Energy Selector Row */}
          <div className="dhnc-mood-section">
            <span className="dhnc-section-lbl">Today's Mood & Energy:</span>
            <div className="dhnc-mood-chips-row">
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = selectedMood === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`mood-chip-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleMoodSelect(opt.id)}
                    style={{
                      borderColor: isSelected ? opt.color : undefined,
                      backgroundColor: isSelected ? `${opt.color}22` : undefined,
                      color: isSelected ? opt.color : undefined,
                    }}
                  >
                    <span className="mcb-icon">{opt.icon}</span>
                    <span className="mcb-lbl">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="dhnc-prompts-row">
            <span className="dhnc-prompts-lbl">Quick Add:</span>
            <div className="dhnc-prompts-list">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-prompt-pill"
                  onClick={() => handleInsertPrompt(p.text)}
                  title={`Insert "${p.label}" into note`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note Textarea */}
          <div className="dhnc-textarea-wrap">
            <textarea
              className="textarea dhnc-textarea"
              placeholder="✍️ Write your daily habit notes, workouts, wins, or routine reflections for today... (Auto-saves automatically)"
              value={noteText}
              onChange={handleTextChange}
              rows={3}
            />
          </div>

          {/* Footer Controls */}
          <div className="dhnc-footer">
            <div className="dhnc-footer-left">
              {pastDaysWithNotes.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-sub"
                  onClick={() => setShowRecentNotes(!showRecentNotes)}
                >
                  <Calendar size={13} />
                  <span>{showRecentNotes ? 'Hide Past Notes' : `Past Notes (${pastDaysWithNotes.length})`}</span>
                </button>
              )}
            </div>

            <div className="dhnc-footer-actions">
              {noteText.trim() && (
                <button
                  type="button"
                  className="btn-icon btn-ghost btn-xs text-danger"
                  onClick={handleClearNote}
                  title="Clear note"
                >
                  <Trash2 size={13} />
                </button>
              )}

              <button
                type="button"
                className="btn btn-primary btn-sm dhnc-save-btn"
                onClick={handleManualSave}
              >
                <Check size={14} />
                <span>Save Note</span>
              </button>
            </div>
          </div>

          {/* Past Notes Scroller / History Accordion */}
          {showRecentNotes && pastDaysWithNotes.length > 0 && (
            <div className="past-notes-container">
              <div className="past-notes-header">
                <Clock size={13} className="text-primary" />
                <span>Recent Daily Notes:</span>
              </div>
              <div className="past-notes-list">
                {pastDaysWithNotes.map((dStr) => {
                  const item = dailyHabitNotes[dStr];
                  const moodObj = MOOD_OPTIONS.find(m => m.id === item.mood);
                  return (
                    <div key={dStr} className="past-note-item">
                      <div className="pni-top">
                        <span className="pni-date">{dStr}</span>
                        {moodObj && (
                          <span className="pni-mood">
                            {moodObj.icon} {moodObj.label}
                          </span>
                        )}
                      </div>
                      <p className="pni-text">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
