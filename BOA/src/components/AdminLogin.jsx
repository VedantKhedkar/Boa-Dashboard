import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. Yahan apne logo ka path daal de (e.g., logo.png ya logo.svg)
import myLogo from '../assets/logo.png'; 

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Login Credentials
    const ADMIN_USER = "boa.admin";
    const ADMIN_PASS = "admin@boa";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem('adminToken', 'active_session');
      navigate('/dashboard'); 
    } else {
      setError('Invalid username or password!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F2] p-4 font-sans overflow-hidden relative">
      {/* Background Shapes */}
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 bg-[#FCECD8] rounded-full -z-10 opacity-60" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#EEEEEE] rounded-full -z-10 opacity-60" />

      <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative border border-gray-100 min-h-[420px]">
        
        {/* Left Side: Branding */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-50">
          <div className="mb-8">
            {/* 2. Tera Asli Logo Yahan Ayega */}
            <img 
              src={myLogo} 
              alt="Logo" 
              className="w-20 h-auto object-contain" // Size yahan se adjust kar lena
            />
          </div>
          
          <h1 className="text-3xl font-bold text-[#333333] mb-2">Sign in to Dashboard</h1>
          <p className="text-gray-400 font-medium">Use your Login Credentials</p>
          
          {error && <p className="text-red-500 text-sm mt-4 font-semibold">{error}</p>}
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-gray-500 z-10">
                Username
              </label>
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username"
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 text-gray-700"
              />
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-gray-500 z-10">
                Password
              </label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 text-gray-700"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#D1E3F8] hover:bg-[#bbd4f0] text-[#1E4E8C] font-bold py-3.5 rounded-md transition-all shadow-sm active:scale-95"
            >
              Login
            </button>
          </form>
        </div>

        {/* Bottom Three-Color Strip */}
        <div className="absolute bottom-0 left-0 w-full h-[6px] flex">
          <div className="h-full w-1/3 bg-[#FFD700]"></div> 
          <div className="h-full w-1/3 bg-[#002BBD]"></div> 
          <div className="h-full w-1/3 bg-[#E31E24]"></div> 
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;