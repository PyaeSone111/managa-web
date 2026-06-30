const HOME_CARDS = [
  { color: 'bg-red-orange/90', width: 'w-2/3' },
  { color: 'bg-mango/90', width: 'w-1/2' },
  { color: 'bg-white/15', width: 'w-3/4' },
  { color: 'bg-red-orange/70', width: 'w-1/2' },
];

const BROWSE_CARDS = [
  'bg-red-orange/30',
  'bg-mango/40',
  'bg-red-orange/25',
  'bg-mango/35',
  'bg-red-orange/30',
  'bg-mango/40',
];

const LIBRARY_ROWS = [
  { color: 'bg-red-orange/80', progress: 'w-4/5' },
  { color: 'bg-mango/80', progress: 'w-3/5' },
  { color: 'bg-white/20', progress: 'w-2/3' },
  { color: 'bg-red-orange/60', progress: 'w-full' },
];

function PhoneMockup({ className, children }) {
  return (
    <div className={`relative w-[140px] sm:w-[160px] md:w-[180px] ${className}`}>
      <div className="rounded-[2rem] border-[6px] border-navy/90 bg-navy p-1.5 shadow-2xl shadow-navy/25">
        <div className="rounded-[1.4rem] overflow-hidden bg-almond aspect-[9/19] relative">
          {children}
        </div>
      </div>
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-navy/90 z-30" />
    </div>
  );
}

function PhoneReflection() {
  return <div className="phone-screen-reflection pointer-events-none absolute inset-0 z-20" aria-hidden="true" />;
}

