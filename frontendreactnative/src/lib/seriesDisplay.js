export function getSeriesAuthorLabel(series) {
  if (!series) return '—';

  if (series.authors?.length) {
    const names = series.authors
      .map((author) => (typeof author === 'object' ? author.name : author))
      .filter(Boolean);
    if (names.length) return names.join(', ');
  }

  if (series.author) return series.author;
  if (series.artist) return series.artist;

  return '—';
}

export function getSeriesTypeLabel(series) {
  if (!series) return '—';

  const typeList =
    series.manga_types ||
    series.mangaTypes ||
    series.types ||
    (series.manga_type ? [series.manga_type] : null);

  if (Array.isArray(typeList) && typeList.length > 0) {
    const names = typeList
      .map((type) => (typeof type === 'object' ? type.name : type))
      .filter(Boolean);
    if (names.length) return names.join(', ');
  }

  if (series.categories?.length) {
    const category = series.categories[0];
    const name = typeof category === 'object' ? category.name : category;
    if (name) return name;
  }

  if (series.type) {
    const value = String(series.type);
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  return '—';
}
