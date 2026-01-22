import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import UserHeader from './UserHeader';
import { 
  User, MapPin, Calendar, Briefcase, Phone, 
  ClipboardList, AlertCircle, Loader2, CheckCircle2, X 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MySurveys = () => {
  // Track which survey is selected for the popup
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const { data: userDataArray, isLoading, isError } = useQuery({
    queryKey: ['mySurveyData'],
    queryFn: async () => {
      const response = await api.get('/api/survey/getuserSurveyData');
      return response.data.userData; 
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">डाटा लोड हुँदैछ...</p>
        </div>
      </div>
    );
  }

  if (isError || !userDataArray || userDataArray.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <UserHeader />
        <div className="max-w-xl mx-auto mt-20 p-8 text-center bg-white rounded-3xl shadow-xl">
          <AlertCircle className="text-orange-500 mx-auto mb-4" size={50} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">डाटा फेला परेन</h2>
          <Link to="/userdashboard" className="text-blue-600 font-bold underline">फारम भर्नुहोस्</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <UserHeader />
      
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-800">मेरो सर्वेक्षणहरू</h2>
          <p className="text-slate-500 font-medium">सबै पेश गरिएका विवरणहरू</p>
        </div>

        {/* LIST VIEW (Table style) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">नाम</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">वार्ड / उमेर</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">पेशा / फोन</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">मिति</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {userDataArray.map((submission) => (
                  <tr key={submission._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{submission.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      वार्ड: {submission.wardNumber} <br/> उमेर: {submission.age}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {submission.currentJob} <br/> {submission.phoneNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{submission.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSurvey(submission)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md transition-all"
                      >
                        विवरण हेर्नुहोस्
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* POP-UP MODAL WINDOW */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay background */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedSurvey(null)}
          ></div>

          {/* Modal Content - EXTRA WIDE */}
          <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{selectedSurvey.name}</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase">पूरा सर्वेक्षण विवरण • {selectedSurvey.date}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSurvey(null)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Scrollable Survey Data */}
            <div className="p-8 overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {selectedSurvey.surveys?.map((survey, sIdx) => (
                  <div key={sIdx} className="space-y-6">
                    <div className="flex items-center gap-3 border-b-2 border-blue-600 pb-2">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                        {sIdx + 1}
                      </span>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        {survey.surveyKey === 'Survey1' ? 'विकास सम्बन्धी' : 'राजनीतिक शल्यक्रिया'}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      {survey.answers.map((item, index) => (
                        <div key={index} className="group">
                          <h5 className="text-slate-600 font-bold text-sm mb-2 flex gap-2">
                            <span className="text-blue-400">Q{index + 1}.</span> {item.questionText}
                          </h5>
                          
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-blue-200 transition-colors">
                            {typeof item.answer === 'object' ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(item.answer).map(([q, a], i) => (
                                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-blue-500 font-black uppercase mb-1">{q || 'विवरण'}</p>
                                    <p className="text-sm font-bold text-slate-800">{a || '—'}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-base font-black text-slate-900 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                {item.answer || '—'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-right">
              <button 
                onClick={() => setSelectedSurvey(null)}
                className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySurveys;