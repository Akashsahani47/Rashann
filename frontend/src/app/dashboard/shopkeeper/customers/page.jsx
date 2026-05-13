'use client';

import { useRouter } from 'next/navigation';
import { ViewHeader } from '@/components/DashboardShell';
import { useShopkeeperData } from '../data-context';

export default function CustomersPage() {
  const router = useRouter();
  const { customers } = useShopkeeperData();

  const handleSelect = (id) =>
    router.push(`/dashboard/shopkeeper/orders?customer=${id}`);

  return (
    <>
      <ViewHeader
        eyebrow="Customers"
        title={`${customers.length} customer${customers.length === 1 ? '' : 's'}`}
      />
      {customers.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No customers yet. They appear here after sharing a list with you.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customers.map((c) => (
            <button
              key={c._id}
              onClick={() => handleSelect(c._id)}
              className="text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-stone-300"
            >
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{c.phone}</p>
              <p className="text-xs text-zinc-400 mt-2">{c.email}</p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
