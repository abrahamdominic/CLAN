import type { MetadataRoute } from "next";
import { getSermons, getEvents, getBlogPosts } from "@/lib/db";
import { SAMPLE_BLOG, SAMPLE_EVENTS, SAMPLE_SERMONS } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clanministry.org";
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/what-we-do",
    "/discipleship",
    "/sermons",
    "/events",
    "/resources",
    "/testimonies",
    "/outreach",
    "/purpose",
    "/join",
    "/prayer",
    "/give",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const [sermons, events, posts] = await Promise.all([
    getSermons(),
    getEvents(),
    getBlogPosts(),
  ]);
  const sermonList = sermons.length ? sermons : SAMPLE_SERMONS;
  const eventList = events.length ? events : SAMPLE_EVENTS;
  const postList = posts.length ? posts : SAMPLE_BLOG;

  const sermonRoutes = sermonList.map((s) => ({
    url: `${baseUrl}/sermons/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const eventRoutes = eventList.map((e) => ({
    url: `${baseUrl}/events/${e.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const postRoutes = postList.map((p) => ({
    url: `${baseUrl}/resources/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...sermonRoutes, ...eventRoutes, ...postRoutes];
}
