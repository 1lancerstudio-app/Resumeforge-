export type TemplateId = "white-business" | "brown-auditor" | "modern-minimalist-cv" | "minimalist-modern";

export interface ExperienceEntry {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  school: string;
  dates: string;
  gpa?: string;
}

export interface ResumeData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  email: string;
  location: string;
  linkedin?: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  achievements?: string[];
  photoUrl?: string;
}

export const TEMPLATES: Record<
  TemplateId,
  { name: string; style: string; requiresPhoto: boolean; bestFor: string }
> = {
  "white-business": {
    name: "White Modern Business",
    style: "CORPORATE",
    requiresPhoto: false,
    bestFor: "Finance · Admin · Management",
  },
  "brown-auditor": {
    name: "Brown & White Auditor",
    style: "SIDEBAR",
    requiresPhoto: true,
    bestFor: "Finance · Audit · Consulting",
  },
  "modern-minimalist-cv": {
    name: "Modern Minimalist CV",
    style: "CREATIVE",
    requiresPhoto: true,
    bestFor: "Design · Tech · UX · Engineering",
  },
  "minimalist-modern": {
    name: "Minimalist Modern",
    style: "MINIMAL",
    requiresPhoto: true,
    bestFor: "Marketing · Comms · General",
  },
};

export function selectTemplate(role: string): TemplateId {
  const r = role.toLowerCase();
  if (
    r.includes("audit") ||
    r.includes("finance") ||
    r.includes("account") ||
    r.includes("cpa")
  )
    return "brown-auditor";
  if (
    r.includes("design") ||
    r.includes("ux") ||
    r.includes("creative") ||
    r.includes("engineer") ||
    r.includes("developer") ||
    r.includes("senior engineer") ||
    r.includes("tech lead")
  )
    return "modern-minimalist-cv";
  if (
    r.includes("admin") ||
    r.includes("manager") ||
    r.includes("corporate") ||
    r.includes("executive") ||
    r.includes("director")
  )
    return "white-business";
  return "minimalist-modern";
}
