'use client';

import Link from 'next/link';

export default function DashboardShell({
  roleLabel,
  userName,
  userSubtitle,
  navItems,         // [{ id, label, icon, badge? }]
  activeView,
  onSelectView,
  onLogout,
  children,
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fbf7f1] text-zinc-900">
      {/* === Sidebar (desktop) === */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-stone-200 flex-col fixed inset-y-0 left-0 z-30">
        <Link
          href="/"
          className="flex items-baseline gap-2 px-6 py-5 border-b border-stone-100"
        >
          <span className="font-display text-2xl text-emerald-900">राशन</span>
          <span className="h-1 w-1 rounded-full bg-stone-300" />
          <span className="font-semibold tracking-tight">Rashann</span>
        </Link>

        <div className="px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 px-2 mb-2">
            {roleLabel}
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-900'
                    : 'text-zinc-600 hover:bg-stone-100 hover:text-zinc-900'
                }`}
              >
                <span
                  className={`w-5 h-5 flex items-center justify-center ${
                    active ? 'text-emerald-700' : 'text-zinc-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      active
                        ? 'bg-emerald-900 text-stone-50'
                        : 'bg-stone-200 text-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-4 space-y-2">
          <div className="px-2">
            <p className="text-sm font-medium truncate">{userName}</p>
            {userSubtitle && (
              <p className="text-xs text-zinc-500 truncate">{userSubtitle}</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-zinc-600 hover:bg-stone-100 hover:text-red-700"
          >
            <IconLogout /> Log out
          </button>
        </div>
      </aside>

      {/* === Mobile top bar === */}
      <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl text-emerald-900">राशन</span>
          <span className="font-semibold text-sm">Rashann</span>
        </Link>
        <button
          onClick={onLogout}
          className="text-xs text-zinc-600 hover:text-red-700"
        >
          Log out
        </button>
      </header>

      {/* === Main content === */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-12">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>

      {/* === Mobile bottom tabs === */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 flex z-30">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 ${
                active ? 'text-emerald-900' : 'text-zinc-500'
              }`}
            >
              <span className="relative">
                {item.icon}
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold bg-orange-600 text-white rounded-full px-1">
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* Section header used inside any view */
export function ViewHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-emerald-800 mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl md:text-3xl tracking-tight font-semibold">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
