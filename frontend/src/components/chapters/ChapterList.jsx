import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatChapterNumber, formatChapterLabel } from '../../utils/helpers';

function ChapterList({ chapters = [], seriesSlug }) {
  const [order, setOrder] = useState('asc'); // asc = Ch 1 first, desc = latest first

  const sortedChapters = useMemo(() => {
    if (!chapters?.length) return [];
    const list = [...chapters];
    list.sort((a, b) => {
      const na = Number(a.chapter_number) ?? 0;
      const nb = Number(b.chapter_number) ?? 0;
      return order === 'asc' ? na - nb : nb - na;
    });
    return list;
  }, [chapters, order]);

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sidewalk-grey">No chapters available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-sidewalk-grey">Order:</span>
        <button
          type="button"
          onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-white bg-ruskin-blue hover:bg-delta-green transition-colors shadow-sm"
          title={order === 'asc' ? 'Ascending (Ch 1 first). Click for descending.' : 'Descending (latest first). Click for ascending.'}
          aria-label={order === 'asc' ? 'Sort ascending' : 'Sort descending'}
        >
          {order === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
        </button>
      </div>
      {sortedChapters.map((chapter) => (
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
