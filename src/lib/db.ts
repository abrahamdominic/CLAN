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

/* ------------------------------ Sermons ------------------------------ */

export async function getSermons(opts?: {
  category?: string;
  speakerId?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}) {
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
  const { data } = await query;
  return (data as unknown as Sermon[]) ?? [];
}

export async function getSermonBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient()
    .from("sermons")
    .select("*, speaker:speakers(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as unknown as Sermon) ?? null;
}

/* ------------------------------- Events ------------------------------ */

export async function getEvents(opts?: { upcoming?: boolean; includePast?: boolean }) {
  if (!isSupabaseConfigured) return [];
  let query = getServerClient()
    .from("events")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: true });
  if (opts?.upcoming) {
    query = query.gte("date", new Date().toISOString());
  }
  const { data } = await query;
  return (data as unknown as Event[]) ?? [];
}

export async function getEventBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient()
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as unknown as Event) ?? null;
}

/* ---------------------- Discipleship programs ------------------------ */

export async function getPrograms() {
  if (!isSupabaseConfigured) return [];
  const { data } = await getServerClient()
    .from("discipleship_programs")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data as unknown as DiscipleshipProgram[]) ?? [];
}

/* ------------------------- Outreach projects ------------------------- */

export async function getOutreachProjects() {
  if (!isSupabaseConfigured) return [];
  const { data } = await getServerClient()
    .from("outreach_projects")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });
  return (data as unknown as OutreachProject[]) ?? [];
}

/* ------------------------------ Blog --------------------------------- */

export async function getBlogPosts(opts?: {
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}) {
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
  const { data } = await query;
  return (data as unknown as BlogPost[]) ?? [];
}

export async function getBlogPostBySlug(slug: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as unknown as BlogPost) ?? null;
}

/* ---------------------------- Testimonials ---------------------------- */

export async function getTestimonials() {
  if (!isSupabaseConfigured) return [];
  const { data } = await getServerClient()
    .from("testimonials")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  return (data as unknown as Testimonial[]) ?? [];
}

/* ------------------------- Speakers & categories ---------------------- */

export async function getSpeakers() {
  if (!isSupabaseConfigured) return [];
  const { data } = await getServerClient()
    .from("speakers")
    .select("*")
    .order("name", { ascending: true });
  return (data as unknown as Speaker[]) ?? [];
}

export async function getCategories(type?: string) {
  if (!isSupabaseConfigured) return [];
  let query = getServerClient().from("categories").select("*").order("name", {
    ascending: true,
  });
  if (type) query = query.eq("type", type);
  const { data } = await query;
  return (data as unknown as Category[]) ?? [];
}

/* ------------------------------- FAQs -------------------------------- */

export async function getFaqs() {
  if (!isSupabaseConfigured) return [];
  const { data } = await getServerClient()
    .from("faqs")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data as unknown as Faq[]) ?? [];
}

/* ------------------------------ Settings ----------------------------- */

export async function getSettings() {
  if (!isSupabaseConfigured) return {};
  const { data } = await getServerClient().from("settings").select("*").single();
  return (data as Record<string, unknown>) ?? {};
}

export async function getStats() {
  if (!isSupabaseConfigured) {
    return {
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
  }
  const sb = getServerClient();
  const [members, prayer, events, sermons, blogs, outreach, donations, contact] =
    await Promise.all([
      sb.from("membership_applications").select("*", { count: "exact", head: true }),
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
    newMembers: 0,
    prayerRequests: prayer.count ?? 0,
    upcomingEvents: events.count ?? 0,
    sermons: sermons.count ?? 0,
    blogPosts: blogs.count ?? 0,
    outreachProjects: outreach.count ?? 0,
    donationsTotal,
    contactSubmissions: contact.count ?? 0,
  };
}
