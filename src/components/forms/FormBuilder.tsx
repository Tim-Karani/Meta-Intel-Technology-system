import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  Camera,
  CheckSquare,
  ListFilter
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { FormTemplate, FormQuestion, QuestionType } from '../../types';

export const FormBuilder: React.FC = () => {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('yes_no');
  const [newQuestionSection, setNewQuestionSection] = useState('General Execution');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [newQuestionScore, setNewQuestionScore] = useState(20);
  const [newQuestionHelp, setNewQuestionHelp] = useState('');

  // Preview runner state
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

  const loadData = () => {
    const loadedForms = storageService.getForms();
    setForms(loadedForms);
    if (!selectedForm && loadedForms.length > 0) {
      setSelectedForm(loadedForms[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleAddQuestion = () => {
    if (!selectedForm || !newQuestionText) return;

    const newQuestion: FormQuestion = {
      id: 'q_' + Date.now().toString(36),
      section: newQuestionSection,
      questionText: newQuestionText,
      questionType: newQuestionType,
      isRequired: newQuestionRequired,
      scoreWeight: newQuestionScore,
      helpText: newQuestionHelp || undefined,
      options: ['single_select', 'multi_select', 'dropdown'].includes(newQuestionType)
        ? ['Option A', 'Option B', 'Option C']
        : undefined
    };

    const updated: FormTemplate = {
      ...selectedForm,
      questions: [...selectedForm.questions, newQuestion]
    };

    setSelectedForm(updated);
    storageService.addForm(updated);
    setNewQuestionText('');
    setNewQuestionHelp('');
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedForm) return;
    const updated: FormTemplate = {
      ...selectedForm,
      questions: selectedForm.questions.filter(q => q.id !== questionId)
    };
    setSelectedForm(updated);
    storageService.addForm(updated);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Dynamic Form Studio &amp; Skip-Logic Builder</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build custom field audit questionnaires, scoring rubrics, skip logic, and mandatory camera evidence rules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              showPreview
                ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Exit Form Simulator' : 'Test Form Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Selector, Question Canvas, and Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Templates Directory */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Published Form Templates
          </h2>

          <div className="space-y-2">
            {forms.map(form => {
              const isSelected = selectedForm?.id === form.id;
              return (
                <div
                  key={form.id}
                  onClick={() => setSelectedForm(form)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                    v{form.version}.0
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{form.title}</h3>
                  <p className="text-[11px] text-slate-500">{form.category}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    <span>{form.questions.length} Questions</span>
                    <span className="text-emerald-600 font-bold">PUBLISHED</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Question Canvas OR Live Simulator */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-5">
          {selectedForm && !showPreview && (
            <>
              {/* Form Title & Info */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-extrabold text-slate-900">{selectedForm.title}</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                    Active Schema v{selectedForm.version}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Category: {selectedForm.category} &bull; Sections: {selectedForm.sections.join(' &bull; ')}
                </p>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Configured Questions &amp; Scoring Logic ({selectedForm.questions.length})
                </h3>

                {selectedForm.questions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{q.questionText}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                            <span className="bg-slate-200/80 px-2 py-0.5 rounded font-mono uppercase">
                              {q.questionType}
                            </span>
                            <span>Section: <strong>{q.section}</strong></span>
                            {q.scoreWeight && <span>Weight: <strong>{q.scoreWeight} pts</strong></span>}
                            {q.isRequired && <span className="text-rose-500 font-semibold">* Required</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {q.conditionalOnQuestionId && (
                      <div className="bg-amber-50 text-amber-800 text-[10px] px-2.5 py-1 rounded-lg border border-amber-200 font-mono">
                        Conditional: Displays only when Question #{q.conditionalOnQuestionId} == "{q.conditionalExpectedValue}"
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Box */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Add New Field Question</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Question Prompt *</label>
                    <input
                      type="text"
                      placeholder="e.g. Is promotional POSM poster visibly hung on entrance?"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Input Type</label>
                    <select
                      value={newQuestionType}
                      onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                    >
                      <option value="yes_no">Yes / No Switch</option>
                      <option value="number">Numeric Counter</option>
                      <option value="short_text">Short Text</option>
                      <option value="single_select">Single Select (Options)</option>
                      <option value="photo">Photo / Camera Upload</option>
                      <option value="currency_kes">Currency (KES)</option>
                      <option value="rating_5">Rating (1 to 5 Stars)</option>
                      <option value="signature">Customer Signature</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Section</label>
                    <input
                      type="text"
                      value={newQuestionSection}
                      onChange={(e) => setNewQuestionSection(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Score Weight (Points)</label>
                    <input
                      type="number"
                      value={newQuestionScore}
                      onChange={(e) => setNewQuestionScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="reqCheck"
                      checked={newQuestionRequired}
                      onChange={(e) => setNewQuestionRequired(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <label htmlFor="reqCheck" className="font-semibold text-slate-700 select-none">
                      Mandatory Required Field
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-xs"
                >
                  Insert Question into Schema
                </button>
              </div>
            </>
          )}

          {/* Interactive Form Simulator View */}
          {selectedForm && showPreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 text-purple-900">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold">Live Form Questionnaire Simulator (Mobile View)</span>
                </div>
                <span className="text-[10px] text-purple-700 font-mono">Simulating Flutter Form Engine</span>
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-4 max-w-lg mx-auto">
                <h3 className="text-sm font-black text-slate-900">{selectedForm.title}</h3>

                {selectedForm.questions.map((q, idx) => {
                  // Skip logic check
                  if (q.conditionalOnQuestionId) {
                    const parentVal = String(previewAnswers[q.conditionalOnQuestionId]);
                    if (parentVal !== q.conditionalExpectedValue) {
                      return null; // Conditional question hidden
                    }
                  }

                  return (
                    <div key={q.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                      <label className="font-bold text-slate-800 block">
                        {idx + 1}. {q.questionText} {q.isRequired && <span className="text-rose-500">*</span>}
                      </label>

                      {q.questionType === 'yes_no' && (
                        <div className="flex space-x-2">
                          {['true', 'false'].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setPreviewAnswers({ ...previewAnswers, [q.id]: val })}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${
                                previewAnswers[q.id] === val
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              {val === 'true' ? 'YES' : 'NO'}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.questionType === 'number' && (
                        <input
                          type="number"
                          placeholder="0"
                          value={previewAnswers[q.id] || ''}
                          onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      )}

                      {q.questionType === 'single_select' && q.options && (
                        <select
                          value={previewAnswers[q.id] || ''}
                          onChange={(e) => setPreviewAnswers({ ...previewAnswers, [q.id]: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">-- Choose Option --</option>
                          {q.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {q.questionType === 'photo' && (
                        <div className="p-3 border border-dashed border-blue-300 rounded-xl bg-blue-50/50 flex flex-col items-center justify-center text-blue-700">
                          <Camera className="w-5 h-5 mb-1" />
                          <span className="font-semibold text-[11px]">Hardware Camera Live Capture</span>
                          <span className="text-[10px] text-slate-400">GPS &amp; EXIF Timestamp stamped on submit</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
