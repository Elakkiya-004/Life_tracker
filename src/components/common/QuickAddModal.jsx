import React, { useState } from 'react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { HabitModal } from '../habits/HabitModal';
import { TransactionModal } from '../finance/TransactionModal';
import { RoadmapModal } from '../roadmap/RoadmapModal';
import { 
  CheckCircle2, 
  Wallet, 
  Compass,
  ArrowRight 
} from 'lucide-react';

export const QuickAddModal = () => {
  const { isQuickAddOpen, setIsQuickAddOpen } = useApp();
  const [activeModal, setActiveModal] = useState(null); // 'habit' | 'transaction' | 'roadmap' | null

  const handleSelect = (type) => {
    setIsQuickAddOpen(false);
    setActiveModal(type);
  };

  return (
    <>
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Quick Log"
        maxWidth="420px"
      >
        <div className="quick-add-grid">
          <button 
            className="quick-add-card" 
            onClick={() => handleSelect('roadmap')}
          >
            <div className="quick-card-icon roadmap-bg">
              <Compass size={24} />
            </div>
            <div className="quick-card-info">
              <span className="quick-card-title">Career Milestone</span>
              <span className="quick-card-desc">Add custom week or study goal</span>
            </div>
            <ArrowRight size={16} className="quick-card-arrow" />
          </button>

          <button 
            className="quick-add-card" 
            onClick={() => handleSelect('habit')}
          >
            <div className="quick-card-icon habit-bg">
              <CheckCircle2 size={24} />
            </div>
            <div className="quick-card-info">
              <span className="quick-card-title">New Habit</span>
              <span className="quick-card-desc">Track a new daily routine</span>
            </div>
            <ArrowRight size={16} className="quick-card-arrow" />
          </button>

          <button 
            className="quick-add-card" 
            onClick={() => handleSelect('transaction')}
          >
            <div className="quick-card-icon finance-bg">
              <Wallet size={24} />
            </div>
            <div className="quick-card-info">
              <span className="quick-card-title">Expense or Income</span>
              <span className="quick-card-desc">Record financial cashflow</span>
            </div>
            <ArrowRight size={16} className="quick-card-arrow" />
          </button>
        </div>

        <style>{`
          .quick-add-grid {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .quick-add-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-color);
            background: var(--bg-card);
            cursor: pointer;
            text-align: left;
            font-family: inherit;
            transition: all 0.2s ease;
          }

          .quick-add-card:hover {
            background: var(--bg-card-hover);
            border-color: var(--accent-primary);
            transform: translateX(4px);
          }

          .quick-card-icon {
            width: 46px;
            height: 46px;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .roadmap-bg {
            background: rgba(14, 165, 233, 0.15);
            color: var(--accent-cyan);
          }

          .habit-bg {
            background: var(--accent-primary-glow);
            color: var(--accent-primary);
          }

          .finance-bg {
            background: rgba(16, 185, 129, 0.15);
            color: var(--accent-success);
          }

          .quick-card-info {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .quick-card-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .quick-card-desc {
            font-size: 0.75rem;
            color: var(--text-secondary);
          }

          .quick-card-arrow {
            color: var(--text-muted);
          }
        `}</style>
      </Modal>

      {/* Sub Modals */}
      {activeModal === 'roadmap' && (
        <RoadmapModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'habit' && (
        <HabitModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'transaction' && (
        <TransactionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
};
