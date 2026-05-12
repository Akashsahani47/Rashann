import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbf7f1] text-zinc-900">
      <SiteNav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <Features />
      <Roles />
      <CtaBand />
      <SiteFooter />
    </div>
  );
}

/* ---------------------------------------------------------------- */

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#fbf7f1]/80 backdrop-blur-md border-b border-stone-200/70">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-emerald-900">राशन</span>
          <span className="text-zinc-400 text-sm">·</span>
          <span className="text-zinc-900 font-medium tracking-tight">
            Rashann
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-10 text-sm text-zinc-600">
          <a href="#how" className="hover:text-emerald-900 transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-emerald-900 transition-colors">
            Features
          </a>
          <a href="#roles" className="hover:text-emerald-900 transition-colors">
            For you
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-zinc-700 hover:text-emerald-900 px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="text-sm bg-emerald-900 text-stone-50 px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <BgPattern />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white border border-stone-200 text-xs tracking-wide uppercase text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            For Indian households &amp; their kiranas
          </div>
          <h1 className="text-5xl md:text-7xl tracking-tight leading-[1.05] mb-7 text-zinc-900">
            Your monthly <span className="font-display italic text-emerald-900">raashan</span>, without the chaos.
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 max-w-xl leading-relaxed mb-10">
            Build a list at your own pace. Send it to your trusted shopkeeper.
            Skip the calls, the lost paper chits, and the forgotten haldi.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 bg-emerald-900 text-stone-50 px-6 py-3.5 rounded-full font-medium hover:bg-emerald-800 transition-colors"
            >
              Start your free list
              <ArrowRight />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 bg-white border border-stone-200 text-zinc-800 px-6 py-3.5 rounded-full font-medium hover:border-stone-300 transition-colors"
            >
              How it works
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-500">
            <Tick>No app to install</Tick>
            <Tick>Free forever</Tick>
            <Tick>Works on any phone</Tick>
          </div>
        </div>

        <div className="md:col-span-5">
          <PhoneMock />
        </div>
      </div>
    </section>
  );
}

function BgPattern() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(168 162 158 / 0.35) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />
    </>
  );
}

