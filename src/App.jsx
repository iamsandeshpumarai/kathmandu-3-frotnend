import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home'; 
import LoginPage from './Component/Login';

import MySurveys from './Component/MySurvey';
import { useAuth } from './Component/Context/ContextDataprovider';
import Loading from './Component/Loading/Loading';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './Component/Admin/AdminLayout';
import AdminDashboard from './Component/Admin/AdminDashboard';
import UserList from './Component/Admin/UserList';
import AdminSettings from './Component/Admin/AdminSetting';
import ManageSurvey from './Component/Admin/ManageSurvey';
import SurveyAnalyticsDashboard from './Component/Admin/SurveyStat';
import SurveyEditContent from './Component/Admin/EditContent';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading/>

  const isAdmin = user?.role?.includes('admin');
  const isUser = user?.role?.includes('user');

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/mysurveys" element={isUser ? <MySurveys/> : <LoginPage/>} />
        
        <Route 
          path="/userdashboard" 
          element={isUser ? <Home /> : <Navigate to="/login" replace />} 
        />

        {/* --- ADMIN ROUTES --- */}
        <Route 
          path="/admin" 
          element={isAdmin ? <AdminLayout /> : <Navigate to="/login" replace />}
        >
          {/* This is the default page when going to /admindashboard */}
          <Route index  element={<AdminDashboard />} />
          <Route path='users'  element={<UserList />} />
          <Route path='setting'  element={<AdminSettings />} />
          <Route path='stats'  element={<SurveyAnalyticsDashboard />} />
          <Route path='surveys'  element={<ManageSurvey />} />
          <Route path='editcontent'  element={<SurveyEditContent />} />
          
        </Route>

        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : (
            isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/userdashboard" replace />
          )} 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;