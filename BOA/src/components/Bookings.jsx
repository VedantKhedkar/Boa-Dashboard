"use client";
import React, { useState, useEffect } from "react";
import { Search, X, RefreshCw, Building2, Copy, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Booking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- API CONNECTION CONFIG ---
  // Ensure VITE_API_URL is set to https://best-of-amravati.vercel.app/api in your .env
  const API_ENDPOINT = `${import.meta.env.VITE_API_URL}/bookings`;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      // Map MongoDB _id to id for the table
      const formattedData = data.map(item => ({
        ...item,
        id: item._id?.substring(18).toUpperCase() || "#BK-XXXX", // Shortened ID for UI
        fullId: item._id,
        date: new Date(item.createdAt).toLocaleDateString(),
        amount: "₹3,500" // Hardcoded as per your business model
      }));
      
      setBookings(formattedData);
    } catch (err) {
      console.error("Fetch Error:", err);
      // Fallback to empty or error state
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic Update in UI
      setBookings(prev => prev.map(b => b.fullId === id ? { ...b, status: newStatus } : b));
      
      // API call to update status in MongoDB
      await fetch(API_ENDPOINT, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filtered = bookings.filter((b) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      b.businessName?.toLowerCase().includes(search) || 
      b.ownerName?.toLowerCase().includes(search) || 
      b.fullId?.toLowerCase().includes(search);
    
    const matchesStatus = statusFilter === "all" || b.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-white min-h-screen font-sans text-slate-900 antialiased">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all web form entries and payment records</p>
        </div>
        <button onClick={fetchBookings} className="p-2.5 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
          <RefreshCw size={18} className={loading ? "animate-spin text-indigo-600" : "text-slate-400"} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by name, business, or payment ID..." 
            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all text-sm text-slate-600 placeholder:text-slate-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-36">
          <select 
            className="w-full appearance-none bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none focus:border-indigo-500 text-sm text-slate-600 cursor-pointer font-medium"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">all</option>
            <option value="PAID">Paid</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {loading ? (
                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading bookings...</td></tr>
              ) : filtered.length === 0 ? (
                 <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No bookings found.</td></tr>
              ) : (
                filtered.map((booking) => (
                  <tr 
                    key={booking.fullId} 
                    className="hover:bg-slate-50/80 cursor-pointer transition-all active:bg-slate-100"
                    onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                  >
                    <td className="px-6 py-4 font-medium text-slate-500 tabular-nums">{booking.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{booking.businessName}</td>
                    <td className="px-6 py-4 text-slate-600">{booking.ownerName}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                        booking.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 tabular-nums">{booking.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Building2 size={20} /></div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800">{selectedBooking.businessName}</h2>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{selectedBooking.fullId}</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Customer Name</p>
                    <p className="text-sm text-slate-700 font-medium">{selectedBooking.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Date Paid</p>
                    <p className="text-sm text-slate-700 font-medium">{selectedBooking.date}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <div className="flex items-center gap-2 group">
                        <p className="text-sm text-slate-700 font-medium">{selectedBooking.phone}</p>
                        <button onClick={() => copyToClipboard(selectedBooking.phone)} className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={12}/></button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Business Email</p>
                    <div className="flex items-center gap-2 group">
                        <p className="text-sm text-slate-700 font-medium">{selectedBooking.email}</p>
                        <button onClick={() => copyToClipboard(selectedBooking.email)} className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"><Copy size={12}/></button>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Update Order Status</p>
                        <select 
                            value={selectedBooking.status}
                            onChange={(e) => handleStatusChange(selectedBooking.fullId, e.target.value)}
                            className="bg-white border border-slate-200 text-indigo-600 text-sm font-semibold py-2 px-4 rounded-lg outline-none cursor-pointer"
                        >
                            <option value="PAID">Paid</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Amount Paid</p>
                        <p className="text-xl font-semibold text-slate-800 tabular-nums">{selectedBooking.amount}</p>
                    </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;