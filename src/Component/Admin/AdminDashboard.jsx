import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api'; 
import { 
  Users, ClipboardCheck, User, Loader2, 
  ArrowUpRight, UserPlus, Mail, CalendarDays, X 
} from 'lucide-react';

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const totalUsers = usersData?.length || 0;
  const totalSurveys = surveysData?.length || 0;

  // Gender Percentages
  const maleCount = surveysData?.filter(s => s.gender === 'पुरुष' || s.gender === 'Male').length || 0;
  const femaleCount = surveysData?.filter(s => s.gender === 'महिला' || s.gender === 'Female').length || 0;
  const malePercentage = totalSurveys > 0 ? ((maleCount / totalSurveys) * 100).toFixed(1) : 0;
  const femalePercentage = totalSurveys > 0 ? ((femaleCount / totalSurveys) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* STATS GRID - Fully Responsive */}
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
                {surveysData?.slice(0, 5).map((survey) => (
                  <tr key={survey._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{survey.name}</td>
                    <td className="px-6 py-4 text-slate-500">W-{survey.wardNumber}</td>
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
            {usersData?.slice(0, 3).map((user) => (
              <UserListItem key={user._id} user={user} />
            ))}
          </div>
        </div>
      </div>

      {/* FULL USER LIST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
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
              {usersData?.map((user) => (
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

// Reusable Stat Card Component
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

// Reusable User Item Component
const UserListItem = ({ user, full }) => (
  <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 ${full ? 'md:p-4' : ''}`}>
    <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm uppercase">
      {user.username.charAt(0)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-slate-800 truncate text-sm">{user.username}</p>
      <div className="flex items-center gap-1 text-slate-400">
        <Mail size={10} />
        <p className="text-[10px] truncate">{user.email}</p>
      </div>
    </div>
    {full && (
        <div className="hidden sm:block text-right">
            <p className="text-[10px] font-bold text-slate-400">JOINED</p>
            <p className="text-[10px] font-medium text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
    )}
  </div>
);

export default AdminDashboard;