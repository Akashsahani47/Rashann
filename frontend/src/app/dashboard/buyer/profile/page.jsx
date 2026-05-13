'use client';

import { useAuth } from '@/hooks/useAuth';
import { ViewHeader } from '@/components/DashboardShell';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <ViewHeader eyebrow="Profile" title="Your details" />
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 max-w-lg">
        <Detail label="Name" value={user.name} />
        <Detail label="Email" value={user.email} />
        <Detail label="Phone" value={user.phone} />
        <Detail label="Role" value="Customer" />
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Editing not enabled yet — coming soon.
      </p>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
