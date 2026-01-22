import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ClipboardList, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  Edit
} from 'lucide-react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import api from '../../utils/api';
import { useMutation } from '@tanstack/react-query';
const AdminLayout = () => {
    
const navigate = useNavigate()
    const logout = useMutation({
    mutationFn:async function(){
        await api.post('/api/admin/logout')
        
      },
      onSuccess: () => {
     window.location.reload();
    // 1. Clear ALL cached data (very important for security)
    
    
    // 2. Redirect to login
    

    // 3. Optional: If you use a window-level reload to be 100% sure
    // window.location.href = '/login'; 
  },
  onError: (error) => {
    console.error("Logout failed:", error);
    // Even if it fails, you might want to force redirect
    navigate('/login');
  }
})

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Survey Stats', icon: <BarChart3 size={20} />, path: '/admin/stats' },
    // { name: 'Manage Surveys', icon: <ClipboardList size={20} />, path: '/admin/surveys' },
    { name: 'Users List', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Edit Content', icon: <Edit size={20} />, path: '/admin/editcontent' },
    // { name: 'Settings', icon: <Settings size={20} />, path: '/admin/setting' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">S</div>
              <span className="text-xl font-black tracking-tighter">SURVEY PRO</span>
            </div>
            <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
              >
                <span className="group-hover:text-blue-400 transition-colors">
                  {item.icon}
                </span>
                <span className="font-semibold">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Section */}
          <div onClick={()=>{logout.mutate()}} className="p-4 border-t border-slate-800">
            <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-semibold">
              <LogOut size={20} />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-black text-slate-800">Hello, Admin! 👋</h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Welcome back to your dashboard overview.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer">
              <img 
                src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" 
                alt="admin profile" 
              />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT (Renders your Dashboard/Stats component here) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {/* The <Outlet /> is where child routes will render */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;