"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  X, 
  RefreshCw, 
  Phone, 
  User, 
  Briefcase, 
  Calendar, 
  Copy, 
  MessageSquare, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LeadsEntry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0
  });

  // API Configuration
  const API_ENDPOINT = "/api/leads";

  // Format lead data
  const formatLeadData = (lead) => {
    const date = new Date(lead.createdAt || lead.timestamp);
    const formattedDate = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Determine status display
    let statusIcon;
    let statusColor;
    let statusText;

    switch(lead.status) {
      case 'new':
        statusIcon = <Clock size={12} />;
        statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
        statusText = "New";
        break;
      case 'contacted':
        statusIcon = <MessageSquare size={12} />;
        statusColor = "bg-blue-100 text-blue-800 border-blue-200";
        statusText = "Contacted";
        break;
      case 'converted':
        statusIcon = <CheckCircle size={12} />;
        statusColor = "bg-green-100 text-green-800 border-green-200";
        statusText = "Converted";
        break;
      case 'rejected':
        statusIcon = <X size={12} />;
        statusColor = "bg-red-100 text-red-800 border-red-200";
        statusText = "Rejected";
        break;
      default:
        statusIcon = <Clock size={12} />;
        statusColor = "bg-gray-100 text-gray-800 border-gray-200";
        statusText = "Pending";
    }

    return {
      ...lead,
      id: lead._id ? lead._id.substring(lead._id.length - 6).toUpperCase() : 'N/A',
      fullId: lead._id || '',
      date: formattedDate,
      time: formattedTime,
      statusIcon,
      statusColor,
      statusText
    };
  };

  // Fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching leads from:', API_ENDPOINT);
      const response = await fetch(API_ENDPOINT);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.leads && Array.isArray(data.leads)) {
        const formattedLeads = data.leads.map(formatLeadData);
        setLeads(formattedLeads);
        
        // Calculate stats
        const stats = {
          total: formattedLeads.length,
          new: formattedLeads.filter(l => l.status === 'new').length,
          contacted: formattedLeads.filter(l => l.status === 'contacted').length,
          converted: formattedLeads.filter(l => l.status === 'converted').length
        };
        setStats(stats);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (err) {
      console.error("Leads Fetch Error:", err);
      setError(err.message || "Failed to fetch leads. Please check your connection.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh every 30 seconds
  useEffect(() => {
    fetchLeads();
    
    const interval = setInterval(() => {
      fetchLeads();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(search) || 
      lead.profession.toLowerCase().includes(search) || 
      lead.mobile.includes(search) ||
      (lead.id && lead.id.toLowerCase().includes(search));
    
    const matchesSource = sourceFilter === "all" || 
      (lead.source && lead.source.toLowerCase() === sourceFilter.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (lead.status && lead.status.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchLeads(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen font-sans text-gray-900 antialiased">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chatbot Leads Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage leads captured through your AI chatbot</p>
          </div>
          <button 
            onClick={fetchLeads} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-medium">{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">New Leads</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.new}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Contacted</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.contacted}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Phone className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Converted</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.converted}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, profession, mobile, or ID..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                <option value="chatbot">Chatbot</option>
                <option value="website">Website</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lead Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Profession
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Capture Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="animate-spin text-blue-600 mb-3" size={24} />
                      <p className="text-gray-600">Loading leads from database...</p>
                      <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="text-red-500 mb-3" size={32} />
                      <p className="text-red-600 font-medium">{error}</p>
                      <button
                        onClick={fetchLeads}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="text-gray-400 mb-3" size={32} />
                      <p className="text-gray-600 font-medium">No leads found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || sourceFilter !== 'all' || statusFilter !== 'all' 
                          ? "Try adjusting your filters" 
                          : "Start by connecting your chatbot"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                          {lead.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{lead.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">ID: {lead.id || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {lead.profession || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${lead.statusColor} border`}>
                          {lead.statusIcon}
                          <span className="ml-1.5">{lead.statusText}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-gray-900 font-medium">{lead.mobile || 'No number'}</span>
                        <span className="text-xs text-gray-500 mt-1">{lead.source || 'chatbot'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">{lead.date}</span>
                        <span className="text-xs text-gray-500">{lead.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsModalOpen(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        <a
                          href={`https://wa.me/91${lead.mobile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <MessageSquare size={14} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination/Info Footer */}
        {!loading && !error && filteredLeads.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredLeads.length}</span> of{" "}
              <span className="font-semibold">{leads.length}</span> leads
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Lead Details</h2>
                      <p className="text-blue-100 text-sm">ID: {selectedLead.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h3>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedLead.name}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Profession</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedLead.profession}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Information</h3>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Mobile Number</label>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-gray-900 font-mono">{selectedLead.mobile}</p>
                            <button
                              onClick={() => copyToClipboard(selectedLead.mobile)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy size={18} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
                          <p className="text-lg font-semibold text-gray-900 capitalize">{selectedLead.source || 'chatbot'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Timeline</h3>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Capture Date</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedLead.date}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Capture Time</label>
                          <p className="text-lg font-semibold text-gray-900">{selectedLead.time}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Last Updated</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(selectedLead.updatedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <CheckCircle className="text-yellow-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status & Actions</h3>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Current Status</label>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${selectedLead.statusColor} border`}>
                              {selectedLead.statusIcon}
                              <span className="ml-2">{selectedLead.statusText}</span>
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Contacted</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedLead.contacted ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedLead.notes && selectedLead.notes.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Notes</h3>
                    <div className="space-y-3">
                      {selectedLead.notes.map((note, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-800">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            By {note.createdBy} • {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/91${selectedLead.mobile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold text-center hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} />
                  Contact on WhatsApp
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => window.open(`tel:+91${selectedLead.mobile}`)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Call Now
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
                >
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