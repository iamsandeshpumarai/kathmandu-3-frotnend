import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, X, UserCheck, Mail, Loader2, AlertCircle, ClipboardCheck, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const UserList = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['adminUserList'],
    queryFn: async () => {
      const response = await api.get('api/user/user');
      return response?.data?.users || []
      ;
    }
  });

  const { data: surveyDetails, isLoading: isSurveyLoading } = useQuery({
    queryKey: ['userSurvey', selectedUserId],
    queryFn: async () => {
      const response = await api.get(`api/survey/getusersurveydata/${selectedUserId}`);
      return response?.data?.userData;
    },
    enabled: !!selectedUserId,
    retry: false
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => api.delete(`api/user/delete/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUserList']);
      alert('User deleted');
    }
  });

  if (isLoading) return (
    <div className="h-64 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin mb-2 text-blue-600" size={32} />
      <p className="text-slate-500 font-medium">Loading users...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION: Responsive layout (stacks on mobile) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 sm:px-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">User Management</h2>
          <p className="text-slate-500 text-sm">View and manage system participants</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-blue-200">
          <UserCheck size={18}/> {userData?.length} Users Registered
        </div>
      </div>

      {/* --- DESKTOP VIEW: Traditional Table (Hidden on small screens) --- */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">User Details</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {userData.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{user.username}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => setSelectedUserId(user._id)} 
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
                  >
                    <Eye size={16} /> Show Survey
                  </button>
                  <button 
                    onClick={() => window.confirm("Delete this user?") && deleteUserMutation.mutate(user._id)} 
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW: Card Layout (Hidden on desktop) --- */}
      <div className="md:hidden space-y-4 px-2">
        {userData.map((user) => (
          <div key={user._id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                  {user.username.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{user.username}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[150px]">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => window.confirm("Delete this user?") && deleteUserMutation.mutate(user._id)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedUserId(user._id)} 
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md"
            >
              <Eye size={18} /> View Survey Results
            </button>
          </div>
        ))}
      </div>

      {/* --- RESPONSIVE MODAL --- */}
      {selectedUserId && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" 
            onClick={() => setSelectedUserId(null)} 
          />
          
          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-4xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-lg font-black text-slate-800">User Survey Data</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Response History</p>
              </div>
              <button 
                onClick={() => setSelectedUserId(null)} 
                className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50/50">
              {isSurveyLoading ? (
                <div className="py-20 flex flex-col items-center">
                  <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                  <p className="text-slate-500 text-sm">Fetching responses...</p>
                </div>
              ) : surveyDetails?.surveys?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {surveyDetails.surveys.map((s) => (
                    <div key={s._id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <p className="font-black text-blue-600 text-[10px] uppercase tracking-tighter">{s.surveyKey}</p>
                      </div>
                      
                      <div className="space-y-4">
                        {s.answers.map((a, i) => (
                          <div key={i} className="group">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Question {i+1}</p>
                            <p className="text-xs font-bold text-slate-500 italic mb-1">"{a.questionText}"</p>
                            <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                              {a.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                  <AlertCircle className="mx-auto mb-3 text-slate-300" size={48} />
                  <p className="text-slate-400 font-bold italic">No surveys submitted by this user yet.</p>
                </div>
              )}
            </div>

            {/* Modal Footer (Mobile convenience) */}
            <div className="p-4 bg-white border-t sm:hidden">
              <button 
                onClick={() => setSelectedUserId(null)}
                className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;