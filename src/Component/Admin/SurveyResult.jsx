import React, { useMemo, useState } from 'react';

// --- User Detail Modal ---
const UserDetailsModal = ({ isOpen, onClose, title, users }) => {
  if (!isOpen) return null;

  const handlePrintUsers = () => {
    const printContent = document.getElementById('printable-users-table').innerHTML;
    const printWindow = window.open('', '', 'height=700,width=1000');
    printWindow.document.write('<html><head><title>छनौट गर्ने व्यक्तिहरूको सूची</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: sans-serif; margin: 20px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }');
    printWindow.document.write('th { background-color: #f2f2f2; font-weight: bold; }');
    printWindow.document.write('h3 { text-align: center; margin-bottom: 20px; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(`<h3>${title} (${users.length} जना)</h3>`);
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-2xl font-black text-gray-800">{title}</h3>
            <p className="text-blue-600 font-bold">छनौट गर्ने व्यक्तिहरूको सूची ({users.length})</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-200 rounded-full transition-all text-3xl leading-none text-gray-400 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {/* Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div id="printable-users-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b bg-white sticky top-0">
                  <th className="pb-4 font-black">नाम (Name)</th>
                  <th className="pb-4 font-black text-center">उमेर (Age)</th>
                  <th className="pb-4 font-black text-center">लिङ्ग (Gender)</th>
                  <th className="pb-4 font-black text-center">वडा नं (Ward)</th>
                  <th className="pb-4 font-black text-center">पेशा (Profession)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors">
                    <td className="py-4 font-semibold text-gray-800">{user.name}</td>
                    <td className="py-4 text-center text-gray-600">{user.age || '--'}</td>
                    <td className="py-4 text-center text-gray-600">{user.gender || '--'}</td>
                    <td className="py-4 text-center font-mono text-gray-600">{user.ward || '--'}</td>
                    <td className="py-4 text-center text-gray-600">{user.profession || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
          <button
            onClick={handlePrintUsers}
            className="px-10 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md"
          >
            प्रिन्ट गर्नुहोस्
          </button>
          <button
            onClick={onClose}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Data Processing ---
const processSurveyData = (dataSurvey, userData) => {

  if (!dataSurvey || !Array.isArray(dataSurvey)) return [];

  const users = Array.isArray(userData) ? userData : userData?.userData || [];


// till here we extract the users data and the datasurvey 

  return dataSurvey.map((surveyInfo) => {

    const topic = surveyInfo.Topic || surveyInfo.topic || '';
    const subject = surveyInfo.Subject || surveyInfo.subject || '';
    const surveyId = surveyInfo._id 

    // Match survey by topic (most reliable) or surveyKey
    const relevantUsers = users.filter((u) =>
      u.surveys?.some(
        (s) =>
          s.topic  === topic 
      )
    );


    return {
      surveyKey: surveyId,
      topic,
      subject,
      totalRespondents: relevantUsers.length,

      questions: surveyInfo.questions.map((q, qIndex) => {
        const qSummary = {
          id: q._id || `q${qIndex + 1}`,
          question: q.Question || q.question || '',
          optionData: {},
          opinions: [],
        };
        


        // Initialize options
        (q.options || []).forEach((opt) => {
          const optText = typeof opt === 'string' ? opt : (opt.option || opt.text || '');
          if (optText) qSummary.optionData[optText] = [];
        });
        

        // Process answers
        users.forEach((user) => {
          const userSurvey = user.surveys?.find(
            (s) => (s.topic || s.Topic) === topic );
          if (!userSurvey?.answers) return;

          let userAnswer = userSurvey.answers.find(
            (a) =>
              
              a.questionText === q.Question ||
              a.questionText === q.question
          );

          // Fallback to index
          if (!userAnswer) userAnswer = userSurvey.answers[qIndex];
          if (!userAnswer?.answer) return;

          const val = userAnswer.answer;
          const userInfo = {
            name: user.name,
            age: user.age,
            gender: user.gender,
            ward: user.wardNumber || user.ward,
            profession: user.currentJob,
          };

          // Handle different answer types
          if (Array.isArray(val)) {
            val.forEach((item) => {
              const text = typeof item === 'string' ? item.trim() : '';
              if (text) {
                if (qSummary.optionData[text]) {
                  qSummary.optionData[text].push(userInfo);
                } else {
                  qSummary.opinions.push({ userName: user.name, text });
                }
              }
            });
          } else if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed) {
              if (qSummary.optionData[trimmed]) {
                qSummary.optionData[trimmed].push(userInfo);
              } else {
                qSummary.opinions.push({ userName: user.name, text: trimmed });
              }
            }
          } else if (typeof val === 'object' && val !== null) {
            Object.entries(val).forEach(([label, text]) => {
              if (typeof text === 'string' && text.trim()) {
                qSummary.opinions.push({ userName: user.name, label, text: text.trim() });
              }
            });
          }
        });

        return qSummary;
      }),
    };
  });
};

// --- Main Component ---
const SurveyResultsComponent = ({ dataSurvey, userData }) => {
  const processedData = useMemo(() => processSurveyData(dataSurvey, userData), [dataSurvey, userData]);

  const [modal, setModal] = useState({ isOpen: false, title: '', users: [] });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      {processedData.map((survey) => (
        <section key={survey.surveyKey} className="mb-16">
          {/* Survey Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-3xl p-8 md:p-10 mb-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-3 uppercase tracking-tight">{survey.topic}</h2>
              <p className="text-blue-100 text-lg opacity-90">{survey.subject}</p>
              <p className="mt-4 text-blue-200 font-medium">
                कुल उत्तरदाताहरू: <span className="font-bold text-white">{survey.totalRespondents}</span>
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="space-y-12">
            {survey.questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-6 md:p-10">
                  {/* Question */}
                  <div className="flex gap-4 mb-8">
                    <div className="h-11 w-11 flex-shrink-0 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      Q
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">{q.question}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Options Section */}
                    <div className="lg:col-span-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
                        विकल्प छनौट विवरण (क्लिक गर्नुहोस्)
                      </h4>
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">विकल्प</th>
                              <th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">संख्या</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {Object.entries(q.optionData).map(([opt, userList]) => (
                              <tr
                                key={opt}
                                onClick={() => userList.length > 0 && setModal({ isOpen: true, title: opt, users: userList })}
                                className={`group transition-all ${userList.length > 0 ? 'hover:bg-white cursor-pointer' : 'opacity-50'}`}
                              >
                                <td className="p-5">
                                  <span className={`font-semibold text-base ${userList.length > 0 ? 'text-gray-800 group-hover:text-indigo-600' : 'text-gray-400'}`}>
                                    {opt}
                                  </span>
                                </td>
                                <td className="p-5 text-center">
                                  <div
                                    className={`inline-flex items-center justify-center min-w-[52px] h-10 rounded-2xl font-bold text-sm transition-all ${
                                      userList.length > 0
                                        ? 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    {userList.length}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Opinions Section */}
                    <div className="lg:col-span-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
                        खुला सुझाव / राय
                      </h4>
                      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                        {q.opinions.length > 0 ? (
                          q.opinions.map((op, i) => (
                            <div key={i} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">
                                  {op.userName}
                                </span>
                                {op.label && (
                                  <span className="text-[10px] font-medium text-gray-400 border px-2 py-0.5 rounded">
                                    {op.label}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 italic text-[15px] leading-relaxed">"{op.text}"</p>
                            </div>
                          ))
                        ) : (
                          <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-medium">
                            कुनै खुला राय उपलब्ध छैन
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

      {/* Modal */}
      <UserDetailsModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, title: '', users: [] })}
        title={modal.title}
        users={modal.users}
      />
    </div>
  );
};

export default SurveyResultsComponent;