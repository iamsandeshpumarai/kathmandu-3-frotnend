import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, Save, ArrowLeft, CheckSquare, 
  MessageSquare, ChevronDown, Type, ListPlus, 
  Loader2
} from 'lucide-react';
import api from '../../utils/api';

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [survey, setSurvey] = useState(null);

  // 1. Fetch Data
  const { isLoading, error } = useQuery({
    queryKey: ['onesurveyquestion', id],
    queryFn: async () => {
      const res = await api.get(`/api/survey/getsurveyquestion/${id}`);
      // Adapting to your specific console.log(data.data.surveyQuestion) structure
      const data = res.data.surveyQuestion;
      setSurvey(data);
      return data;
    },
    enabled: !!id,
  });

  // 2. Update Mutation
  const updateMutation = useMutation({
    mutationFn: (updatedData) => api.put(`/api/survey/updatesurveyquestion/${id}`, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(['onesurveyquestion', id]);
      alert("Survey updated successfully!");
    }
  });

  // --- Handlers ---
  const addQuestion = () => {
    const newQuestion = {
      Question: "New Question Text",
      options: [{ type: "checkbox", option: "New Option" }],
      answer: ""
    };
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
  };

  const removeQuestion = (qIndex) => {
    const newQuestions = survey.questions.filter((_, i) => i !== qIndex);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const updateQuestionText = (qIndex, text) => {
    const newQuestions = [...survey.questions];
    newQuestions[qIndex].Question = text;
    setSurvey({ ...survey, questions: newQuestions });
  };

  const addOption = (qIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[qIndex].options.push({ type: "checkbox", option: "New Option" });
    setSurvey({ ...survey, questions: newQuestions });
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const updateOptionData = (qIndex, oIndex, field, value) => {
    const newQuestions = [...survey.questions];
    newQuestions[qIndex].options[oIndex][field] = value;
    setSurvey({ ...survey, questions: newQuestions });
  };

  if (isLoading || !survey) return <Loader2/>
  if (error) return <div className="text-red-500 p-10">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4 shadow-sm flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <h1 className="text-lg font-bold hidden md:block">Survey Editor</h1>
        <button 
          onClick={() => updateMutation.mutate(survey)}
          disabled={updateMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <Save size={18} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        {/* Topic & Subject Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Survey Topic</label>
            <input 
              className="w-full text-2xl font-bold border-none focus:ring-0 p-0"
              value={survey.Topic}
              onChange={(e) => setSurvey({...survey, Topic: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
            <input 
              className="w-full text-gray-600 border-none focus:ring-0 p-0"
              value={survey.Subject}
              onChange={(e) => setSurvey({...survey, Subject: e.target.value})}
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {survey.questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Question {qIndex + 1}</span>
                <button 
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-400 hover:text-red-600 p-1 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <textarea 
                  className="w-full text-lg font-medium border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  rows="2"
                  value={q.Question}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  placeholder="Enter your question..."
                />

                {/* Options Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700">Options</label>
                    <button 
                      onClick={() => addOption(qIndex)}
                      className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add Option
                    </button>
                  </div>

                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex flex-col md:flex-row gap-3 p-3 bg-gray-50 rounded-lg group">
                      {/* Type Selector */}
                      <div className="flex items-center gap-2 bg-white border rounded px-2">
                        {opt.type === 'checkbox' ? <CheckSquare size={16} className="text-blue-500" /> : <MessageSquare size={16} className="text-purple-500" />}
                        <select 
                          className="border-none text-sm bg-transparent focus:ring-0 py-1"
                          value={opt.type}
                          onChange={(e) => updateOptionData(qIndex, oIndex, 'type', e.target.value)}
                        >
                          <option value="checkbox">Tick (Checkbox)</option>
                          <option value="text">Opinion (Text)</option>
                        </select>
                      </div>

                      {/* Option Text */}
                      <input 
                        className="flex-1 border-gray-300 rounded text-sm focus:ring-blue-500"
                        value={opt.option}
                        onChange={(e) => updateOptionData(qIndex, oIndex, 'option', e.target.value)}
                        placeholder={opt.type === 'text' ? "e.g., Other (please specify)" : "Option text"}
                      />

                      <button 
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-gray-400 hover:text-red-500 self-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <button 
          onClick={addQuestion}
          className="w-full mt-8 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition flex flex-col items-center justify-center gap-2"
        >
          <ListPlus size={24} />
          <span className="font-medium">Add New Question</span>
        </button>
      </div>
    </div>
  );
};

export default EditQuestion;