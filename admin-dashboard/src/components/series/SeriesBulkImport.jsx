import { useState, useRef, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { adminApi } from '../../services/api';

const TEMPLATE_HEADERS = [
  'Title',
  'Description',
  'Authors',
  'Image URL',
  'MediaFire Folder URL',
  'Pages Per Chapter',
  'Series Type',
  'Status',
];

const HEADER_MAP = {
  title: 'title',
  name: 'title',
  description: 'description',
  desc: 'description',
  authors: 'authors',
  author: 'authors',
  'image url': 'image_url',
  image_url: 'image_url',
  image: 'image_url',
  thumbnail: 'image_url',
  'thumbnail url': 'image_url',
  cover: 'image_url',
  'cover url': 'image_url',
  'mediafire folder url': 'mediafire_folder_url',
  mediafire_folder_url: 'mediafire_folder_url',
  'folder url': 'mediafire_folder_url',
  'pages per chapter': 'pages_per_chapter',
  pages_per_chapter: 'pages_per_chapter',
  pages: 'pages_per_chapter',
  'series type': 'type',
  type: 'type',
  status: 'status',
};

const VALID_STATUSES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
];

const LEGACY_TYPE_SLUGS = ['manga', 'manhwa', 'manhua'];

function legacyTypeFromSlug(slug) {
  const normalized = String(slug || '').toLowerCase();
  return LEGACY_TYPE_SLUGS.includes(normalized) ? normalized : 'manga';
}

/** Match Excel "Series Type" cell to a manga_types record (name, slug, or English slug). */
export function resolveMangaType(rawValue, mangaTypes = []) {
  const typeRaw = String(rawValue || '').trim();

  if (!typeRaw || mangaTypes.length === 0) {
    return {
      type_raw: typeRaw,
      type_id: '',
      type_matched: false,
      type_confirmed: false,
      type: '',
      type_name: '',
    };
  }

  const lower = typeRaw.toLowerCase();
  const found =
    mangaTypes.find((t) => t.name.trim() === typeRaw) ||
    mangaTypes.find((t) => t.slug?.toLowerCase() === lower) ||
    mangaTypes.find((t) => t.name?.toLowerCase() === lower);

  return {
    type_raw: typeRaw,
    type_id: found?.id ?? '',
    type_matched: Boolean(found),
    type_confirmed: Boolean(found),
    type: found ? legacyTypeFromSlug(found.slug) : '',
    type_name: found?.name ?? '',
  };
}

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase();
}

/** Read cell text or Excel hyperlink target (URL columns often store link separately). */
function readSheetCell(sheet, rowIndex, colIndex) {
  const addr = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
  const cell = sheet[addr];
  if (!cell) return '';

  if (cell.l?.Target) {
    return String(cell.l.Target).trim();
  }

  const value = cell.w ?? cell.v ?? '';
  return String(value).trim();
}

