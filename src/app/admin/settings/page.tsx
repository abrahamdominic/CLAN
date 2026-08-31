"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Field, FormActions } from "@/components/admin/admin-form-fields";
import { updateSettings } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ site_name: "", tagline: "", description: "", email: "", phone: "", address: "" });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.data) setSettings(d.data); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      site_name: fd.get("site_name"),
      tagline: fd.get("tagline"),
      description: fd.get("description"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      address: fd.get("address"),
    };
    const result = await updateSettings(data);
    setSaving(false);
    if (result.error) toast.error(result.error);
    else toast.success("Settings saved");
  }

  return (
    <>
      <AdminPageHeader title="Settings" description="Manage site-wide settings" />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
        <Field label="Site Name" name="site_name" defaultValue={settings.site_name} />
        <Field label="Tagline" name="tagline" defaultValue={settings.tagline} />
        <Field label="Description" name="description" textarea defaultValue={settings.description} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" defaultValue={settings.email} />
          <Field label="Phone" name="phone" defaultValue={settings.phone} />
        </div>
        <Field label="Address" name="address" defaultValue={settings.address} />
        <FormActions onCancel={() => {}} saving={saving} />
      </form>
    </>
  );
}
