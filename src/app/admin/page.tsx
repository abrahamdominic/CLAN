import {
  Users, Heart, Calendar, BookOpen, FileText, Megaphone, DollarSign, MessageSquare,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Members", value: stats.members, icon: <Users className="h-5 w-5" /> },
    { label: "Prayer Requests", value: stats.prayerRequests, icon: <Heart className="h-5 w-5" /> },
    { label: "Upcoming Events", value: stats.upcomingEvents, icon: <Calendar className="h-5 w-5" /> },
    { label: "Sermons", value: stats.sermons, icon: <BookOpen className="h-5 w-5" /> },
    { label: "Blog Posts", value: stats.blogPosts, icon: <FileText className="h-5 w-5" /> },
    { label: "Outreach Projects", value: stats.outreachProjects, icon: <Megaphone className="h-5 w-5" /> },
    { label: "Donations Total", value: `$${stats.donationsTotal.toLocaleString()}`, icon: <DollarSign className="h-5 w-5" /> },
    { label: "Contact Messages", value: stats.contactSubmissions, icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Overview of your ministry platform" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>
    </>
  );
}