function normalizeImageUrl(value) {
  let url = String(value || '').trim();
  if (!url) return '';

  // Decode Excel/URI encoding so MediaFire view links stay intact
  try {
    url = decodeURI(url);
  } catch {
    // keep original when not URI-encoded
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url;
}

function isMediaFireViewUrl(url) {
  return /mediafire\.com\/(view|file)\/[a-zA-Z0-9]+\/.+/i.test(String(url || ''));
}

function parseTypeField(rawValue) {
  const typeRaw = String(rawValue || '').trim();
  return {
    type_raw: typeRaw,
    type_id: '',
    type_matched: false,
    type_confirmed: false,
    type: '',
    type_name: '',
  };
}

function parseStatusField(rawValue) {
  const statusRaw = String(rawValue || '').trim();
  const normalized = statusRaw.toLowerCase();
  const matched = VALID_STATUSES.some((s) => s.value === normalized);

  return {
    status_raw: statusRaw,
    status: matched ? normalized : 'ongoing',
    status_matched: matched,
  };
}

export function resolveAuthorBindings(authorsStr, authorList = []) {
  const names = String(authorsStr || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return { bindings: [], allBound: false, hasAuthors: false };
  }

  const bindings = names.map((name) => {
    const existing = authorList.find((a) => a.name.trim() === name);
    if (existing) {
      return { name, status: 'existing', id: existing.id };
    }
    return { name, status: 'new' };
  });

  return {
    bindings,
    hasAuthors: true,
    allBound: bindings.every((b) => b.status === 'existing'),
  };
}

function enrichRow(row, authorList, mangaTypes = []) {
  const authorMeta = resolveAuthorBindings(row.authors, authorList);

  let type_id = row.type_id;
  let type_matched = row.type_matched;
  let type = row.type;
  let type_name = row.type_name;
  let type_confirmed = row.type_confirmed;

  if (!type_confirmed && row.type_raw && mangaTypes.length > 0) {
    const resolved = resolveMangaType(row.type_raw, mangaTypes);
    type_id = resolved.type_id;
    type_matched = resolved.type_matched;
    type = resolved.type;
    type_name = resolved.type_name;
    type_confirmed = resolved.type_confirmed;
  } else if (type_confirmed && type_id && mangaTypes.length > 0) {
    const selected = mangaTypes.find((t) => String(t.id) === String(type_id));
    if (selected) {
      type_name = selected.name;
      type = legacyTypeFromSlug(selected.slug);
      if (row.type_raw) {
        type_matched =
          selected.name.trim() === row.type_raw ||
          selected.slug?.toLowerCase() === row.type_raw.toLowerCase() ||
          selected.name?.toLowerCase() === row.type_raw.toLowerCase();
      }
    }
  }

  return {
    ...row,
    type_id,
    type_matched,
    type,
    type_name,
    type_confirmed,
    author_bindings: authorMeta.bindings,
    authors_bound: authorMeta.hasAuthors && authorMeta.allBound,
    authors_has_value: authorMeta.hasAuthors,
  };
}

function parseExcelRows(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    throw new Error('Excel file is empty or has no data rows');
  }

  const headerRow = rawRows[0];
  const columnMap = {};

  headerRow.forEach((header, index) => {
    const key = HEADER_MAP[normalizeHeader(header)];
    if (key) {
      columnMap[key] = index;
    }
  });

  const required = ['title', 'mediafire_folder_url'];
  const missing = required.filter((field) => columnMap[field] === undefined);
  if (missing.length > 0) {
    throw new Error(
      'Missing required columns. Expected at least: Title | MediaFire Folder URL'
    );
  }

  const rows = [];
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const title = String(row[columnMap.title] || '').trim();
    const folderUrl =
      columnMap.mediafire_folder_url !== undefined
        ? readSheetCell(sheet, i, columnMap.mediafire_folder_url)
        : '';
    const pagesRaw =
      columnMap.pages_per_chapter !== undefined ? row[columnMap.pages_per_chapter] : '';
    const pagesPerChapter =
      pagesRaw === '' || pagesRaw === null || pagesRaw === undefined
        ? null
        : parseInt(pagesRaw, 10);

    if (!title && !folderUrl) {
      continue;
    }

    const typeField = columnMap.type !== undefined
      ? parseTypeField(row[columnMap.type])
      : parseTypeField('');
    const statusField = columnMap.status !== undefined
      ? parseStatusField(row[columnMap.status])
      : parseStatusField('ongoing');

    rows.push({
      row_number: i + 1,
      title,
      description: columnMap.description !== undefined ? readSheetCell(sheet, i, columnMap.description) : '',
      authors: columnMap.authors !== undefined ? readSheetCell(sheet, i, columnMap.authors) : '',
      image_url:
        columnMap.image_url !== undefined
          ? normalizeImageUrl(readSheetCell(sheet, i, columnMap.image_url))
          : '',
      mediafire_folder_url: folderUrl,
      pages_per_chapter: pagesPerChapter,
      ...typeField,
      ...statusField,
    });
  }

  if (rows.length === 0) {
    throw new Error('No valid data rows found in Excel file');
  }

  return rows;
}

function toApiRow(row) {
  return {
    row_number: row.row_number,
    title: row.title,
    description: row.description || '',
    authors: row.authors || '',
    image_url: row.image_url ? normalizeImageUrl(row.image_url) : '',
    mediafire_folder_url: row.mediafire_folder_url,
    pages_per_chapter: row.pages_per_chapter || null,
    type_ids: row.type_id ? [row.type_id] : [],
    type: row.type || 'manga',
    status: row.status,
  };
}

