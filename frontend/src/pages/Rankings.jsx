import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { rankingsApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RANKING_TABS = [
  { id: 'top', label: 'Top Manga', description: 'Best rated series' },
  { id: 'reading', label: 'Most Read', description: 'Most actively read' },
  { id: 'trending', label: 'Trending', description: 'Rising in popularity' },
];

function RankingCard({ series, rank, showScore = false }) {
  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-bracken-green text-silver-grass';
    if (rank === 2) return 'bg-paradise-found text-silver-grass';
    if (rank === 3) return 'bg-bamboo-shoot text-white';
    return 'bg-silver-grass/30 text-white';
  };

  return (
    <Link
      to={`/series/${series.slug}`}
      className="flex items-center gap-4 p-4 glass-card rounded-xl shadow-lg hover:shadow-xl border border-silver-grass/30 hover:border-silver-grass/50 transition-all duration-300"
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadge(rank)}`}
      >
        {rank}
      </div>
      <img
        src={series.thumbnail_url || '/placeholder.jpg'}
        alt={series.title}
        className="w-16 h-24 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-silver-grass truncate">
          {series.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-1 text-sm text-white">
          <span>{series.status}</span>
          {series.total_chapters > 0 && (
            <span>{series.total_chapters} chapters</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {series.categories?.slice(0, 3).map((cat) => (
            <span
              key={cat.id}
              className="px-2 py-0.5 bg-bracken-green/30 text-white rounded text-xs backdrop-blur-sm"
            >
              {cat.name}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {series.average_rating > 0 && (
          <div className="flex items-center gap-1 text-white">
            <span>★</span>
            <span className="font-semibold">{series.average_rating.toFixed(1)}</span>
          </div>
        )}
        {showScore && series.ranking?.score && (
          <div className="text-xs text-white mt-1">
            Score: {Math.round(series.ranking.score)}
          </div>
        )}
        <div className="text-xs text-white mt-1">
          {series.total_views?.toLocaleString() || 0} views
        </div>
      </div>
    </Link>
  );
}

function Rankings() {
  const [activeTab, setActiveTab] = useState('top');
  const [period, setPeriod] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['rankings', activeTab, period],
    queryFn: () => {
      const params = { per_page: 50 };
      if (period !== 'all') params.period = period;

      switch (activeTab) {
        case 'top':
          return rankingsApi.getTop(params);
        case 'reading':
          return rankingsApi.getTopReading(params);
        case 'trending':
          return rankingsApi.getTrending(params);
        default:
          return rankingsApi.getTop(params);
      }
    },
  });

  const series = data?.data || [];

  return (
    <>
      <Helmet>
        <title>Rankings - Manga Web</title>
        <meta name="description" content="Discover top-ranked manga, most read series, and trending titles." />
      </Helmet>

      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-silver-grass">
            Rankings
          </h1>

          <div className="flex items-center gap-2">
            <label className="text-sm text-silver-grass">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1.5 border border-silver-grass/40 rounded-lg glass-effect text-white text-sm focus:ring-2 focus:ring-bracken-green focus:border-transparent transition-all"
            >
              <option value="all">All Time</option>
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
        </div>

        {/* Tabs with Glass Card Background */}
        <div className="glass-card rounded-xl p-4 border border-silver-grass/30">
          <nav className="flex gap-4 sm:gap-8 overflow-x-auto" aria-label="Ranking tabs">
            {RANKING_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-bracken-green text-white'
                    : 'border-transparent text-white hover:text-silver-grass hover:border-silver-grass/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <p className="text-sm text-silver-grass">
          {RANKING_TABS.find((t) => t.id === activeTab)?.description}
        </p>

        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-white">
              {error.message || 'Failed to load rankings'}
            </p>
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-silver-grass">No rankings available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {series.map((item, index) => (
              <RankingCard
                key={item.id}
                series={item}
                rank={index + 1}
                showScore={activeTab !== 'top'}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Rankings;
