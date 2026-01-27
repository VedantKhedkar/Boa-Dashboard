"use client";
import React, { useState, useEffect, useCallback } from "react";
// Added Trash2 icon to imports
import { Search, X, RefreshCw, Phone, User, Copy, ChevronDown, MessageSquare, Briefcase, Calendar, AlertCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LeadsEntry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const API_ENDPOINT = `${import.meta.env.VITE_API_URL}/leads`;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}. Path might be incorrect.`);
      }
      const data = await response.json();
      const rawLeads = data.leads || (Array.isArray(data) ? data : []);

      const formatted = rawLeads.map(lead => ({
        ...lead,
        displayId: lead._id ? lead._id.substring(lead._id.length - 6).toUpperCase() : "N/A",
        fullId: lead._id,
        date: new Date(lead.createdAt || lead.timestamp).toLocaleDateString('en-IN'),
        time: new Date(lead.createdAt || lead.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: lead.status ? lead.status.charAt(0).toUpperCase() + lead.status.slice(1) : "New"
      }));

      setLeads(formatted);
    } catch (err) {
      console.error("Leads Fetch Error:", err);
      setFetchError(err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [API_ENDPOINT]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLeads(prev => prev.map(l => l.fullId === id ? { ...l, status: newStatus } : l));
      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });
      if (!response.ok) throw new Error("Failed to update status");
    } catch (error) {
      console.error("Update failed:", error);
      fetchLeads(); 
    }
  };

  // --- NEW DELETE HANDLER ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    
    try {
      // Optimistic UI update: Remove from local state immediately
      setLeads(prev => prev.filter(lead => lead.fullId !== id));

      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Failed to delete lead");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting lead. Please try again.");
      fetchLeads(); // Re-fetch on failure to restore state
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filtered = leads.filter((l) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      l.name?.toLowerCase().includes(search) || 
      l.profession?.toLowerCase().includes(search) || 
      l.mobile?.includes(search);
    const matchesStatus = statusFilter === "all" || l.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-[#fcfcfc] min-h-screen font-sans text-slate-900 antialiased">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Chatbot Leads</h1>
          <p className="text-slate-500 text-sm">Reviewing business inquiries from the Chatbot</p>
        </div>
        <button onClick={fetchLeads} className="p-2.5 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
          <RefreshCw size={20} className={loading ? "animate-spin text-indigo-600" : "text-slate-400"} />
        </button>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
          <AlertCircle size={18} />
          <p><strong>Fetch Error:</strong> {fetchError}. Verify the API route on your backend.</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-sm text-slate-600"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-44">
          <select 
            className="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none focus:border-indigo-500 text-sm text-slate-600 cursor-pointer font-medium"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
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
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Profession</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {loading ? (
                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading leads...</td></tr>
              ) : filtered.length === 0 ? (
                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No leads found.</td></tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.fullId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{lead.name || "Unknown"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {lead.displayId}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{lead.profession || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                        lead.status === 'New' ? 'bg-amber-50 text-amber-600' :
                        lead.status === 'Contacted' ? 'bg-indigo-50 text-indigo-600' :
                        lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500">{lead.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button 
                          onClick={() => { setSelectedLead(lead); setIsModalOpen(true); }}
                          className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(lead.fullId)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-6 flex justify-between items-start bg-slate-50/50 border-b border-slate-100">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedLead.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lead Details</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-y-8 gap-x-6 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1.5 uppercase text-[10px] font-bold tracking-widest">
                      <Briefcase size={12} /> Profession
                    </div>
                    <p className="text-slate-700 font-semibold">{selectedLead.profession}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1.5 uppercase text-[10px] font-bold tracking-widest">
                      <Phone size={12} /> Mobile Number
                    </div>
                    <div className="flex items-center gap-2 group">
                        <p className="text-slate-700 font-semibold">{selectedLead.mobile}</p>
                        <button onClick={() => copyToClipboard(selectedLead.mobile)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-indigo-600 transition-all"><Copy size={12}/></button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lead Status</p>
                        <select 
                            value={selectedLead.status}
                            onChange={(e) => handleStatusChange(selectedLead.fullId, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-indigo-600 text-sm font-bold py-2 px-3 rounded-lg outline-none"
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Converted">Converted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button 
                          onClick={() => { handleDelete(selectedLead.fullId); setIsModalOpen(false); }}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <a 
                          href={`https://wa.me/91${selectedLead.mobile}`} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                        >
                          <MessageSquare size={14}/> WhatsApp
                        </a>
                    </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  Close
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