import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api'; 
import { 
  Users, ClipboardCheck, User, Loader2, 
  ArrowUpRight, UserPlus, Mail, X, AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. FETCH USERS
  const { data: usersData =[], isLoading: loadingUsers, isError: userError, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
     
      try {
        const res = await api.get('/api/user/user');
        const users = Array.isArray(res.data?.users) ? res.data.users : [];
        
        return users;
      } catch (err) {

        return [];
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: 3,
  });

  // 2. FETCH SURVEYS
  const { data: surveysData =[], isLoading: loadingSurveys, isError: surveyError, refetch: refetchSurveys } = useQuery({
    queryKey: ['adminSurveys'],
    queryFn: async () => {
      console.log("🔄 Fetching surveys...");
      try {
        const res = await api.get('/api/survey/getsurvey');
        const surveys = Array.isArray(res.data?.userData) ? res.data.userData : [];

        return surveys;
      } catch (err) {

        return [];
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: 3,
  });

  // FORCE REFETCH WHEN COMPONENT MOUNTS
  useEffect(() => {
    console.log("🚀 AdminDashboard mounted!");
    
    // Ensure data is always an array
    if (!Array.isArray(usersData)) {

      refetchUsers();
    }
    if (!Array.isArray(surveysData)) {

      refetchSurveys();
    }

    return () => {
      console.log("🛑 AdminDashboard unmounted");
    };
  }, [usersData, surveysData, refetchUsers, refetchSurveys]);

  // --- ERROR HANDLING ---
  if (userError || surveyError) {
   
    return (
      <div className="h-96 flex flex-col items-center justify-center text-red-500 gap-4">
        <AlertCircle size={40} />
        <p className="font-bold text-lg">Failed to load dashboard data.</p>
        <p className="text-sm text-gray-600">{userError?.message || surveyError?.message}</p>
        <button 
          onClick={() => {
            console.log("Retry clicked");
            refetchUsers();
            refetchSurveys();
          }}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (loadingUsers || loadingSurveys) {
   
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-600 font-semibold">Loading dashboard...</p>
      </div>
    );
  }


  // Ensure we always have arrays
  const safeUsersData = Array.isArray(usersData) ? usersData : [];
  const safeSurveysData = Array.isArray(surveysData) ? surveysData : [];

  const totalUsers = safeUsersData.length || 0;
  const totalSurveys = safeSurveysData.length || 0;

  // Gender Percentages (Safe calculations)
  const maleCount = safeSurveysData.filter(s => s?.gender === 'पुरुष' || s?.gender === 'Male').length || 0;
  const femaleCount = safeSurveysData.filter(s => s?.gender === 'महिला' || s?.gender === 'Female').length || 0;
  const malePercentage = totalSurveys > 0 ? ((maleCount / totalSurveys) * 100).toFixed(1) : 0;
  const femalePercentage = totalSurveys > 0 ? ((femaleCount / totalSurveys) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Users" value={totalUsers} icon={<Users className="text-blue-600" />} bg="bg-blue-50" />
        <StatCard label="Total Surveys" value={totalSurveys} icon={<ClipboardCheck className="text-emerald-600" />} bg="bg-emerald-50" />
        <StatCard label="Male %" value={`${malePercentage}%`} icon={<User className="text-blue-500" />} bg="bg-blue-50" />
        <StatCard label="Female %" value={`${femalePercentage}%`} icon={<User className="text-pink-500" />} bg="bg-pink-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT SURVEYS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 tracking-tight">Recent Surveys</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Ward</th>
                  <th className="px-6 py-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {safeSurveysData?.slice(0, 5).map((survey) => (
                  <tr key={survey._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{survey?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-500">W-{survey?.wardNumber || '0'}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold text-[10px]">COMPLETED</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MINI USER LIST */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <UserPlus size={18} className="text-purple-500" /> Collectors
            </h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 underline"
            >
              See More
            </button>
          </div>
          
          <div className="space-y-3">
            {safeUsersData?.slice(0, 3).map((user) => (
              <UserListItem key={user._id} user={user} />
            ))}
          </div>
        </div>
      </div>

      {/* FULL USER LIST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-slate-800">All Registered Collectors</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {safeUsersData?.map((user) => (
                <UserListItem key={user._id} user={user} full />
              ))}
            </div>
            
            <div className="p-6 border-t bg-slate-50 text-center">
              <p className="text-xs font-bold text-slate-400 italic">Showing total {totalUsers} active members</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ label, value, icon, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${bg} group-hover:scale-110 transition-transform`}>{icon}</div>
      <ArrowUpRight size={18} className="text-slate-300" />
    </div>
    <h3 className="text-2xl md:text-3xl font-black text-slate-800">{value}</h3>
    <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

// Reusable User Item Component (ADDED SAFE NAVIGATION)
const UserListItem = ({ user, full }) => {
  // Safe character check to prevent crash if username is missing
  const initial = user?.username ? user.username.charAt(0) : '?';
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 ${full ? 'md:p-4' : ''}`}>
      <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm uppercase">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-800 truncate text-sm">{user?.username || 'Unknown User'}</p>
        <div className="flex items-center gap-1 text-slate-400">
          <Mail size={10} />
          <p className="text-[10px] truncate">{user?.email || 'No Email'}</p>
        </div>
      </div>
      {full && user?.createdAt && (
          <div className="hidden sm:block text-right">
              <p className="text-[10px] font-bold text-slate-400">JOINED</p>
              <p className="text-[10px] font-medium text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;