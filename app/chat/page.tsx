"use client"

import { Suspense, useState, useEffect } from "react"
import { ChatArea } from "@/components/ai-chat/chat-area"
import { Sidebar } from "@/components/ai-chat/sidebar"
import { Navigation } from "@/components/landing/navigation"
import { useRouter } from "next/navigation"
import { Moon, Sun } from "lucide-react"

function ChatContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("chat-theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-chat-theme", savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("chat-theme", newTheme)
    document.documentElement.setAttribute("data-chat-theme", newTheme)
  }

  if (!mounted) return null

  return (
    <div className={`flex flex-col h-screen ${theme === "light" ? "bg-white text-gray-900" : "bg-background text-foreground"}`} data-chat-theme={theme}>
      <Navigation isChat={true} />
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute left-4 top-4 z-50 p-2 rounded-lg transition-colors md:hidden ${
            theme === "light" ? "hover:bg-gray-200" : "hover:bg-secondary/50"
          }`}
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`absolute right-4 top-4 z-50 p-2 rounded-lg transition-colors md:relative md:right-auto md:top-auto md:absolute md:right-4 md:top-4 ${
            theme === "light" 
              ? "bg-gray-100 text-gray-800 hover:bg-gray-200" 
              : "hover:bg-secondary/50"
          }`}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Sidebar with responsive behavior */}
        <div
          className={`absolute md:relative w-80 h-full ${
            theme === "light" 
              ? "bg-gray-50 border-r border-gray-200" 
              : "bg-sidebar"
          } transform transition-transform duration-300 ease-in-out z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className={`absolute inset-0 md:hidden z-30 ${theme === "light" ? "bg-gray-900/50" : "bg-black/50"}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <ChatArea theme={theme} />
      </div>
    </div>
  )
}

function ChatPageFallback() {
  return (
    <div className="flex h-screen bg-background text-foreground items-center justify-center">
      <div className="animate-pulse font-display text-xl text-foreground">Loading AI Chat...</div>
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("resumeforge_user")
    if (!user) {
      router.push("/login")
      return
    }

    // Check if questionnaire is completed for candidates
    const role = localStorage.getItem("resumeforge_role")
    const isNewUser = localStorage.getItem("resumeforge_new_user")

    if (role === "candidate" && isNewUser === "true") {
      router.push("/questionnaire")
      return
    }
  }, [router])

  return (
    <Suspense fallback={<ChatPageFallback />}>
      <ChatContent />
    </Suspense>
  )
}
