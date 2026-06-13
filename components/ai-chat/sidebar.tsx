import {
  MessageSquarePlus,
  MessageSquare,
  Archive,
  BookOpen,
  FolderPlus,
  ImageIcon,
  Presentation,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <aside className="w-80 bg-gradient-to-b from-sidebar to-sidebar/95 flex flex-col h-full border-r border-border/10">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 rounded-full border-2 border-white/60" />
          </div>
          <div>
            <span className="text-sm font-semibold text-sidebar-foreground font-display tracking-tight">
              ResumeForge
            </span>
            <span className="text-xs text-muted-foreground ml-1">AI</span>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="secondary"
          className="btn-3d btn-glow w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 font-medium"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Features Section */}
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</h3>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </Button>
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <Archive className="w-4 h-4" />
              Archived
            </Button>
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Library
            </Button>
          </div>
        </div>

        {/* Workspaces Section */}
        <div>
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</h3>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <FolderPlus className="w-4 h-4" />
              New Project
            </Button>
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </Button>
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <Presentation className="w-4 h-4" />
              Presentation
            </Button>
            <Button
              variant="ghost"
              className="btn-3d w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent font-medium"
            >
              <FileText className="w-4 h-4" />
              Research
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
