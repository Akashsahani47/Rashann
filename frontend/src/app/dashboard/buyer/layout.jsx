'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { buyerAPI } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';
import { BuyerDataContext } from './data-context';

const TABS = [
  { id: 'lists', label: 'My lists' },
  { id: 'khata', label: 'Khata' },
  { id: 'shopkeepers', label: 'Shopkeepers' },
  { id: 'profile', label: 'Profile' },
];

export default function BuyerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const [shoppingLists, setShoppingLists] = useState([]);
  const [shopkeepers, setShopkeepers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchShoppingLists = useCallback(
    () =>
      buyerAPI
        .getShoppingLists()
        .then((r) => setShoppingLists(r.data))
        .catch(console.error),
    []
  );

  const fetchShopkeepers = useCallback(
    () =>
      buyerAPI
        .getShopkeepers()
        .then((r) => setShopkeepers(r.data))
        .catch(console.error),
    []
  );

  const fetchLedger = useCallback(
    () =>
      buyerAPI
        .getLedger()
        .then((r) => setLedger(r.data))
        .catch(console.error),
    []
  );

  const fetchAll = useCallback(
    () =>
      Promise.all([fetchShoppingLists(), fetchShopkeepers(), fetchLedger()]),
    [fetchShoppingLists, fetchShopkeepers, fetchLedger]
  );

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user && user.userType !== 'buyer')
      router.push('/dashboard/shopkeeper');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchAll().finally(() => {
      if (!cancelled) setDataLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }
  if (!user) return null;

  // Derive active tab from URL (last segment)
  const activeView =
    TABS.find((t) => pathname?.endsWith(`/${t.id}`))?.id || 'lists';

  const owedCount = ledger.filter((l) => l.balance > 0).length;

  const navItems = TABS.map((t) => ({
    id: t.id,
    label: t.label,
    icon: ICONS[t.id],
    badge:
      t.id === 'lists'
        ? shoppingLists.length || null
        : t.id === 'khata'
        ? owedCount || null
        : null,
  }));

  return (
    <BuyerDataContext.Provider
      value={{
        shoppingLists,
        shopkeepers,
        ledger,
        dataLoading,
        fetchShoppingLists,
        fetchShopkeepers,
        fetchLedger,
        fetchAll,
      }}
    >
      <DashboardShell
        roleLabel="Customer"
        userName={user.name}
        userSubtitle={user.email}
        navItems={navItems}
        activeView={activeView}
        onSelectView={(id) => router.push(`/dashboard/buyer/${id}`)}
        onLogout={logout}
      >
        {children}
      </DashboardShell>
    </BuyerDataContext.Provider>
  );
}

/* ============================== Icons ============================== */

const ICONS = {
  lists: <IconList />,
  khata: <IconRupee />,
  shopkeepers: <IconShop />,
  profile: <IconUser />,
};

function IconList() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01"
      />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 4h12M6 9h12M9 4c3.5 0 5.5 2 5.5 4.5S12.5 13 9 13H7l8 7"
      />
    </svg>
  );
}
function IconShop() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9l1.2-5h15.6L21 9M4 9v11h16V9M9 20v-6h6v6"
      />
    </svg>
  );
}
function IconUser() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
