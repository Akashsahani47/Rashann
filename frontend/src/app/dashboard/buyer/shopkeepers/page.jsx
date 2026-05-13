'use client';

import { ViewHeader } from '@/components/DashboardShell';
import { useBuyerData } from '../data-context';

export default function ShopkeepersPage() {
  const { shopkeepers } = useBuyerData();

  return (
    <>
      <ViewHeader eyebrow="Discover" title="Kiranas you can share with" />
      {shopkeepers.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No shopkeepers registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shopkeepers.map((sk) => (
            <div
              key={sk._id}
              className="bg-white border border-stone-200 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{sk.shopName}</h3>
                  <p className="text-xs text-zinc-500">
                    {sk.name} · {sk.phone}
                  </p>
                </div>
                {sk.rating?.count > 0 && (
                  <span className="text-sm">
                    ⭐ {sk.rating.avg.toFixed(1)}
                  </span>
                )}
              </div>
              {sk.shopAddress && (
                <p className="text-sm text-zinc-600 mt-2">
                  {sk.shopAddress.line1}
                  {sk.shopAddress.city ? `, ${sk.shopAddress.city}` : ''}
                  {sk.shopAddress.pincode
                    ? ` · ${sk.shopAddress.pincode}`
                    : ''}
                </p>
              )}
              {sk.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sk.categories.slice(0, 5).map((c) => (
                    <span
                      key={c}
                      className="text-[10px] uppercase tracking-widest bg-stone-100 text-zinc-600 px-2 py-1 rounded-full"
                    >
                      {c.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-3 text-xs text-zinc-500">
                {sk.deliveryAvailable && (
                  <span>🚲 Delivers {sk.deliveryRadiusKm || ''}km</span>
                )}
                {sk.upiVpa && <span>💳 UPI</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
