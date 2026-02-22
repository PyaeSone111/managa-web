import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function ChapterList() {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: seriesData } = useQuery({
    queryKey: ['admin-series'],
    queryFn: () => adminApi.getSeries({ per_page: 1000 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-chapters', selectedSeries, page],
    queryFn: () => {
      if (!selectedSeries) return { data: [], pagination: {} };
      return adminApi.getChapters(selectedSeries, { page, per_page: 50 });
    },
    enabled: !!selectedSeries,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteChapter(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-chapters'] });
      queryClient.refetchQueries({ queryKey: ['admin-chapters'] });
    },
  });

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete chapter: ' + error.message);
      }
    }
  };

  const series = seriesData?.data || [];
  const chapters = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Chapters Management</h1>
          <Link
            to="/dashboard/chapters/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Chapter
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Series
          </label>
          <select
            value={selectedSeries}
            onChange={(e) => {
              setSelectedSeries(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select a series --</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {selectedSeries && (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Chapter #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : chapters.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No chapters found for this series.
                      </td>
                    </tr>
                  ) : (
                    chapters.map((chapter) => (
                      <tr key={chapter.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {chapter.chapter_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {chapter.title || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {chapter.page_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              chapter.is_published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {chapter.is_published ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            to={`/dashboard/chapters/${chapter.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(chapter.id, chapter.title || `Chapter ${chapter.chapter_number}`)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.last_page > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                  disabled={page === pagination.last_page}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default ChapterList;

