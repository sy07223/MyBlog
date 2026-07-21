import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface Post {
  slug: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at?: string;
  excerpt?: string;
  reading_minutes?: number;
}

export interface PostListItem {
  slug: string;
  title: string;
  tags: string[];
  created_at: string;
  excerpt: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function excerptFromMarkdown(md: string, max = 160): string {
  if (!md || typeof md !== "string") return "";
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`#>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function normalizeTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
}

function parsePostFile(filePath: string): Post | null {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContent);
    const slug = path.basename(filePath, path.extname(filePath));

    return {
      slug: String(data.slug || slug),
      title: String(data.title || "未命名"),
      content,
      tags: normalizeTags(data.tags),
      published: data.published !== false && data.published !== 0,
      created_at: data.created_at
        ? new Date(data.created_at).toISOString()
        : new Date().toISOString(),
      updated_at: data.updated_at
        ? new Date(data.updated_at).toISOString()
        : undefined,
      excerpt: excerptFromMarkdown(content),
      reading_minutes: Math.max(1, Math.ceil(readingTime(content).minutes)),
    };
  } catch {
    return null;
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR);
  const posts = files
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => parsePostFile(path.join(POSTS_DIR, f)))
    .filter((p): p is Post => p !== null)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  return posts;
}

export function getPublishedPosts(): Post[] {
  return getAllPosts().filter((p) => p.published);
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function getAllTags(scope?: "essay" | "post"): string[] {
  const posts = getPublishedPosts();
  const set = new Set<string>();
  for (const p of posts) {
    const isEssay = p.tags.includes("随笔");
    if (scope === "essay" && !isEssay) continue;
    if (scope === "post" && isEssay) continue;
    for (const t of p.tags) {
      if (t !== "随笔") set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function filterPosts(
  posts: Post[],
  options: {
    page?: number;
    limit?: number;
    q?: string;
    tags?: string[];
    essay?: boolean;
  } = {}
): { items: Post[]; total: number; page: number; pages: number } {
  const { page = 1, limit = 8, q = "", tags = [], essay = false } = options;

  let filtered = posts.filter((p) => p.published);

  // 随笔筛选
  if (essay) {
    filtered = filtered.filter((p) => p.tags.includes("随笔"));
  } else {
    filtered = filtered.filter((p) => !p.tags.includes("随笔"));
  }

  // 搜索
  if (q) {
    const lowerQ = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQ) ||
        p.content.toLowerCase().includes(lowerQ)
    );
  }

  // 标签筛选
  for (const tag of tags) {
    if (tag && tag !== "随笔") {
      filtered = filtered.filter((p) => p.tags.includes(tag));
    }
  }

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), pages);
  const start = (currentPage - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page: currentPage, pages };
}
