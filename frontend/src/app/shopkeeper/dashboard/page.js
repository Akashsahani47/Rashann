'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { shopkeeperAPI } from '@/lib/api';
import DashboardShell, { ViewHeader } from '@/components/DashboardShell';

const CATEGORY_OPTIONS = [
  'grains',
  'pulses',
  'spices',
  'oils',
  'dairy',
  'vegetables',
  'fruits',
  'snacks',
  'beverages',
  'personal_care',
  'household',
];

export default function ShopkeeperDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [view, setView] = useState('orders');
  const [shoppingLists, setShoppingLists] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [me, setMe] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [completingList, setCompletingList] = useState(null);
  const [actualPrice, setActualPrice] = useState('');

  const fetchData = () =>
    Promise.all([shopkeeperAPI.getShoppingLists(), shopkeeperAPI.getCustomers()])
      .then(([listsRes, customersRes]) => {
        setShoppingLists(listsRes.data);
        setCustomers(customersRes.data);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));

  const fetchLedger = () =>
    shopkeeperAPI
      .getLedger()
      .then((r) => setLedger(r.data))
      .catch(console.error);

  const fetchMe = () =>
    shopkeeperAPI
      .getMe()
      .then((r) => setMe(r.data))
      .catch(console.error);

  const fetchAll = () => Promise.all([fetchData(), fetchLedger(), fetchMe()]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user && user.userType !== 'shopkeeper')
      router.push('/buyer/dashboard');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      shopkeeperAPI.getShoppingLists(),
      shopkeeperAPI.getCustomers(),
      shopkeeperAPI.getLedger(),
      shopkeeperAPI.getMe(),
    ])
      .then(([listsRes, customersRes, ledgerRes, meRes]) => {
        if (cancelled) return;
        setShoppingLists(listsRes.data);
        setCustomers(customersRes.data);
        setLedger(ledgerRes.data);
        setMe(meRes.data);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCompleteList = (listId) => {
    const list = shoppingLists.find((l) => l._id === listId);
    setCompletingList(list);
    setActualPrice(String(list?.totalEstimatedPrice || ''));
  };
  const confirmComplete = async () => {
    try {
      await shopkeeperAPI.markAsCompleted(
        completingList._id,
        Number(actualPrice)
      );
      setCompletingList(null);
      setActualPrice('');
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  if (!user) return null;

  const pendingOrders = shoppingLists.length;
  const owedTotal = ledger.reduce(
    (s, r) => s + (r.balance > 0 ? r.balance : 0),
    0
  );

  const navItems = [
    {
      id: 'orders',
      label: 'Orders',
      icon: <IconInbox />,
      badge: pendingOrders || null,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <IconPeople />,
      badge: customers.length || null,
    },
    {
      id: 'khaate',
      label: 'Khaate',
      icon: <IconRupee />,
      badge: owedTotal > 0 ? `₹${Math.round(owedTotal)}` : null,
    },
    {
      id: 'shop',
      label: 'Shop profile',
      icon: <IconShop />,
    },
  ];

  return (
    <DashboardShell
      roleLabel="Shopkeeper"
      userName={me?.shopName || user.name}
      userSubtitle={user.email}
      navItems={navItems}
      activeView={view}
      onSelectView={setView}
      onLogout={logout}
    >
      {view === 'orders' && (
        <OrdersView
          shoppingLists={shoppingLists}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          dataLoading={dataLoading}
          onComplete={handleCompleteList}
        />
      )}
      {view === 'customers' && (
        <CustomersView
          customers={customers}
          onSelect={(id) => {
            setSelectedCustomer(id);
            setView('orders');
          }}
        />
      )}
      {view === 'khaate' && (
        <KhaateView
          ledger={ledger}
          owedTotal={owedTotal}
          onPaymentRecorded={() => Promise.all([fetchLedger(), fetchData()])}
        />
      )}
      {view === 'shop' &&
        (me ? (
          <ShopProfileView key={me._id} me={me} onSaved={fetchMe} />
        ) : (
          <>
            <ViewHeader eyebrow="Shop profile" title="Your dukaan" />
            <div className="text-zinc-500">Loading...</div>
          </>
        ))}

      {completingList && (
        <CompleteModal
          list={completingList}
          actualPrice={actualPrice}
          setActualPrice={setActualPrice}
          onConfirm={confirmComplete}
          onCancel={() => {
            setCompletingList(null);
            setActualPrice('');
          }}
        />
      )}
    </DashboardShell>
  );
}

/* ============================== Views ============================== */

function OrdersView({
  shoppingLists,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  dataLoading,
  onComplete,
}) {
  const [statusFilter, setStatusFilter] = useState('shared');

  const pendingCount = shoppingLists.filter((l) => l.status === 'shared').length;
  const completedCount = shoppingLists.filter((l) => l.status === 'completed').length;

  const filtered = shoppingLists
    .filter((l) => statusFilter === 'all' || l.status === statusFilter)
    .filter((l) => !selectedCustomer || l.buyerId?._id === selectedCustomer);

  const statusPills = [
    { id: 'shared', label: 'Pending', count: pendingCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'all', label: 'All', count: shoppingLists.length },
  ];

  return (
    <>
      <ViewHeader
        eyebrow="Incoming"
        title="Orders from customers"
        action={
          (selectedCustomer || statusFilter !== 'shared') && (
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setStatusFilter('shared');
              }}
              className="text-xs text-zinc-600 hover:text-emerald-900"
            >
              Reset filters ×
            </button>
          )
        }
      />

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusPills.map((p) => {
          const active = statusFilter === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setStatusFilter(p.id)}
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-emerald-900 text-stone-50 border-emerald-900'
                  : 'bg-white border-stone-200 text-zinc-700 hover:border-stone-300'
              }`}
            >
              {p.label}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-emerald-800 text-stone-50' : 'bg-stone-100 text-zinc-600'
                }`}
              >
                {p.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customer filter chips */}
      {customers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {customers.map((c) => {
            const active = selectedCustomer === c._id;
            return (
              <button
                key={c._id}
                onClick={() => setSelectedCustomer(active ? null : c._id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-zinc-900 text-stone-50 border-zinc-900'
                    : 'bg-white border-stone-200 text-zinc-700 hover:border-stone-300'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {dataLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          {statusFilter === 'shared'
            ? 'No pending orders right now.'
            : statusFilter === 'completed'
            ? 'No completed orders yet.'
            : 'No orders received yet.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((list) => (
            <OrderCard key={list._id} list={list} onComplete={onComplete} />
          ))}
        </div>
      )}
    </>
  );
}

function OrderCard({ list, onComplete }) {
  const completed = list.status === 'completed';
  const stamp = completed ? list.completedAt : list.sharedAt;
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{list.title}</h3>
          <p className="text-xs text-zinc-500">
            From {list.buyerId?.name} · {list.buyerId?.phone}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {completed ? 'Completed' : 'Shared'} · {formatStamp(stamp)} ·{' '}
            {list.items?.length || 0} items
          </p>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-1 rounded-full ${
            completed
              ? 'bg-stone-100 text-stone-700'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {list.status}
        </span>
      </div>

      <div className="space-y-1 mb-3">
        {list.items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm bg-stone-50 px-3 py-1.5 rounded-lg"
          >
            <span>
              {item.itemName} — {item.quantity} {item.unit}
              {item.category ? ` · ${item.category}` : ''}
            </span>
            {item.estimatedPrice ? (
              <span className="text-zinc-500">est. ₹{item.estimatedPrice}</span>
            ) : null}
          </div>
        ))}
      </div>

      {list.totalEstimatedPrice ? (
        <p className="text-sm text-zinc-600 mb-3">
          Customer&apos;s estimate: ₹
          {list.totalEstimatedPrice.toLocaleString('en-IN')}
        </p>
      ) : null}

      {!completed && (
        <button
          onClick={() => onComplete(list._id)}
          className="bg-emerald-900 text-stone-50 px-4 py-2 rounded-full text-sm hover:bg-emerald-800"
        >
          Mark complete & set bill
        </button>
      )}
    </div>
  );
}

function formatStamp(d) {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffH = diffMs / 36e5;
  if (diffH < 1) return `${Math.max(1, Math.round(diffMs / 6e4))}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  const days = Math.floor(diffH / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric',
  });
}

function CustomersView({ customers, onSelect }) {
  return (
    <>
      <ViewHeader eyebrow="Customers" title={`${customers.length} customer${customers.length === 1 ? '' : 's'}`} />
      {customers.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No customers yet. They appear here after sharing a list with you.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customers.map((c) => (
            <button
              key={c._id}
              onClick={() => onSelect(c._id)}
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

function KhaateView({ ledger, owedTotal, onPaymentRecorded }) {
  const [paymentTarget, setPaymentTarget] = useState(null); // ledger row

  if (ledger.length === 0) {
    return (
      <>
        <ViewHeader eyebrow="Khaate" title="Customer balances" />
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No khata yet. Balances appear when you mark an order complete.
        </div>
      </>
    );
  }
  return (
    <>
      <ViewHeader
        eyebrow="Khaate"
        title={
          <>
            ₹{Math.round(owedTotal).toLocaleString('en-IN')}{' '}
            <span className="text-zinc-400 text-base font-normal">to collect</span>
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ledger.map((row) => {
          const owes = row.balance > 0;
          return (
            <div
              key={row.buyerId}
              className="bg-white border border-stone-200 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {row.buyer?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {row.buyer?.phone || ''}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    ₹{Math.round(row.charges).toLocaleString('en-IN')} billed · ₹
                    {Math.round(row.payments).toLocaleString('en-IN')} paid
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-semibold ${
                      owes
                        ? 'text-orange-700'
                        : row.balance < 0
                        ? 'text-emerald-800'
                        : 'text-zinc-500'
                    }`}
                  >
                    ₹{Math.round(Math.abs(row.balance)).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {owes ? 'Owes' : row.balance < 0 ? 'Credit' : 'Settled'}
                  </p>
                </div>
              </div>
              {owes && (
                <button
                  onClick={() => setPaymentTarget(row)}
                  className="mt-3 w-full bg-stone-900 text-stone-50 px-3 py-2 rounded-full text-xs font-medium hover:bg-emerald-900"
                >
                  Record payment received
                </button>
              )}
            </div>
          );
        })}
      </div>

      {paymentTarget && (
        <RecordPaymentModal
          row={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onSaved={() => {
            setPaymentTarget(null);
            onPaymentRecorded?.();
          }}
        />
      )}
    </>
  );
}

