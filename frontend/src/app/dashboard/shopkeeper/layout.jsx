'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { shopkeeperAPI } from '@/lib/api';
import DashboardShell from '@/components/DashboardShell';
import { ShopkeeperDataContext } from './data-context';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'khaate', label: 'Khaate' },
  { id: 'shop', label: 'Shop profile' },
];

export default function ShopkeeperLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const [shoppingLists, setShoppingLists] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [me, setMe] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchShoppingLists = useCallback(
    () =>
      shopkeeperAPI
        .getShoppingLists()
        .then((r) => setShoppingLists(r.data))
        .catch(console.error),
    []
  );

  const fetchCustomers = useCallback(
    () =>
      shopkeeperAPI
        .getCustomers()
        .then((r) => setCustomers(r.data))
        .catch(console.error),
    []
  );

  const fetchLedger = useCallback(
    () =>
      shopkeeperAPI
        .getLedger()
        .then((r) => setLedger(r.data))
        .catch(console.error),
    []
  );

  const fetchMe = useCallback(
    () =>
      shopkeeperAPI
        .getMe()
        .then((r) => setMe(r.data))
        .catch(console.error),
    []
  );

  const fetchAll = useCallback(
    () =>
      Promise.all([
        fetchShoppingLists(),
        fetchCustomers(),
        fetchLedger(),
        fetchMe(),
      ]),
    [fetchShoppingLists, fetchCustomers, fetchLedger, fetchMe]
  );

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user && user.userType !== 'shopkeeper')
      router.push('/dashboard/buyer');
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

  const activeView =
    TABS.find((t) => pathname?.endsWith(`/${t.id}`))?.id || 'orders';

  const pendingOrders = shoppingLists.filter((l) => l.status === 'shared')
    .length;
  const owedTotal = ledger.reduce(
    (s, r) => s + (r.balance > 0 ? r.balance : 0),
    0
  );

  const navItems = TABS.map((t) => ({
    id: t.id,
    label: t.label,
    icon: ICONS[t.id],
    badge:
      t.id === 'orders'
        ? pendingOrders || null
        : t.id === 'customers'
        ? customers.length || null
        : t.id === 'khaate'
        ? owedTotal > 0
          ? `₹${Math.round(owedTotal)}`
          : null
        : null,
  }));

  return (
    <ShopkeeperDataContext.Provider
      value={{
        shoppingLists,
        customers,
        ledger,
        me,
        dataLoading,
        fetchShoppingLists,
        fetchCustomers,
        fetchLedger,
        fetchMe,
        fetchAll,
      }}
    >
      <DashboardShell
        roleLabel="Shopkeeper"
        userName={me?.shopName || user.name}
        userSubtitle={user.email}
        navItems={navItems}
        activeView={activeView}
        onSelectView={(id) => router.push(`/dashboard/shopkeeper/${id}`)}
        onLogout={logout}
      >
        {children}
      </DashboardShell>
    </ShopkeeperDataContext.Provider>
  );
}

/* ============================== Icons ============================== */

const ICONS = {
  orders: <IconInbox />,
  customers: <IconPeople />,
  khaate: <IconRupee />,
  shop: <IconShop />,
};

function IconInbox() {
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
        d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      />
    </svg>
  );
}
function IconPeople() {
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
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
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
