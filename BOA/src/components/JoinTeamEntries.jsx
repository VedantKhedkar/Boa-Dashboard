"use client";
import React, { useState, useEffect } from "react";
import { Search, X, RefreshCw, Mail, Phone, MapPin, User, Link as LinkIcon, ChevronDown, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const JoinTeamEntry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      // Mock data for Team Applications
      const mockData = [
        { id: "#APP-101", name: "Amit Deshmukh", email: "amit@boa.com", phone: "+91 91111 22222", role: "Video Editing", address: "Rajapeth, Amravati", portfolio: "instagram.com/amit_edits", status: "New", date: "2026-01-02" },
        { id: "#APP-102", name: "Sana Sheikh", email: "sana@boa.com", phone: "+91 93333 44444", role: "Content Creation", address: "Sainagar, Amravati", portfolio: "behance.net/sana_creatives", status: "Interviewing", date: "2026-01-01" },
      ];
      setApplicants(mockData);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const handleStatusChange = (id, newStatus) => {
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Enhanced Filter Logic: Search by Name, Role, or ID
  const filtered = applicants.filter((a) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      a.name.toLowerCase().includes(search) || 
      a.role.toLowerCase().includes(search) || 
      a.id.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-[#fcfcfc] min-h-screen font-sans text-slate-900 antialiased">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Team Applications</h1>
          <p className="text-slate-500 text-sm">Reviewing talent for Best of Amravati Media</p>
        </div>
        <button onClick={fetchApplicants} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Replicated Search Bar Section */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by name, role, or ID..." 
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-sm text-slate-600 placeholder:text-slate-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-40">
          <select 
            className="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none focus:border-indigo-500 text-sm text-slate-600 cursor-pointer font-medium"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">all</option>
            <option value="new">New</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/30 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Applied Role</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-800">{app.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{app.role}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      app.status === 'New' ? 'bg-indigo-50 text-indigo-600' :
                      app.status === 'Interviewing' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-400">{app.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { setSelectedApplicant(app); setIsModalOpen(true); }}
                      className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isModalOpen && selectedApplicant && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-6 flex justify-between items-start bg-slate-50/50 border-b border-slate-100">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-100">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedApplicant.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{selectedApplicant.role}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-y-8 gap-x-6 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1.5 uppercase text-[10px] font-bold tracking-widest">
                      <Mail size={12} /> Email Address
                    </div>
                    <div className="flex items-center gap-2 group">
                        <p className="text-slate-700 font-semibold">{selectedApplicant.email}</p>
                        <button onClick={() => copyToClipboard(selectedApplicant.email)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all"><Copy size={12}/></button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1.5 uppercase text-[10px] font-bold tracking-widest">
                      <Phone size={12} /> Phone
                    </div>
                    <div className="flex items-center gap-2 group">
                        <p className="text-slate-700 font-semibold">{selectedApplicant.phone}</p>
                        <button onClick={() => copyToClipboard(selectedApplicant.phone)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all"><Copy size={12}/></button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1.5 uppercase text-[10px] font-bold tracking-widest">
                      <MapPin size={12} /> Current Location
                    </div>
                    <p className="text-slate-700 font-semibold">{selectedApplicant.address}</p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-slate-400 mb-1.5 uppercase text-[10px] font-bold tracking-widest">
                      <LinkIcon size={12} /> Portfolio & Work
                    </div>
                    <a 
                      href={`https://${selectedApplicant.portfolio}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                    >
                      {selectedApplicant.portfolio}
                    </a>
                  </div>
                </div>

                {/* Edit Status in Modal */}
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Edit Application Status</p>
                        <select 
                            value={selectedApplicant.status}
                            onChange={(e) => handleStatusChange(selectedApplicant.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-indigo-600 text-sm font-bold py-2 px-3 rounded-lg outline-none focus:border-indigo-500"
                        >
                            <option value="New">New</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-slate-400 font-medium italic">ID: {selectedApplicant.id}</p>
                    </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinTeamEntry;