"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PLATFORM_LIST, getPlatformConfig, validateExternalUrl } from "@/lib/external-platforms"
import type { ExternalLink } from "@/lib/external-platforms"

interface EditExternalLinksProps {
  isOpen: boolean
  onClose: () => void
  onSave: (links: ExternalLink[]) => void
  initialLinks?: ExternalLink[]
}

export function EditExternalLinks({
  isOpen,
  onClose,
  onSave,
  initialLinks = [],
}: EditExternalLinksProps) {
  const [links, setLinks] = useState<ExternalLink[]>(initialLinks)
  const [newPlatform, setNewPlatform] = useState<string>("")
  const [newUrl, setNewUrl] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  const addLink = () => {
    setError("")

    if (!newPlatform) {
      setError("Please select a platform")
      return
    }

    if (!newUrl.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!validateExternalUrl(newUrl, newPlatform)) {
      setError("Invalid URL format for this platform")
      return
    }

    // Check if platform already linked
    if (links.some((l) => l.platform === newPlatform)) {
      setError("You've already linked this platform")
      return
    }

    const platform = getPlatformConfig(newPlatform)
    if (!platform) return

    const newLink: ExternalLink = {
      id: `${newPlatform}-${Date.now()}`,
      platform: newPlatform,
      url: newUrl,
      label: platform.name,
      icon: platform.icon,
    }

    setLinks([...links, newLink])
    setNewPlatform("")
    setNewUrl("")
  }

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem("externalLinks", JSON.stringify(links))
      onSave(links)
      onClose()
    } catch (err) {
      setError("Failed to save links")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background border border-border/20 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border/20 p-6 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-foreground">Connect Profiles</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add New Link */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Add a New Link</h3>

            {/* Platform Selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Platform</label>
              <select
                value={newPlatform}
                onChange={(e) => {
                  setNewPlatform(e.target.value)
                  setError("")
                }}
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="">Select a platform...</option>
                {PLATFORM_LIST.map((platform) => (
                  <option key={platform.id} value={platform.id} disabled={links.some((l) => l.platform === platform.id)}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {/* URL Input */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Profile URL</label>
              <Input
                type="url"
                placeholder={newPlatform ? getPlatformConfig(newPlatform)?.placeholder : "https://..."}
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value)
                  setError("")
                }}
                className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Add Button */}
            <Button
              onClick={addLink}
              className="w-full bg-primary/90 hover:bg-primary text-primary-foreground"
            >
              Add Link
            </Button>
          </div>

          {/* Connected Links */}
          {links.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Connected Links ({links.length})</h3>
              <div className="space-y-2">
                {links.map((link) => {
                  const platform = getPlatformConfig(link.platform)
                  if (!platform) return null

                  return (
                    <div
                      key={link.id}
                      className="flex items-center justify-between bg-secondary/20 border border-border/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-muted-foreground">{platform.icon && <platform.icon className="w-4 h-4" />}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{platform.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLink(link.id)}
                        className="p-1 hover:bg-destructive/20 rounded transition-colors ml-2"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border/20 p-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || links.length === 0}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
