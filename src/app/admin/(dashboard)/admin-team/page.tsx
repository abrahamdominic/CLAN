"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Field, SelectField, Badge, EmptyState } from "@/components/admin/admin-form-fields";
import { inviteAdmin } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";

type TeamMember = {
  email: string;
  full_name: string | null;
  role: string;
  confirmed: boolean;
  last_sign_in_at: string | null;
};

type PendingInvite = {
  email: string;
  invited_at: string | null;
};

export default function AdminTeamPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);
  const [canInvite, setCanInvite] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team");
      const d = await res.json();
      setTeam(d.data?.team ?? []);
      setPending(d.data?.pending ?? []);
      setCanInvite(d.data?.currentUserRole === "super_admin");
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const result = await inviteAdmin(new FormData(e.currentTarget));
    setSending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.note || "Invite sent");
    e.currentTarget.reset();
    load();
  }

  function roleBadge(role: string) {
    const l = role.toLowerCase();
    if (l === "super_admin") return <Badge variant="success">Super Admin</Badge>;
    if (l === "admin") return <Badge variant="info">Admin</Badge>;
    if (l === "editor") return <Badge variant="default">Editor</Badge>;
    return <Badge>{l}</Badge>;
  }

  return (
    <>
      <AdminPageHeader title="Admin Team" description="Send invites and manage who can access the dashboard" />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">Invite a team member</h2>
            <p className="mt-1 text-xs text-navy-400">
              The invite is sent by email through Supabase. Once they set a password and
              confirm, they can sign in to the dashboard.
            </p>

            {canInvite ? (
              <form onSubmit={handleInvite} className="mt-5 space-y-4">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  required
                  placeholder="person@example.com"
                />
                <SelectField
                  label="Role"
                  name="role"
                  required
                  defaultValue="admin"
                  options={[
                    { value: "admin", label: "Admin — full access" },
                    { value: "editor", label: "Editor — content only" },
                  ]}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
                >
                  {sending ? "Sending invite..." : "Send invite"}
                </button>
              </form>
            ) : (
              <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Only a <strong>Super Admin</strong> can send invites. Please contact a
                Super Admin to add you to the team.
              </p>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              Current team <span className="text-sm font-normal text-navy-400">({team.length})</span>
            </h2>

            {loading ? (
              <p className="mt-4 text-sm text-navy-400">Loading...</p>
            ) : team.length === 0 && pending.length === 0 ? (
              <div className="mt-4">
                <EmptyState message="No team members yet." />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                      <th className="pb-2 pr-4 font-medium">Name</th>
                      <th className="pb-2 pr-4 font-medium">Email</th>
                      <th className="pb-2 pr-4 font-medium">Role</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((m) => (
                      <tr key={m.email} className="border-b border-navy-50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-navy-900">
                          {m.full_name || "—"}
                        </td>
                        <td className="py-3 pr-4 text-navy-600">{m.email}</td>
                        <td className="py-3 pr-4">{roleBadge(m.role)}</td>
                        <td className="py-3">
                          {m.confirmed ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="warning">Awaiting confirmation</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {pending.map((inv) => (
                      <tr key={inv.email} className="border-b border-navy-50 last:border-0 opacity-70">
                        <td className="py-3 pr-4 font-medium text-navy-900">—</td>
                        <td className="py-3 pr-4 text-navy-600">{inv.email}</td>
                        <td className="py-3 pr-4"><Badge variant="warning">Invited</Badge></td>
                        <td className="py-3">
                          <span className="text-xs text-navy-400">
                            {inv.invited_at
                              ? new Date(inv.invited_at).toLocaleDateString()
                              : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}