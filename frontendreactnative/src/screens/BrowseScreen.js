import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRefreshControl } from '../hooks/usePullToRefresh';
import {
  authorApi,
  categoryApi,
  mangaTypeApi,
  seriesApi,
} from '../services/api';
import { ITEMS_PER_PAGE, SORT_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import SeriesGrid from '../components/SeriesGrid';
import SearchBar from '../components/SearchBar';
import colors from '../theme/colors';

export default function BrowseScreen({ navigation, route }) {
  const initialQuery = route.params?.q || '';
  const initialSort = route.params?.sort || 'latest';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (route.params?.q) setQuery(route.params.q);
    if (route.params?.sort) setSort(route.params.sort);
    if (route.params?.categories) {
      setSelectedCategories(String(route.params.categories).split(',').filter(Boolean));
    }
    if (route.params?.types) {
      setSelectedTypes(String(route.params.types).split(',').filter(Boolean));
    }
  }, [route.params]);

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

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['series', 'browse', { query, selectedCategories, selectedTypes, selectedAuthors, status, sort, page }],
    queryFn: () =>
      seriesApi.getAll({
        search: query || undefined,
        categories: selectedCategories.join(',') || undefined,
        types: selectedTypes.join(',') || undefined,
        authors: selectedAuthors.join(',') || undefined,
        status: status || undefined,
        sort,
        page,
        per_page: ITEMS_PER_PAGE,
      }),
  });

  const categories = categoriesData?.data || [];
  const types = typesData?.data || [];
  const authors = authorsData?.data || [];
  const pagination = data?.meta || {};
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedAuthors.length > 0 ||
    Boolean(status);

  const toggleInList = (list, setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedAuthors([]);
    setStatus('');
    setPage(1);
  };

  const handleSearch = (text) => {
    setQuery(text);
    setPage(1);
  };

  const openSeries = (series) => {
    if (series?.slug) navigation.navigate('SeriesDetail', { slug: series.slug });
  };

  const filterCount = useMemo(
    () =>
      selectedCategories.length +
      selectedTypes.length +
      selectedAuthors.length +
      (status ? 1 : 0),
    [selectedCategories, selectedTypes, selectedAuthors, status]
  );

  const refreshControl = useRefreshControl(refetch, { isFetching, isLoading });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={refreshControl}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{query ? `Search: "${query}"` : null}</Text>
        {pagination.total > 0 && (
          <Text style={styles.count}>{pagination.total} series found</Text>
        )}
      </View>

      <View style={styles.searchWrap}>
        <SearchBar onSearch={handleSearch} />
      </View>

      <Pressable style={styles.filterToggle} onPress={() => setFiltersOpen(true)}>
        <Text style={styles.filterToggleText}>
          Filters{filterCount > 0 ? ` (${filterCount})` : ''}
        </Text>
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error.message || 'Failed to load series'}</Text>
      ) : (
        <>
          <SeriesGrid
            series={data?.data || []}
            loading={isLoading}
            onSeriesPress={openSeries}
            section="browse"
          />

          {pagination.last_page > 1 && (
            <View style={styles.pagination}>
              <Pressable
                disabled={page <= 1}
                onPress={() => setPage((p) => p - 1)}
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Previous</Text>
              </Pressable>
              <Text style={styles.pageInfo}>
                Page {page} of {pagination.last_page}
              </Text>
              <Pressable
                disabled={page >= pagination.last_page}
                onPress={() => setPage((p) => p + 1)}
                style={[styles.pageBtn, page >= pagination.last_page && styles.pageBtnDisabled]}
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      <Modal visible={filtersOpen} animationType="slide" onRequestClose={() => setFiltersOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <Pressable onPress={() => setFiltersOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {hasActiveFilters && (
              <Pressable onPress={clearFilters}>
                <Text style={styles.clearAll}>Clear All</Text>
              </Pressable>
            )}

            <Text style={styles.filterLabel}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSort(option.value);
                  setPage(1);
                }}
                style={[styles.option, sort === option.value && styles.optionActive]}
              >
                <Text style={sort === option.value ? styles.optionTextActive : styles.optionText}>
                  {option.label}
                </Text>
              </Pressable>
            ))}

            <Text style={styles.filterLabel}>Status</Text>
            {STATUS_OPTIONS.map((option) => (
              <Pressable
                key={option.value || 'all'}
                onPress={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                style={[styles.option, status === option.value && styles.optionActive]}
              >
                <Text style={status === option.value ? styles.optionTextActive : styles.optionText}>
                  {option.label}
                </Text>
              </Pressable>
            ))}

            <Text style={styles.filterLabel}>Type</Text>
            {types.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => toggleInList(selectedTypes, setSelectedTypes, String(type.id))}
                style={[
                  styles.option,
                  selectedTypes.includes(String(type.id)) && styles.optionActive,
                ]}
              >
                <Text
                  style={
                    selectedTypes.includes(String(type.id))
                      ? styles.optionTextActive
                      : styles.optionText
                  }
                >
                  {type.name}
                </Text>
              </Pressable>
            ))}

            <Text style={styles.filterLabel}>Categories</Text>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() =>
                  toggleInList(selectedCategories, setSelectedCategories, String(cat.id))
                }
                style={[
                  styles.option,
                  selectedCategories.includes(String(cat.id)) && styles.optionActive,
                ]}
              >
                <Text
                  style={
                    selectedCategories.includes(String(cat.id))
                      ? styles.optionTextActive
                      : styles.optionText
                  }
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}

            <Text style={styles.filterLabel}>Authors</Text>
            {authors.map((author) => (
              <Pressable
                key={author.id}
                onPress={() =>
                  toggleInList(selectedAuthors, setSelectedAuthors, String(author.id))
                }
                style={[
                  styles.option,
                  selectedAuthors.includes(String(author.id)) && styles.optionActive,
                ]}
              >
                <Text
                  style={
                    selectedAuthors.includes(String(author.id))
                      ? styles.optionTextActive
                      : styles.optionText
                  }
                >
                  {author.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.applyBtn} onPress={() => setFiltersOpen(false)}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.almond },
  content: { paddingBottom: 24 },
  header: { padding: 16, gap: 4 },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy },
  count: { fontSize: 13, color: colors.muted },
  searchWrap: { paddingHorizontal: 16, marginBottom: 12 },
  filterToggle: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.redOrange,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterToggleText: { color: colors.white, fontWeight: '600' },
  error: { textAlign: 'center', color: colors.muted, padding: 24 },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.almondBorder,
  },
  pageBtnDisabled: { opacity: 0.5 },
  pageBtnText: { color: colors.navy, fontWeight: '600' },
  pageInfo: { color: colors.muted, fontSize: 13 },
  modal: { flex: 1, backgroundColor: colors.almond },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.almondBorder,
    backgroundColor: colors.white,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  close: { color: colors.redOrange, fontWeight: '600' },
  modalContent: { padding: 16, paddingBottom: 100 },
  clearAll: { color: colors.redOrange, fontWeight: '600', marginBottom: 16 },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.almondBorder,
  },
  optionActive: {
    backgroundColor: `${colors.redOrange}22`,
    borderColor: colors.redOrange,
  },
  optionText: { color: colors.navy },
  optionTextActive: { color: colors.redOrange, fontWeight: '600' },
  applyBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.navy,
    padding: 16,
    alignItems: 'center',
  },
  applyBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
