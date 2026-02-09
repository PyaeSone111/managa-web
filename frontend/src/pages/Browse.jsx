import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { seriesApi, categoryApi, mangaTypeApi, authorApi } from '../services/api';
import SeriesGrid from '../components/series/SeriesGrid';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'dropped', label: 'Dropped' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Recently Updated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'views', label: 'Most Views' },
  { value: 'favorites', label: 'Most Favorites' },
];

function FilterSection({ title, children, collapsible = true }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-quarzo pb-4">
      {collapsible ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left font-medium text-black-feather mb-2 hover:text-ruskin-blue transition-colors"
        >
          {title}
          <span className="text-sidewalk-grey">{isOpen ? '\u2212' : '+'}</span>
        </button>
      ) : (
        <h3 className="font-medium text-black-feather mb-2">{title}</h3>
      )}
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || '';
  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const selectedTypes = searchParams.get('types')?.split(',').filter(Boolean) || [];
  const selectedAuthors = searchParams.get('authors')?.split(',').filter(Boolean) || [];
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const { data: typesData } = useQuery({
    queryKey: ['manga-types'],
    queryFn: () => mangaTypeApi.getAll(),
  });

  const { data: authorsData } = useQuery({
    queryKey: ['authors', 'all'],
    queryFn: () => authorApi.getAll({ per_page: 100 }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['series', 'browse', { query, selectedCategories, selectedTypes, selectedAuthors, status, sort, page }],
    queryFn: () => seriesApi.getAll({
      search: query,
      categories: selectedCategories.join(','),
      types: selectedTypes.join(','),
      authors: selectedAuthors.join(','),
      status,
      sort,
      page,
      per_page: 20,
    }),
  });

  const categories = categoriesData?.data || [];
  const types = typesData?.data || [];
  const authors = authorsData?.data || [];

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value.length > 0) {
      newParams.set(key, Array.isArray(value) ? value.join(',') : value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const toggleArrayFilter = (key, value, currentValues) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues);
  };

  const clearAllFilters = () => {
    setSearchParams(query ? { q: query } : {});
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTypes.length > 0 || selectedAuthors.length > 0 || status;
  const pagination = data?.meta || {};

  return (
    <>
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Browse'} - Myangar</title>
        <meta name="description" content="Browse and discover manga, manhwa, and manhua series." />
      </Helmet>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-delta-green text-white rounded-lg hover:bg-ruskin-blue transition-all duration-200"
        >
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          {hasActiveFilters && (
            <span className="bg-white text-delta-green rounded-full w-5 h-5 text-xs flex items-center justify-center font-semibold">
              {selectedCategories.length + selectedTypes.length + selectedAuthors.length + (status ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 xl:w-72 flex-shrink-0`}>
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4 sticky top-20 border border-quarzo">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black-feather">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-ruskin-blue hover:text-delta-green hover:underline transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Sort */}
            <FilterSection title="Sort By" collapsible={false}>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-3 py-2 border border-quarzo rounded-lg bg-white text-black-feather text-sm focus:ring-2 focus:ring-ruskin-blue focus:border-transparent transition-all"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </FilterSection>

            {/* Status */}
            <FilterSection title="Status">
              <div className="space-y-1">
                {STATUS_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => updateFilter('status', e.target.value)}
                      className="text-ruskin-blue accent-ruskin-blue"
                    />
                    <span className="text-sm text-black-feather">{option.label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Types */}
            {types.length > 0 && (
              <FilterSection title="Type">
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {types.map((type) => (
                    <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(String(type.id))}
                        onChange={() => toggleArrayFilter('types', String(type.id), selectedTypes)}
                        className="rounded text-ruskin-blue accent-ruskin-blue"
                      />
                      <span className="text-sm text-black-feather">{type.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <FilterSection title="Categories">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(String(cat.id))}
                        onChange={() => toggleArrayFilter('categories', String(cat.id), selectedCategories)}
                        className="rounded text-ruskin-blue accent-ruskin-blue"
                      />
                      <span className="text-sm text-black-feather">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Authors */}
            {authors.length > 0 && (
              <FilterSection title="Authors">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {authors.map((author) => (
                    <label key={author.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAuthors.includes(String(author.id))}
                        onChange={() => toggleArrayFilter('authors', String(author.id), selectedAuthors)}
                        className="rounded text-ruskin-blue accent-ruskin-blue"
                      />
                      <span className="text-sm text-black-feather">{author.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-black-feather">
              {query ? `Search Results for "${query}"` : 'Browse Series'}
            </h1>
            {pagination.total > 0 && (
              <span className="text-sm text-sidewalk-grey">
                {pagination.total} series found
              </span>
            )}
          </div>

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((catId) => {
                const cat = categories.find((c) => String(c.id) === catId);
                return cat ? (
                  <button
                    key={catId}
                    onClick={() => toggleArrayFilter('categories', catId, selectedCategories)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-ruskin-blue/10 text-ruskin-blue rounded-full text-sm hover:bg-ruskin-blue/20 transition-colors border border-ruskin-blue/20"
                  >
                    {cat.name}
                    <span>&times;</span>
                  </button>
                ) : null;
              })}
              {selectedTypes.map((typeId) => {
                const type = types.find((t) => String(t.id) === typeId);
                return type ? (
                  <button
                    key={typeId}
                    onClick={() => toggleArrayFilter('types', typeId, selectedTypes)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-dockside-blue/20 text-delta-green rounded-full text-sm hover:bg-dockside-blue/30 transition-colors border border-dockside-blue/30"
                  >
                    {type.name}
                    <span>&times;</span>
                  </button>
                ) : null;
              })}
              {selectedAuthors.map((authorId) => {
                const author = authors.find((a) => String(a.id) === authorId);
                return author ? (
                  <button
                    key={authorId}
                    onClick={() => toggleArrayFilter('authors', authorId, selectedAuthors)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-quarzo/40 text-delta-green rounded-full text-sm hover:bg-quarzo/60 transition-colors border border-quarzo"
                  >
                    {author.name}
                    <span>&times;</span>
                  </button>
                ) : null;
              })}
              {status && (
                <button
                  onClick={() => updateFilter('status', '')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-quarzo/40 text-delta-green rounded-full text-sm hover:bg-quarzo/60 transition-colors border border-quarzo"
                >
                  {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                  <span>&times;</span>
                </button>
              )}
            </div>
          )}

          {error ? (
            <div className="text-center py-12">
              <p className="text-sidewalk-grey">
                {error.message || 'Failed to load series'}
              </p>
            </div>
          ) : (
            <>
              <SeriesGrid
                section="browse"
                series={data?.data || []}
                loading={isLoading}
                adSlot={import.meta.env.VITE_ADSENSE_SLOT_CONTENT}
              />

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 pt-6">
                  <button
                    onClick={() => updateFilter('page', String(page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-quarzo rounded-lg bg-white text-black-feather disabled:opacity-50 disabled:cursor-not-allowed hover:bg-quarzo/30 transition-all shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sidewalk-grey text-sm">
                    Page {page} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() => updateFilter('page', String(page + 1))}
                    disabled={page >= pagination.last_page}
                    className="px-4 py-2 border border-quarzo rounded-lg bg-white text-black-feather disabled:opacity-50 disabled:cursor-not-allowed hover:bg-quarzo/30 transition-all shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Browse;
