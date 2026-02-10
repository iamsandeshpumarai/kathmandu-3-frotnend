import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Save, ChevronLeft, 
  CheckCircle2, XCircle, ListPlus, Type, 
  LayoutGrid, StickyNote, HelpCircle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
 // Your axios instance

const CreateSurvey = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Local State for Dynamic Form
  const [formData, setFormData] = useState({
    Topic: '',
    Subject: '',
    isActive: true,
    questions: [
      { 
        Question: '', 
        options: [{ type: 'checkbox', option: '' }], 
        answer: '' 
      }
    ]
  });

  // 2. React Query Mutation
  const createMutation = useMutation({
    mutationFn: (newSurvey) => api.post('/api/survey/createsurveyquestion', newSurvey),
    onSuccess: () => {
      queryClient.invalidateQueries(['surveys']);
      toast.success('Survey created successfully');
      navigate('/admin/surveylist');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create survey');
    },
  });

  // --- Handlers for Basic Info ---
  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Handlers for Questions ---
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { Question: '', options: [{ type: 'checkbox', option: '' }], answer: '' }]
    }));
  };

  const removeQuestion = (qIndex) => {
    const updatedQuestions = formData.questions.filter((_, index) => index !== qIndex);
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index].Question = value;
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  // --- Handlers for Options ---
  const addOption = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options.push({ type: 'checkbox', option: '' });
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, index) => index !== oIndex);
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[oIndex][field] = value;
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={20} /> Back to List
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all ${
                formData.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {formData.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {formData.isActive ? 'VISIBLE / ACTIVE' : 'HIDDEN / INACTIVE'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><LayoutGrid size={24}/></div>
              <h2 className="text-xl font-bold text-gray-800">Survey Identity</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">Survey Topic (Nepali/English)</label>
                <input 
                  required name="Topic" value={formData.Topic} onChange={handleBaseChange}
                  placeholder="e.g. विकाससँग सम्बन्धी प्रश्नावलीहरु"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">Subject / Category</label>
                <input 
                  required name="Subject" value={formData.Subject} onChange={handleBaseChange}
                  placeholder="e.g. क्षेत्रको समग्र अवस्था"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Section 2: Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                <StickyNote size={20} className="text-indigo-500"/> Questionnaire Builder
              </h3>
              <span className="text-sm text-gray-400 font-medium">{formData.questions.length} Questions Added</span>
            </div>

            <AnimatePresence mode="popLayout">
              {formData.questions.map((q, qIndex) => (
                <motion.div 
                  key={qIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group"
                >
                  {/* Remove Question Button */}
                  {formData.questions.length > 1 && (
                    <button 
                      type="button" onClick={() => removeQuestion(qIndex)}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}

                  <div className="flex gap-4 mb-6">
                    <div className="h-10 w-10 shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-indigo-100">
                      {qIndex + 1}
                    </div>
                    <div className="w-full space-y-4">
                      <input 
                        placeholder="Enter your question here..."
                        className="text-lg font-bold text-gray-800 w-full border-b-2 border-gray-50 focus:border-indigo-500 outline-none pb-2 transition-all placeholder:text-gray-300"
                        value={q.Question}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      />
                      
                      {/* Options List */}
                      <div className="space-y-3 mt-4">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
                          <ListPlus size={14}/> Answer Options
                        </label>
                        
                        {q.options.map((opt, oIndex) => (
                          <motion.div layout key={oIndex} className="flex gap-3 items-center">
                            <select 
                              value={opt.type}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'type', e.target.value)}
                              className="bg-gray-100 p-2 rounded-lg text-xs font-bold text-gray-600 outline-none border-none"
                            >
                              <option value="checkbox">Checkbox</option>
                              <option value="text">Text Input</option>
                            </select>
                            <input 
                              placeholder="Option text..."
                              className="flex-1 bg-gray-50 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                              value={opt.option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'option', e.target.value)}
                            />
                            {q.options.length > 1 && (
                              <button 
                                type="button" onClick={() => removeOption(qIndex, oIndex)}
                                className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                              >
                                <XCircle size={18}/>
                              </button>
                            )}
                          </motion.div>
                        ))}

                        <button 
                          type="button" onClick={() => addOption(qIndex)}
                          className="mt-2 text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline underline-offset-4"
                        >
                          <Plus size={14}/> Add another option
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button 
              type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={addQuestion}
              className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-gray-400 font-bold flex items-center justify-center gap-3 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
            >
              <Plus size={24} /> Add New Question Block
            </motion.button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-10 pb-20">
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-indigo-600 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
            >
              {createMutation.isPending ? 'Saving Survey...' : <><Save size={22}/> Publish Survey</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateSurvey;