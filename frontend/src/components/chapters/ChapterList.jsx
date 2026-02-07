import { Link } from 'react-router-dom';
import { formatChapterNumber, formatChapterLabel } from '../../utils/helpers';

function ChapterList({ chapters = [], seriesSlug }) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sidewalk-grey">No chapters available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <Link
          key={chapter.id}
          to={`/read/${seriesSlug}/${formatChapterNumber(chapter.chapter_number)}`}
          className="block p-3 sm:p-4 bg-white rounded-xl hover:shadow-md border border-quarzo hover:border-ruskin-blue/30 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex-1">
              <span className="font-semibold text-sm sm:text-base text-black-feather">
                {formatChapterLabel(chapter.chapter_number)}
              </span>
              {chapter.title && (
                <p className="text-xs sm:text-sm text-sidewalk-grey mt-1 line-clamp-1">
                  {chapter.title}
                </p>
              )}
            </div>
            <div className="text-xs sm:text-sm text-sidewalk-grey">
              {chapter.page_count} pages
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ChapterList;