function PhoneMock() {
  const items = [
    { name: 'Basmati Rice', qty: '5 kg', price: 450, cat: 'Grains' },
    { name: 'Toor Dal', qty: '2 kg', price: 320, cat: 'Pulses' },
    { name: 'Mustard Oil', qty: '1 L', price: 180, cat: 'Oils' },
    { name: 'Atta', qty: '10 kg', price: 520, cat: 'Grains' },
    { name: 'Onions', qty: '3 kg', price: 90, cat: 'Veg' },
  ];
  const total = items.reduce((s, i) => s + i.price, 0);
  return (
    <div className="relative">
      <div className="absolute inset-x-0 -bottom-8 mx-8 h-8 bg-zinc-900/10 blur-2xl rounded-full" />
      <div className="relative bg-white border border-stone-200 rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-zinc-400">
              November 2026
            </p>
            <h3 className="font-semibold text-zinc-900 mt-1">
              Monthly Groceries
            </h3>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
            Draft
          </span>
        </div>
        <div className="px-3 py-2 divide-y divide-stone-100">
          {items.map((i) => (
            <div key={i.name} className="px-3 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-xs text-zinc-500 font-medium shrink-0">
                {i.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {i.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {i.qty} · {i.cat}
                </p>
              </div>
              <p className="text-sm font-semibold text-zinc-900">₹{i.price}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <span className="text-sm text-zinc-600">Estimated total</span>
          <span className="font-semibold text-emerald-900 text-lg">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="px-4 pb-4">
          <button className="w-full bg-emerald-900 text-stone-50 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors">
            Share with shopkeeper <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Marquee() {
  const words = [
    'Atta',
    'चावल',
    'Dal',
    'मसाला',
    'Oil',
    'सब्ज़ी',
    'Sugar',
    'दूध',
    'Ghee',
    'चाय',
  ];
  return (
    <div className="border-y border-stone-200/70 bg-white/50">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-zinc-500">
        {words.map((w, i) => (
          <span key={i} className="text-sm tracking-wide">
            {i % 2 === 1 ? <span className="font-display italic">{w}</span> : w}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Build the list',
      body: 'Add items with category, quantity and a price estimate. Edit through the month.',
    },
    {
      n: '02',
      title: 'Pick your kirana',
      body: 'Choose from registered shopkeepers near you. Send the list with one tap.',
    },
    {
      n: '03',
      title: 'Receive & review',
      body: 'Your shopkeeper marks the order complete. It is saved to your monthly history.',
    },
  ];
  return (
    <section id="how" className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-16">
        <p className="text-xs uppercase tracking-widest text-emerald-800 mb-4">
          How it works
        </p>
        <h2 className="text-4xl md:text-5xl tracking-tight leading-tight text-zinc-900">
          From your kitchen to the{' '}
          <span className="font-display italic text-emerald-900">dukaan</span>{' '}
          in three steps.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {steps.map((s) => (
          <div
            key={s.n}
            className="bg-white border border-stone-200 rounded-2xl p-8 md:p-10 hover:border-stone-300 transition-colors"
          >
            <div className="font-display italic text-5xl text-emerald-900/90 mb-6">
              {s.n}
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-3 tracking-tight">
              {s.title}
            </h3>
            <p className="text-zinc-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Features() {
  const features = [
    {
      title: 'Monthly history, automatically',
      body: 'Every list saved and organised by month — see exactly what last Diwali cost.',
      icon: <IconCalendar />,
    },
    {
      title: 'No more forgotten items',
      body: 'Build the list through the week. Add it the moment you finish the bottle.',
      icon: <IconList />,
    },
    {
      title: 'Know the bill upfront',
      body: 'Estimated prices per item give you a running total before you order.',
      icon: <IconRupee />,
    },
    {
      title: 'Multiple shopkeepers',
      body: 'Grains from one dukaan, vegetables from another. Pick the right one each time.',
      icon: <IconShop />,
    },
    {
      title: 'A real shopkeeper dashboard',
      body: 'All customer lists in one feed — no more scrolling through WhatsApp threads.',
      icon: <IconBoard />,
    },
    {
      title: 'Free, no commission',
      body: 'No subscription, no cuts taken from your shopkeeper. Just a better workflow.',
      icon: <IconHeart />,
    },
  ];
  return (
    <section id="features" className="bg-white border-y border-stone-200/70">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-widest text-emerald-800 mb-4">
            Why Rashann
          </p>
          <h2 className="text-4xl md:text-5xl tracking-tight leading-tight text-zinc-900">
            Built to respect how Indian households{' '}
            <span className="font-display italic">actually shop.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-[#fbf7f1] border border-stone-200 rounded-2xl p-8 hover:border-stone-300 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-stone-200 text-emerald-900 flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2 tracking-tight">
                {f.title}
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Roles() {
  return (
    <section id="roles" className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div className="max-w-2xl mb-16">
        <p className="text-xs uppercase tracking-widest text-emerald-800 mb-4">
          For you
        </p>
        <h2 className="text-4xl md:text-5xl tracking-tight leading-tight text-zinc-900">
          Built for both sides of the{' '}
          <span className="font-display italic text-emerald-900">counter.</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <RoleCard
          tag="Customers"
          title="Spend less time on the monthly raashan."
          bullets={[
            'Create lists for any month',
            'Track items with category, unit & price',
            'Pick a trusted shopkeeper for each order',
            'Full history, always',
          ]}
          cta="Sign up as a customer"
          icon={<IconUser />}
          theme="emerald"
        />
        <RoleCard
          tag="Shopkeepers"
          title="Bring your dukaan online without the headache."
          bullets={[
            'All incoming lists in one organised feed',
            'Filter and search by customer',
            'Mark orders complete with one tap',
            'Build a digital customer base',
          ]}
          cta="Sign up as a shopkeeper"
          icon={<IconStore />}
          theme="orange"
        />
      </div>
    </section>
  );
}

function RoleCard({ tag, title, bullets, cta, icon, theme }) {
  const themes = {
    emerald: {
      ring: 'border-emerald-900/10',
      bg: 'bg-emerald-50/50',
      pill: 'bg-emerald-900 text-stone-50',
      iconBg: 'bg-emerald-900 text-stone-50',
    },
    orange: {
      ring: 'border-orange-900/10',
      bg: 'bg-orange-50/40',
      pill: 'bg-orange-900 text-stone-50',
      iconBg: 'bg-orange-900 text-stone-50',
    },
  }[theme];
  return (
    <div className={`relative border ${themes.ring} ${themes.bg} rounded-2xl p-8 md:p-10`}>
      <div className="flex items-start justify-between mb-8">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          {tag}
        </span>
        <div className={`w-11 h-11 rounded-xl ${themes.iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl tracking-tight leading-tight text-zinc-900 mb-6">
        {title}
      </h3>
      <ul className="space-y-3 mb-10">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 text-zinc-700">
            <CheckMark /> <span className="text-sm">{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`inline-flex items-center gap-2 ${themes.pill} px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity`}
      >
        {cta} <ArrowRight />
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function CtaBand() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-24 md:pb-32">
      <div className="relative overflow-hidden bg-emerald-950 rounded-3xl">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.4) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative px-6 md:px-12 py-20 md:py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-300 mb-5">
            Begin
          </p>
          <h2 className="text-4xl md:text-6xl tracking-tight leading-tight text-stone-50 mb-6">
            Your next{' '}
            <span className="font-display italic text-emerald-200">raashan</span>,
            ordered before you finish your chai.
          </h2>
          <p className="text-emerald-100/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Sign up in under a minute. Bring your shopkeeper along.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-stone-50 text-emerald-950 px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
          >
            Create your free account <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function SiteFooter() {
  return (
    <footer className="bg-[#fbf7f1] border-t border-stone-200/70">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl text-emerald-900">राशन</span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-700 font-medium">Rashann</span>
        </div>
        <p className="text-zinc-500">
          Made for Indian households · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/*                              ICONS                                */
/* ---------------------------------------------------------------- */

function ArrowRight() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg className="w-5 h-5 text-emerald-900 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Tick({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-4 h-4 rounded-full bg-emerald-900/10 text-emerald-900 flex items-center justify-center">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {children}
    </span>
  );
}

function IconCalendar() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M16 3v4M8 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}
function IconList() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 9h12M9 4c3.5 0 5.5 2 5.5 4.5S12.5 13 9 13H7l8 7" />
    </svg>
  );
}
function IconShop() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.2-5h15.6L21 9M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  );
}
function IconBoard() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9h17M9 20.5V9" strokeLinecap="round" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.2-5h15.6L21 9M4 9v11h16V9M9 20v-6h6v6" />
    </svg>
  );
}
