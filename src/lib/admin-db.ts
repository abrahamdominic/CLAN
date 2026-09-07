import { getServerClient, getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  BlogPost,
  Category,
  ContactMessage,
  DiscipleshipProgram,
  Donation,
  Event,
  Faq,
  Media,
  MembershipApplication,
  NewsletterSubscriber,
  OutreachProject,
  PrayerRequest,
  Sermon,
  Speaker,
  Testimonial,
} from "@/types";

/* ========================== Sermons ========================== */

export async function adminGetSermons(page = 1, perPage = 20, search?: string) {
  let q = getServerClient()
    .from("sermons")
    .select("*, speaker:speakers(*)", { count: "exact" });
  if (search) q = q.ilike("title", `%${search}%`);
  q = q.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as Sermon[]) ?? [], count: count ?? 0 };
}

export async function adminGetSermon(id: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("sermons").select("*, speaker:speakers(*)").eq("id", id).single();
  return (data as Sermon) ?? null;
}

export async function adminUpsertSermon(sermon: Partial<Sermon>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("sermons").upsert(sermon, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Events ========================== */

export async function adminGetEvents(page = 1, perPage = 20, search?: string) {
  let q = getServerClient().from("events").select("*", { count: "exact" });
  if (search) q = q.ilike("title", `%${search}%`);
  q = q.order("date", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as Event[]) ?? [], count: count ?? 0 };
}

export async function adminGetEvent(id: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("events").select("*").eq("id", id).single();
  return (data as Event) ?? null;
}

export async function adminUpsertEvent(event: Partial<Event>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("events").upsert(event, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Blog Posts ========================== */

export async function adminGetBlogPosts(page = 1, perPage = 20, search?: string) {
  let q = getServerClient().from("blog_posts").select("*", { count: "exact" });
  if (search) q = q.ilike("title", `%${search}%`);
  q = q.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as BlogPost[]) ?? [], count: count ?? 0 };
}

export async function adminGetBlogPost(id: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("blog_posts").select("*").eq("id", id).single();
  return (data as BlogPost) ?? null;
}

export async function adminUpsertBlogPost(post: Partial<BlogPost>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("blog_posts").upsert(post, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Discipleship Programs ========================== */

export async function adminGetPrograms(page = 1, perPage = 20) {
  const q = getServerClient()
    .from("discipleship_programs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as DiscipleshipProgram[]) ?? [], count: count ?? 0 };
}

export async function adminGetProgram(id: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("discipleship_programs").select("*").eq("id", id).single();
  return (data as DiscipleshipProgram) ?? null;
}

export async function adminUpsertProgram(program: Partial<DiscipleshipProgram>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("discipleship_programs").upsert(program, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Outreach Projects ========================== */

export async function adminGetOutreach(page = 1, perPage = 20) {
  const q = getServerClient()
    .from("outreach_projects")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as OutreachProject[]) ?? [], count: count ?? 0 };
}

export async function adminGetOutreachProject(id: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("outreach_projects").select("*").eq("id", id).single();
  return (data as OutreachProject) ?? null;
}

export async function adminUpsertOutreach(project: Partial<OutreachProject>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("outreach_projects").upsert(project, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Prayer Requests ========================== */

export async function adminGetPrayerRequests(page = 1, perPage = 20, search?: string) {
  let q = getServerClient().from("prayer_requests").select("*", { count: "exact" });
  if (search) q = q.ilike("name", `%${search}%`);
  q = q.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as PrayerRequest[]) ?? [], count: count ?? 0 };
}

export async function adminMarkPrayedFor(id: string, prayedFor: boolean) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("prayer_requests").update({ prayed_for: prayedFor }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Testimonials ========================== */

export async function adminGetTestimonials(page = 1, perPage = 20) {
  const q = getServerClient()
    .from("testimonials")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as Testimonial[]) ?? [], count: count ?? 0 };
}

export async function adminApproveTestimonial(id: string, approved: boolean) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("testimonials").update({ approved }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Members ========================== */

export async function adminGetMembers(page = 1, perPage = 20, search?: string, status?: string) {
  let q = getServerClient().from("membership_applications").select("*", { count: "exact" });
  if (search) q = q.ilike("full_name", `%${search}%`);
  if (status && status !== "all") q = q.eq("status", status);
  q = q.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as MembershipApplication[]) ?? [], count: count ?? 0 };
}

export async function adminExportMembers(search?: string, status?: string) {
  let q = getServerClient().from("membership_applications").select("*").order("created_at", { ascending: false });
  if (search) q = q.ilike("full_name", `%${search}%`);
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data as MembershipApplication[]) ?? [];
}

export async function adminUpdateMemberStatus(id: string, status: string) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("membership_applications").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Contact Messages ========================== */

export async function adminGetContacts(page = 1, perPage = 20) {
  const q = getServerClient()
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as ContactMessage[]) ?? [], count: count ?? 0 };
}

