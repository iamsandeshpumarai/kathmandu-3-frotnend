import React, { memo, useReducer, useState } from 'react';
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

  const initialState = {
    name: "",
    age: "", 
    gender: "",
    wardNumber: "",
    address: "",
    date: "",
    time: "",
    currentJob: "",
    familyNumber: "",
    phoneNumber: "",
    caste: "",
    class: "",
    religiousAffiliation: "",
    educationLevel: "",
    residencyStatus: "",
  };

  function reducerFun(state, action) {
    return {
      ...state,
      [action.field]: action.value,
    };
  }

  const [personalInfoState, dispatch] = useReducer(reducerFun, initialState);

  // --- Survey Reducer Logic ---
  const surveyReducer = (state, action) => {
    const { section, questionId, value, type, optionLabel } = action;
    const currentSection = state[section];

    const updatedQuestions = currentSection.questions.map((q) => {
      if (q.id === questionId) {
        if (type === 'checkbox') {
          return { ...q, answer: value };
        }

        if (type === 'text') {
          const currentAnswers = typeof q.answer === 'object' ? { ...q.answer } : {};
          return {
            ...q,
            answer: {
              ...currentAnswers,
              [optionLabel]: value, 
            },
          };
        }
      }
      return q;
    });

    return {
      ...state,
      [section]: { ...currentSection, questions: updatedQuestions },
    };
  };

  const [surveyState, surveyDispatch] = useReducer(surveyReducer, dataSurvey);
  const [activeSurvey, setActiveSurvey] = useState('Survey1');

  const sendData = useMutation({
    mutationFn: async (data) => {
      await api.post('/api/survey/createsurvey', { data });
    },
    onSuccess: function() {
      toast.success("Survey Saved Successfully");
    },
    onError: function(err) {
      toast.error(err?.response?.data?.message || "Failed to save survey");
    }
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
      
      {/* Header Info Forms */}
      <SurveyMetaForm state={personalInfoState} dispatch={dispatch} />
      <ResponsiveVoterTable state={personalInfoState} dispatch={dispatch} />

      {/* Dynamic Dropdown */}
      <div className="max-w-4xl mx-auto my-6 bg-white p-4 rounded-lg shadow-md">
        <label htmlFor="survey-select" className="block text-lg font-medium text-gray-700 mb-2">
          Select Survey
        </label>
        <select
          id="survey-select"
          value={activeSurvey}
          onChange={(e) => setActiveSurvey(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none transition-all text-lg cursor-pointer"
        >
          {Object.keys(surveyState).map((key) => (
            <option key={key} value={key}>
              {surveyState[key].Topic}
            </option>
          ))}
        </select>
      </div>

      {/* --- MOVED: Submit Section is now ABOVE the Survey --- */}



      {/* Survey Questions Component */}
      <Survey 
        dispatch={surveyDispatch} 
        DevData={surveyState[activeSurvey]} 
        section={activeSurvey} 
        onSubmit={handleSubmit} // Passing submit handler to the button in Survey header
        isPending={sendData.isPending}
      />

      {/* Bottom spacer for better mobile scrolling */}
      <div className="pb-20"></div>
    </div>
  );
};

export default memo(Home);