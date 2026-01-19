import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import api from '../../utils/api';

const AdminSettings = () => {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    oldEmail: '',
    oldPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });

  // API Mutation for updating credentials
  const mutation = useMutation({
    mutationFn: (data) => api.put('/api/user/update-admin', data),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Credentials updated successfully!' });
      setFormData({ oldEmail: '', oldPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Account Settings</h2>
        <p className="text-slate-500 font-medium">Update your admin credentials and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Info */}
        <div className="space-y-4">
          <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-100">
            <ShieldCheck size={32} className="mb-4" />
            <h3 className="font-bold text-lg mb-2">Security First</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Changing your email or password will require you to log in again on all devices to ensure your account remains secure.
            </p>
          </div>
          
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-3">Requirements:</h4>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Valid current email</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Min. 8 characters password</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Must match confirmation</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 space-y-6">
              
              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
                  <p className="text-sm font-bold">{message.text}</p>
                </div>
              )}

              {/* Current Credentials Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verify Identity</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Current Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" name="oldEmail" required value={formData.oldEmail} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showOldPass ? "text" : "password"} name="oldPassword" required value={formData.oldPassword} onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showOldPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-50" />

              {/* New Credentials Section */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Update Information</p>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">New Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" name="newEmail" required value={formData.newEmail} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
                      placeholder="newadmin@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showNewPass ? "text" : "password"} name="newPassword" required value={formData.newPassword} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showNewPass ? "text" : "password"} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNewPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-70"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;