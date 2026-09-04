import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  Sunrise,
  Moon,
  Droplets, 
  Dumbbell, 
  BookOpen, 
  Heart,
  Sparkles, 
  Zap, 
  Target, 
  Footprints,
  Utensils,
  Clock
} from 'lucide-react';

const ICONS = [
  { id: 'Sunrise', icon: Sunrise, label: 'Morning' },
  { id: 'Sparkles', icon: Sparkles, label: 'Clean' },
  { id: 'Zap', icon: Zap, label: 'Energy' },
  { id: 'BookOpen', icon: BookOpen, label: 'Reading' },
  { id: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { id: 'Heart', icon: Heart, label: 'Self Care' },
  { id: 'Droplets', icon: Droplets, label: 'Water' },
  { id: 'Target', icon: Target, label: 'Diet/Focus' },
  { id: 'Footprints', icon: Footprints, label: 'Walking' },
  { id: 'Moon', icon: Moon, label: 'Sleep' },
  { id: 'Utensils', icon: Utensils, label: 'Meals' },
  { id: 'Clock', icon: Clock, label: 'Routine' },
];

const COLORS = [
  '#f59e0b', // Amber (Morning)
  '#0ea5e9', // Cyan (Water/Oral)
  '#8b5cf6', // Purple (Meditation/Reading)
  '#6366f1', // Indigo (Sleep/Journal)
  '#10b981', // Emerald (Fitness/Diet)
  '#ec4899', // Pink (Skin/Hair Care)
  '#f43f5e', // Rose
];

const CATEGORIES = [
  'Morning',
  'Health',
  'Fitness',
  'Self Care',
  'Growth',
  'Night',
  'Diet',
  'Custom',
];

const TIMES_OF_DAY = [
  { id: 'Morning', label: '🌅 Morning Routine (5 AM - 9 AM)' },
  { id: 'Daytime', label: '☀️ Daytime & Nutrition (9 AM - 6 PM)' },
  { id: 'Evening', label: '🌙 Evening & Night (6 PM - 11 PM)' },
];

export const HabitModal = ({ isOpen, onClose, habitToEdit = null }) => {
  const { addHabit, updateHabit } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Morning');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [icon, setIcon] = useState('Sunrise');
  const [color, setColor] = useState('#f59e0b');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(7);

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name || '');
      setCategory(habitToEdit.category || 'Morning');
      setTimeOfDay(habitToEdit.timeOfDay || 'Morning');
      setIcon(habitToEdit.icon || 'Sunrise');
      setColor(habitToEdit.color || '#f59e0b');
      setFrequency(habitToEdit.frequency || 'daily');
      setTargetDays(habitToEdit.targetDays || 7);
    } else {
      setName('');
      setCategory('Morning');
      setTimeOfDay('Morning');
      setIcon('Sunrise');
      setColor('#f59e0b');
      setFrequency('daily');
      setTargetDays(7);
    }
  }, [habitToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      category,
      timeOfDay,
      icon,
      color,
      frequency,
      targetDays: parseInt(targetDays, 10),
    };

    if (habitToEdit) {
      updateHabit(habitToEdit.id, payload);
    } else {
      addHabit(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? 'Edit Habit' : 'Create Routine Habit'}
    >
      <form onSubmit={handleSubmit} className="habit-form">
        {/* Habit Name */}
        <div className="input-group">
          <label className="label">Habit / Routine Name *</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Wake up 5 am, Morning meditation, 3L water"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Time of Day Grouping */}
        <div className="input-group">
          <label className="label">Time of Day (Chronological)</label>
          <select
            className="select"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
          >
            {TIMES_OF_DAY.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Category & Frequency */}
        <div className="form-row">
          <div className="input-group flex-1">
            <label className="label">Category</label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group flex-1">
            <label className="label">Target Days/Week</label>
            <select
              className="select"
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
            >
              <option value={7}>Everyday (7 days)</option>
              <option value={6}>6 days / week</option>
              <option value={5}>Weekdays (5 days)</option>
              <option value={3}>3 days / week</option>
            </select>
          </div>
        </div>

        {/* Icon Picker */}
        <div className="input-group">
          <label className="label">Choose Icon</label>
          <div className="icon-grid">
            {ICONS.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`icon-choice-btn ${icon === item.id ? 'active' : ''}`}
                  onClick={() => setIcon(item.id)}
                  style={{
                    borderColor: icon === item.id ? color : undefined,
                    backgroundColor: icon === item.id ? `${color}20` : undefined,
                    color: icon === item.id ? color : 'var(--text-secondary)'
                  }}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette */}
        <div className="input-group">
          <label className="label">Color Accent</label>
          <div className="color-row">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={`color-choice-btn ${color === c ? 'active' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {habitToEdit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>

      <style>{`
        .habit-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: flex;
          gap: 0.75rem;
        }

        .flex-1 {
          flex: 1;
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.4rem;
        }

        .icon-choice-btn {
          height: 40px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-choice-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .color-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .color-choice-btn {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .color-choice-btn:hover {
          transform: scale(1.15);
        }

        .color-choice-btn.active {
          border-color: #ffffff;
          transform: scale(1.15);
          box-shadow: 0 0 10px currentColor;
        }

        .form-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }
      `}</style>
    </Modal>
  );
};
