import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbf7f1] text-zinc-900 selection:bg-emerald-900/20">
      <SiteNav />
      <Hero />
      <TrustStrip />
      <Workflow />
      <FeatureBento />
      <Languages />
      <Roles />
      <Testimonials />
      <Faq />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

/* ============================== Nav ============================== */

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#fbf7f1]/85 backdrop-blur-md border-b border-stone-200/70">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-emerald-900">राशन</span>
          <span className="w-1 h-1 rounded-full bg-stone-300" />
          <span className="text-zinc-900 font-medium tracking-tight">
            Rashann
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-9 text-sm text-zinc-600">
          <a href="#workflow" className="hover:text-emerald-900 transition-colors">
            Workflow
          </a>
          <a href="#features" className="hover:text-emerald-900 transition-colors">
            Features
          </a>
          <a href="#roles" className="hover:text-emerald-900 transition-colors">
            For you
          </a>
          <a href="#faq" className="hover:text-emerald-900 transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/login"
            className="text-sm text-zinc-700 hover:text-emerald-900 px-3 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="text-sm bg-emerald-900 text-stone-50 px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors inline-flex items-center gap-1.5"
          >
            Get started <ArrowRight />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ============================== Hero ============================== */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBg />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="grid md:grid-cols-12 gap-14 items-center">
          <div className="md:col-span-7">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white border border-stone-200 text-xs tracking-wide uppercase text-zinc-600 hover:border-emerald-900/30 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Now in public beta
              <span className="text-zinc-400">·</span>
              <span className="text-emerald-900 font-medium normal-case tracking-normal group-hover:underline">
                Sign up free
              </span>
            </Link>
            <h1 className="text-[2.75rem] md:text-7xl tracking-tight leading-[1.02] mb-7 text-zinc-900">
              The{' '}
              <span className="font-display italic text-emerald-900">
                raashan
              </span>
              <br />
              workflow,
              <br />
              <span className="text-zinc-500">finally fixed.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 max-w-xl leading-relaxed mb-10">
              Build your monthly list in your language. Send it to your trusted
              kirana with one tap. Track the khata. Settle by UPI. No paper
              chits, no missed calls.
            </p>
            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-emerald-900 text-stone-50 px-6 py-3.5 rounded-full font-medium hover:bg-emerald-800 transition-colors shadow-sm shadow-emerald-900/20"
              >
                Start your free list
                <ArrowRight />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center gap-2 bg-white border border-stone-200 text-zinc-800 px-6 py-3.5 rounded-full font-medium hover:border-stone-300 transition-colors"
              >
                See how it works
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-zinc-500">
              <Tick>Free forever</Tick>
              <Tick>No app to install</Tick>
              <Tick>हिन्दी · தமிழ் · বাংলা +3</Tick>
            </div>
          </div>

          <div className="md:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBg() {
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
      <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-orange-200/25 blur-3xl pointer-events-none" />
      {/* Faint giant devanagari watermark */}
      <div
        aria-hidden
        className="absolute right-[-3rem] top-1/2 -translate-y-1/2 font-display text-[24rem] leading-none text-emerald-900/[0.04] select-none pointer-events-none hidden lg:block"
      >
        राशन
      </div>
    </>
  );
}

