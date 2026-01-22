import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Trash2, Eye, X, UserCheck, Search, Loader2, 
  AlertCircle, ChevronRight, Calendar, User, MapPin,
  ClipboardList, Phone, Info, ArrowLeft
} from 'lucide-react';
import api from '../../utils/api';
import Loading from '../Loading/Loading';

const UserList = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch All Users
  const { data: userData = [], isLoading } = useQuery({
    queryKey: ['adminUserList'],
    queryFn: async () => {
      const response = await api.get('api/user/user');
      return response?.data?.users || [];
    }
  });

  // 2. Fetch All Submissions for Selected User
  const { data: userSubmissions = [], isLoading: isSurveyLoading } = useQuery({
    queryKey: ['userSurvey', selectedUserId],
    queryFn: async () => {
      const response = await api.get(`/api/survey/getusersurvey/${selectedUserId}`);
      return response?.data || []; 
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

  const filteredUsers = useMemo(() => {
    return userData.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userData, searchTerm]);

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Survey Takers</h2>
          <p className="text-slate-500 text-sm">Manage users who collect field data</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-100">
            <UserCheck size={18}/> <span>{userData.length} Takers</span>
          </div>
        </div>
      </div>

      {/* USER LIST - RESPONSIVE VIEW */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        {/* Desktop View Table (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Survey Taker</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm font-medium">{user.email}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setSelectedUserId(user._id)} 
                      className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all border border-emerald-100"
                    >
                      <Eye size={16} /> View Submissions
                    </button>
                    <button 
                      onClick={() => window.confirm("Delete this taker?") && deleteUserMutation.mutate(user._id)} 
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

        {/* Mobile View Cards (Hidden on medium/large screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredUsers.map((user) => (
            <div key={user._id} className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 truncate">{user.username}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedUserId(user._id)} 
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl font-bold text-xs border border-emerald-100"
                >
                  <Eye size={16} /> View
                </button>
                <button 
                  onClick={() => window.confirm("Delete this taker?") && deleteUserMutation.mutate(user._id)} 
                  className="p-2.5 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {selectedUserId && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setSelectedUserId(null); setActiveSubmission(null); }} />
          
          <div className="relative bg-white w-full max-w-6xl h-full sm:h-[90vh] rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4">
                {activeSubmission && (
                  <button 
                    onClick={() => setActiveSubmission(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="text-slate-600" size={20} />
                  </button>
                )}
                <div className="overflow-hidden">
                  <h3 className="text-lg md:text-xl font-black text-slate-800 truncate">
                    {activeSubmission ? `Result: ${activeSubmission.name}` : "User Submissions"}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-blue-600 font-black uppercase tracking-widest truncate">
                    {activeSubmission ? "Detailed Data View" : "Browse all field submissions"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setSelectedUserId(null); setActiveSubmission(null); }} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 shrink-0">
                <X size={20}/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/50">
              {isSurveyLoading ? (
                <div className="py-20 flex flex-col items-center">
                  <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                  <p className="text-slate-500 text-sm font-medium">Fetching surveys...</p>
                </div>
              ) : !activeSubmission ? (
                /* STEP 1: SUBMISSIONS GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userSubmissions?.userData?.length > 0 ? userSubmissions.userData.map((sub) => (
                    <div 
                      key={sub._id} 
                      onClick={() => setActiveSubmission(sub)}
                      className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-400 cursor-pointer transition-all group hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ClipboardList size={20} />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg block">
                            {sub.date}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">{sub.time}</span>
                        </div>
                      </div>
                      <h4 className="font-black text-slate-800 text-lg mb-1 truncate">{sub.name}</h4>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                        <MapPin size={12} className="shrink-0" /> <span className="truncate">{sub.address || 'Location Not Specified'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-500">{sub.surveys?.length || 0} Modules</span>
                        <ChevronRight size={16} className="text-blue-500" />
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 px-6">
                      <AlertCircle className="mx-auto mb-3 text-slate-300" size={48} />
                      <p className="text-slate-400 font-bold italic">No survey data found for this user.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* STEP 2: SURVEY DETAIL VIEW */
                <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Participant Profile */}
                  <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <User size={16} className="text-slate-400"/>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participant Profile</span>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
                      <ProfileItem label="Full Name" value={activeSubmission.name} />
                      <ProfileItem label="Age / Gender" value={`${activeSubmission.age} / ${activeSubmission.gender}`} />
                      <ProfileItem label="Phone Number" value={activeSubmission.phoneNumber} icon={<Phone size={10}/>} />
                      <ProfileItem label="Ward No." value={activeSubmission.wardNumber} />
                      <ProfileItem label="Address" value={activeSubmission.address} />
                      <ProfileItem label="Education" value={activeSubmission.educationLevel} />
                      <ProfileItem label="Occupation" value={activeSubmission.currentJob} />
                      <ProfileItem label="Caste / Class" value={`${activeSubmission.caste} / ${activeSubmission.class}`} />
                      <ProfileItem label="Religion" value={activeSubmission.religiousAffiliation} />
                      <ProfileItem label="Family Count" value={activeSubmission.familyNumber} />
                    </div>
                  </div>

                  {/* Survey Modules */}
                  <div className="space-y-6">
                    {activeSubmission.surveys?.map((module, mIdx) => (
                      <div key={mIdx} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-slate-900 p-6 text-white">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-blue-500 rounded-md text-[10px] font-black uppercase tracking-tighter">
                              {module.surveyKey}
                            </div>
                            <h5 className="font-black text-lg leading-tight">{module.topic}</h5>
                          </div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80">{module.subject}</p>
                        </div>

                        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                          {module.answers?.map((ans, aIdx) => (
                            <div key={aIdx} className="flex flex-col bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                              <div className="flex items-start gap-2 mb-4">
                                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md shrink-0">Q{aIdx + 1}</span>
                                <p className="text-sm font-bold text-slate-700 leading-snug">
                                  {ans.questionText}
                                </p>
                              </div>

                              <div className="mt-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                {typeof ans.answer === 'object' && ans.answer !== null ? (
                                  <div className="space-y-3">
                                    {Object.entries(ans.answer).map(([key, val], i) => (
                                      <div key={i} className="text-xs border-l-2 border-blue-200 pl-3">
                                        <span className="text-slate-400 font-bold block mb-0.5">{key}</span>
                                        <span className="text-slate-900 font-black">{val || 'No data'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm font-black text-blue-700 break-words">
                                    {ans.answer || <span className="text-slate-300 italic font-medium">No answer provided</span>}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Responsively adjusted Profile Item
const ProfileItem = ({ label, value, icon }) => (
  <div className="overflow-hidden">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
        {icon} {label}
    </p>
    <p className="font-bold text-slate-800 text-sm md:text-base break-words">
        {value || <span className="text-slate-300">—</span>}
    </p>
  </div>
);

export default UserList;