function PhoneTabBar({ tabs, variant = 'dark' }) {
  const isDark = variant === 'dark';
  return (
    <div
      className={`relative flex shrink-0 border-t px-2 py-1.5 gap-1 ${
        isDark ? 'border-white/10 bg-navy/95' : 'border-navy/10 bg-almond/95'
      }`}
    >
      <div
        className={`phone-tab-indicator absolute bottom-1.5 h-0.5 rounded-full ${
          isDark ? 'bg-mango' : 'bg-red-orange'
        }`}
        style={{ width: `calc(${100 / tabs.length}% - 4px)` }}
      />
      {tabs.map((tab) => (
        <div
          key={tab}
          className={`phone-tab-dot flex-1 text-center text-[6px] sm:text-[7px] font-medium truncate ${
            isDark ? 'text-almond/40' : 'text-navy/35'
          }`}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}

function ScrollCards({ items, variant = 'home' }) {
  const doubled = [...items, ...items];
  return (
    <div className="phone-scroll-mask flex-1 min-h-0 overflow-hidden">
      <div className={`phone-scroll-track ${variant === 'grid' ? 'phone-scroll-track--grid' : 'phone-scroll-track--list'}`}>
        {doubled.map((item, i) =>
          variant === 'grid' ? (
            <div key={i} className="rounded-md bg-navy/10 overflow-hidden shrink-0">
              <div className={`h-12 ${item}`} />
              <div className="h-1.5 m-1 rounded bg-navy/15" />
            </div>
          ) : variant === 'home' ? (
            <div key={i} className={`rounded-lg ${item.color} p-2 shrink-0`}>
              <div className="h-8 rounded bg-white/20 mb-1.5" />
              <div className={`h-1.5 ${item.width} rounded bg-white/30`} />
            </div>
          ) : (
            <div key={i} className={`rounded-lg ${item.color} p-2 shrink-0`}>
              <div className="h-1.5 w-2/3 rounded bg-white/25 mb-1.5" />
              <div className={`h-1 rounded-full bg-white/20`}>
                <div className={`h-1 rounded-full bg-mango/90 ${item.progress}`} />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function AnimatedHomePhone() {
  return (
    <PhoneMockup className="-rotate-12 translate-y-4 z-10 phone-mockup--left">
      <div className="phone-screen-cycle absolute inset-0 flex flex-col bg-gradient-to-b from-navy to-navy/90">
        {/* Tab 1 — Home */}
        <div className="phone-panel phone-panel--1 absolute inset-0 flex flex-col p-3 pb-0">
          <p className="text-[9px] text-almond/80 mb-1 shrink-0">Hi, Reader!</p>
          <p className="text-[11px] font-bold text-white mb-2 shrink-0">Continue Reading</p>
          <ScrollCards items={HOME_CARDS} variant="home" />
          <PhoneTabBar tabs={['Home', 'Browse', 'Saved']} variant="dark" />
        </div>

        {/* Tab 2 — Browse */}
        <div className="phone-panel phone-panel--2 absolute inset-0 flex flex-col p-3 pb-0 bg-navy">
          <p className="text-[10px] font-bold text-white mb-2 shrink-0">Latest Release</p>
          <ScrollCards items={LIBRARY_ROWS} variant="library" />
          <PhoneTabBar tabs={['Home', 'Browse', 'Saved']} variant="dark" />
        </div>

        {/* Tab 3 — Saved */}
        <div className="phone-panel phone-panel--3 absolute inset-0 flex flex-col p-3 pb-0 bg-navy">
          <p className="text-[10px] font-bold text-white mb-2 shrink-0">My Favorites</p>
          <ScrollCards items={HOME_CARDS.slice().reverse()} variant="home" />
          <PhoneTabBar tabs={['Home', 'Browse', 'Saved']} variant="dark" />
        </div>

        <PhoneReflection />
      </div>
    </PhoneMockup>
  );
}

function AnimatedBrowsePhone() {
  return (
    <PhoneMockup className="rotate-6 -translate-y-2 z-20 phone-mockup--right">
      <div className="phone-screen-cycle phone-screen-cycle--browse absolute inset-0 flex flex-col bg-almond">
        {/* Browse tab */}
        <div className="phone-panel-browse phone-panel-browse--1 absolute inset-0 flex flex-col p-3 pb-0">
          <p className="text-[10px] font-bold text-navy mb-2 shrink-0">Browse Library</p>
          <div className="phone-scroll-mask flex-1 min-h-0 overflow-hidden">
            <div className="phone-scroll-track phone-scroll-track--grid grid grid-cols-2 gap-1.5">
              {[...BROWSE_CARDS, ...BROWSE_CARDS].map((color, i) => (
                <div key={i} className="rounded-md bg-navy/10 overflow-hidden shrink-0">
                  <div className={`h-12 ${color}`} />
                  <div className="h-1.5 m-1 rounded bg-navy/15" />
                </div>
              ))}
            </div>
          </div>
          <PhoneTabBar tabs={['Browse', 'Rankings']} variant="light" />
        </div>

        {/* Rankings tab */}
        <div className="phone-panel-browse phone-panel-browse--2 absolute inset-0 flex flex-col p-3 pb-0 bg-almond">
          <p className="text-[10px] font-bold text-navy mb-2 shrink-0">Top Rankings</p>
          <div className="phone-scroll-mask flex-1 min-h-0 overflow-hidden">
            <div className="phone-scroll-track phone-scroll-track--list space-y-1.5">
              {[...LIBRARY_ROWS, ...LIBRARY_ROWS].map((row, i) => (
                <div key={i} className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[8px] font-bold text-red-orange w-3">{(i % 4) + 1}</span>
                  <div className="flex-1 rounded-md bg-navy/10 overflow-hidden">
                    <div className={`h-8 ${i % 2 === 0 ? 'bg-red-orange/30' : 'bg-mango/35'}`} />
                    <div className="h-1 m-1 rounded bg-navy/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <PhoneTabBar tabs={['Browse', 'Rankings']} variant="light" />
        </div>

        <PhoneReflection />
      </div>
    </PhoneMockup>
  );
}

export { AnimatedHomePhone, AnimatedBrowsePhone };
