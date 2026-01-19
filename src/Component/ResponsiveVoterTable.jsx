import React from 'react';

const VoterProfileTable = ({ state, dispatch }) => {
  
  // The first 7 fields
  const fields = [
    { label: 'नाम', sub: '(Name)', name: 'name' },
    { label: 'उमेर', sub: '(Age)', name: 'age' },
    { label: 'थर / जाति', sub: '(Caste)', name: 'caste' },
    { label: 'लिङ्ग', sub: '(Gender)', name: 'gender' },
    { label: 'हलको पेशा', sub: '(Occupation)', name: 'currentJob' },
    { label: 'सम्पर्क नं.', sub: '(Contact)', name: 'phoneNumber' },
    { label: 'परिवार संख्या', sub: '(Family Member)', name: 'familyNumber' },
    { label: 'धार्मिक आस्था', sub: '(Religious Belief)', name: 'religiousAffiliation' },
    { label: 'उत्तीर्ण माथिल्लो शैक्षिक तह', sub: '(Education Level)', name: 'educationLevel' },
    { label: 'वर्ग', sub: '(class)', name: 'class' }
    
  ];

  const handleChange = (e) => {
    dispatch({
      field: e.target.name,
      value: e.target.value
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Table Title Header */}
      <div className="hidden md:grid grid-cols-2 gap-0 border-x border-t border-gray-800 bg-slate-800 text-white">
        <div className="grid grid-cols-12">
          <div className="col-span-4 py-2 px-4 border-r border-slate-600 font-bold">सुचक</div>
          <div className="col-span-8 py-2 px-4 font-bold">विवरण</div>
        </div>
        <div className="grid grid-cols-12 border-l border-slate-600">
          <div className="col-span-4 py-2 px-4 border-r border-slate-600 font-bold">सुचक</div>
          <div className="col-span-8 py-2 px-4 font-bold">विवरण</div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t md:border-t-0 border-gray-300 shadow-xl overflow-hidden">
        
        {/* Render the 7 Profile Fields */}
        {fields.map((field, index) => (
          <div key={index} className="grid grid-cols-12 border-r border-b border-gray-300 items-stretch">
            <div className="col-span-4 bg-slate-100 p-3 flex flex-col justify-center border-r border-gray-300">
              <span className="text-base font-bold text-slate-800">{field.label}</span>
              <span className="text-xs text-blue-600 italic">{field.sub}</span>
            </div>
            <div className="col-span-8 bg-white flex items-center">
              <input
                type="text"
                name={field.name}
                value={state[field.name] || ''}
                onChange={handleChange}
                className="w-full h-full px-4 py-3 outline-none focus:bg-blue-50 text-lg"
              />
            </div>
          </div>
        ))}

        {/* 8th Field: Location Selection only (No Label) */}
        <div className="grid grid-cols-12 border-r border-b border-gray-300 items-stretch">
          <div className="col-span-12 bg-white flex items-center justify-around px-4 py-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="origin"
                value="स्वदेशमा"
                checked={state.origin === 'स्वदेशमा'}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 cursor-pointer"
              />
              <span className="text-lg font-bold text-slate-800">स्वदेशमा</span>
            </label>
            
            <div className="h-8 w-[1px] bg-gray-300"></div> {/* Visual Divider */}

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="origin"
                value="बिदेशमा"
                checked={state.origin === 'बिदेशमा'}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 cursor-pointer"
              />
              <span className="text-lg font-bold text-slate-800">बिदेशमा</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterProfileTable;