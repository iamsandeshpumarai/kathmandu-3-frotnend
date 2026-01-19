import React from 'react';
import { NepaliDatePicker } from 'nepali-datepicker-reactjs';
import 'nepali-datepicker-reactjs/dist/index.css';

const SurveyMetaForm = ({ state, dispatch }) => {
  
  // Standard handler for text/time inputs
  const handleChange = (e) => {
    dispatch({
      field: e.target.name,
      value: e.target.value
    });
  };

  // SPECIFIC handler for NepaliDatePicker (it returns a string, not an event)
  const handleDateChange = (dateValue) => {
    dispatch({
      field: 'date',
      value: dateValue
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Ward Number */}
          <div className="group flex flex-col space-y-2">
            <label className="text-slate-700 font-bold text-lg flex items-center gap-2">
              वडा नं. <span className="text-blue-500 font-normal text-sm">(Ward No.)</span>
            </label>
            <input
              type="text"
              name="wardNumber"
              value={state.wardNumber || ''}
              onChange={handleChange}
              placeholder="उदा: ५"
              className="border-b-2 border-gray-300 focus:border-blue-600 outline-none py-2 px-1 transition-all bg-transparent text-xl font-medium"
            />
          </div>

          {/* Location */}
          <div className="group flex flex-col space-y-2">
            <label className="text-slate-700 font-bold text-lg flex items-center gap-2">
              स्थानः <span className="text-blue-500 font-normal text-sm">(Location)</span>
            </label>
            <input
              type="text"
              name="address"
              value={state.address || ''}
              onChange={handleChange}
              placeholder="बलेफी, बाह्रबिसे..."
              className="border-b-2 border-gray-300 focus:border-blue-600 outline-none py-2 px-1 transition-all bg-transparent text-xl font-medium"
            />
          </div>

          {/* Date - FIXED HANDLER */}
          <div className="flex flex-col space-y-2">
            <label className="text-slate-700 font-bold text-lg flex items-center gap-2">
              मिति (वि.सं.): <span className="text-blue-500 font-normal text-sm">(Date)</span>
            </label>
            <NepaliDatePicker
              inputClassName="border-b-2 border-gray-300 focus:border-blue-600 outline-none py-2 text-xl w-full bg-transparent font-medium"
              className="w-full"
              value={state.date || ''}
              onChange={handleDateChange} // Use the specific string handler
              options={{ calenderType: 'BS', language: 'ne' }}
            />
          </div>

          {/* Time */}
          <div className="group flex flex-col space-y-2">
            <label className="text-slate-700 font-bold text-lg flex items-center gap-2">
              समयः <span className="text-blue-500 font-normal text-sm">(Time)</span>
            </label>
            <input
              type="time" // Changed from "string" to "time" for native clock picker
              name="time"
              value={state.time || ''}
              onChange={handleChange}
              className="border-b-2 border-gray-300 focus:border-blue-600 outline-none py-2 px-1 transition-all bg-transparent text-xl font-medium"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default SurveyMetaForm;