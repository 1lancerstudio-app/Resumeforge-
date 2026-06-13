"use client"

import { Suspense, useState } from "react"
import { ChatArea } from "@/components/ai-chat/chat-area"
import { Sidebar } from "@/components/ai-chat/sidebar"
import { Navigation } from "@/components/landing/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

function ChatContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navigation />
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-4 z-50 p-2 rounded-lg hover:bg-secondary/50 transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Sidebar with responsive behavior */}
        <div
          className={`absolute md:relative w-80 h-full bg-sidebar transform transition-transform duration-300 ease-in-out z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/50 md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <ChatArea />
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
