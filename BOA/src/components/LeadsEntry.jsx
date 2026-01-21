"use client";
import React, { useState, useEffect } from "react";
import { Search, X, RefreshCw, Phone, User, Briefcase, Calendar, Copy, MessageSquare, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LeadsEntry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- API CONFIGURATION ---
  const API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/leads`;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) throw new Error("Connection failed");
      const data = await response.json();
      
      const formatted = data.map(lead => ({
        ...lead,
        id: lead._id.substring(lead._id.length - 6).toUpperCase(),
        fullId: lead._id,
        date: new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
      }));

      setLeads(formatted);
    } catch (err) {
      console.error("Leads Fetch Error:", err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filtered = leads.filter((l) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      l.name.toLowerCase().includes(search) || 
      l.profession.toLowerCase().includes(search) || 
      l.mobile.includes(search);
    
    const matchesSource = sourceFilter === "all" || l.source?.toLowerCase() === sourceFilter.toLowerCase();
    
    return matchesSearch && matchesSource;
  });

  return (
    <div className="p-8 bg-[#fcfcfc] min-h-screen font-sans text-slate-900 antialiased">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Chatbot Leads</h1>
          <p className="text-slate-500 text-sm">Review potential clients captured via the AI chatbot</p>
        </div>
        <button onClick={fetchLeads} className="p-2.5 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
          <RefreshCw size={20} className={loading ? "animate-spin text-indigo-600" : "text-slate-400"} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by name, profession, or mobile..." 
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-sm text-slate-600 shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-44">
          <select 
            className="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none focus:border-indigo-500 text-sm text-slate-600 cursor-pointer font-medium shadow-sm"
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="chatbot">Chatbot</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/30 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Lead Detail</th>
                <th className="px-6 py-4">Profession</th>
                <th className="px-6 py-4 text-center">Mobile</th>
                <th className="px-6 py-4 text-center">Capture Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {loading ? (
                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Syncing with database...</td></tr>
              ) : filtered.length === 0 ? (
                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No leads found matching your criteria.</td></tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.fullId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="bg-indigo-50/50 text-indigo-600 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-tight">
                            {lead.profession}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700 font-mono font-medium">{lead.mobile}</td>
                    <td className="px-6 py-4 text-center text-slate-400">{lead.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedLead(lead); setIsModalOpen(true); }}
                        className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors px-3 py-1 hover:bg-indigo-50 rounded-md"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Backdrop Modal */}
      <AnimatePresence>
        {isModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-6 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Lead Insights</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Lead ID: {selectedLead.id}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <User className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLead.name}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <Briefcase className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profession</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLead.profession}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 group">
                  <Phone className="text-indigo-600" size={20} />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</p>
                    <p className="text-sm font-bold text-slate-700 font-mono">{selectedLead.mobile}</p>
                  </div>
                  <button onClick={() => copyToClipboard(selectedLead.mobile)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <Calendar className="text-indigo-600" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Captured Date</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLead.date}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <a 
                    href={`https://wa.me/${selectedLead.mobile.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold text-center hover:bg-emerald-600 transition-all shadow-md flex items-center justify-center gap-2"
                >
                    WhatsApp Lead <ExternalLink size={14} />
                </a>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadsEntry;