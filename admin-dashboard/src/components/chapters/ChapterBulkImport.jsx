import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { adminApi } from '../../services/api';

const TEMPLATE_HEADERS = [
  'Manga ID',
  'Chapter Number',
  'Chapter Title',
  'MediaFire Folder URL',
];

const HEADER_MAP = {
  'manga id': 'series_id',
  'series id': 'series_id',
  'series_id': 'series_id',
  'chapter number': 'chapter_number',
  'chapter_number': 'chapter_number',
  'chapter title': 'title',
  'title': 'title',
  'mediafire folder url': 'mediafire_folder_url',
  'mediafire_folder_url': 'mediafire_folder_url',
  'folder url': 'mediafire_folder_url',
};

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase();
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

  const required = ['series_id', 'chapter_number', 'mediafire_folder_url'];
  const missing = required.filter((field) => columnMap[field] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Missing required columns. Expected: ${TEMPLATE_HEADERS.join(' | ')}`
    );
  }

  const rows = [];
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const seriesId = row[columnMap.series_id];
    const chapterNumber = row[columnMap.chapter_number];
    const folderUrl = row[columnMap.mediafire_folder_url];

    if (!seriesId && !chapterNumber && !folderUrl) {
      continue;
    }

    rows.push({
      row_number: i + 1,
      series_id: Number(seriesId),
      chapter_number: parseFloat(chapterNumber),
      title: columnMap.title !== undefined ? String(row[columnMap.title] || '').trim() : '',
      mediafire_folder_url: String(folderUrl || '').trim(),
    });
  }

  if (rows.length === 0) {
    throw new Error('No valid data rows found in Excel file');
  }

  return rows;
}

function ChapterBulkImport() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [fileName, setFileName] = useState('');
  const [importResults, setImportResults] = useState(null);

  const importMutation = useMutation({
    mutationFn: (rows) => adminApi.bulkImportChapters({ rows }),
    onSuccess: async (response) => {
      setImportResults(response.data);
      await queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
    },
  });

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      [1, 1, 'Chapter 1', 'https://www.mediafire.com/folder/xxxxx/chapter-1'],
      [1, 2, 'Chapter 2', 'https://www.mediafire.com/folder/yyyyy/chapter-2'],
    ]);
    ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 24 }, { wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chapters');
    XLSX.writeFile(wb, 'chapter_bulk_import_template.xlsx');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError('');
    setParsedRows([]);
    setImportResults(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const rows = parseExcelRows(workbook);

      const invalidRows = rows.filter(
        (row) =>
          !row.series_id ||
          Number.isNaN(row.chapter_number) ||
          !row.mediafire_folder_url.includes('mediafire.com')
      );

      if (invalidRows.length > 0) {
        throw new Error(
          `Invalid data on row(s): ${invalidRows.map((r) => r.row_number).join(', ')}. ` +
            'Each row needs Manga ID, Chapter Number, and a valid MediaFire folder URL.'
        );
      }

      setParsedRows(rows);
    } catch (error) {
      setParseError(error.message || 'Failed to parse Excel file');
      setParsedRows([]);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setImportResults(null);
    try {
      await importMutation.mutateAsync(parsedRows);
    } catch (error) {
      alert('Import failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleClear = () => {
    setParsedRows([]);
    setParseError('');
    setFileName('');
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Bulk Import Chapters</h2>
          <p className="text-sm text-gray-500 mt-1">
            Import multiple chapters from Excel. Page images are fetched from each MediaFire folder URL.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-50 whitespace-nowrap"
        >
          Download Excel Template
        </button>
      </div>

      <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Upload Excel File (.xlsx)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {fileName && !parseError && parsedRows.length > 0 && (
          <p className="text-sm text-green-600">
            {fileName}: {parsedRows.length} chapter(s) ready to import
          </p>
        )}

        {parseError && (
          <p className="text-sm text-red-600">{parseError}</p>
        )}
      </div>

      {parsedRows.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Row</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Manga ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Chapter #</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">MediaFire URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parsedRows.slice(0, 10).map((row) => (
                <tr key={row.row_number}>
                  <td className="px-4 py-2">{row.row_number}</td>
                  <td className="px-4 py-2">{row.series_id}</td>
                  <td className="px-4 py-2">{row.chapter_number}</td>
                  <td className="px-4 py-2">{row.title || '-'}</td>
                  <td className="px-4 py-2 truncate max-w-xs" title={row.mediafire_folder_url}>
                    {row.mediafire_folder_url}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {parsedRows.length > 10 && (
            <p className="text-xs text-gray-500 px-4 py-2">
              Showing first 10 of {parsedRows.length} rows
            </p>
          )}
        </div>
      )}

      {importResults && (
        <div className="rounded-lg border border-gray-200 p-4 space-y-2">
          <p className="text-sm font-medium text-gray-900">
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
                {result.page_count ? ` (${result.page_count} pages)` : ''}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={parsedRows.length === 0 || importMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {importMutation.isPending ? 'Importing...' : `Import ${parsedRows.length || ''} Chapters`}
        </button>
        {(parsedRows.length > 0 || fileName) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={importMutation.isPending}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default ChapterBulkImport;
