import React, { memo, useEffect, useReducer, useRef, useState } from 'react';
import SurveyHeader from './Component/SurveyHeader';
import SurveyMetaForm from './Component/HeaderMetaForm';
import ResponsiveVoterTable from './Component/ResponsiveVoterTable';
import { useMutation } from '@tanstack/react-query';
import api from './utils/api';
import { useAuth } from './Component/Context/ContextDataprovider';
import UserHeader from './Component/UserHeader';
import dataSurvey from './utils/data';
import Survey from './Component/ResuableComponent/Survey';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const surveyRef = useRef(null); 
  const isFirstRender = useRef(true);

  // --- States ---
  const initialState = {
    name: "", age: "", gender: "", wardNumber: "", address: "",
    date: "", time: "", currentJob: "", familyNumber: "",
    phoneNumber: "", caste: "", class: "", religiousAffiliation: "",
    educationLevel: "", residencyStatus: "",
  };

  const reducerFun = (state, action) => ({ ...state, [action.field]: action.value });
  const [personalInfoState, dispatch] = useReducer(reducerFun, initialState);

  const surveyReducer = (state, action) => {
    const { section, questionId, value, type, optionLabel } = action;
    const currentSection = state[section];
    const updatedQuestions = currentSection.questions.map((q) => {
      if (q.id === questionId) {
        if (type === 'checkbox') return { ...q, answer: value };
        if (type === 'text') {
          const currentAnswers = typeof q.answer === 'object' ? { ...q.answer } : {};
          return { ...q, answer: { ...currentAnswers, [optionLabel]: value } };
        }
      }
      return q;
    });
    return { ...state, [section]: { ...currentSection, questions: updatedQuestions } };
  };

  const [surveyState, surveyDispatch] = useReducer(surveyReducer, dataSurvey);
  const surveyKeys = Object.keys(surveyState);
  const [activeSurvey, setActiveSurvey] = useState(surveyKeys[0]);
  const currentIndex = surveyKeys.indexOf(activeSurvey);

  // --- 1. Fix for Refresh (Stay at top) ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- 2. Navigation Handlers with Timeout Fix ---
  const handleNext = () => {
    if (currentIndex < surveyKeys.length - 1) {
      setActiveSurvey(surveyKeys[currentIndex + 1]);
      
      // Delay the scroll slightly so React can finish rendering the next section
      setTimeout(() => {
        surveyRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); 
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveSurvey(surveyKeys[currentIndex - 1]);
      
      setTimeout(() => {
        surveyRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  const sendData = useMutation({
    mutationFn: async (data) => { await api.post('/api/survey/createsurvey', { data }); },
    onSuccess: () => toast.success("Survey Saved Successfully"),
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save survey")
  });

  const handleSubmit = () => {
    const fullData = {
      personalInfo: personalInfoState,
      surveys: surveyState,
      submittedBy: user?.id || "anonymous"
    };
    sendData.mutate(fullData);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <UserHeader />
      <SurveyHeader />
      
      <SurveyMetaForm state={personalInfoState} dispatch={dispatch} />
      <ResponsiveVoterTable state={personalInfoState} dispatch={dispatch} />

      {/* Anchor Point */}
      <div ref={surveyRef} className="scroll-mt-10" /> 

      <Survey 
        dispatch={surveyDispatch} 
        DevData={surveyState[activeSurvey]} 
        section={activeSurvey} 
        onSubmit={handleSubmit} 
        isPending={sendData.isPending}
      />

      {/* Navigation Bar */}
      <div className="max-w-4xl mx-auto my-6 flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-xl shadow-lg gap-4 border border-gray-100">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition-all border ${
            currentIndex === 0 
              ? "bg-gray-50 text-gray-300 border-gray-200" 
              : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
          }`}
        >
          ← Previous
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">
            Section {currentIndex + 1} of {surveyKeys.length}
          </p>
          <h3 className="text-lg font-bold text-gray-800">{surveyState[activeSurvey].Topic}</h3>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === surveyKeys.length - 1}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition-all shadow-md ${
            currentIndex === surveyKeys.length - 1 
              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {currentIndex === surveyKeys.length - 1 ? "End of Survey" : "Next Section →"}
        </button>
      </div>

      <div className="pb-24"></div>
    </div>
  );
};

export default memo(Home);