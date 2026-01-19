import React from 'react';

const Survey = ({ DevData, dispatch, section }) => {
  
  const handleInputChange = (questionId, value, type, optionLabel = null) => {
    dispatch({
      section,
      questionId,
      value,
      type,
      optionLabel,
    });
  };

  return (
    <div className="max-w-5xl mx-auto my-6 md:my-10 p-0 md:p-2">
      {/* Survey Card Container */}
      <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
        
        {/* Header Section with Gradient Accent */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 md:p-10 text-white">
          <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight">
            {DevData?.Topic}
          </h1>
          <div className="flex items-center gap-2 text-blue-100 opacity-90 italic">
            <span className="h-1 w-8 bg-blue-400 rounded-full"></span>
            <h2 className="text-lg md:text-xl font-medium">{DevData?.Subject}</h2>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-12">
          {DevData?.questions.map((q, qIndex) => (
            <div key={q.id} className="group animate-fade-in">
              {/* Question Label */}
              <div className="flex items-start gap-4 mb-6">
                <span className="flex-shrink-0 bg-blue-100 text-blue-700 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {qIndex + 1}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug pt-1">
                  {q.Question}
                </h3>
              </div>

              {/* Options Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-0 md:ml-14">
                {q.options.map((opt, index) => {
                  const isText = opt.type === "text";
                  
                  return (
                    <div 
                      key={index} 
                      className={`${isText ? "col-span-full" : "col-span-1"}`}
                    >
                      {opt.type === "checkbox" ? (
                        /* Choice Card Style */
                        <label 
                          className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                            q.answer === opt.option 
                              ? 'border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600' 
                              : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                              checked={q.answer === opt.option}
                              onChange={(e) => {
                                const val = e.target.checked ? opt.option : '';
                                handleInputChange(q.id, val, 'checkbox');
                              }}
                            />
                            {/* Custom checkmark icon */}
                            <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-lg font-semibold text-gray-700">{opt.option}</span>
                        </label>
                      ) : (
                        /* Premium Input Field */
                        <div className="mt-2 group/input">
                          <label className="text-sm font-bold text-blue-600/70 block mb-2 uppercase tracking-wider ml-1">
                            {opt.option}
                          </label>
                          <textarea
                            placeholder="तपाईँको जवाफ यहाँ लेख्नुहोस्..."
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all min-h-[100px] text-lg text-gray-800 placeholder:text-gray-400"
                            value={typeof q.answer === 'object' ? (q.answer[opt.option] || "") : ""}
                            onChange={(e) => handleInputChange(q.id, e.target.value, 'text', opt.option)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Survey;