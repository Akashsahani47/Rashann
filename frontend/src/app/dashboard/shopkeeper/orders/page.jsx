'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { shopkeeperAPI } from '@/lib/api';
import { ViewHeader } from '@/components/DashboardShell';
import { useShopkeeperData } from '../data-context';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCustomer = searchParams.get('customer') || null;

  const { shoppingLists, customers, dataLoading, fetchAll } = useShopkeeperData();

  const [statusFilter, setStatusFilter] = useState('shared');
  const [completingList, setCompletingList] = useState(null);
  const [actualPrice, setActualPrice] = useState('');

  const setSelectedCustomer = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('customer', id);
    else params.delete('customer');
    const qs = params.toString();
    router.replace(
      `/dashboard/shopkeeper/orders${qs ? `?${qs}` : ''}`,
      { scroll: false }
    );
  };

  const pendingCount = shoppingLists.filter((l) => l.status === 'shared').length;
  const completedCount = shoppingLists.filter(
    (l) => l.status === 'completed'
  ).length;

  const filtered = shoppingLists
    .filter((l) => statusFilter === 'all' || l.status === statusFilter)
    .filter((l) => !selectedCustomer || l.buyerId?._id === selectedCustomer);

  const statusPills = [
    { id: 'shared', label: 'Pending', count: pendingCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'all', label: 'All', count: shoppingLists.length },
  ];

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
                  active
                    ? 'bg-emerald-800 text-stone-50'
                    : 'bg-stone-100 text-zinc-600'
                }`}
              >
                {p.count}
              </span>
            </button>
          );
        })}
      </div>

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
            <OrderCard
              key={list._id}
              list={list}
              onComplete={handleCompleteList}
            />
          ))}
        </div>
      )}

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

function CompleteModal({
  list,
  actualPrice,
  setActualPrice,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-semibold text-lg mb-1">Mark complete</h3>
        <p className="text-sm text-zinc-500 mb-5">
          Set the actual bill — this gets added to {list.buyerId?.name}
          &apos;s khata.
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
            Confirm &amp; charge khata
          </button>
        </div>
      </div>
    </div>
  );
}
