'use client';

import { useState } from 'react';
import { shopkeeperAPI } from '@/lib/api';
import { ViewHeader } from '@/components/DashboardShell';
import { useShopkeeperData } from '../data-context';

export default function KhaatePage() {
  const { ledger, fetchLedger, fetchShoppingLists } = useShopkeeperData();
  const [paymentTarget, setPaymentTarget] = useState(null);

  const owedTotal = ledger.reduce(
    (s, r) => s + (r.balance > 0 ? r.balance : 0),
    0
  );

  const onPaymentRecorded = () =>
    Promise.all([fetchLedger(), fetchShoppingLists()]);

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
            <span className="text-zinc-400 text-base font-normal">
              to collect
            </span>
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
                    ₹{Math.round(row.charges).toLocaleString('en-IN')} billed
                    · ₹{Math.round(row.payments).toLocaleString('en-IN')} paid
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
            onPaymentRecorded();
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
          {Math.round(row.balance).toLocaleString('en-IN')}. Logging a payment
          reduces the balance.
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
