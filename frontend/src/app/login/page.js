'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    userType: 'buyer',
    // shopkeeper-only
    shopName: '',
    shopLine1: '',
    shopCity: '',
    shopState: '',
    shopPincode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setRole = (userType) => setFormData((f) => ({ ...f, userType }));

  const buildRegisterPayload = () => {
    const { userType } = formData;
    const base = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      userType,
    };
    if (userType === 'shopkeeper') {
      return {
        ...base,
        shopName: formData.shopName,
        shopAddress: {
          line1: formData.shopLine1,
          city: formData.shopCity,
          state: formData.shopState,
          pincode: formData.shopPincode,
        },
      };
    }
    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = isLogin
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(buildRegisterPayload());
      const { token, user } = response.data;
      Cookies.set('token', token);
      Cookies.set('user', JSON.stringify(user));
      router.push(
        user.userType === 'buyer' ? '/dashboard/buyer' : '/dashboard/shopkeeper'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fbf7f1] text-zinc-900 flex flex-col overflow-hidden">
      {/* Soft background blobs */}
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-emerald-900">राशन</span>
          <span className="text-zinc-400 text-sm">·</span>
          <span className="text-zinc-900 font-medium tracking-tight">
            Rashann
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-emerald-900 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft /> Back to home
        </Link>
      </header>

      {/* Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-stone-200 rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.15)] p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-emerald-800 mb-2">
                {isLogin ? 'Welcome back' : 'Get started'}
              </p>
              <h1 className="text-3xl tracking-tight text-zinc-900 leading-tight">
                {isLogin ? (
                  <>
                    Sign in to your{' '}
                    <span className="font-display italic text-emerald-900">
                      raashan
                    </span>
                  </>
                ) : (
                  <>
                    Create your free{' '}
                    <span className="font-display italic text-emerald-900">
                      account
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-stone-100 rounded-full p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                  isLogin ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                  !isLogin ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 flex gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-2.5 rounded-xl text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <RoleSelector value={formData.userType} onChange={setRole} />
                  <Field
                    label="Full name"
                    name="name"
                    type="text"
                    placeholder="Akash Kumar"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Field
                    label="Phone number"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                  {formData.userType === 'shopkeeper' && (
                    <div className="space-y-4 pt-2 border-t border-stone-200">
                      <p className="text-xs uppercase tracking-widest text-emerald-800 pt-2">
                        Your shop
                      </p>
                      <Field
                        label="Shop name"
                        name="shopName"
                        type="text"
                        placeholder="Sharma Kirana Store"
                        value={formData.shopName}
                        onChange={handleChange}
                        required
                      />
                      <Field
                        label="Shop address"
                        name="shopLine1"
                        type="text"
                        placeholder="Street, area"
                        value={formData.shopLine1}
                        onChange={handleChange}
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="City"
                          name="shopCity"
                          type="text"
                          placeholder="Mumbai"
                          value={formData.shopCity}
                          onChange={handleChange}
                          required
                        />
                        <Field
                          label="State"
                          name="shopState"
                          type="text"
                          placeholder="Maharashtra"
                          value={formData.shopState}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <Field
                        label="Pincode"
                        name="shopPincode"
                        type="text"
                        placeholder="400001"
                        value={formData.shopPincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Field
                label="Password"
                name="password"
                type="password"
                placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={isLogin ? undefined : 8}
              />

              <button
                type="submit"
                disabled={loading}
                className="group w-full inline-flex items-center justify-center gap-2 bg-emerald-900 text-stone-50 py-3 rounded-full font-medium hover:bg-emerald-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed mt-2"
              >
                {loading
                  ? 'Just a moment…'
                  : isLogin
                  ? 'Log in'
                  : 'Create my account'}
                {!loading && <ArrowRight />}
              </button>
            </form>

            <p className="mt-5 text-sm text-center text-zinc-500">
              {isLogin ? "Don't have an account? " : 'Already on Rashann? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-900 font-medium hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Free forever · No commission · Built for Indian households
          </p>
        </div>
      </main>
    </div>
  );
}

/* ----------------------------- Components ----------------------------- */

function Field({ label, name, type, placeholder, value, onChange, required, minLength }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-700 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 transition-colors"
      />
    </label>
  );
}

function RoleSelector({ value, onChange }) {
  return (
    <div>
      <span className="block text-xs font-medium text-zinc-700 mb-2">
        I am a…
      </span>
      <div className="grid grid-cols-2 gap-3">
        <RoleOption
          active={value === 'buyer'}
          onClick={() => onChange('buyer')}
          icon={<IconUser />}
          title="Customer"
          subtitle="I shop"
        />
        <RoleOption
          active={value === 'shopkeeper'}
          onClick={() => onChange('shopkeeper')}
          icon={<IconStore />}
          title="Shopkeeper"
          subtitle="I run a dukaan"
        />
      </div>
    </div>
  );
}

function RoleOption({ active, onClick, icon, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-4 rounded-2xl border-2 transition-colors ${
        active
          ? 'border-emerald-900 bg-emerald-50/50'
          : 'border-stone-200 bg-stone-50 hover:border-stone-300'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
          active ? 'bg-emerald-900 text-stone-50' : 'bg-white border border-stone-200 text-zinc-600'
        }`}
      >
        {icon}
      </div>
      <p className="font-semibold text-sm text-zinc-900">{title}</p>
      <p className="text-xs text-zinc-500">{subtitle}</p>
      {active && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-900 text-stone-50 flex items-center justify-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* ------------------------------- Icons -------------------------------- */

function ArrowRight() {
  return (
    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.2-5h15.6L21 9M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  );
}
