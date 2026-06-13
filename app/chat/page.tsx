"use client"

import { Suspense } from "react"
import { ChatArea } from "@/components/ai-chat/chat-area"
import { Sidebar } from "@/components/ai-chat/sidebar"
import { Navigation } from "@/components/landing/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

function ChatContent() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Navigation />
      <div className="flex flex-1">
        <Sidebar />
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
