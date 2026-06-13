"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPlatformConfig } from "@/lib/external-platforms"
import type { ExternalLink as ExternalLinkType } from "@/lib/external-platforms"

interface ExternalLinksProps {
  onEdit?: () => void
}

export function ExternalLinks({ onEdit }: ExternalLinksProps) {
  const [links, setLinks] = useState<ExternalLinkType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load links from localStorage
    try {
      const stored = localStorage.getItem("externalLinks")
      if (stored) {
        const parsedLinks = JSON.parse(stored)
        setLinks(parsedLinks)
      }
    } catch (error) {
      console.error("[v0] Error loading external links:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return <div className="h-24 bg-secondary/20 rounded-lg animate-pulse" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold text-foreground">External Profiles</h2>
        <Button
          onClick={onEdit}
          size="sm"
          className="bg-primary/90 hover:bg-primary text-primary-foreground"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="bg-secondary/20 border border-border/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Link your external profiles to showcase your work and skills
          </p>
          <Button
            onClick={onEdit}
            variant="outline"
            className="border-border/50 hover:bg-secondary/30"
          >
            Connect Your First Profile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {links.map((link) => {
            const platform = getPlatformConfig(link.platform)
            if (!platform) return null

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-lg bg-secondary/30 border border-border/50 p-4 transition-all hover:bg-secondary/50 hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="text-foreground/70 group-hover:text-primary transition-colors">
                    {platform.icon && <platform.icon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{platform.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.label || "Profile"}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
