import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { chapterApi, seriesApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
// import { loadInPagePushAd } from '../components/ads/loadInPagePushAd';
import { formatChapterLabel, formatChapterNumber, toAbsoluteImageUrl } from '../utils/helpers';

function Reader() {
  const { seriesSlug, chapterNumber } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bottomSentinelRef = useRef(null);

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

  const chapterData = chapter?.data;
  const chaptersList = chaptersRes?.data ?? [];
  const sortedChapters = [...chaptersList].sort(
    (a, b) => (Number(a.chapter_number) ?? 0) - (Number(b.chapter_number) ?? 0)
  );
  const currentIndex = sortedChapters.findIndex(
    (ch) => Number(ch.chapter_number) === Number(chapterData?.chapter_number)
  );
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < sortedChapters.length - 1
    ? sortedChapters[currentIndex + 1]
    : null;
  const nextChapterNumber = nextChapter ? formatChapterNumber(nextChapter.chapter_number) : null;

  // Prefetch the next chapter once the reader nears the bottom of this one.
  useEffect(() => {
    if (!nextChapterNumber || !bottomSentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          queryClient.prefetchQuery({
            queryKey: ['chapter', seriesSlug, nextChapterNumber],
            queryFn: () => chapterApi.getBySeriesAndNumber(seriesSlug, nextChapterNumber),
          });
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [nextChapterNumber, queryClient, seriesSlug]);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!chapterData) {
    return (
      <div className="text-center py-12">
        <p className="text-sidewalk-grey">Chapter not found.</p>
      </div>
    );
  }

  const seriesUrl = `/series/${seriesSlug}`;
  const sortedPages = chapterData.pages?.slice().sort((a, b) => a.page_number - b.page_number) ?? [];

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
        {sortedPages[0]?.image_url ? (
          <link rel="preload" as="image" href={toAbsoluteImageUrl(sortedPages[0].image_url)} />
        ) : null}
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
          {sortedPages.map((page) => (
            <img
              key={page.id || page.page_number}
              src={toAbsoluteImageUrl(page.image_url)}
              alt={`Page ${page.page_number}`}
              width={page.width || undefined}
              height={page.height || undefined}
              className="w-full h-auto rounded-lg shadow-sm mx-auto block border border-quarzo"
              loading={page.page_number <= 2 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={page.page_number === 1 ? 'high' : 'auto'}
            />
          ))}
        </div>

        {/* Invisible trigger — prefetches the next chapter before the user reaches the end. */}
        <div ref={bottomSentinelRef} aria-hidden="true" />

        <NavBlock />
      </div>
    </>
  );
}

export default Reader;
