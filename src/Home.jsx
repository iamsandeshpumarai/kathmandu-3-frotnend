import React, { memo, useEffect, useReducer, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Components
import SurveyHeader from './Component/SurveyHeader';
import SurveyMetaForm from './Component/HeaderMetaForm';
import ResponsiveVoterTable from './Component/ResponsiveVoterTable';
import UserHeader from './Component/UserHeader';
import Survey from './Component/ResuableComponent/Survey';
import Loading from './Component/Loading/Loading';

// Utils / Context
import api from './utils/api';
import { useAuth } from './Component/Context/ContextDataprovider';

const Home = () => {
  const { user } = useAuth();
  const surveyRef = useRef(null);

  // --- 1. Fetch Data ---
  const { data: dataSurvey = [], isLoading } = useQuery({
    queryKey: ['surveyquestion'],
    queryFn: async () => {
      const response = await api.get('/api/survey/getsurveyquestions');
      return response.data.data;
    }
  });

  // --- 2. Reducers & State ---
  const personalInitialState = {
    name: "", age: "", gender: "", wardNumber: "", address: "",
    date: "", time: "", currentJob: "", familyNumber: "",
    phoneNumber: "", caste: "", class: "", religiousAffiliation: "",
    educationLevel: "", residencyStatus: "",
  };

  const personalReducer = (state, action) => ({ ...state, [action.field]: action.value });
  const [personalInfoState, personalDispatch] = useReducer(personalReducer, personalInitialState);

  // surveyState will hold the array of sections with answers
  const [surveyState, setSurveyState] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // --- 3. Sync API Data to Local State ---
  useEffect(() => {
    if (dataSurvey.length > 0) {
      setSurveyState(dataSurvey);
    }
    window.scrollTo(0, 0);
  }, [dataSurvey]);

  // --- 4. Survey Answer Handler ---
  // This replaces the complex surveyReducer for better clarity
  const handleSurveyUpdate = (sectionIndex, questionId, value, type, optionLabel) => {
    const updatedState = [...surveyState];
    const section = { ...updatedState[sectionIndex] };
    
    section.questions = section.questions.map((q) => {
      if (q._id === questionId) {
        if (type === 'checkbox') {
          return { ...q, answer: value };
        }
        if (type === 'text') {
          const currentAnswers = typeof q.answer === 'object' ? { ...q.answer } : {};
          return { ...q, answer: { ...currentAnswers, [optionLabel]: value } };
        }
      }
      return q;
    });

    updatedState[sectionIndex] = section;
    setSurveyState(updatedState);
  };

  // --- 5. Navigation Handlers ---
  const handleNext = () => {
    if (activeIndex < surveyState.length - 1) {
      setActiveIndex(prev => prev + 1);
      scrollToSurvey();
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
      scrollToSurvey();
    }
  };

  const scrollToSurvey = () => {
    setTimeout(() => {
      surveyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // --- 6. Submission ---
  const sendData = useMutation({
    mutationFn: async (data) => await api.post('/api/survey/createsurvey', { data }),
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

  // --- 7. Conditional Rendering ---
  if (isLoading || surveyState.length === 0) return <Loading />;

  const currentSectionData = surveyState[activeIndex];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <UserHeader />
      <SurveyHeader />
      
      <SurveyMetaForm state={personalInfoState} dispatch={personalDispatch} />
      <ResponsiveVoterTable state={personalInfoState} dispatch={personalDispatch} />

      {/* Anchor Point */}
      <div ref={surveyRef} className="scroll-mt-20" /> 

      <Survey 
        // Pass a wrapper to the dispatch to handle updates
        dispatch={(action) => handleSurveyUpdate(activeIndex, action.questionId, action.value, action.type, action.optionLabel)} 
        DevData={currentSectionData} 
        section={activeIndex} 
        onSubmit={handleSubmit} 
        isPending={sendData.isPending}
      />

      {/* Navigation Bar */}
    
    {/* Navigation Bar */}
<div className="max-w-4xl mx-auto my-6 flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-xl shadow-lg gap-4 border border-gray-100">
  <button
    onClick={handlePrev}
    disabled={activeIndex === 0}
    className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition-all border ${
      activeIndex === 0 
        ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" 
        : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
    }`}
  >
    ← Previous
  </button>

  <div className="text-center">
    <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-1">
      Section {activeIndex + 1} of {surveyState.length}
    </p>
    <h3 className="text-lg font-bold text-gray-800">{currentSectionData?.Topic}</h3>
  </div>

  <button
    onClick={handleNext}
    // Logic: Disable if activeIndex is the last index in the array
    disabled={activeIndex >= surveyState.length - 1}
    className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition-all shadow-md ${
      activeIndex >= surveyState.length - 1
        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
        : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
  >
    {activeIndex >= surveyState.length - 1 ? "End of Survey" : "Next Section →"}
  </button>
</div>
    
    </div>
  );
};

export default memo(Home);