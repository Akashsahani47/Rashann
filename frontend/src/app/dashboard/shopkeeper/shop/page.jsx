'use client';

import { useState } from 'react';
import { shopkeeperAPI } from '@/lib/api';
import { ViewHeader } from '@/components/DashboardShell';
import { useShopkeeperData } from '../data-context';

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

export default function ShopProfilePage() {
  const { me, fetchMe } = useShopkeeperData();

  if (!me) {
    return (
      <>
        <ViewHeader eyebrow="Shop profile" title="Your dukaan" />
        <div className="text-zinc-500">Loading...</div>
      </>
    );
  }

  return <ShopProfileForm key={me._id} me={me} onSaved={fetchMe} />;
}

function ShopProfileForm({ me, onSaved }) {
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
            value={`${me.shopAddress?.line1 || ''}, ${
              me.shopAddress?.city || ''
            } · ${me.shopAddress?.pincode || ''}`}
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
            <span className="text-xs text-emerald-700">
              ✓ Saved at {savedAt}
            </span>
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
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