export async function adminMarkContactRead(id: string, read: boolean) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("contact_messages").update({ read }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Donations ========================== */

export async function adminGetDonations(page = 1, perPage = 20) {
  const q = getServerClient()
    .from("donations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as Donation[]) ?? [], count: count ?? 0 };
}

/* ========================== FAQs ========================== */

export async function adminGetFaqs() {
  const q = getServerClient().from("faqs").select("*").order("sort_order", { ascending: true });
  const { data, error } = await q;
  if (error) throw error;
  return (data as Faq[]) ?? [];
}

export async function adminUpsertFaq(faq: Partial<Faq>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("faqs").upsert(faq, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Media ========================== */

export async function adminGetMedia(page = 1, perPage = 20) {
  const q = getServerClient()
    .from("media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as Media[]) ?? [], count: count ?? 0 };
}

export async function adminUpsertMedia(media: Partial<Media>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("media").upsert(media, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Speakers ========================== */

export async function adminGetSpeakers() {
  const q = getServerClient().from("speakers").select("*").order("name", { ascending: true });
  const { data, error } = await q;
  if (error) throw error;
  return (data as Speaker[]) ?? [];
}

export async function adminUpsertSpeaker(speaker: Partial<Speaker>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("speakers").upsert(speaker, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Categories ========================== */

export async function adminGetCategories() {
  const q = getServerClient().from("categories").select("*").order("name", { ascending: true });
  const { data, error } = await q;
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function adminUpsertCategory(cat: Partial<Category>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("categories").upsert(cat, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Newsletter ========================== */

export async function adminGetNewsletterSubscribers(
  page = 1,
  perPage = 20,
  opts?: { search?: string; status?: "active" | "inactive" | "all" }
) {
  let q = getServerClient()
    .from("newsletter_subscribers")
    .select("*", { count: "exact" });
  if (opts?.search) {
    q = q.or(`email.ilike.%${opts.search}%,name.ilike.%${opts.search}%`);
  }
  if (opts?.status === "active") q = q.eq("active", true);
  if (opts?.status === "inactive") q = q.eq("active", false);
  q = q.order("created_at", { ascending: false }).range((page - 1) * perPage, page * perPage - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: (data as NewsletterSubscriber[]) ?? [], count: count ?? 0 };
}

export async function adminExportNewsletterSubscribers(opts?: {
  search?: string;
  status?: "active" | "inactive" | "all";
}) {
  let q = getServerClient()
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (opts?.search) {
    q = q.or(`email.ilike.%${opts.search}%,name.ilike.%${opts.search}%`);
  }
  if (opts?.status === "active") q = q.eq("active", true);
  if (opts?.status === "inactive") q = q.eq("active", false);
  const { data, error } = await q;
  if (error) throw error;
  return (data as NewsletterSubscriber[]) ?? [];
}

export async function adminResendConfirmation(id: string) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const sb = getServerClient();
  const { data, error } = await sb
    .from("newsletter_subscribers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Subscriber not found." };

  const sub = data as NewsletterSubscriber;
  if (sub.active && sub.confirmed_at) {
    return { error: "This subscriber is already confirmed." };
  }

  const { generateConfirmationToken } = await import("@/components/footer-actions");
  const token = await generateConfirmationToken();
  const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const { error: updateErr } = await sb
    .from("newsletter_subscribers")
    .update({
      confirmation_token: token,
      confirmation_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateErr) return { error: updateErr.message };

  const { sendWelcomeEmail } = await import("@/lib/email");
  const name = (sub.name || "").trim();
  const emailResult = await sendWelcomeEmail(sub.email, name.split(" ")[0] || "Friend", token);

  return { success: true, emailSent: emailResult.ok };
}

/* ========================== Settings ========================== */

export async function adminGetSettings() {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("settings").select("*").eq("id", 1).single();
  return data as Record<string, unknown> | null;
}

export async function adminUpdateSettings(settings: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { error: "Database not configured" };
  const { error } = await getServerClient().from("settings").upsert({ id: 1, ...settings }, { onConflict: "id" });
  if (error) return { error: error.message };
  return { success: true };
}

/* ========================== Profile ========================== */

export async function adminGetProfile(userId: string) {
  if (!isSupabaseConfigured) return null;
  const { data } = await getServerClient().from("profiles").select("*").eq("user_id", userId).single();
  return data as { role: string; full_name: string | null } | null;
}

/**
 * Super-admin gate for destructive admin operations. Reads the authenticated
 * session from cookies and checks the profile role.
 * Returns true when the current user is allowed; false otherwise.
 */
export async function currentUserIsSuperAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const profile = await adminGetProfile(user.id);
    return profile?.role === "super_admin";
  } catch {
    return false;
  }
}

/* ========================== Admin team ========================== */

type AuthUserInfo = {
  id: string;
  email: string | null;
  email_confirmed_at?: string | null;
  invited_at?: string | null;
  last_sign_in_at?: string | null;
};

export type AdminTeamMember = {
  email: string;
  full_name: string | null;
  role: string;
  confirmed: boolean;
  last_sign_in_at: string | null;
};

export type PendingInvite = {
  email: string;
  invited_at: string | null;
};

export type AdminTeam = {
  team: AdminTeamMember[];
  pending: PendingInvite[];
  currentUserRole: string | null;
};

export async function adminGetTeam(): Promise<AdminTeam | null> {
  if (!isSupabaseConfigured) return null;
  const sb = getServerClient();
  const [staffResult, usersResult] = await Promise.all([
    sb
      .from("profiles")
      .select("user_id,email,full_name,role")
      .in("role", ["super_admin", "admin", "editor"])
      .order("created_at", { ascending: true }),
    sb.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const authUsers = (usersResult.data?.users ?? []) as AuthUserInfo[];
  const authMap = new Map(authUsers.map((u) => [u.id, u]));

  const team: AdminTeamMember[] = (staffResult.data ?? []).map((p) => {
    const auth = authMap.get(p.user_id);
    return {
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      confirmed: Boolean(auth?.email_confirmed_at),
      last_sign_in_at: auth?.last_sign_in_at ?? null,
    };
  });

  const pending: PendingInvite[] = authUsers
    .filter((u) => u.invited_at && !u.email_confirmed_at)
    .map((u) => ({ email: u.email ?? "", invited_at: u.invited_at ?? null }))
    .sort((a, b) => (a.invited_at ?? "").localeCompare(b.invited_at ?? ""));

  let currentUserRole: string | null = null;
  try {
    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await sb
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .limit(1);
      currentUserRole = data?.[0]?.role ?? null;
    }
  } catch {
    currentUserRole = null;
  }

  return { team, pending, currentUserRole };
}
