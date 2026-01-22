import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api'; // Adjust the path to your api utility
import { Loader2, Mic } from 'lucide-react';

const SurveyHeader = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 1. Fetch Dynamic Content
  const { data: surveyContent, isLoading } = useQuery({
    queryKey: ['getContent'],
    queryFn: async () => {
      const response = await api.get('api/content/getcontent');
      return response.data;
    },
    select: (res) => res?.data || {},
  });

  useEffect(() => {
    if (!isLoading) {
      setIsVisible(true);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="w-full py-12 flex justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <header className="w-full bg-slate-50 border-b border-gray-200">
      {/* Top Identity Section */}
      <div className="bg-white py-8 px-4 shadow-sm">
        <div 
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
          }`}
        >
          {/* Dynamic Nepali Title */}
          <h1 className="text-2xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-3">
            {surveyContent?.titleNp || "सिन्धुपाल्चोक निर्वाचन क्षेत्र १ को राजनीतिक शल्यकृया—२०८१"}
          </h1>
          
          {/* Dynamic English Title */}
          <h2 className="text-lg md:text-2xl font-bold text-blue-700 mb-2">
            {surveyContent?.titleEn || "Political Survey of Sindhupalchowk Region One"}
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-gray-500 font-medium italic">
            <span className="h-px w-8 bg-gray-300"></span>
            <span>{surveyContent?.subtitle || "अनुसन्धान प्रश्नावली—१"}</span>
            <span className="h-px w-8 bg-gray-300"></span>
          </div>
        </div>
      </div>

      {/* Intro & Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* 1. Subject Title */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-r-full font-bold text-xl shadow-lg">
            १. दलहरु प्रतीको जन–मनोबिज्ञान सर्वेक्षण
          </div>
        </div>

        {/* 2. Welcome & Region Information - DYNAMIC DESCRIPTION */}
        <div className={`bg-white p-6 rounded-2xl border-l-4 border-blue-600 shadow-sm transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            {surveyContent?.greeting || "नमस्कार !"}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
            {surveyContent?.description || "सिन्धुपाल्चोक १ संसदीय निर्वाचन क्षेत्र सम्बन्धी विवरण..."}
          </p>
        </div>

        {/* 3. Consent Box */}
        <div className={`bg-amber-50 p-6 rounded-2xl border border-amber-200 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-full shrink-0">
              <Mic className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-800 text-lg leading-relaxed italic">
                "तपाईंको आवाज रेकर्ड/नोट गरिनेछ । यस अनुसन्धानमा इच्छानुसार तपाईंको नाम गोप्य वा खुला राखिनेछ । के तपाईं यस अनुसन्धानका लागि कुराकानी गर्न सहमत हुनुहुन्छ? यदि सहमत हुनुहुन्छ भने म छलफल अगाडी बढाउन अनुमति चाहन्छु ।"
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default SurveyHeader;