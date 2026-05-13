'use client';

import { buyerAPI } from '@/lib/api';
import { ViewHeader } from '@/components/DashboardShell';
import { useBuyerData } from '../data-context';

export default function KhataPage() {
  const { ledger, fetchLedger } = useBuyerData();

  if (ledger.length === 0) {
    return (
      <>
        <ViewHeader eyebrow="Udhaar khata" title="Your balances" />
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center text-zinc-500">
          No transactions yet. Khata entries appear after a shopkeeper marks an
          order complete.
        </div>
      </>
    );
  }

  return (
    <>
      <ViewHeader
        eyebrow="Udhaar khata"
        title="Your balance with each kirana"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ledger.map((row) => (
          <LedgerRow key={row.shopkeeperId} row={row} onPaid={fetchLedger} />
        ))}
      </div>
    </>
  );
}

function LedgerRow({ row, onPaid }) {
  const owes = row.balance > 0;
  const credit = row.balance < 0;
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">
            {row.shopkeeper?.shopName || row.shopkeeper?.name || 'Unknown shop'}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            ₹{Math.round(row.charges).toLocaleString('en-IN')} billed · ₹
            {Math.round(row.payments).toLocaleString('en-IN')} paid
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-semibold ${
              owes
                ? 'text-orange-700'
                : credit
                ? 'text-emerald-800'
                : 'text-zinc-500'
            }`}
          >
            ₹{Math.round(Math.abs(row.balance)).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            {owes ? 'You owe' : credit ? 'Credit' : 'Settled'}
          </p>
        </div>
      </div>
      {owes && (
        <div className="mt-4">
          <UpiPayButton
            shopkeeper={row.shopkeeper}
            amount={row.balance}
            onPaid={onPaid}
          />
        </div>
      )}
    </div>
  );
}

function UpiPayButton({ shopkeeper, amount, onPaid }) {
  const vpa = shopkeeper?.upiVpa;
  const note = `Rashann settle — ${shopkeeper?.shopName || ''}`.trim();
  const handlePay = async () => {
    if (vpa) {
      const url = `upi://pay?pa=${encodeURIComponent(
        vpa
      )}&pn=${encodeURIComponent(
        shopkeeper?.shopName || shopkeeper?.name || 'Shopkeeper'
      )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
      window.location.href = url;
    }
    if (
      confirm(
        vpa
          ? `Mark ₹${Math.round(amount)} as paid via UPI?`
          : `This shopkeeper hasn't added a UPI ID. Record ₹${Math.round(
              amount
            )} as paid anyway?`
      )
    ) {
      try {
        await buyerAPI.recordPayment({
          shopkeeperId: shopkeeper._id,
          amount,
          method: 'upi',
          note,
        });
        onPaid();
      } catch (e) {
        console.error(e);
      }
    }
  };
  return (
    <button
      onClick={handlePay}
      className="bg-emerald-900 text-stone-50 px-4 py-2 rounded-full text-sm hover:bg-emerald-800"
    >
      {vpa ? 'Pay via UPI' : 'Record as paid'}
    </button>
  );
}