function TypeBindingBadge({ row }) {
  if (!row.type_id) {
    return (
      <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
        Type required
      </span>
    );
  }
  if (row.type_matched && row.type_raw) {
    return (
      <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
        Matched
      </span>
    );
  }
  return (
    <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
      Manual
    </span>
  );
}

function AuthorBindingBadges({ row }) {
  if (!row.authors_has_value) {
    return (
      <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
        No authors
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {row.author_bindings?.map((b) => (
        <span
          key={b.name}
          className={`inline-flex text-[10px] px-1.5 py-0.5 rounded ${
            b.status === 'existing'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-800'
          }`}
          title={b.status === 'existing' ? `Existing author #${b.id}` : 'Will create new author'}
        >
          {b.status === 'existing' ? `#${b.id}` : 'new'} {b.name}
        </span>
      ))}
    </div>
  );
}

function SeriesBulkImport() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [fileName, setFileName] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [importError, setImportError] = useState('');
  const [importBatchId, setImportBatchId] = useState(null);
  const [importProgress, setImportProgress] = useState(null);

  const isImportRunning = Boolean(importBatchId);

  const { data: authorsData } = useQuery({
    queryKey: ['authors', 'import-bindings'],
    queryFn: () => adminApi.getAuthors({ per_page: 1000 }),
  });

  const { data: mangaTypesData } = useQuery({
    queryKey: ['manga-types'],
    queryFn: () => adminApi.getMangaTypes(),
  });

  const authorList = authorsData?.data || [];
  const mangaTypes = mangaTypesData?.data || [];

  useEffect(() => {
    if (parsedRows.length > 0 && (authorList.length > 0 || mangaTypes.length > 0)) {
      setParsedRows((prev) => prev.map((row) => enrichRow(row, authorList, mangaTypes)));
    }
  }, [authorList, mangaTypes, parsedRows.length]);

  const reviewStats = useMemo(() => {
    const typeMissing = parsedRows.filter((r) => !r.type_id).length;
    const typeFromExcelUnrecognized = parsedRows.filter(
      (r) => r.type_raw && !r.type_matched
    ).length;
    const authorsMissing = parsedRows.filter((r) => !r.authors_has_value).length;
    const authorsNew = parsedRows.filter(
      (r) => r.authors_has_value && !r.authors_bound
    ).length;
    const authorsBound = parsedRows.filter((r) => r.authors_bound).length;

    return {
      typeMissing,
      typeFromExcelUnrecognized,
      authorsMissing,
      authorsNew,
      authorsBound,
      ready: typeMissing === 0,
    };
  }, [parsedRows]);

  const { data: batchStatusData } = useQuery({
    queryKey: ['series-import-batch', importBatchId],
    queryFn: () => adminApi.getSeriesBulkImportStatus(importBatchId),
    enabled: Boolean(importBatchId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === 'completed' || status === 'failed' ? false : 2000;
    },
  });

  useEffect(() => {
    const batch = batchStatusData?.data;
    if (!batch) return;

    setImportProgress({
      status: batch.status,
      processed: batch.processed,
      total: batch.total,
      progress_percent: batch.progress_percent,
      imported: batch.imported,
      skipped: batch.skipped,
      failed: batch.failed,
      results: batch.results,
    });

    if (batch.status === 'completed') {
      setImportResults({
        imported: batch.imported,
        skipped: batch.skipped,
        failed: batch.failed,
        results: batch.results,
      });
      setImportBatchId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-series'] });
    }
  }, [batchStatusData, queryClient]);

  const importMutation = useMutation({
    mutationFn: (rows) => adminApi.bulkImportSeries({ rows: rows.map(toApiRow) }),
    onSuccess: async (response) => {
      const data = response?.data;
      setImportError('');

      if (data?.batch_id) {
        setImportResults(null);
        setImportBatchId(data.batch_id);
        setImportProgress({
          status: data.status || 'pending',
          processed: data.processed ?? 0,
          total: data.total ?? 0,
          progress_percent: data.progress_percent ?? 0,
          imported: data.imported ?? 0,
          skipped: data.skipped ?? 0,
          failed: data.failed ?? 0,
          results: data.results ?? [],
        });
        return;
      }

      setImportResults(data);
      await queryClient.invalidateQueries({ queryKey: ['admin-series'] });
    },
    onError: (error) => {
      const msg = error.message || 'Unknown error';
      const detail = error.errors
        ? Object.entries(error.errors)
            .slice(0, 5)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('\n')
        : '';
      setImportError(detail ? `${msg}\n${detail}` : msg);
    },
  });

  const applyRows = (rows) => {
    setParsedRows(rows.map((row) => enrichRow(row, authorList, mangaTypes)));
  };

  const updateRow = (rowNumber, updates) => {
    setParsedRows((prev) =>
      prev.map((row) => {
        if (row.row_number !== rowNumber) return row;
        const merged = { ...row, ...updates };

        if ('authors' in updates) {
          const authorMeta = resolveAuthorBindings(merged.authors, authorList);
          merged.author_bindings = authorMeta.bindings;
          merged.authors_bound = authorMeta.hasAuthors && authorMeta.allBound;
          merged.authors_has_value = authorMeta.hasAuthors;
        }

        if ('type_id' in updates) {
          merged.type_confirmed = Boolean(merged.type_id);
          const selected = mangaTypes.find((t) => String(t.id) === String(merged.type_id));
          merged.type_name = selected?.name || '';
          merged.type = selected ? legacyTypeFromSlug(selected.slug) : '';
          if (merged.type_raw && selected) {
            merged.type_matched =
              selected.name.trim() === merged.type_raw ||
              selected.slug?.toLowerCase() === merged.type_raw.toLowerCase() ||
              selected.name?.toLowerCase() === merged.type_raw.toLowerCase();
          } else {
            merged.type_matched = false;
          }
        }

        if ('status' in updates) {
          merged.status_matched = VALID_STATUSES.some((s) => s.value === merged.status);
        }

        return merged;
      })
    );
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      [
        'Solo Leveling',
        'A hunter grows stronger in a monster-filled world.',
        'Chugong, Dubu',
        'https://www.mediafire.com/view/bya154gqmz2iod9/cover.jpg/file',
        'https://www.mediafire.com/folder/xxxxx/solo-leveling',
        '',
        'manhwa',
        'ongoing',
      ],
    ]);
    ws['!cols'] = [
      { wch: 24 }, { wch: 36 }, { wch: 24 }, { wch: 36 }, { wch: 50 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Series');
    XLSX.writeFile(wb, 'series_bulk_import_template.xlsx');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError('');
    setParsedRows([]);
    setImportResults(null);
    setImportError('');
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const rows = parseExcelRows(workbook);

      const invalidRows = rows.filter(
        (row) =>
          !row.title ||
          !row.mediafire_folder_url.includes('mediafire.com') ||
          (row.pages_per_chapter !== null &&
            (Number.isNaN(row.pages_per_chapter) || row.pages_per_chapter < 1))
      );

      if (invalidRows.length > 0) {
        throw new Error(
          `Invalid data on row(s): ${invalidRows.map((r) => r.row_number).join(', ')}. ` +
            'Each row needs Title and a valid MediaFire folder URL. Pages Per Chapter is optional (≥ 1 if set).'
        );
      }

      applyRows(rows);
    } catch (error) {
      setParseError(error.message || 'Failed to parse Excel file');
      setParsedRows([]);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    const typeMissing = parsedRows.filter((r) => !r.type_id);
    if (typeMissing.length > 0) {
      setImportError(
        `Select a manga type for row(s): ${typeMissing.map((r) => r.row_number).join(', ')}`
      );
      return;
    }

    setImportResults(null);
    setImportError('');
    try {
      await importMutation.mutateAsync(parsedRows);
    } catch {
      // onError handler sets importError
    }
  };

  const handleClear = () => {
    setParsedRows([]);
    setParseError('');
    setFileName('');
    setImportResults(null);
    setImportError('');
    setImportBatchId(null);
    setImportProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-bonaire rounded-lg border border-stone-lion/20 shadow-sm p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-torrefacto-roast">Bulk Import Series</h2>
          <p className="text-sm text-stone-lion mt-1">
            Import series with chapters from a MediaFire folder. Leave{' '}
            <strong>Pages Per Chapter</strong> empty to auto-pick a balanced size (~20 pages,
            avoiding tiny last chapters). Imports run in the background (queue jobs). Review and
            fix <strong>Series Type</strong> and <strong>Authors</strong> bindings before importing.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-4 py-2 border border-indiana-clay text-indiana-clay rounded-lg hover:bg-indiana-clay/10 whitespace-nowrap"
        >
          Download Excel Template
        </button>
      </div>

      <div className="border border-dashed border-stone-lion/30 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-torrefacto-roast">
          Upload Excel File (.xlsx)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-stone-lion file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indiana-clay/10 file:text-indiana-clay hover:file:bg-indiana-clay/20"
        />

        {fileName && !parseError && parsedRows.length > 0 && (
          <p className="text-sm text-green-700">
            {fileName}: {parsedRows.length} series loaded — review bindings below
          </p>
        )}

        {parseError && <p className="text-sm text-red-600">{parseError}</p>}
      </div>

      {parsedRows.length > 0 && (
        <>
          <div
            className={`rounded-lg border p-4 text-sm space-y-1 ${
              reviewStats.ready
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <p className="font-medium">Binding review</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>
                Series type: {reviewStats.typeMissing} need selection
                {reviewStats.typeFromExcelUnrecognized > 0 &&
                  ` · ${reviewStats.typeFromExcelUnrecognized} unrecognized from Excel (pick from your manga types)`}
              </li>
              <li>
                Authors: {reviewStats.authorsBound} fully bound to existing
                {reviewStats.authorsNew > 0 && ` · ${reviewStats.authorsNew} will create new author(s)`}
                {reviewStats.authorsMissing > 0 && ` · ${reviewStats.authorsMissing} missing authors`}
              </li>
            </ul>
            {!reviewStats.ready && (
              <p className="text-xs pt-1">
                Fix rows marked <strong>Type required</strong> using the dropdown before importing.
              </p>
            )}
          </div>

          <div className="overflow-x-auto border border-stone-lion/20 rounded-lg max-h-[480px] overflow-y-auto">
            <table className="min-w-full divide-y divide-stone-lion/20 text-sm">
              <thead className="bg-stone-lion/10 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion w-10">#</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion min-w-[140px]">Title</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion min-w-[180px]">Cover URL</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion min-w-[180px]">Authors</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion min-w-[130px]">Series Type</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion min-w-[110px]">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-stone-lion w-16">Pages/Ch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-lion/10">
                {parsedRows.map((row) => (
                  <tr key={row.row_number} className={!row.type_id ? 'bg-red-50/50' : ''}>
                    <td className="px-3 py-2 align-top">{row.row_number}</td>
                    <td className="px-3 py-2 align-top">
                      <span className="line-clamp-2" title={row.title}>
                        {row.title}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="url"
                        value={row.image_url}
                        onChange={(e) =>
                          updateRow(row.row_number, {
                            image_url: normalizeImageUrl(e.target.value),
                          })
                        }
                        placeholder="https://… cover image"
                        className="w-full min-w-[180px] px-2 py-1 text-xs border border-stone-lion/30 rounded bg-white"
                      />
                      {row.image_url ? (
                        <>
                          {isMediaFireViewUrl(row.image_url) && (
                            <p className="text-[10px] text-blue-700 mt-0.5">
                              MediaFire view link — resolved to direct image on import
                            </p>
                          )}
                          <img
                            src={row.image_url}
                            alt=""
                            className="mt-1 h-10 w-8 object-cover rounded border border-stone-lion/20"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </>
                      ) : (
                        <p className="text-[10px] text-stone-lion mt-0.5">Optional — uses first MediaFire page if empty</p>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        value={row.authors}
                        onChange={(e) => updateRow(row.row_number, { authors: e.target.value })}
                        placeholder="Author names, comma separated"
                        className="w-full min-w-[160px] px-2 py-1 text-xs border border-stone-lion/30 rounded bg-white"
                      />
                      <AuthorBindingBadges row={row} />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        value={row.type_id}
                        onChange={(e) =>
                          updateRow(row.row_number, {
                            type_id: e.target.value ? Number(e.target.value) : '',
                          })
                        }
                        className={`w-full px-2 py-1 text-xs border rounded bg-white ${
                          !row.type_id ? 'border-red-400' : 'border-stone-lion/30'
                        }`}
                      >
                        <option value="">— Select type —</option>
                        {mangaTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      {row.type_raw && (
                        <p className="text-[10px] text-stone-lion mt-0.5 truncate" title={row.type_raw}>
                          Excel: {row.type_raw}
                        </p>
                      )}
                      <div className="mt-1">
                        <TypeBindingBadge row={row} />
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        value={row.status}
                        onChange={(e) => updateRow(row.row_number, { status: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-stone-lion/30 rounded bg-white"
                      >
                        {VALID_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {row.status_raw && !row.status_matched && (
                        <p className="text-[10px] text-amber-700 mt-0.5 truncate" title={row.status_raw}>
                          Excel: {row.status_raw} → ongoing
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {row.pages_per_chapter || (
                        <span className="text-stone-lion italic" title="Will auto-calculate (~20 pages, balanced last chapter)">
                          Auto
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {importProgress && isImportRunning && (
        <div className="rounded-lg border border-indiana-clay/30 bg-indiana-clay/5 p-4 space-y-2">
          <p className="text-sm font-medium text-torrefacto-roast">
            Import in progress — {importProgress.processed} / {importProgress.total} series
            {importProgress.status === 'processing' ? ' (processing)' : ' (queued)'}
          </p>
          <div className="h-2 bg-stone-lion/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-indiana-clay transition-all duration-500"
              style={{ width: `${importProgress.progress_percent ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-stone-lion">
            Each series downloads from MediaFire in a background job. Keep this page open or check
            back — the series list updates when complete.
          </p>
          {importProgress.results?.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-0.5 pt-1">
              {importProgress.results.map((result) => (
                <p
                  key={`progress-${result.row}-${result.status}`}
                  className={`text-xs ${
                    result.status === 'success'
                      ? 'text-green-700'
                      : result.status === 'skipped'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}
                >
                  Row {result.row}: {result.status}
                  {result.message ? ` — ${result.message}` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {importError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 whitespace-pre-wrap">
          {importError}
        </div>
      )}

      {importResults && (
        <div className="rounded-lg border border-stone-lion/20 p-4 space-y-2">
          <p className="text-sm font-medium text-torrefacto-roast">
            Import complete: {importResults.imported} imported, {importResults.skipped} skipped,{' '}
            {importResults.failed} failed
          </p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {importResults.results?.map((result) => (
              <p
                key={result.row}
                className={`text-xs ${
                  result.status === 'success'
                    ? 'text-green-700'
                    : result.status === 'skipped'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}
              >
                Row {result.row}: {result.status}
                {result.message ? ` — ${result.message}` : ''}
                {result.series_id ? ` (Series ID: ${result.series_id})` : ''}
                {result.chapters_created ? ` — ${result.chapters_created} chapters` : ''}
                {result.pages_per_chapter ? ` × ${result.pages_per_chapter} pages/ch` : ''}
                {result.total_pages ? `, ${result.total_pages} pages` : ''}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={
            parsedRows.length === 0 ||
            importMutation.isPending ||
            isImportRunning ||
            !reviewStats.ready
          }
          className="px-4 py-2 bg-indiana-clay text-white rounded-lg hover:bg-indiana-clay/90 disabled:opacity-50"
        >
          {importMutation.isPending
            ? 'Queuing...'
            : isImportRunning
            ? 'Import running...'
            : `Import ${parsedRows.length || ''} Series`}
        </button>
        {(parsedRows.length > 0 || fileName) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={importMutation.isPending || isImportRunning}
            className="px-4 py-2 border border-stone-lion/30 rounded-lg hover:bg-stone-lion/10 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default SeriesBulkImport;
