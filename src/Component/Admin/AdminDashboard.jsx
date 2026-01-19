import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api'; // Your axios instance
import { 
  Users, 
  ClipboardCheck, 
  PieChart, 
  TrendingUp, 
  MapPinned, 
  Loader2,
  ArrowUpRight
} from 'lucide-react';

const AdminDashboard = () => {
  // 1. FETCH USERS
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/api/user/user').then(res => res.data.users),
  });

  // 2. FETCH SURVEYS
  const { data: surveysData, isLoading: loadingSurveys } = useQuery({
    queryKey: ['adminSurveys'],
    queryFn: () => api.get('/api/survey/getsurvey').then(res => res.data.userData),
  });

  if (loadingUsers || loadingSurveys) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // --- CALCULATIONS (FRONTEND LOGIC) ---
  const totalUsers = usersData?.length || 0;
  const totalSurveys = surveysData?.length || 0;

  // Calculate most active ward (Top Ward)
  const wardCounts = surveysData?.reduce((acc, curr) => {
    acc[curr.wardNumber] = (acc[curr.wardNumber] || 0) + 1;
    return acc;
  }, {});
  const topWard = Object.entries(wardCounts || {}).sort((a, b) => b[1] - a[1])[0];

  // Calculate Gender Stats (Handling your Nepali data)
  const maleCount = surveysData?.filter(s => s.gender === 'पुरुष' || s.gender === 'Male').length || 0;
  const femaleCount = surveysData?.filter(s => s.gender === 'महिला' || s.gender === 'Female').length || 0;

  const stats = [
    { 
        label: 'Total Users', 
        value: totalUsers, 
        icon: <Users className="text-blue-600" />, 
        bg: 'bg-blue-50',
        desc: 'Registered collectors'
    },
    { 
        label: 'Total Surveys', 
        value: totalSurveys, 
        icon: <ClipboardCheck className="text-emerald-600" />, 
        bg: 'bg-emerald-50',
        desc: 'Forms submitted'
    },
    { 
        label: 'Active Ward', 
        value: topWard ? `Ward ${topWard[0]}` : 'N/A', 
        icon: <MapPinned className="text-orange-600" />, 
        bg: 'bg-orange-50',
        desc: `${topWard ? topWard[1] : 0} submissions here`
    },
    { 
        label: 'Completion Rate', 
        value: '94%', 
        icon: <TrendingUp className="text-purple-600" />, 
        bg: 'bg-purple-50',
        desc: 'Avg. form accuracy'
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">सिस्टम ओभरभ्यू (System Overview)</h2>
          <p className="text-slate-500 font-medium">Real-time statistics of users and survey responses.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-slate-600">Live Updates</span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-slate-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-3 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT SUBMISSIONS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-blue-500" />
              भर्खरै प्राप्त सर्वेक्षणहरू
            </h3>
            <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">नाम (Name)</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">वार्ड (Ward)</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">पेशा (Job)</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {surveysData?.slice(0, 5).map((survey) => (
                  <tr key={survey._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{survey.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{survey.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        W-{survey.wardNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{survey.currentJob}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Completed
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GENDER DISTRIBUTION CHART (Simple CSS Implementation) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8">
            <PieChart size={20} className="text-pink-500" />
            लैंगिक अवस्था (Gender)
          </h3>
          
          <div className="space-y-6">
            <GenderBar label="पुरुष (Male)" count={maleCount} total={totalSurveys} color="bg-blue-500" />
            <GenderBar label="महिला (Female)" count={femaleCount} total={totalSurveys} color="bg-pink-500" />
            <GenderBar label="अन्य (Others)" count={totalSurveys - (maleCount + femaleCount)} total={totalSurveys} color="bg-slate-300" />
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Total Analyzed</span>
              <span className="text-slate-800">{totalSurveys} Surveys</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for a custom progress-bar chart
const GenderBar = ({ label, count, total, color }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-2">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AdminDashboard;