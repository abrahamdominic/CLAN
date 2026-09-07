"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Field, FormActions } from "@/components/admin/admin-form-fields";
import { updateSettings } from "@/components/admin/admin-actions";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{
    site_name: string;
    tagline: string;
    description: string;
    email: string;
    phone: string;
    address: string;
    maintenance_mode: boolean;
  }>({
    site_name: "",
    tagline: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    maintenance_mode: false,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setSettings((prev) => ({ ...prev, ...d.data }));
      })
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
      maintenance_mode: settings.maintenance_mode,
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

        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div>
            <p className="text-sm font-semibold text-amber-900">Maintenance Mode</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Takes the public site offline and shows the maintenance page. The admin
              dashboard and payment webhooks keep working.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, maintenance_mode: e.target.checked }))
              }
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-navy-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-gold-500 peer-checked:after:translate-x-5" />
          </label>
        </div>

        <FormActions onCancel={() => {}} saving={saving} />
      </form>
    </>
  );
}