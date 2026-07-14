import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { adminApi } from '../../services/api';

const TEMPLATE_HEADERS = ['Name', 'Slug', 'Bio', 'Image URL'];

const HEADER_MAP = {
  name: 'name',
  slug: 'slug',
  bio: 'bio',
  'image url': 'image_url',
  image_url: 'image_url',
  image: 'image_url',
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

  if (columnMap.name === undefined) {
    throw new Error(
      `Missing required column "Name". Expected: ${TEMPLATE_HEADERS.join(' | ')}`
    );
  }

  const rows = [];
  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    const name = String(row[columnMap.name] || '').trim();
    const slug =
      columnMap.slug !== undefined ? String(row[columnMap.slug] || '').trim() : '';
    const bio =
      columnMap.bio !== undefined ? String(row[columnMap.bio] || '').trim() : '';
    const imageUrl =
      columnMap.image_url !== undefined
        ? String(row[columnMap.image_url] || '').trim()
        : '';

    if (!name && !slug && !bio && !imageUrl) {
      continue;
    }

    rows.push({
      row_number: i + 1,
      name,
      slug,
      bio,
      image_url: imageUrl,
    });
  }

  if (rows.length === 0) {
    throw new Error('No valid data rows found in Excel file');
  }

  return rows;
}

function AuthorBulkImport() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [fileName, setFileName] = useState('');
  const [importResults, setImportResults] = useState(null);

  const importMutation = useMutation({
    mutationFn: (rows) => adminApi.bulkImportAuthors({ rows }),
    onSuccess: async (response) => {
      setImportResults(response?.data);
      await queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ['Kentaro Miura', 'kentaro-miura', 'Creator of Berserk', ''],
      ['ONE', '', 'Author of One Punch Man', ''],
    ]);
    ws['!cols'] = [{ wch: 24 }, { wch: 20 }, { wch: 40 }, { wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Authors');
    XLSX.writeFile(wb, 'author_bulk_import_template.xlsx');
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

      const invalidRows = rows.filter((row) => !row.name);
      if (invalidRows.length > 0) {
        throw new Error(
          `Missing name on row(s): ${invalidRows.map((r) => r.row_number).join(', ')}`
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
          <h2 className="text-lg font-semibold text-gray-900">Bulk Import Authors</h2>
          <p className="text-sm text-gray-500 mt-1">
            Import authors from Excel. Existing names are skipped. Slug is optional
            (auto-generated from name).
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
            {fileName}: {parsedRows.length} author(s) ready to import
          </p>
        )}

        {parseError && <p className="text-sm text-red-600">{parseError}</p>}
      </div>

      {parsedRows.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Row</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Slug</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Bio</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Image URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parsedRows.slice(0, 10).map((row) => (
                <tr key={row.row_number}>
                  <td className="px-4 py-2">{row.row_number}</td>
                  <td className="px-4 py-2">{row.name}</td>
                  <td className="px-4 py-2">{row.slug || '—'}</td>
                  <td className="px-4 py-2 truncate max-w-xs" title={row.bio}>
                    {row.bio || '—'}
                  </td>
                  <td className="px-4 py-2 truncate max-w-xs" title={row.image_url}>
                    {row.image_url || '—'}
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
            Import complete: {importResults.imported} imported, {importResults.skipped}{' '}
            skipped, {importResults.failed} failed
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
          {importMutation.isPending
            ? 'Importing...'
            : `Import ${parsedRows.length || ''} Authors`}
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

export default AuthorBulkImport;
