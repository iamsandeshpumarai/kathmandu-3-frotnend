import React, { useState } from 'react';
import { Edit3, Globe, MessageSquare, Save, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const SurveyEditContent = () => {
  // Initial content based on your request

const queryClient =  useQueryClient()
  const sendData =  useMutation({
    
    mutationFn: async (newContent) => {
    await api.post('/api/content/createcontent', newContent);
    },
    onSuccess:function(){
queryClient.invalidateQueries({queryKey:['getContent']})
toast.success("Content Updated Successfully")
    }
  })
  const [content, setContent] = useState({
    titleNp: "सिन्धुपाल्चोक निर्वाचन क्षेत्र १ को राजनीतिक शल्यकृया—२०८१",
    titleEn: "Political Survey of Sindhupalchowk Region One",
    subtitle: "अनुसन्धान प्रश्नावली—१",
    greeting: "नमस्कार !",
    description: "सिन्धुपाल्चोक १ संसदीय निर्वाचन क्षेत्रमा जुगल गाउँपालिका, भोटेकोशी गाउँपालिका, त्रिपुरासुन्दरी गाउँपालिका, लिसङ्खुपाखर गाउँपालिका, सुनकोशी गाउँपालिका, बलेफी गाउँपालिका, बाह्रबिसे नगरपालिका र चौतारा साँगाचोकगढी नगरपालिकाको २–४, ९ र १० वडा रहेका छन् ।"
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false); // Reset saved state on change
  };



  return (
    <div className="max-w-6xl mx-auto my-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Edit3 size={20} className="text-blue-600" /> 
            Edit Survey Header
          </h2>
          <p className="text-sm text-gray-500">Update the introductory text for Region 1</p>
        </div>
        <button
          onClick={()=>{sendData.mutate(content)}}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all ${
            isSaved 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
          }`}
        >
          {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
          {isSaved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Title Nepali */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">शीर्षक (Title - Nepali)</label>
          <input
            type="text"
            name="titleNp"
            value={content.titleNp}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Title English */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Globe size={14} /> Title (English)
          </label>
          <input
            type="text"
            name="titleEn"
            value={content.titleEn}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subtitle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">उप-शीर्षक (Subtitle)</label>
            <input
              type="text"
              name="subtitle"
              value={content.subtitle}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {/* Greeting */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">अभिवादन (Greeting)</label>
            <input
              type="text"
              name="greeting"
              value={content.greeting}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <MessageSquare size={14} /> मुख्य विवरण (Main Description)
          </label>
          <textarea
            name="description"
            rows="5"
            value={content.description}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all leading-relaxed"
            placeholder="यहाँ विवरण लेख्नुहोस्..."
          />
          <p className="mt-2 text-xs text-gray-400">
            Tip: Mentioning specific wards helps voters identify their constituency correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SurveyEditContent;