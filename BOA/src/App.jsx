import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './components/MainApp.jsx';
import AdminLogin from './components/AdminLogin.jsx';

// Security: Check karega ki admin logged in hai ya nahi
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken') === 'active_session';
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pehle Login Page dikhega */}
        <Route path="/" element={<AdminLogin />} />

        {/* Tera pura dashboard Protected hai */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />

        {/* Galat URL par redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;