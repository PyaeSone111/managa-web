import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { rankingsApi } from '../services/api';
import SeriesGrid from '../components/series/SeriesGrid';

const RANKING_TABS = [
  { id: 'top', label: 'Top Manga', description: 'Best rated series' },
  { id: 'reading', label: 'Most Read', description: 'Most actively read' },
  { id: 'trending', label: 'Trending', description: 'Rising in popularity' },
];

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

        {error ? (
          <div className="text-center py-12">
            <p className="text-white">
              {error.message || 'Failed to load rankings'}
            </p>
          </div>
        ) : (
          <SeriesGrid
            series={series}
            loading={isLoading}
            layout="horizontal"
            sectionKey="rankings"
          />
        )}
      </div>
    </>
  );
}

export default Rankings;
