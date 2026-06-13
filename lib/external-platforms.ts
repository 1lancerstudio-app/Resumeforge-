import { Linkedin, Github, Figma, Award, BookOpen, Code2, Briefcase, GraduationCap } from "lucide-react"

export interface ExternalLink {
  id: string
  platform: string
  url: string
  label: string
  icon: React.ReactNode
}

export interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  placeholder: string
  urlPattern: string
  validateUrl: (url: string) => boolean
}

export const SUPPORTED_PLATFORMS: Record<string, Platform> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/yourprofile",
    urlPattern: "https://linkedin.com/in/",
    validateUrl: (url: string) => url.includes("linkedin.com") && (url.includes("/in/") || url.includes("/company/")),
  },
  github: {
    id: "github",
    name: "GitHub",
    icon: Github,
    placeholder: "https://github.com/yourprofile",
    urlPattern: "https://github.com/",
    validateUrl: (url: string) => url.includes("github.com/") && url.split("/").length >= 4,
  },
  figma: {
    id: "figma",
    name: "Figma",
    icon: Figma,
    placeholder: "https://figma.com/@yourprofile",
    urlPattern: "https://figma.com/",
    validateUrl: (url: string) => url.includes("figma.com"),
  },
  credly: {
    id: "credly",
    name: "Credly",
    icon: Award,
    placeholder: "https://credly.com/users/yourprofile",
    urlPattern: "https://credly.com/",
    validateUrl: (url: string) => url.includes("credly.com"),
  },
  notion: {
    id: "notion",
    name: "Notion",
    icon: BookOpen,
    placeholder: "https://notion.so/yourprofile",
    urlPattern: "https://notion.so/",
    validateUrl: (url: string) => url.includes("notion.so"),
  },
  leetcode: {
    id: "leetcode",
    name: "LeetCode",
    icon: Code2,
    placeholder: "https://leetcode.com/yourprofile",
    urlPattern: "https://leetcode.com/",
    validateUrl: (url: string) => url.includes("leetcode.com/") && url.split("/").length >= 4,
  },
  hackerrank: {
    id: "hackerrank",
    name: "HackerRank",
    icon: Briefcase,
    placeholder: "https://hackerrank.com/yourprofile",
    urlPattern: "https://hackerrank.com/",
    validateUrl: (url: string) => url.includes("hackerrank.com"),
  },
  coursera: {
    id: "coursera",
    name: "Coursera",
    icon: GraduationCap,
    placeholder: "https://coursera.org/user/yourprofile",
    urlPattern: "https://coursera.org/",
    validateUrl: (url: string) => url.includes("coursera.org") || url.includes("coursera.com"),
  },
}

export const PLATFORM_LIST = Object.values(SUPPORTED_PLATFORMS)

export function getPlatformConfig(platformId: string): Platform | undefined {
  return SUPPORTED_PLATFORMS[platformId]
}

export function validateExternalUrl(url: string, platformId: string): boolean {
  try {
    new URL(url)
    const platform = getPlatformConfig(platformId)
    return platform ? platform.validateUrl(url) : false
  } catch {
    return false
  }
}
