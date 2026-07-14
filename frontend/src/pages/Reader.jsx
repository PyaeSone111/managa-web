import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { chapterApi, seriesApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
// import { loadInPagePushAd } from '../components/ads/loadInPagePushAd';
import { formatChapterLabel, formatChapterNumber, toAbsoluteImageUrl } from '../utils/helpers';

function Reader() {
  const { seriesSlug, chapterNumber } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [seriesSlug, chapterNumber]);

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', seriesSlug, chapterNumber],
    queryFn: () => chapterApi.getBySeriesAndNumber(seriesSlug, chapterNumber),
    enabled: !!seriesSlug && !!chapterNumber,
  });

  const { data: chaptersRes } = useQuery({
    queryKey: ['series', seriesSlug, 'chapters'],
    queryFn: () => seriesApi.getChapters(seriesSlug),
    enabled: !!seriesSlug && !!chapter?.data,
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!chapter?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-sidewalk-grey">Chapter not found.</p>
      </div>
    );
  }

  const chapterData = chapter.data;
  const chaptersList = chaptersRes?.data ?? [];
  const sortedChapters = [...chaptersList].sort(
    (a, b) => (Number(a.chapter_number) ?? 0) - (Number(b.chapter_number) ?? 0)
  );
  const currentIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(chapterData.chapter_number)
  );
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < sortedChapters.length - 1
    ? sortedChapters[currentIndex + 1]
    : null;
  const seriesUrl = `/series/${seriesSlug}`;

  const btnClass = "px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm border border-ruskin-blue/40 text-ruskin-blue bg-ruskin-blue/10 hover:bg-ruskin-blue hover:text-white";
  const btnClassPrimary = "px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm bg-delta-green text-white hover:bg-ruskin-blue border border-delta-green hover:border-ruskin-blue";

  const NavBlock = () => (
    <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-3 border-y border-quarzo">
      {prevChapter ? (
        <Link to={`/read/${seriesSlug}/${formatChapterNumber(prevChapter.chapter_number)}`} className={btnClass}>
          ← Prev
        </Link>
      ) : (
        <Link to={seriesUrl} className={btnClass}>
          ← Back to series
        </Link>
      )}
      <Link to={seriesUrl} className={btnClassPrimary}>
        Series
      </Link>
      {nextChapter ? (
        <Link to={`/read/${seriesSlug}/${formatChapterNumber(nextChapter.chapter_number)}`} className={btnClass}>
          Next →
        </Link>
      ) : (
        <Link to={seriesUrl} className={btnClass}>
          Back to series →
        </Link>
      )}
    </nav>
  );

  return (
    <>
      <Helmet>
        <title>
          {chapterData.title || formatChapterLabel(chapterData.chapter_number)} - Myangar
        </title>
      </Helmet>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black-feather">
            {chapterData.title || formatChapterLabel(chapterData.chapter_number)}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm border border-ruskin-blue/40 text-ruskin-blue bg-ruskin-blue/10 hover:bg-ruskin-blue hover:text-white"
          >
            Back
          </button>
        </div>

        <NavBlock />

        <div className="space-y-2 sm:space-y-4">
          {(chapterData.pages?.sort((a, b) => a.page_number - b.page_number) ?? []).map((page) => (
            <img
              key={page.id || page.page_number}
              src={toAbsoluteImageUrl(page.image_url)}
              alt={`Page ${page.page_number}`}
              className="w-full h-auto rounded-lg shadow-sm mx-auto block border border-quarzo"
              loading="lazy"
            />
          ))}
        </div>

        <NavBlock />
      </div>
    </>
  );
}

export default Reader;
