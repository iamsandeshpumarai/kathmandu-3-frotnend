import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShieldCheck, Activity, Loader2, Calendar } from 'lucide-react';
import api from '../../utils/api';

const AdminHome = () => {
  const { data: userData, isLoading } = useQuery({
    queryKey: ['adminUserList'],
    queryFn: async () => {
      const response = await api.get('/api/user/user');
      return response?.data?.users || [];
    }
  });

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const totalUsers = userData?.length || 0;
  const adminCount = userData?.filter(u => u.role.includes('admin')).length || 0;
  const recentUsers = userData?.slice(-5).reverse() || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">नमस्ते, Admin!</h1>
          <p className="text-slate-500 font-medium">System status and user activity overview.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-400 bg-white px-4 py-2 rounded-2xl border border-slate-200 text-sm font-bold">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={totalUsers} icon={<Users />} color="bg-blue-600" />
        <StatCard title="Admin Staff" value={adminCount} icon={<ShieldCheck />} color="bg-indigo-600" />
        <StatCard title="System Status" value="Online" icon={<Activity />} color="bg-emerald-500" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6">Recently Joined Users</h3>
        <div className="grid grid-cols-1 gap-4">
          {recentUsers.map((user) => (
            <div key={user._id} className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-100 border border-transparent rounded-3xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 border border-slate-200 group-hover:border-blue-200">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-slate-800">{user.username}</p>
                  <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Joined On</span>
                <span className="text-sm font-bold text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default AdminHome;