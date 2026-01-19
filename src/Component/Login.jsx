import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, ClipboardList } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const authMutation = useMutation({
    mutationFn: async (userData) => {
      const endpoint = isLogin ? 'api/admin/loginuser' : 'api/admin/registeruser';
      const response = await api.post(endpoint, userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['checkauth']);
      const roles = data.user?.role || [];
      if (roles.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/userdashboard');
      }
    },
    onError: (error) => {
      alert(error.response?.data?.message || "प्रविष्टिमा समस्या देखियो। कृपया फेरि प्रयास गर्नुहोला।");
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    authMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-[1100px] flex rounded-3xl shadow-2xl overflow-hidden min-h-[650px] border border-slate-100">
        
        {/* Left Side (Context & Branding) */}
        <div className="hidden lg:flex w-5/12 bg-[#1e293b] p-12 flex-col justify-between text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
               <ClipboardList className="text-indigo-400" size={32} />
               <span className="text-sm font-semibold tracking-widest uppercase text-indigo-300">Political Survey 2081</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 leading-tight">
              सिन्धुपाल्चोक निर्वाचन क्षेत्र १ <br/>
              <span className="text-indigo-400">राजनीतिक शल्यकृया</span>
            </h1>
            <div className="h-1 w-20 bg-indigo-500 mb-6"></div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              जुगल, भोटेकोशी, त्रिपुरासुन्दरी, लिसङ्खुपाखर, सुनकोशी, बलेफी, बाह्रबिसे र चौतारा साँगाचोकगढी (२-४, ९, १०) समेटिएको बृहत् सर्वेक्षण।
            </p>
          </div>

          <div className="relative z-10 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold">अनुसन्धान नैतिकता</p>
            <p className="italic text-sm text-slate-200">
              "यस अनुसन्धानमा तपाईंको नाम गोप्य वा खुला राख्न सकिनेछ। प्राप्त तथ्याङ्क केवल विश्लेषणका लागि प्रयोग गरिनेछ।"
            </p>
          </div>

          {/* Abstract background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full lg:w-7/12 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {isLogin ? "सर्वेक्षक लग-इन" : "नयाँ खाता सिर्जना गर्नुहोस्"}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {isLogin ? "अगाडि बढ्न आफ्नो विवरण भर्नुहोस्।" : "सर्वेक्षण प्रणालीमा जोडिन फारम भर्नुहोस्।"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase ml-1">नाम (Full Name)</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    name="username"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Enter full name"
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">इमेल (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="name@email.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">पासवर्ड (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={authMutation.isPending}
              className={`w-full py-4 mt-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all ${
                authMutation.isPending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {authMutation.isPending ? "प्रक्रियामा छ..." : isLogin ? "लग-इन गर्नुहोस्" : "दर्ता गर्नुहोस्"}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              {isLogin ? "नयाँ प्रयोगकर्ता हुनुहुन्छ?" : "पहिले नै खाता छ?"} 
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 underline-offset-4 hover:underline"
              >
                {isLogin ? "खाता बनाउनुहोस्" : "लग-इन गर्नुहोस्"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;