function RecordPaymentModal({ row, onClose, onSaved }) {
  const [amount, setAmount] = useState(String(Math.round(row.balance)));
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError('Enter a positive amount');
      return;
    }
    try {
      setSaving(true);
      await shopkeeperAPI.recordPayment({
        buyerId: row.buyerId,
        amount: amt,
        method,
        note,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-md p-6"
      >
        <h3 className="font-semibold text-lg mb-1">Record payment</h3>
        <p className="text-sm text-zinc-500 mb-5">
          {row.buyer?.name} owes ₹
          {Math.round(row.balance).toLocaleString('en-IN')}.
          Logging a payment reduces the balance.
        </p>

        {error && (
          <div className="mb-4 flex gap-2 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-xl text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <label className="block mb-4">
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Amount received (₹)
          </span>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-lg focus:outline-none focus:border-emerald-700"
            autoFocus
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Method
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'cash', label: '💵 Cash' },
              { id: 'upi', label: '📱 UPI' },
              { id: 'bank_transfer', label: '🏦 Bank' },
              { id: 'other', label: 'Other' },
            ].map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-emerald-900 text-stone-50 border-emerald-900'
                      : 'bg-white border-stone-200 text-zinc-700 hover:border-stone-300'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </label>

        <label className="block mb-5">
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Note (optional)
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Settled at counter on Friday"
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-stone-200 text-zinc-700 px-4 py-2.5 rounded-full text-sm hover:bg-stone-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-emerald-900 text-stone-50 px-4 py-2.5 rounded-full text-sm hover:bg-emerald-800 disabled:bg-zinc-300"
          >
            {saving ? 'Saving…' : 'Record payment'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ShopProfileView({ me, onSaved }) {
  const [form, setForm] = useState(() => ({
    upiVpa: me.upiVpa || '',
    gstNumber: me.gstNumber || '',
    deliveryAvailable: !!me.deliveryAvailable,
    deliveryRadiusKm: me.deliveryRadiusKm || 0,
    minOrderValue: me.minOrderValue || 0,
    isAcceptingOrders: me.isAcceptingOrders ?? true,
    categories: me.categories || [],
    openingHours: me.openingHours || { open: '08:00', close: '21:00' },
  }));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const toggleCategory = (c) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await shopkeeperAPI.updateMe(form);
      setSavedAt(new Date().toLocaleTimeString());
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ViewHeader eyebrow="Shop profile" title={me.shopName} />

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Section title="Read-only info">
          <Detail label="Owner" value={me.name} />
          <Detail label="Email" value={me.email} />
          <Detail
            label="Address"
            value={`${me.shopAddress?.line1 || ''}, ${me.shopAddress?.city || ''} · ${
              me.shopAddress?.pincode || ''
            }`}
          />
        </Section>

        <Section title="Payments">
          <Field
            label="UPI VPA (e.g. shop@upi)"
            value={form.upiVpa}
            onChange={(v) => setForm({ ...form, upiVpa: v })}
            placeholder="dukaan@oksbi"
          />
          <Field
            label="GST number (optional)"
            value={form.gstNumber}
            onChange={(v) => setForm({ ...form, gstNumber: v })}
            placeholder="29ABCDE1234F1Z5"
          />
        </Section>

        <Section title="Hours">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Opens at"
              type="time"
              value={form.openingHours.open}
              onChange={(v) =>
                setForm({
                  ...form,
                  openingHours: { ...form.openingHours, open: v },
                })
              }
            />
            <Field
              label="Closes at"
              type="time"
              value={form.openingHours.close}
              onChange={(v) =>
                setForm({
                  ...form,
                  openingHours: { ...form.openingHours, close: v },
                })
              }
            />
          </div>
        </Section>

        <Section title="Categories you stock">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => {
              const active = form.categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-emerald-900 text-stone-50 border-emerald-900'
                      : 'bg-white border-stone-200 text-zinc-700 hover:border-stone-300'
                  }`}
                >
                  {c.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Delivery">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.deliveryAvailable}
              onChange={(e) =>
                setForm({ ...form, deliveryAvailable: e.target.checked })
              }
            />
            We deliver
          </label>
          {form.deliveryAvailable && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field
                label="Delivery radius (km)"
                type="number"
                value={form.deliveryRadiusKm}
                onChange={(v) =>
                  setForm({ ...form, deliveryRadiusKm: Number(v) || 0 })
                }
              />
              <Field
                label="Min order (₹)"
                type="number"
                value={form.minOrderValue}
                onChange={(v) =>
                  setForm({ ...form, minOrderValue: Number(v) || 0 })
                }
              />
            </div>
          )}
        </Section>

        <Section title="Accepting orders">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isAcceptingOrders}
              onChange={(e) =>
                setForm({ ...form, isAcceptingOrders: e.target.checked })
              }
            />
            Currently accepting new lists
          </label>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-900 text-stone-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 disabled:bg-zinc-300"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {savedAt && (
            <span className="text-xs text-emerald-700">✓ Saved at {savedAt}</span>
          )}
        </div>
      </form>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-700 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-emerald-700 focus:bg-white"
      />
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}

/* ====================== Complete modal ====================== */

function CompleteModal({ list, actualPrice, setActualPrice, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-semibold text-lg mb-1">Mark complete</h3>
        <p className="text-sm text-zinc-500 mb-5">
          Set the actual bill — this gets added to {list.buyerId?.name}&apos;s khata.
        </p>
        <label className="block mb-4">
          <span className="block text-xs font-medium text-zinc-700 mb-1.5">
            Actual bill (₹)
          </span>
          <input
            type="number"
            min="0"
            value={actualPrice}
            onChange={(e) => setActualPrice(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-lg focus:outline-none focus:border-emerald-700"
            autoFocus
          />
          <p className="text-xs text-zinc-500 mt-1.5">
            Customer&apos;s estimate was ₹
            {list.totalEstimatedPrice?.toLocaleString('en-IN') || 0}
          </p>
        </label>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-stone-200 text-zinc-700 px-4 py-2.5 rounded-full text-sm hover:bg-stone-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!actualPrice || Number(actualPrice) < 0}
            className="flex-1 bg-emerald-900 text-stone-50 px-4 py-2.5 rounded-full text-sm hover:bg-emerald-800 disabled:bg-zinc-300"
          >
            Confirm & charge khata
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Icons ============================== */

function IconInbox() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
function IconPeople() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 9h12M9 4c3.5 0 5.5 2 5.5 4.5S12.5 13 9 13H7l8 7" />
    </svg>
  );
}
function IconShop() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.2-5h15.6L21 9M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  );
}
