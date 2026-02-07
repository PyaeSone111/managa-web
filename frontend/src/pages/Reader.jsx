import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { chapterApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatChapterLabel } from '../utils/helpers';

function Reader() {
  const { seriesSlug, chapterNumber } = useParams();
  const navigate = useNavigate();

  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', seriesSlug, chapterNumber],
    queryFn: () => chapterApi.getBySeriesAndNumber(seriesSlug, chapterNumber),
    enabled: !!seriesSlug && !!chapterNumber,
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

  return (
    <>
      <Helmet>
        <title>
          {chapterData.title || formatChapterLabel(chapterData.chapter_number)} - Manga Web
        </title>
      </Helmet>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-black-feather">
            {chapterData.title || formatChapterLabel(chapterData.chapter_number)}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm bg-white border border-quarzo text-black-feather rounded-lg hover:bg-quarzo/30 transition-all shadow-sm"
          >
            Back
          </button>
        </div>

        <div className="space-y-2 sm:space-y-4">
          {chapterData.pages
            ?.sort((a, b) => a.page_number - b.page_number)
            ?.map((page) => (
              <img
                key={page.id || page.page_number}
                src={page.image_url}
                alt={`Page ${page.page_number}`}
                className="w-full h-auto rounded-lg shadow-sm mx-auto block border border-quarzo"
                loading="lazy"
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default Reader;
