"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, UsersRound, MessageSquare } from "lucide-react" // Added MessageSquare

// Import your dashboard components
import Bookings from "./Bookings.jsx"
import JoinTeamEntries from "./JoinTeamEntries.jsx"
import LeadsEntry from "./LeadsEntry.jsx" // Import the new Leads component

// Sidebar configuration array
const sidebarItems = [
    { title: "Bookings", Content: Bookings, Icon: Calendar },
    { title: "Join Team", Content: JoinTeamEntries, Icon: UsersRound }, 
    { title: "Leads", Content: LeadsEntry, Icon: MessageSquare }, // Added Leads button config
]

function Sidebar({ isOpen: propIsOpen }) {
    // Set "Bookings" as default active content since "Home" isn't in sidebarItems
    const [activeContent, setActiveContent] = useState("Bookings")
    const [isMobile, setIsMobile] = useState(false)
    const [isOpen, setIsOpen] = useState(propIsOpen)

    // Handle Responsive Layout
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) setIsOpen(false)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Sync open state with parent prop on desktop
    useEffect(() => {
        if (!isMobile) setIsOpen(propIsOpen)
    }, [propIsOpen, isMobile])

    // Helper to render the active component
    const getContent = (title) => {
        const item = sidebarItems.find((item) => item.title === title)
        return item ? <item.Content setActiveContent={setActiveContent} /> : null
    }

    const renderSidebarButton = (item, index) => {
        const isActive = activeContent === item.title
        return (
            <motion.div key={index} className="relative group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                    onClick={() => {
                        setActiveContent(item.title)
                        if (isMobile) setIsOpen(false) // Close sidebar on mobile after selection
                    }}
                    className={`flex items-center ${
                        isOpen ? "justify-start space-x-3 whitespace-nowrap" : "justify-center"
                    } py-2.5 px-4 text-left transition-all duration-200 ease-in-out rounded-r-full text-sm ${
                        isActive 
                            ? "bg-blue-400/30 text-blue-950 w-full font-bold" 
                            : "text-gray-600 hover:bg-gray-100 w-full"
                    }`}
                >
                    <item.Icon className={`w-4 h-4 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
                    {isOpen && (
                        <motion.span 
                            initial={{ opacity: 0, x: -5 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="font-medium"
                        >
                            {item.title}
                        </motion.span>
                    )}
                </button>
            </motion.div>
        )
    }

    return (
        <div className="relative h-full">
            <div className="flex h-[calc(100vh-5rem)]">
                {/* Sidebar Navigation */}
                <motion.div
                    className="sidebar flex flex-col shadow-md pt-8 bg-white z-10 border-r border-gray-100"
                    animate={{ width: isOpen ? "16rem" : "5rem" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {sidebarItems.map((item, index) => renderSidebarButton(item, index))}
                </motion.div>

                {/* Main Content Area */}
                <div className="content flex-1 bg-gray-50/30 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeContent}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {getContent(activeContent)}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default Sidebar