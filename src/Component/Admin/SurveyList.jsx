import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Eye, EyeOff, Trash2, 
  Pencil, X, Loader2, AlertCircle 
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SurveyDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  // --- 1. Fetching Data ---
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const res = await api.get('/api/survey/getsurveylist');
      return res.data; 
    }
  });

  const surveys = response?.data || [];

  // --- 2. Mutations ---
  const statusMutation = useMutation({
    mutationFn: (id) => api.get(`/api/survey/changestatus/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['surveys']);
      toast.success('Survey status updated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/survey/deletesurveyquestion/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['surveys']);
      toast.success('Survey deleted');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete survey'),
  });

  const topicMutation = useMutation({
    mutationFn: ({ id, topic }) => api.put(`/api/survey/updatetopic/${id}`, { Topic: topic }),
    onSuccess: () => {
      queryClient.invalidateQueries(['surveys']);
      setIsModalOpen(false);
      toast.success('Topic updated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update topic'),
  });

  // --- 3. Filter Logic ---
  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      const matchesSearch = survey.Topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' 
        ? true 
        : filterStatus === 'active' ? survey.isActive : !survey.isActive;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, surveys]);

  const handleQuickEdit = (survey) => {
    setSelectedSurvey(survey);
    setNewTitle(survey.Topic);
    setIsModalOpen(true);
  };

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Survey Management</h1>
          <p className="text-gray-500 text-sm">Create and manage your questionnaire topics</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin/createsurvey')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> <span className="whitespace-nowrap">Create Survey</span>
        </motion.button>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search questionnaire topics..."
            className="w-full pl-12 pr-4 py-3 border-none rounded-2xl shadow-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm md:text-base"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="w-full md:w-[200px] px-6 py-3 rounded-2xl bg-white border-none shadow-sm text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base cursor-pointer"
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[11px] tracking-wider font-bold">
              <tr>
                <th className="px-6 md:px-8 py-5">Topic Title</th>
                <th className="px-6 md:px-8 py-5 text-center">Status</th>
                <th className="px-6 md:px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredSurveys.map((survey) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={survey._id}
                    className="group hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-700 line-clamp-1">{survey.Topic}</span>
                        <button 
                          onClick={() => handleQuickEdit(survey)}
                          className="p-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md shadow-sm transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          survey.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${survey.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {survey.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => statusMutation.mutate(survey._id)}
                          className={`p-2 rounded-lg md:rounded-xl transition-all ${
                            survey.isActive 
                              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
                              : 'text-gray-400 bg-gray-50 hover:bg-gray-200'
                          }`}
                        >
                          {survey.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        
                        {/* <button 
                          onClick={() => navigate(`/admin/editsurvey/${survey._id}`)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg md:rounded-xl"
                        >
                          <Edit2 size={18} />
                        </button> */}

                        <button 
                          onClick={() => {
                            if(window.confirm("Delete this survey?")) deleteMutation.mutate(survey._id)
                          }}
                          className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg md:rounded-xl"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredSurveys.length === 0 && (
          <div className="py-20 flex flex-col items-center text-gray-400">
            <AlertCircle size={48} className="mb-2 opacity-20" />
            <p className="text-sm">No surveys found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Change Title Modal - Enhanced for Mobile */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Change Topic Title</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"
                >
                  <X size={20}/>
                </button>
              </div>
              
              <label className="block text-xs font-semibold text-gray-500 mb-2 ml-1 uppercase">New Title</label>
              <input 
                autoFocus
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl mb-8 outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-700"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => topicMutation.mutate({ id: selectedSurvey._id, topic: newTitle })}
                  disabled={topicMutation.isPending}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {topicMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurveyDashboard;