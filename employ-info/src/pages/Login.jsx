import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/altacomputec_logo.jpg';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await api.post("/employees/login", { 
      email: email.trim(), 
      password 
    });
    
    // 1. Store session data
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // 2. Extract position for routing
    const userPosition = res.data.user.proposed_position || "";
    
    // 3. Robust check for Admin/Manager roles
    const isPrivileged = 
      userPosition.toLowerCase().includes("ict solution manager") || 
      userPosition.toLowerCase().includes("division head") ||
      userPosition.toLowerCase().includes("general manager") ||
      userPosition.toLowerCase().includes("human resource manager") ||
      userPosition.toLowerCase().includes("director");

    if (isPrivileged) {
      navigate("/employees"); 
    } else {
      navigate("/my-profile");
    }
    
  } catch (err) {
    console.error("Login Error:", err);
    setError(err.response?.data?.message || "Invalid credentials. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT SIDE: Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-center bg-sky-600 p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sky-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="relative z-10">
          <img src={logo} alt="Logo" className="h-16 mb-12" />
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Standardizing <span className="text-lime-500">Professional Identity</span> across the firm.
          </h1>
          <p className="text-lime-300 text-lg max-w-md">
            Log in to manage your professional record, update certifications, and export your official CV.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo Only */}
          <img src={logo} alt="Logo" className="h-12 lg:hidden mb-8" />
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8">Enter your credentials to access your account.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl animate-shake">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            Haven't registered your CV yet?{' '}
            <Link to="/employees/new" className="text-sky-600 font-bold hover:underline">
              Create Profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}