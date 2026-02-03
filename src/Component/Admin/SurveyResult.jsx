import React, { useMemo } from 'react';

// --- Logic to process data ---
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
          optionCounts: {},
          opinions: [],
        };

        // Initialize counts for all defined checkbox options to 0
        q.options.forEach((opt) => {
          if (opt.type === "checkbox") {
            qSummary.optionCounts[opt.option] = 0;
          }
        });

        // Collect answers from all users for this specific question
        userData.forEach((user) => {
          const userSurvey = user.surveys?.find((s) => s.surveyKey === surveyKey);
          const userAnswer = userSurvey?.answers?.find((a) => a.questionId === q.id);

          if (userAnswer) {
            const val = userAnswer.answer;

            // Handle Checkbox/Selection counts
            if (typeof val === "string") {
              if (qSummary.optionCounts.hasOwnProperty(val)) {
                qSummary.optionCounts[val]++;
              } else if (val.trim() !== "") {
                // If the answer isn't in defined options, it's an "Other" opinion
                qSummary.opinions.push({ userName: user.name, text: val });
              }
            } 
            // Handle Object-based text answers (sub-questions)
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">प्रश्नावली नतिजा</h1>
        <p className="text-gray-500">सर्वेक्षणबाट प्राप्त तथ्यांक र सुझावहरूको विस्तृत विवरण</p>
      </header>

      {Object.entries(processedData).map(([key, survey]) => (
        <section key={key} className="mb-16">
          {/* Survey Section Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold">{survey.topic}</h2>
            <p className="text-blue-100 mt-1 opacity-90">{survey.subject}</p>
          </div>

          <div className="space-y-8">
            {survey.questions.map((q) => (
              <div key={q.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="p-6 md:p-8">
                  <h3 className="text-xl font-extrabold text-gray-800 mb-6 flex items-start gap-3">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm">Q</span>
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Option Counts Table */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 ml-1">विकल्प विवरण (Counts)</h4>
                      <div className="overflow-hidden border border-gray-100 rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-4 text-sm font-bold text-gray-600 border-b">विकल्प (Option)</th>
                              <th className="p-4 text-sm font-bold text-gray-600 border-b text-center w-24">संख्या</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(q.optionCounts).map(([opt, count]) => (
                              <tr key={opt} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4 text-gray-700 border-b text-sm font-medium">{opt}</td>
                                <td className="p-4 border-b text-center">
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    {count}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT: Opinions / Text Answers */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 ml-1">खुल्ला सुझाव/विचार (Opinions)</h4>
                      {q.opinions.length > 0 ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {q.opinions.map((op, idx) => (
                            <div key={idx} className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl relative group">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">जवाफकर्ता: {op.userName}</span>
                                {op.label && <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-orange-200 text-orange-700 font-bold">{op.label}</span>}
                              </div>
                              <p className="text-gray-800 text-sm italic leading-relaxed">"{op.text}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-300 text-sm">
                          कुनै सुझाव उपलब्ध छैन
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default SurveyResultsComponent;