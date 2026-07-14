// import IframeBanner from './IframeBanner';

/**
 * Ad strip shown above the site footer (not under the navbar).
 * Monetag iframe banner commented out — add AdSense ad units when ready.
 */
function FooterAdStrip({ className = '' }) {
  return (
    <aside
      className={`w-full border-t border-quarzo/60 bg-white/80 backdrop-blur-sm ${className}`}
      aria-label="Advertisement"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <p className="text-[10px] uppercase tracking-widest text-sidewalk-grey text-center mb-3">
          Advertisement
        </p>
        {/* <IframeBanner className="mx-auto" tall /> */}
      </div>
    </aside>
  );
}

export default FooterAdStrip;
