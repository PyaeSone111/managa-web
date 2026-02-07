import { Link } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';

function HeroBanner() {
  const { heroBackgroundUrl, heroImageUrl } = useBranding();

  const hasBgImage = Boolean(heroBackgroundUrl);
  const sectionStyle = hasBgImage
    ? { backgroundImage: `url(${heroBackgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <section
      className="relative w-full overflow-hidden border-b border-quarzo"
      aria-label="Promotion"
    >
      <div
        className={`relative flex min-h-[200px] sm:min-h-[240px] md:min-h-[280px] items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12 ${
          hasBgImage ? '' : 'bg-delta-green'
        }`}
        style={sectionStyle}
      >
        {/* Overlay for background images */}
        {hasBgImage && <div className="absolute inset-0 bg-delta-green/70" />}

        <div className="relative container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight text-balance">
              Discover New Stories
            </h2>
            <p className="mt-2 text-dockside-blue text-sm sm:text-base max-w-xl leading-relaxed">
              Read the latest manga, manhwa, and manhua. New releases added weekly.
            </p>
            <Link
              to="/browse"
              className="mt-4 inline-block px-5 py-2.5 text-sm font-medium bg-ruskin-blue text-white rounded-lg hover:bg-ruskin-blue/80 transition-all duration-200"
            >
              Browse All
            </Link>
          </div>
          <div className="hidden sm:block flex-shrink-0" aria-hidden>
            {heroImageUrl ? (
              <img
                src={heroImageUrl}
                alt=""
                className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover border border-white/20"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
