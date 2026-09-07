import { unstable_cache } from "next/cache";
import { getServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  BlogPost,
  Category,
  DiscipleshipProgram,
  Donation,
  Event,
  Faq,
  OutreachProject,
  Sermon,
  Speaker,
  Testimonial,
} from "@/types";

// Public content gets cached (30s) and is invalidated by the admin CMS through
// revalidateTag("content-*"). This keeps the site fast under heavy traffic
// while ensuring new/edited content appears quickly after publishing.

/* ------------------------------ Sermons ------------------------------ */

interface SermonOpts {
  category?: string;
  speakerId?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}

async function fetchSermons(opts?: SermonOpts) {
  if (!isSupabaseConfigured) return [];
  let query = getServerClient()
    .from("sermons")
    .select("*, speaker:speakers(*)", { count: "exact" })
    .eq("published", true)
    .order("date", { ascending: false });
  if (opts?.category) query = query.eq("category", opts.category);
  if (opts?.speakerId) query = query.eq("speaker_id", opts.speakerId);
  if (opts?.featured) query = query.eq("featured", true);
  if (opts?.search) query = query.ilike("title", `%${opts.search}%`);
  if (opts?.page && opts?.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  }
  try {
    const { data } = await query;
    return (data as unknown as Sermon[]) ?? [];
  } catch {
    return [];
  }
}

async function fetchSermonBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await getServerClient()
      .from("sermons")
      .select("*, speaker:speakers(*)")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    return (data as unknown as Sermon) ?? null;
  } catch {
    return null;
  }
}

export const getSermons = unstable_cache(fetchSermons, ["content-sermons"], {
  revalidate: 30,
  tags: ["content-sermons"],
});

export const getSermonBySlug = unstable_cache(fetchSermonBySlug, ["content-sermons"], {
  revalidate: 30,
  tags: ["content-sermons"],
});

/* ------------------------------- Events ------------------------------ */

interface EventOpts {
  upcoming?: boolean;
  includePast?: boolean;
}

async function fetchEvents(opts?: EventOpts) {
  if (!isSupabaseConfigured) return [];
  let query = getServerClient()
    .from("events")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: true });
  if (opts?.upcoming) {
    query = query.gte("date", new Date().toISOString());
  }
  try {
    const { data } = await query;
    return (data as unknown as Event[]) ?? [];
  } catch {
    return [];
  }
}

async function fetchEventBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await getServerClient()
      .from("events")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    return (data as unknown as Event) ?? null;
  } catch {
    return null;
  }
}

export const getEvents = unstable_cache(fetchEvents, ["content-events"], {
  revalidate: 30,
  tags: ["content-events"],
});

export const getEventBySlug = unstable_cache(fetchEventBySlug, ["content-events"], {
  revalidate: 30,
  tags: ["content-events"],
});

/* ---------------------- Discipleship programs ------------------------ */

async function fetchPrograms() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await getServerClient()
      .from("discipleship_programs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    return (data as unknown as DiscipleshipProgram[]) ?? [];
  } catch {
    return [];
  }
}

export const getPrograms = unstable_cache(fetchPrograms, ["content-programs"], {
  revalidate: 30,
  tags: ["content-programs"],
});

/* ------------------------- Outreach projects ------------------------- */

async function fetchOutreachProjects() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await getServerClient()
      .from("outreach_projects")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false });
    return (data as unknown as OutreachProject[]) ?? [];
  } catch {
    return [];
  }
}

export const getOutreachProjects = unstable_cache(fetchOutreachProjects, ["content-outreach"], {
  revalidate: 30,
  tags: ["content-outreach"],
});

/* ------------------------------ Blog --------------------------------- */

interface BlogOpts {
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

async function fetchBlogPosts(opts?: BlogOpts) {
  if (!isSupabaseConfigured) return [];
  let query = getServerClient()
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_date", { ascending: false });
  if (opts?.category) {
    query = query.eq("category", opts.category);
  }
  if (opts?.search) {
    query = query.ilike("title", `%${opts.search}%`);
  }
  if (opts?.page && opts?.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  }
  try {
    const { data } = await query;
    return (data as unknown as BlogPost[]) ?? [];
  } catch {
    return [];
  }
}

async function fetchBlogPostBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await getServerClient()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();
    return (data as unknown as BlogPost) ?? null;
  } catch {
    return null;
  }
}

