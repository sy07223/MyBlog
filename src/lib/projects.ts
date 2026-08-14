import { SITE_PROJECTS } from "@/config/site";

export interface Project {
  id?: number;
  name: string;
  slug?: string;
  description: string;
  role?: string;
  status?: string;
  href?: string;
  demo_url?: string;
  cover_url?: string;
  tags: string[];
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
}

const FALLBACK_PROJECTS: Project[] = SITE_PROJECTS.map((project, index) => ({
  ...project,
  slug: project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  featured: index < 2,
  published: true,
  sort_order: (index + 1) * 10,
}));

function apiBaseUrl() {
  if (process.env.BLOG_API_URL) {
    return process.env.BLOG_API_URL.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001/api";
  }
  return "";
}

export async function getProjects(): Promise<Project[]> {
  const baseUrl = apiBaseUrl();
  if (!baseUrl) return FALLBACK_PROJECTS;

  try {
    const response = await fetch(`${baseUrl}/projects`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return FALLBACK_PROJECTS;
    const data = (await response.json()) as { items?: Project[] };
    if (!Array.isArray(data.items)) return FALLBACK_PROJECTS;
    return data.items;
  } catch {
    return FALLBACK_PROJECTS;
  }
}
