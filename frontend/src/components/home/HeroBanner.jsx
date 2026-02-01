import { Link } from 'react-router-dom';

function HeroBanner() {
  return (
    <section
      className="relative w-full overflow-hidden border-b border-silver-grass/20"
      aria-label="Promotion"
    >
      <div
        className="relative flex min-h-[200px] sm:min-h-[240px] md:min-h-[280px] items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12 hero-section-bg"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Discover New Stories
            </h2>
            <p className="mt-2 text-silver-grass text-sm sm:text-base max-w-xl">
              Read the latest manga, manhwa, and manhua. New releases added weekly.
            </p>
            <Link
              to="/browse"
              className="mt-4 inline-block px-5 py-2.5 text-sm font-medium bg-bracken-green text-silver-grass rounded-lg hover:bg-bracken-fern transition-all duration-200"
            >
              Browse All
            </Link>
          </div>
          <div className="hidden sm:block flex-shrink-0 opacity-90" aria-hidden>
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-silver-grass/20 border border-silver-grass/30 flex items-center justify-center text-4xl md:text-5xl">
              📚
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