export const getBlogPosts = unstable_cache(fetchBlogPosts, ["content-blog"], {
  revalidate: 30,
  tags: ["content-blog"],
});

export const getBlogPostBySlug = unstable_cache(fetchBlogPostBySlug, ["content-blog"], {
  revalidate: 30,
  tags: ["content-blog"],
});

/* ---------------------------- Testimonials ---------------------------- */

async function fetchTestimonials() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await getServerClient()
      .from("testimonials")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    return (data as unknown as Testimonial[]) ?? [];
  } catch {
    return [];
  }
}

export const getTestimonials = unstable_cache(fetchTestimonials, ["content-testimonials"], {
  revalidate: 30,
  tags: ["content-testimonials"],
});

/* ------------------------- Speakers & categories ---------------------- */

async function fetchSpeakers() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await getServerClient()
      .from("speakers")
      .select("*")
      .order("name", { ascending: true });
    return (data as unknown as Speaker[]) ?? [];
  } catch {
    return [];
  }
}

async function fetchCategories(type?: string) {
  if (!isSupabaseConfigured) return [];
  let query = getServerClient().from("categories").select("*").order("name", {
    ascending: true,
  });
  if (type) query = query.eq("type", type);
  try {
    const { data } = await query;
    return (data as unknown as Category[]) ?? [];
  } catch {
    return [];
  }
}

export const getSpeakers = unstable_cache(fetchSpeakers, ["content-speakers"], {
  revalidate: 30,
  tags: ["content-speakers"],
});

export const getCategories = unstable_cache(fetchCategories, ["content-categories"], {
  revalidate: 30,
  tags: ["content-categories"],
});

/* ------------------------------- FAQs -------------------------------- */

async function fetchFaqs() {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await getServerClient()
      .from("faqs")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    return (data as unknown as Faq[]) ?? [];
  } catch {
    return [];
  }
}

export const getFaqs = unstable_cache(fetchFaqs, ["content-faqs"], {
  revalidate: 30,
  tags: ["content-faqs"],
});

/* ------------------------------ Settings ----------------------------- */

async function fetchSettings() {
  if (!isSupabaseConfigured) return {};
  try {
    const { data } = await getServerClient().from("settings").select("*").single();
    return (data as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

export const getSettings = unstable_cache(fetchSettings, ["content-settings"], {
  revalidate: 60,
  tags: ["content-settings"],
});

/* ------------------------------ Stats -------------------------------- */

async function fetchStats() {
  const fallback = {
    members: 0,
    newMembers: 0,
    prayerRequests: 0,
    upcomingEvents: 0,
    sermons: 0,
    blogPosts: 0,
    outreachProjects: 0,
    donationsTotal: 0,
    contactSubmissions: 0,
  };
  if (!isSupabaseConfigured) {
    return fallback;
  }
  try {
    const sb = getServerClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [members, newMembers, prayer, events, sermons, blogs, outreach, donations, contact] =
      await Promise.all([
        sb.from("membership_applications").select("*", { count: "exact", head: true }),
        sb
          .from("membership_applications")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo),
        sb.from("prayer_requests").select("*", { count: "exact", head: true }),
        sb.from("events").select("*", { count: "exact", head: true }).gte("date", new Date().toISOString()),
        sb.from("sermons").select("*", { count: "exact", head: true }),
        sb.from("blog_posts").select("*", { count: "exact", head: true }),
        sb.from("outreach_projects").select("*", { count: "exact", head: true }),
        sb.from("donations").select("amount"),
        sb.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);
    const donationsTotal = (donations.data ?? []).reduce(
      (sum, d) => sum + (Number((d as Donation).amount) || 0),
      0
    );
    return {
      members: members.count ?? 0,
      newMembers: newMembers.count ?? 0,
      prayerRequests: prayer.count ?? 0,
      upcomingEvents: events.count ?? 0,
      sermons: sermons.count ?? 0,
      blogPosts: blogs.count ?? 0,
      outreachProjects: outreach.count ?? 0,
      donationsTotal,
      contactSubmissions: contact.count ?? 0,
    };
  } catch {
    return fallback;
  }
}

export const getStats = unstable_cache(fetchStats, ["admin-stats"], {
  revalidate: 30,
  tags: ["admin-stats"],
});