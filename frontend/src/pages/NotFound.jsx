import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found - Manga Web</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3 sm:mb-4">
            404
          </h1>
          <p className="text-lg sm:text-xl text-silver-grass mb-6 sm:mb-8">
            Page not found
          </p>
          <Link
            to="/"
            className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-bracken-green text-silver-grass rounded-lg hover:bg-bracken-fern transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFound;