function HeroVisual() {
  const items = [
    { name: 'Basmati Rice', qty: '5 kg', price: 450 },
    { name: 'Toor Dal', qty: '2 kg', price: 320 },
    { name: 'Mustard Oil', qty: '1 L', price: 180 },
    { name: 'Atta', qty: '10 kg', price: 520 },
  ];
  const total = items.reduce((s, i) => s + i.price, 0);
  return (
    <div className="relative">
      {/* Floating UPI badge */}
      <div className="hidden md:flex absolute -left-10 top-12 z-20 items-center gap-2 bg-white border border-stone-200 rounded-2xl shadow-lg shadow-stone-900/5 px-3 py-2">
        <span className="w-8 h-8 rounded-lg bg-emerald-900 text-stone-50 flex items-center justify-center text-sm font-medium">
          ₹
        </span>
        <div className="text-xs leading-tight">
          <p className="font-semibold text-zinc-900">Paid via UPI</p>
          <p className="text-zinc-500">Khata settled · 2m ago</p>
        </div>
      </div>
      {/* Floating mic badge */}
      <div className="hidden md:flex absolute -right-6 bottom-32 z-20 items-center gap-2 bg-white border border-stone-200 rounded-2xl shadow-lg shadow-stone-900/5 px-3 py-2">
        <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
          <IconMic />
        </span>
        <div className="text-xs leading-tight">
          <p className="font-semibold text-zinc-900">&ldquo;Atta paanch kilo&rdquo;</p>
          <p className="text-zinc-500">Heard in हिन्दी</p>
        </div>
      </div>

      {/* Soft shadow under */}
      <div className="absolute inset-x-0 -bottom-10 mx-8 h-10 bg-zinc-900/10 blur-2xl rounded-full" />

      {/* Phone card */}
      <div className="relative bg-white border border-stone-200 rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)] overflow-hidden">
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
        <ul className="px-3 py-1 divide-y divide-stone-100">
          {items.map((i) => (
            <li key={i.name} className="px-3 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-xs text-zinc-500 font-semibold shrink-0">
                {i.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {i.name}
                </p>
                <p className="text-xs text-zinc-500">{i.qty}</p>
              </div>
              <p className="text-sm font-semibold text-zinc-900">₹{i.price}</p>
            </li>
          ))}
        </ul>
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

/* ============================== Trust strip ============================== */

function TrustStrip() {
  const stats = [
    { value: '₹0', label: 'Commission' },
    { value: '6', label: 'Indian languages' },
    { value: '1 tap', label: 'To send a list' },
    { value: '∞', label: 'Months of history' },
  ];
  const words = [
    'Atta',
    'चावल',
    'Toor Dal',
    'मसाला',
    'Mustard Oil',
    'सब्ज़ी',
    'Sugar',
    'दूध',
    'Ghee',
    'चाय',
  ];
  return (
    <section className="border-y border-stone-200/70 bg-white/60">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-zinc-500 overflow-hidden">
        {words.map((w, i) => (
          <span key={i} className="text-sm tracking-wide whitespace-nowrap">
            {i % 2 === 1 ? (
              <span className="font-display italic">{w}</span>
            ) : (
              w
            )}
          </span>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-200">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-6 py-8 ${
                i === 0 ? 'border-l border-stone-200' : ''
              }`}
            >
              <p className="text-4xl md:text-5xl font-semibold tracking-tight text-emerald-900 mb-1">
                {s.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== Workflow ============================== */

function Workflow() {
  const steps = [
    {
      n: '01',
      tag: 'Build',
      title: 'List what you need',
      body:
        'Add items by typing or by voice — हिन्दी, English, मराठी, தமிழ், বাংলা, తెలుగు. Quantity, unit and a price estimate per row.',
    },
    {
      n: '02',
      tag: 'Send',
      title: 'Share with your kirana',
      body:
        'Pick a registered shopkeeper near you. Your list, with the running total, lands in their dashboard. One tap.',
    },
    {
      n: '03',
      tag: 'Settle',
      title: 'Khata + UPI',
      body:
        'Shopkeeper marks the order complete and the bill enters your khata. Pay in full or in part, by UPI or cash, when you’re ready.',
    },
  ];
  return (
    <section id="workflow" className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <Eyebrow text="The workflow" />
      <h2 className="text-4xl md:text-5xl tracking-tight leading-[1.1] text-zinc-900 max-w-3xl mb-16">
        From your kitchen to the{' '}
        <span className="font-display italic text-emerald-900">dukaan</span>,
        in three calm steps.
      </h2>
      <div className="relative grid md:grid-cols-3 gap-5">
        {/* connecting line */}
        <div className="hidden md:block absolute top-[3.4rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-stone-200 via-emerald-900/30 to-stone-200" />
        {steps.map((s) => (
          <div
            key={s.n}
            className="relative bg-white border border-stone-200 rounded-2xl p-8 md:p-10 hover:border-stone-300 transition-colors"
          >
            <div className="flex items-center gap-3 mb-7">
              <span className="font-display italic text-4xl text-emerald-900/90">
                {s.n}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 px-2 py-1 rounded-full border border-stone-200 bg-stone-50">
                {s.tag}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-3 tracking-tight">
              {s.title}
            </h3>
            <p className="text-zinc-600 leading-relaxed text-sm">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================== Feature bento ============================== */

function FeatureBento() {
  return (
    <section
      id="features"
      className="bg-white border-y border-stone-200/70 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <Eyebrow text="Why Rashann" theme="dark" />
        <h2 className="text-4xl md:text-5xl tracking-tight leading-[1.1] text-zinc-900 max-w-3xl mb-16">
          Built to respect how Indian households{' '}
          <span className="font-display italic">actually shop.</span>
        </h2>

        <div className="grid md:grid-cols-6 gap-5">
          {/* Wide: voice/multilingual */}
          <div className="md:col-span-4 group bg-gradient-to-br from-emerald-50 to-[#fbf7f1] border border-stone-200 rounded-2xl p-8 md:p-10 hover:border-stone-300 transition-colors overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-emerald-200/40 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-emerald-900 flex items-center justify-center">
                  <IconMic />
                </span>
                <span className="text-xs uppercase tracking-widest text-zinc-500">
                  Voice first
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-3">
                Speak your list, in your{' '}
                <span className="font-display italic text-emerald-900">
                  bhasha
                </span>
                .
              </h3>
              <p className="text-zinc-600 leading-relaxed max-w-md mb-6 text-sm">
                Atta paanch kilo, doodh do liter, dahi 500 gram — Rashann parses
                item, quantity and unit across six Indian languages.
              </p>
              <div className="flex flex-wrap gap-2">
                {['हिन्दी', 'English', 'मराठी', 'தமிழ்', 'বাংলা', 'తెలుగు'].map(
                  (l) => (
                    <span
                      key={l}
                      className="font-display text-sm text-emerald-900 bg-white border border-stone-200 px-3 py-1 rounded-full"
                    >
                      {l}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Tall: khata */}
          <div className="md:col-span-2 md:row-span-2 bg-emerald-950 text-stone-50 rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.1] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-950 flex items-center justify-center">
                  <IconRupee />
                </span>
                <span className="text-xs uppercase tracking-widest text-emerald-200/70">
                  Udhaar khata
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight mb-3">
                The khata,{' '}
                <span className="font-display italic text-emerald-200">
                  finally
                </span>{' '}
                digital.
              </h3>
              <p className="text-emerald-100/80 leading-relaxed mb-6 text-sm">
                Running balance with every kirana you deal with. Both sides see
                the same numbers, always.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-emerald-200/80">
                    Sharma Kirana
                  </span>
                  <span className="text-[10px] uppercase tracking-widest bg-orange-300/20 text-orange-200 px-2 py-0.5 rounded-full">
                    You owe
                  </span>
                </div>
                <p className="text-3xl font-semibold text-stone-50 mb-3">
                  ₹1,470
                </p>
                <button className="w-full bg-emerald-200 text-emerald-950 text-xs font-medium py-2 rounded-full hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-1.5">
                  Pay via UPI <ArrowRight />
                </button>
              </div>
            </div>
          </div>

          {/* Square: history */}
          <div className="md:col-span-2 bg-[#fbf7f1] border border-stone-200 rounded-2xl p-8 hover:border-stone-300 transition-colors">
            <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-emerald-900 flex items-center justify-center mb-5">
              <IconCalendar />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 mb-2">
              Monthly history, automatic
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Every list saved and organised by month — see what last Diwali
              actually cost.
            </p>
          </div>

          {/* Square: multi-shop */}
          <div className="md:col-span-2 bg-[#fbf7f1] border border-stone-200 rounded-2xl p-8 hover:border-stone-300 transition-colors">
            <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-emerald-900 flex items-center justify-center mb-5">
              <IconShop />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 mb-2">
              Multiple kiranas, one app
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Grains from one dukaan, vegetables from another. Switch easily,
              keep separate khaate.
            </p>
          </div>

          {/* Wide: shopkeeper dashboard */}
          <div className="md:col-span-4 bg-gradient-to-br from-orange-50 to-[#fbf7f1] border border-stone-200 rounded-2xl p-8 md:p-10 hover:border-stone-300 transition-colors relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-orange-200/40 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-orange-700 flex items-center justify-center">
                    <IconBoard />
                  </span>
                  <span className="text-xs uppercase tracking-widest text-zinc-500">
                    For shopkeepers
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">
                  A real dukaan dashboard
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed mb-4 max-w-sm">
                  All customer lists in one feed. Filter by status, search by
                  buyer. Mark complete, set the bill, charge the khata — done.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-800 hover:text-orange-900"
                >
                  Open for kiranas <ArrowRight />
                </Link>
              </div>
              <div className="w-full md:w-44 shrink-0 bg-white border border-stone-200 rounded-xl p-3 text-xs space-y-2 shadow-sm">
                <div className="flex justify-between bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                  <span className="font-medium text-zinc-800">Priya · ₹1.4k</span>
                  <span className="text-amber-700">New</span>
                </div>
                <div className="flex justify-between bg-stone-50 border border-stone-100 rounded-lg px-2 py-1.5">
                  <span className="text-zinc-700">Ramesh · ₹2.1k</span>
                  <span className="text-zinc-500">Done</span>
                </div>
                <div className="flex justify-between bg-stone-50 border border-stone-100 rounded-lg px-2 py-1.5">
                  <span className="text-zinc-700">Karthik · ₹860</span>
                  <span className="text-zinc-500">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== Languages ============================== */

function Languages() {
  const langs = [
    { native: 'हिन्दी', label: 'Hindi', example: 'Atta paanch kilo' },
    { native: 'English', label: 'English', example: '5 kg of flour' },
    { native: 'मराठी', label: 'Marathi', example: 'Tandool tin kilo' },
    { native: 'தமிழ்', label: 'Tamil', example: 'Arisi rendu kilo' },
    { native: 'বাংলা', label: 'Bengali', example: 'Chal du kilo' },
    { native: 'తెలుగు', label: 'Telugu', example: 'Biyyam rendu kilolu' },
  ];
  return (
    <section className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div className="grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5 md:sticky md:top-24">
          <Eyebrow text="Voice input" />
          <h2 className="text-4xl md:text-5xl tracking-tight leading-[1.1] text-zinc-900 mb-6">
            <span className="font-display italic text-emerald-900">
              Bol-ke
            </span>{' '}
            banao list.
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-8 text-base">
            Rashann understands the way you actually speak — quantity, unit and
            item, in six Indian languages. Tap the mic, talk, done.
          </p>
          <div className="inline-flex items-center gap-3 bg-white border border-stone-200 rounded-full pl-1 pr-5 py-1 text-sm text-zinc-700">
            <span className="w-10 h-10 rounded-full bg-orange-600 text-stone-50 flex items-center justify-center shrink-0">
              <IconMic />
            </span>
            Tap to speak in your language
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {langs.map((l) => (
              <div
                key={l.label}
                className="group bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-900/30 hover:bg-emerald-50/30 transition-colors"
              >
                <p className="font-display text-2xl text-emerald-900 mb-1">
                  {l.native}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                  {l.label}
                </p>
                <p className="text-xs text-zinc-600 italic leading-relaxed">
                  &ldquo;{l.example}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== Roles ============================== */

function Roles() {
  return (
    <section
      id="roles"
      className="bg-white border-y border-stone-200/70"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <Eyebrow text="For you" theme="dark" />
        <h2 className="text-4xl md:text-5xl tracking-tight leading-[1.1] text-zinc-900 max-w-3xl mb-16">
          Built for both sides of the{' '}
          <span className="font-display italic text-emerald-900">counter</span>.
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <RoleCard
            tag="Customers"
            title="Spend less time on the monthly raashan."
            bullets={[
              'Create monthly lists, by typing or voice',
              'Quantity, unit, category & price per item',
              'Pick a trusted kirana — one tap to share',
              'Khata + UPI settlement, in app',
              'Full history, organised by month',
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
              'Filter by status, search by customer',
              'Mark complete and set the actual bill',
              'Customer khata + payment tracking',
              'Build a digital customer base',
            ]}
            cta="Sign up as a shopkeeper"
            icon={<IconStore />}
            theme="orange"
          />
        </div>
      </div>
    </section>
  );
}

function RoleCard({ tag, title, bullets, cta, icon, theme }) {
  const themes = {
    emerald: {
      ring: 'border-emerald-900/10',
      bg: 'bg-emerald-50/50',
      pill: 'bg-emerald-900 text-stone-50 hover:bg-emerald-800',
      iconBg: 'bg-emerald-900 text-stone-50',
      check: 'text-emerald-900',
    },
    orange: {
      ring: 'border-orange-900/10',
      bg: 'bg-orange-50/40',
      pill: 'bg-orange-900 text-stone-50 hover:bg-orange-800',
      iconBg: 'bg-orange-900 text-stone-50',
      check: 'text-orange-800',
    },
  }[theme];
  return (
    <div
      className={`relative border ${themes.ring} ${themes.bg} rounded-2xl p-8 md:p-10`}
    >
      <div className="flex items-start justify-between mb-8">
        <span className="text-[11px] uppercase tracking-widest text-zinc-500">
          {tag}
        </span>
        <div
          className={`w-11 h-11 rounded-xl ${themes.iconBg} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl tracking-tight leading-tight text-zinc-900 mb-6">
        {title}
      </h3>
      <ul className="space-y-3 mb-10">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 text-zinc-700">
            <CheckMark className={themes.check} />
            <span className="text-sm">{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`inline-flex items-center gap-2 ${themes.pill} px-5 py-2.5 rounded-full text-sm font-medium transition-colors`}
      >
        {cta} <ArrowRight />
      </Link>
    </div>
  );
}

/* ============================== Testimonials ============================== */

function Testimonials() {
  const quotes = [
    {
      body:
        'My mother used to send me three calls and two WhatsApps for one grocery list. Now she just shares it from Rashann.',
      name: 'Priya Sharma',
      role: 'Customer · Bengaluru',
      theme: 'emerald',
    },
    {
      body:
        'पहले हर महीने ग्राहक का हिसाब मिलाना सिरदर्द था। अब सब एक जगह दिखता है — कौन कितना देना है।',
      name: 'Ramesh Bhai',
      role: 'Kirana owner · Pune',
      theme: 'orange',
    },
    {
      body:
        'Voice input in Tamil changed everything for my paati. She just talks, the list builds itself.',
      name: 'Karthik Subramanian',
      role: 'Customer · Chennai',
      theme: 'emerald',
    },
  ];
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <Eyebrow text="From the chai-table" />
      <h2 className="text-4xl md:text-5xl tracking-tight leading-[1.1] text-zinc-900 max-w-3xl mb-16">
        Words from{' '}
        <span className="font-display italic text-emerald-900">
          real households
        </span>{' '}
        and their kiranas.
      </h2>
      <div className="grid md:grid-cols-3 gap-5">
        {quotes.map((q, i) => {
          const accent =
            q.theme === 'orange'
              ? 'text-orange-700 border-orange-200/60 bg-orange-50/40'
              : 'text-emerald-800 border-emerald-200/60 bg-emerald-50/40';
          return (
            <figure
              key={i}
              className="bg-white border border-stone-200 rounded-2xl p-7 md:p-8 hover:border-stone-300 transition-colors flex flex-col"
            >
              <span
                className={`font-display text-6xl leading-none mb-3 ${
                  q.theme === 'orange' ? 'text-orange-700' : 'text-emerald-800'
                }`}
              >
                &ldquo;
              </span>
              <blockquote className="text-zinc-700 leading-relaxed mb-6 flex-1 text-sm md:text-base">
                {q.body}
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-5 border-t border-stone-100">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold border ${accent}`}
                >
                  {q.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {q.name}
                  </p>
                  <p className="text-xs text-zinc-500">{q.role}</p>
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

/* ============================== FAQ ============================== */

function Faq() {
  const items = [
    {
      q: 'Is Rashann really free?',
      a: 'Yes. No subscription, no per-order fee, no commission from your shopkeeper. Free forever for both customers and kiranas.',
    },
    {
      q: 'Does my shopkeeper need to install anything?',
      a: 'No app required — Rashann works in any browser. Your shopkeeper signs up once and sees incoming lists in their dashboard.',
    },
    {
      q: 'Which languages does the voice input support?',
      a: 'Hindi, English (India), Marathi, Tamil, Bengali and Telugu. More languages are coming based on demand.',
    },
    {
      q: 'How does the khata (udhaar) work?',
      a: 'When a shopkeeper marks an order complete with a bill amount, it gets added to your running balance with them. Settle in part or full anytime — UPI or cash. Both sides see the same history.',
    },
    {
      q: 'Is my data safe?',
      a: 'Your account is protected with a password and a JWT token. Lists and khata entries are only visible to you and the shopkeeper you shared them with.',
    },
    {
      q: 'Can I use Rashann on an older phone?',
      a: 'Yes — Rashann is a lightweight web app and runs on most modern browsers. No installation, minimal data usage.',
    },
  ];
  return (
    <section
      id="faq"
      className="bg-white border-y border-stone-200/70"
    >
      <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center mb-14">
          <Eyebrow text="FAQ" theme="dark" centered />
          <h2 className="text-4xl md:text-5xl tracking-tight leading-[1.1] text-zinc-900">
            Questions, answered{' '}
            <span className="font-display italic text-emerald-900">
              honestly
            </span>
            .
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <details
              key={i}
              className="group bg-[#fbf7f1] border border-stone-200 rounded-2xl px-6 py-5 open:bg-white open:border-stone-300 transition-colors"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                <span className="font-medium text-zinc-900">{it.q}</span>
                <span className="w-7 h-7 rounded-full border border-stone-300 text-zinc-500 flex items-center justify-center shrink-0 group-open:rotate-45 group-open:border-emerald-900 group-open:text-emerald-900 transition-transform">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                </span>
              </summary>
              <p className="text-sm text-zinc-600 leading-relaxed mt-4">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== Final CTA ============================== */

function FinalCta() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div className="relative overflow-hidden bg-emerald-950 rounded-[28px]">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.4) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden
          className="absolute -right-10 -bottom-10 font-display text-[20rem] leading-none text-emerald-200/[0.05] select-none pointer-events-none hidden md:block"
        >
          राशन
        </div>
        <div className="relative px-6 md:px-12 py-20 md:py-28 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-300 mb-5">
            Begin
          </p>
          <h2 className="text-4xl md:text-6xl tracking-tight leading-[1.05] text-stone-50 mb-6 max-w-3xl mx-auto">
            Your next{' '}
            <span className="font-display italic text-emerald-200">
              raashan
            </span>
            , ordered before you finish your chai.
          </h2>
          <p className="text-emerald-100/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Sign up in under a minute. Bring your shopkeeper along.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-stone-50 text-emerald-950 px-7 py-3.5 rounded-full font-medium hover:bg-white transition-colors"
            >
              Create your free account <ArrowRight />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-stone-50/90 hover:text-stone-50 px-5 py-3.5 rounded-full font-medium transition-colors"
            >
              I&apos;m a shopkeeper <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================== Footer ============================== */

function SiteFooter() {
  const product = [
    { label: 'Workflow', href: '#workflow' },
    { label: 'Features', href: '#features' },
    { label: 'For customers', href: '#roles' },
    { label: 'For shopkeepers', href: '#roles' },
    { label: 'FAQ', href: '#faq' },
  ];
  const company = [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press kit', href: '#' },
  ];
  const support = [
    { label: 'Help centre', href: '#' },
    { label: 'Contact us', href: 'mailto:hello@rashann.app' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ];
  return (
    <footer className="bg-emerald-950 text-stone-300">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 pb-14 border-b border-stone-50/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="flex items-baseline gap-2 mb-5">
              <span className="font-display text-3xl text-emerald-200">
                राशन
              </span>
              <span className="text-stone-400 text-sm">·</span>
              <span className="text-stone-50 font-medium tracking-tight">
                Rashann
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm mb-6">
              The monthly raashan workflow for Indian households and their
              kiranas — built with respect for how shopping actually happens at
              home.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="#" label="Twitter">
                <IconTwitter />
              </SocialLink>
              <SocialLink href="#" label="Instagram">
                <IconInstagram />
              </SocialLink>
              <SocialLink href="#" label="GitHub">
                <IconGithub />
              </SocialLink>
              <SocialLink href="#" label="LinkedIn">
                <IconLinkedIn />
              </SocialLink>
            </div>
          </div>

          <FooterCol title="Product" links={product} />
          <FooterCol title="Company" links={company} />
          <FooterCol title="Support" links={support} />

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3">
            <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-4">
              Stay in the loop
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 min-w-0 px-4 py-2.5 bg-emerald-900/60 border border-stone-50/10 rounded-full text-sm text-stone-50 placeholder:text-stone-500 focus:outline-none focus:border-emerald-300/40"
              />
              <button
                type="submit"
                className="bg-emerald-200 text-emerald-950 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                Notify
              </button>
            </form>
            <p className="mt-3 text-xs text-stone-500 leading-relaxed">
              Occasional updates about new languages, kiranas onboarded and
              shipping notes. No spam.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Rashann · Made with{' '}
            <span className="text-orange-300">♥</span> in India
          </p>
          <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-xs text-stone-400">
            <Link href="#" className="hover:text-stone-50 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-stone-50 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-stone-50 transition-colors">
              Cookies
            </Link>
            <span className="text-stone-500">v1.0 · Beta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-stone-400 mb-4">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-sm text-stone-300 hover:text-stone-50 transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-full bg-emerald-900/60 border border-stone-50/10 text-stone-300 flex items-center justify-center hover:bg-emerald-200 hover:text-emerald-950 hover:border-transparent transition-colors"
    >
      {children}
    </a>
  );
}

/* ============================== Small primitives ============================== */

function Eyebrow({ text, theme = 'light', centered = false }) {
  return (
    <div
      className={`${centered ? 'justify-center' : ''} flex items-center gap-3 mb-5`}
    >
      <span
        className={`h-px w-6 ${
          theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-900/40'
        }`}
      />
      <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-800 font-medium">
        {text}
      </span>
    </div>
  );
}

function Tick({ children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-4 h-4 rounded-full bg-emerald-900/10 text-emerald-900 flex items-center justify-center">
        <svg
          className="w-2.5 h-2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
      {children}
    </span>
  );
}

function CheckMark({ className = 'text-emerald-900' }) {
  return (
    <svg
      className={`w-5 h-5 mt-0.5 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ============================== Icons ============================== */

function ArrowRight() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14M13 5l7 7-7 7"
      />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M16 3v4M8 3v4M3.5 10h17" strokeLinecap="round" />
    </svg>
  );
}
function IconRupee() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
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
      strokeWidth="1.6"
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
function IconBoard() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9h17M9 20.5V9" strokeLinecap="round" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}
function IconStore() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
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
function IconMic() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path strokeLinecap="round" d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-7.013L4.6 22H1.34l8.026-9.169L1 2h6.99l4.846 6.41L18.244 2zm-2.4 18h1.84L7.27 4H5.36l10.484 16z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-1.93c-3.2.7-3.88-1.55-3.88-1.55-.52-1.34-1.28-1.7-1.28-1.7-1.04-.72.08-.71.08-.71 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.8 0c2.21-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.42.36.78 1.06.78 2.14v3.17c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7.5 0H14v1.65h.06c.5-.95 1.74-1.95 3.58-1.95 3.83 0 4.54 2.52 4.54 5.8V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4V9z" />
    </svg>
  );
}
