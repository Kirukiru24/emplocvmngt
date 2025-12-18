import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, FileText, ShieldCheck, PieChart, ArrowRight, LogIn } from 'lucide-react';
// IMPORTING LOGO FROM ASSETS
import logo from '../assets/altacomputec_logo.jpg'; 

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10">
          <PieChart size={400} className="text-blue-400" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* HEADER AREA WITH LOGO AND SIGN IN */}
          <div className="flex justify-between items-center mb-12">
            <img src={logo} alt="Company Logo" className="h-16 w-auto object-contain" />
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-700 hover:bg-slate-800"
            >
              <LogIn size={18} /> Sign In
            </button>
          </div>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <ShieldCheck size={16} />
              <span>Secure Employee Data Management</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-lime-500 leading-tight mb-6">
              Manage your workforce <span className="text-sky-600">with precision.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed">
              A comprehensive system to record professional backgrounds, track certifications, 
              and generate standardized CVs for your entire team in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Launch Directory <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate('/employees/new')}
                className="flex items-center justify-center gap-2 bg-lime-500 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold transition-all border border-slate-700"
              >
                Add New Staff
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE CARDS --- */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <UserPlus size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Seamless Onboarding</h3>
            <p className="text-slate-600 leading-relaxed">
              Easily input education, employment history, and professional training through our structured forms.
            </p>
          </div>

          <div className="group">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic Directory</h3>
            <p className="text-slate-600 leading-relaxed">
              Search and filter your talent pool by position, nationality, or expertise on any device.
            </p>
          </div>

          <div className="group">
            <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant CV Export</h3>
            <p className="text-slate-600 leading-relaxed">
              Generate standardized, professional PDF CVs ready for proposal submissions or audits.
            </p>
          </div>
        </div>
      </section>

      {/* --- QUICK ACTION SECTION --- */}
      <section className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              onClick={() => navigate('/employees/new')}
              className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-2xl flex flex-col items-center"
            >
              <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
                <UserPlus size={32} />
              </div>
              <h4 className="text-xl font-bold">Register New Employee</h4>
              <p className="text-slate-500 mt-2">Start a new profile with photo and full history</p>
            </div>

            <div 
              onClick={() => navigate('/employees')}
              className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-2xl flex flex-col items-center"
            >
              <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 mb-4">
                <Users size={32} />
              </div>
              <h4 className="text-xl font-bold">View All Staff</h4>
              <p className="text-slate-500 mt-2">Browse the directory and export CVs</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-sky-600 text-center text-white text-sm">
        <p>© {new Date().getFullYear()} Employee Info System. All rights reserved.</p>
      </footer>
    </div>
  );
}