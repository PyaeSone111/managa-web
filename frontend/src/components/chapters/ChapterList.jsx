import { Link } from 'react-router-dom';
import { formatChapterNumber } from '../../utils/helpers';

function ChapterList({ chapters = [], seriesSlug }) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white">No chapters available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <Link
          key={chapter.id}
          to={`/read/${seriesSlug}/${chapter.chapter_number}`}
          className="block p-3 sm:p-4 glass-card rounded-xl hover:shadow-xl border border-silver-grass/30 hover:border-silver-grass/50 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex-1">
              <span className="font-semibold text-sm sm:text-base text-white">
                Chapter {formatChapterNumber(chapter.chapter_number)}
              </span>
              {chapter.title && (
                <p className="text-xs sm:text-sm text-white mt-1 line-clamp-1">
                  {chapter.title}
                </p>
              )}
            </div>
            <div className="text-xs sm:text-sm text-silver-grass">
              {chapter.page_count} pages
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ChapterList;

