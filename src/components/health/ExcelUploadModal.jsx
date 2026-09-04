import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  X, 
  Clock, 
  Flame, 
  Sparkles, 
  Droplets, 
  ShieldCheck,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { 
  parseHealthProtocolFromExcel, 
  downloadSampleDietTemplate 
} from '../../services/excelProtocolParser';

export const ExcelUploadModal = ({ isOpen, onClose, onApply, targetUserName = null }) => {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('meals'); // 'meals' | 'macros' | 'fasting' | 'regimes'
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelected = async (selectedFile) => {
    if (!selectedFile) return;

    // Check extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMsg('Please upload a valid Excel spreadsheet (.xlsx, .xls) or CSV file.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    setIsParsing(true);
    setParseResult(null);

    try {
      const res = await parseHealthProtocolFromExcel(selectedFile);
      if (res.success) {
        setParseResult(res);
      } else {
        setErrorMsg(res.error || 'Failed to parse the file. Please check format.');
      }
    } catch (err) {
      setErrorMsg(`Error processing file: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleResetFile = () => {
    setFile(null);
    setParseResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmApply = () => {
    if (parseResult?.protocol) {
      onApply(parseResult.protocol, parseResult.stats);
      onClose();
    }
  };

  const protocol = parseResult?.protocol;
  const stats = parseResult?.stats;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel excel-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="excel-modal-header">
          <div className="header-icon-wrap">
            <FileSpreadsheet size={24} className="text-emerald" />
            <div>
              <h3 className="modal-title">
                {targetUserName ? `Upload Diet Protocol for ${targetUserName}` : 'Upload Health & Diet Excel Sheet'}
              </h3>
              <p className="modal-subtitle">
                Import personalized meal timetables, calorie targets, macros, fasting & care routines
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Template Download Banner */}
        <div className="template-banner">
          <div className="template-banner-info">
            <span className="template-badge">EXCEL TEMPLATE</span>
            <p className="template-text">
              Need the official template? Download our pre-formatted spreadsheet with all 6 structured sheets.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm template-dl-btn"
            onClick={downloadSampleDietTemplate}
          >
            <Download size={14} />
            <span>Download Template (.xlsx)</span>
          </button>
        </div>

        {/* Upload Dropzone (When no file parsed yet) */}
        {!parseResult && (
          <div 
            className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />

            <div className="dropzone-inner">
              <div className="dropzone-icon">
                <UploadCloud size={40} className="text-primary" />
              </div>
              <h4 className="dropzone-title">
                {isParsing ? 'Reading & Parsing Spreadsheet...' : 'Drop your Diet Excel or CSV file here'}
              </h4>
              <p className="dropzone-sub">
                Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> files
              </p>
              <button type="button" className="btn btn-primary btn-sm" disabled={isParsing}>
                {isParsing ? 'Analyzing Data...' : 'Browse Computer Files'}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="excel-error-alert">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsing Success Preview UI */}
        {parseResult && protocol && (
          <div className="excel-preview-container">
            {/* File Info Bar */}
            <div className="parsed-file-bar">
              <div className="file-info-left">
                <CheckCircle2 size={18} className="text-emerald" />
                <span className="parsed-filename">{stats?.fileName || file?.name}</span>
                <span className="parsed-badge">{stats?.sheetsParsed?.length || 1} Sheets Detected</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-xs"
                onClick={handleResetFile}
              >
                Change File
              </button>
            </div>

            {/* Quick Stats Highlights */}
            <div className="preview-stats-grid">
              <div className="preview-stat-card">
                <Utensils size={18} className="text-primary" />
                <div className="stat-content">
                  <span className="stat-val">{stats?.totalMealsParsed || 0}</span>
                  <span className="stat-lbl">Daily Meals</span>
                </div>
              </div>

              <div className="preview-stat-card">
                <Flame size={18} className="text-amber" />
                <div className="stat-content">
                  <span className="stat-val">{stats?.totalCaloriesFromMeals || protocol.calories?.fatLossTarget || 1400}</span>
                  <span className="stat-lbl">Meal Calories</span>
                </div>
              </div>

              <div className="preview-stat-card">
                <Droplets size={18} className="text-cyan" />
                <div className="stat-content">
                  <span className="stat-val">{protocol.fastingAndWater?.waterTargetLiters || 3.5}L</span>
                  <span className="stat-lbl">Water Target</span>
                </div>
              </div>

              <div className="preview-stat-card">
                <ShieldCheck size={18} className="text-emerald" />
                <div className="stat-content">
                  <span className="stat-val">{protocol.fastingAndWater?.fastingProtocol || '16:8'}</span>
                  <span className="stat-lbl">Fasting Mode</span>
                </div>
              </div>
            </div>

            {/* Preview Tabs */}
            <div className="preview-tabs-row">
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === 'meals' ? 'active' : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                🍽️ Meal Schedule ({protocol.mealSchedule?.length || 0})
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === 'macros' ? 'active' : ''}`}
                onClick={() => setActiveTab('macros')}
              >
                📊 Macros & Calories
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === 'fasting' ? 'active' : ''}`}
                onClick={() => setActiveTab('fasting')}
              >
                💧 Fasting & Hydration
              </button>
              <button
                type="button"
                className={`preview-tab-btn ${activeTab === 'regimes' ? 'active' : ''}`}
                onClick={() => setActiveTab('regimes')}
              >
                💆 Self-Care Regimes
              </button>
            </div>

            {/* Tab Contents */}
            <div className="preview-tab-body">
              {/* MEALS TAB */}
              {activeTab === 'meals' && (
                <div className="meals-preview-list">
                  {(protocol.mealSchedule || []).map((m, idx) => (
                    <div key={m.id || idx} className="meal-preview-item">
                      <div className="meal-time-badge">
                        <Clock size={12} />
                        <span>{m.time}</span>
                      </div>
                      <div className="meal-preview-info">
                        <h5 className="meal-preview-title">{m.name}</h5>
                        <p className="meal-preview-dishes"><strong>Dishes:</strong> {m.dishes}</p>
                        {m.hairSkinBenefits && (
                          <span className="meal-preview-benefits">✨ <strong>Benefits:</strong> {m.hairSkinBenefits}</span>
                        )}
                      </div>
                      <div className="meal-preview-macros">
                        {m.calories > 0 && <span className="cal-pill">{m.calories} kcal</span>}
                        {m.protein && <span className="protein-pill">{m.protein}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MACROS TAB */}
              {activeTab === 'macros' && (
                <div className="macros-preview-tab">
                  <div className="macro-targets-box">
                    <div className="target-row">
                      <span className="target-label">Maintenance Baseline:</span>
                      <span className="target-val">{protocol.calories?.maintenance} kcal/day</span>
                    </div>
                    <div className="target-row">
                      <span className="target-label">Daily Fat Loss Target:</span>
                      <span className="target-val text-primary font-bold">{protocol.calories?.fatLossTarget}</span>
                    </div>
                    <div className="target-row">
                      <span className="target-label">Expected Fat Loss Rate:</span>
                      <span className="target-val text-success">{protocol.calories?.expectedLoss}</span>
                    </div>
                    <div className="target-row">
                      <span className="target-label">Cheat Day Target:</span>
                      <span className="target-val text-amber">{protocol.calories?.cheatDay?.target}</span>
                    </div>
                  </div>

                  <div className="macro-breakdown-cards">
                    {(protocol.calories?.macros || []).map(m => (
                      <div key={m.id || m.name} className="macro-preview-card" style={{ borderTopColor: m.color }}>
                        <span className="macro-prev-name" style={{ color: m.color }}>{m.name}</span>
                        <span className="macro-prev-val">{m.amount} ({m.percentage})</span>
                        <span className="macro-prev-foods"><strong>Key Foods:</strong> {m.foods}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FASTING TAB */}
              {activeTab === 'fasting' && (
                <div className="fasting-preview-tab">
                  <div className="fasting-info-card">
                    <h5 className="fasting-card-title">⏳ {protocol.fastingAndWater?.fastingProtocol}</h5>
                    <p className="fasting-card-desc">{protocol.fastingAndWater?.fastingWindow}</p>
                    <span className="fasting-card-notes">📝 {protocol.fastingAndWater?.fastingNotes}</span>
                  </div>

                  <div className="fasting-info-card">
                    <h5 className="fasting-card-title">💧 Hydration Target: {protocol.fastingAndWater?.waterTargetLiters} Litres/day</h5>
                    <p className="fasting-card-desc">Equivalent to ~{protocol.fastingAndWater?.waterTargetGlasses} glasses of 250ml.</p>
                    <span className="fasting-card-notes">⚡ {protocol.fastingAndWater?.electrolyteHack}</span>
                  </div>
                </div>
              )}

              {/* REGIMES TAB */}
              {activeTab === 'regimes' && (
                <div className="regimes-preview-tab">
                  <div className="regime-prev-card">
                    <span className="regime-prev-title">✨ Skin Care Regime</span>
                    <p><strong>Daily:</strong> {protocol.skinCare?.daily}</p>
                    <p><strong>Sunday:</strong> {protocol.skinCare?.weeklySunday}</p>
                    <p><strong>Tue & Fri:</strong> {protocol.skinCare?.weeklyTueFri}</p>
                  </div>

                  <div className="regime-prev-card">
                    <span className="regime-prev-title">💆 Hair Care Regime</span>
                    <p><strong>Daily:</strong> {protocol.hairCare?.daily}</p>
                    <p><strong>Weekly:</strong> {protocol.hairCare?.weekly}</p>
                    <p><strong>Bi-Weekly:</strong> {protocol.hairCare?.biWeekly}</p>
                  </div>

                  <div className="regime-prev-card">
                    <span className="regime-prev-title">🛁 Body Care Regime</span>
                    <p><strong>Sunday:</strong> {protocol.bodyCare?.sunday}</p>
                    <p><strong>Tue & Fri:</strong> {protocol.bodyCare?.tueFri}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Warnings Alert if any */}
            {stats?.warnings?.length > 0 && (
              <div className="preview-warnings-box">
                {stats.warnings.map((w, i) => (
                  <p key={i}>⚠️ {w}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="excel-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {parseResult && (
            <button
              type="button"
              className="btn btn-primary btn-apply"
              onClick={handleConfirmApply}
            >
              <Sparkles size={16} />
              <span>Apply Protocol to {targetUserName || 'Profile'}</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .excel-modal-panel {
          max-width: 720px;
          padding: 1.5rem;
        }

        .excel-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .header-icon-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .modal-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .template-banner {
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .template-banner-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .template-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.15);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          align-self: flex-start;
        }

        .template-text {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .upload-dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.02);
          padding: 2.5rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-dropzone:hover, .upload-dropzone.dragging {
          border-color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.05);
        }

        .dropzone-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .dropzone-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .dropzone-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .excel-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #ef4444;
          font-size: 0.82rem;
          margin-top: 1rem;
        }

        .excel-preview-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .parsed-file-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.65rem 1rem;
        }

        .file-info-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .parsed-filename {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .parsed-badge {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-success);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .preview-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.65rem;
        }

        @media (min-width: 640px) {
          .preview-stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .preview-stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-val {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-lbl {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .preview-tabs-row {
          display: flex;
          gap: 0.4rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.4rem;
          overflow-x: auto;
        }

        .preview-tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .preview-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .preview-tab-btn.active {
          color: var(--accent-primary);
          background: rgba(99, 102, 241, 0.12);
        }

        .preview-tab-body {
          max-height: 40vh;
          overflow-y: auto;
          padding-right: 0.35rem;
        }

        .meals-preview-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .meal-preview-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .meal-time-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .meal-preview-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .meal-preview-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .meal-preview-dishes {
          font-size: 0.78rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .meal-preview-benefits {
          font-size: 0.72rem;
          color: var(--accent-cyan);
        }

        .meal-preview-macros {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .cal-pill {
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(245, 158, 11, 0.15);
          color: var(--accent-warning);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .protein-pill {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .macro-targets-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 0.85rem;
        }

        .target-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .target-label {
          color: var(--text-muted);
        }

        .target-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .macro-breakdown-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.65rem;
        }

        .macro-preview-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-top: 3px solid var(--accent-primary);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .macro-prev-name {
          font-size: 0.82rem;
          font-weight: 800;
        }

        .macro-prev-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .macro-prev-foods {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        .fasting-info-card, .regime-prev-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 0.65rem;
        }

        .fasting-card-title, .regime-prev-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .fasting-card-desc, .regime-prev-card p {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin: 0.15rem 0;
        }

        .fasting-card-notes {
          font-size: 0.72rem;
          color: var(--accent-success);
        }

        .preview-warnings-box {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          font-size: 0.75rem;
          color: var(--accent-warning);
        }

        .excel-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-apply {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          color: white;
          font-weight: 800;
          gap: 0.5rem;
        }

        .btn-apply:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
