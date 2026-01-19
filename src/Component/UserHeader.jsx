import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  Settings,
  Bell,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "./Context/ContextDataprovider";
import { useMutation } from "@tanstack/react-query";

const UserHeader = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { mutateAsync: logout, isPending } = useMutation({
    mutationFn: () => api.post("api/admin/logout"),
    onSuccess: () => {
      navigate("/login");
      window.location.reload();
    },
    onError: () => {
      navigate("/login");
    },
  });

  const navLinks = [
    {
      name: "Dashboard",
      path: "/userdashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "My Surveys",
      path: "/mysurveys",
      icon: <ClipboardList size={18} />,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo & Desktop Nav */}
          <div className="flex items-center">
            <Link
              to="/userdashboard"
              className="flex-shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
                SurveyPortal
              </span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === link.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {user?.role?.[0]}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-all text-slate-600"
                title="Logout"
              >
                {isPending ? "logging out..." : <LogOut size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogout.mutate()}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default UserHeader;
