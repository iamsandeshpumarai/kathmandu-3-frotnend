import React, { useMemo, useState } from 'react';

// --- User Detail Modal ---
const UserDetailsModal = ({ isOpen, onClose, title, users }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col scale-in-center">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{title}</h3>
            <p className="text-sm text-blue-600 font-bold">छनौट गर्ने व्यक्तिहरूको सूची ({users.length})</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-gray-800"
          >
            <span className="text-2xl font-light">&times;</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase text-gray-400 border-b tracking-widest bg-white sticky top-0">
                <th className="pb-3 font-black">नाम (Name)</th>
                <th className="pb-3 font-black text-center">उमेर (Age)</th>
                <th className="pb-3 font-black text-center">लिङ्ग (Gender)</th>
                <th className="pb-3 font-black text-center">वडा नं (Ward)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{user.name}</td>
                  <td className="py-4 text-gray-600 text-center">{user.age || '--'}</td>
                  <td className="py-4 text-gray-600 text-center">{user.gender || '--'}</td>
                  <td className="py-4 text-gray-600 text-center font-mono">{user.ward || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Data Processing Logic ---
const processSurveyData = (dataSurvey, userData) => {
  const summary = {};

  Object.entries(dataSurvey).forEach(([surveyKey, surveyInfo]) => {
    summary[surveyKey] = {
      topic: surveyInfo.Topic,
      subject: surveyInfo.Subject,
      questions: surveyInfo.questions.map((q) => {
        const qSummary = {
          id: q.id,
          question: q.Question,
          optionData: {}, 
          opinions: [],
        };

        q.options.forEach((opt) => {
          if (opt.type === "checkbox") {
            qSummary.optionData[opt.option] = [];
          }
        });

        userData.forEach((user) => {
          const userSurvey = user.surveys?.find((s) => s.surveyKey === surveyKey);
          const userAnswer = userSurvey?.answers?.find((a) => a.questionId === q.id);

          if (userAnswer) {
            const val = userAnswer.answer;
            if (typeof val === "string") {
              if (qSummary.optionData.hasOwnProperty(val)) {
                qSummary.optionData[val].push({
                  name: user.name,
                  age: user.age,
                  gender: user.gender,
                  ward: user.ward || user.wardNumber
                });
              } else if (val.trim() !== "") {
                qSummary.opinions.push({ userName: user.name, text: val });
              }
            } 
            else if (typeof val === "object" && val !== null) {
              Object.entries(val).forEach(([subLabel, text]) => {
                if (text && text.trim() !== "") {
                  qSummary.opinions.push({ userName: user.name, label: subLabel, text });
                }
              });
            }
          }
        });

        return qSummary;
      }),
    };
  });

  return summary;
};

const SurveyResultsComponent = ({ dataSurvey, userData }) => {
  const processedData = useMemo(() => processSurveyData(dataSurvey, userData), [dataSurvey, userData]);
  const [modal, setModal] = useState({ isOpen: false, title: '', users: [] });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 bg-gray-50 min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-3 tracking-tighter">प्रश्नावली नतिजा</h1>
        <p className="text-gray-500 font-medium">कुनै पनि विकल्पमा क्लिक गरेर छनौट गर्ने व्यक्तिहरूको विवरण हेर्नुहोस्</p>
      </header>

      {Object.entries(processedData).map(([key, survey]) => (
        <section key={key} className="mb-20">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-[2rem] p-8 mb-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-tight">{survey.topic}</h2>
              <p className="text-blue-100 text-lg opacity-80">{survey.subject}</p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          </div>

          <div className="grid gap-10">
            {survey.questions.map((q) => (
              <div key={q.id} className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="h-10 w-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200">Q</span>
                    <h3 className="text-2xl font-black text-gray-800 leading-tight">{q.question}</h3>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                    {/* LEFT: Clickable Option Table */}
                    <div className="xl:col-span-3">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 ml-2">विकल्प छनौट विवरण (Click any option)</h4>
                      <div className="overflow-hidden border border-gray-100 rounded-[1.5rem] bg-gray-50/50">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-100/50">
                              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-wider">विकल्प (Option)</th>
                              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center w-32">संख्या (Count)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {Object.entries(q.optionData).map(([opt, userList]) => (
                              <tr 
                                key={opt} 
                                onClick={() => userList.length > 0 && setModal({ isOpen: true, title: opt, users: userList })}
                                className={`group transition-all duration-300 ${
                                  userList.length > 0 
                                  ? 'hover:bg-white cursor-pointer active:scale-[0.99]' 
                                  : 'opacity-40 grayscale cursor-default'
                                }`}
                              >
                                <td className="p-5">
                                  <div className="flex flex-col">
                                    <span className={`text-base font-bold transition-colors ${userList.length > 0 ? 'text-gray-700 group-hover:text-indigo-600' : 'text-gray-400'}`}>
                                      {opt}
                                    </span>
                                    {userList.length > 0 && (
                                      <span className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        विवरण हेर्न क्लिक गर्नुहोस् ↑
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-5 text-center">
                                  <div className={`inline-flex items-center justify-center min-w-[3rem] h-10 px-3 rounded-2xl font-black text-sm transition-all shadow-sm ${
                                    userList.length > 0 
                                    ? 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-200 group-hover:shadow-lg' 
                                    : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {userList.length}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT: Opinions */}
                    <div className="xl:col-span-2">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-5 ml-2">खुल्ला सुझाव (Opinions)</h4>
                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                        {q.opinions.length > 0 ? q.opinions.map((op, idx) => (
                          <div key={idx} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:border-indigo-100 transition-all">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">
                                {op.userName}
                              </span>
                              {op.label && <span className="text-[9px] font-bold text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase">{op.label}</span>}
                            </div>
                            <p className="text-gray-700 text-sm italic leading-relaxed font-medium">"{op.text}"</p>
                          </div>
                        )) : (
                          <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300 font-bold text-sm bg-gray-50/30">
                            उपलब्ध छैन
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <UserDetailsModal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        users={modal.users}
      />
    </div>
  );
};

export default SurveyResultsComponent;