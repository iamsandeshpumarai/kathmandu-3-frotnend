import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, LayoutDashboard, ClipboardList } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from './Context/ContextDataprovider';
import { useMutation } from '@tanstack/react-query';

const UserHeader = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useMutation({
    mutationFn: () => api.post('api/admin/logout'),
    onSuccess: () => {
      // Clear local storage or context if necessary before reload
      window.location.reload();
    },
    onError: () => {
      navigate('/login');
    }
  });

  const navLinks = [
    { name: 'Dashboard', path: '/userdashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'My Surveys', path: '/mysurveys', icon: <ClipboardList size={18} /> },
  ];

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Logo & Desktop Nav */}
          <div className="flex items-center">
            <Link to="/userdashboard" className="flex-shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight hidden xs:block">
                SurveyPortal
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              {/* Profile Info (Desktop Only) */}
              <div className="text-right hidden sm:block border-r border-slate-200 pr-4 mr-1">
                <p className="text-sm font-bold text-slate-800 leading-none">{user?.username || 'User'}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  {user?.role?.[0] || 'Member'}
                </p>
              </div>
              
              {/* Logout Button (Desktop) */}
              <button 
                onClick={() => handleLogout.mutate()}
                disabled={handleLogout.isPending}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-all text-slate-600 active:scale-95"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-64 border-t border-slate-100' : 'max-h-0'
      }`}>
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout.mutate();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              {handleLogout.isPending ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;