import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';

function StarRating({ rating, size = 'sm' }) {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const filled = Math.round(value);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= filled ? (
          <FaStar
            key={star}
            className={`${sizeClass} flex-shrink-0 text-bracken-green`}
          />
        ) : (
          <FaRegStar
            key={star}
            className={`${sizeClass} flex-shrink-0 text-silver-grass/50`}
          />
        )
      )}
    </div>
  );
}

function SeriesCard({ series, layout = 'horizontal' }) {
  const navigate = useNavigate();
  const rating = series.average_rating || series.rating;
  const authorText = series.authors?.length
    ? series.authors.map((a) => (typeof a === 'object' ? a.name : a)).join(', ')
    : series.author || null;
  const categoryName = series.categories?.[0]?.name || series.manga_type?.name || null;
  const imageUrl = series.cover_url || series.thumbnail_url || '/placeholder.jpg';

  const handleClick = (e) => {
    if (e.target.closest('a')) return;
    navigate(`/series/${series.slug}`);
  };

  const titleEl = (
    <h3 className="font-semibold text-xs text-white line-clamp-2 group-hover:text-silver-grass transition-colors leading-tight">
      {series.title}
    </h3>
  );
  const authorEl = authorText && (
    <p className="text-[10px] sm:text-xs text-silver-grass mt-0.5 line-clamp-1">{authorText}</p>
  );
  const categoryEl = categoryName && (
    <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-bracken-green text-white">
      {categoryName}
    </span>
  );
  const ratingEl = (
    <div className="mt-auto pt-2">
      <StarRating rating={rating} />
    </div>
  );

  if (layout === 'vertical') {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer glass-card rounded-xl border border-silver-grass/30 hover:border-silver-grass/50 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-silver-grass/10 rounded-t-xl">
          <img
            src={imageUrl}
            alt={series.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-2 sm:p-3 flex flex-col min-h-[72px]">
          <div className="min-h-0">
            {titleEl}
            {authorEl}
            {categoryEl}
          </div>
          {ratingEl}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer glass-card rounded-xl border border-silver-grass/30 hover:border-silver-grass/50 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[120px] sm:min-h-[128px]"
    >
      <div className="flex-shrink-0 w-20 sm:w-24 h-24 sm:h-28 overflow-hidden bg-silver-grass/10 rounded-l-xl">
        <img
          src={imageUrl}
          alt={series.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between p-2 sm:p-3 text-left min-h-0">
        <div>
          {titleEl}
          {authorEl}
          {categoryEl}
        </div>
        {ratingEl}
      </div>
    </div>
  );
}

export default SeriesCard;
