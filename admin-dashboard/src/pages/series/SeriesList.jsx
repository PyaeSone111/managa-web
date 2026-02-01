import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function SeriesList() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-series', page],
    queryFn: () => adminApi.getSeries({ page, per_page: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-series']);
    },
  });

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete series: ' + error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indiana-clay"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-indiana-clay/20 border border-indiana-clay/30 rounded-lg p-4">
          <p className="text-indiana-clay">Error loading series: {error.message}</p>
        </div>
      </Layout>
    );
  }

  const series = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-torrefacto-roast">Series Management</h1>
          <Link
            to="/dashboard/series/create"
            className="px-4 py-2 bg-indiana-clay text-white rounded-lg hover:bg-indiana-clay/90 transition-colors"
          >
            + Add New Series
          </Link>
        </div>

        <div className="bg-bonaire rounded-lg shadow overflow-hidden border border-stone-lion/20">
          <table className="min-w-full divide-y divide-stone-lion/20">
            <thead className="bg-stone-lion/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-torrefacto-roast uppercase tracking-wider">
                  Thumbnail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bonaire divide-y divide-stone-lion/20">
              {series.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-stone-lion">
                    No series found. Create your first series!
                  </td>
                </tr>
              ) : (
                series.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-lion/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.thumbnail_url || '/placeholder.jpg'}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-torrefacto-roast">{item.title}</div>
                      <div className="text-sm text-stone-lion">{item.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-lion">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'ongoing'
                            ? 'bg-green-bottle/20 text-green-bottle'
                            : item.status === 'completed'
                            ? 'bg-indiana-clay/20 text-indiana-clay'
                            : 'bg-stone-lion/20 text-stone-lion'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-lion">
                      {item.total_chapters}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/dashboard/series/${item.id}/edit`}
                        className="text-indiana-clay hover:text-indiana-clay/80"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-indiana-clay hover:text-indiana-clay/80"
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
              className="px-4 py-2 border border-stone-lion/40 rounded-lg disabled:opacity-50 text-torrefacto-roast hover:bg-stone-lion/20"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={page === pagination.last_page}
              className="px-4 py-2 border border-stone-lion/40 rounded-lg disabled:opacity-50 text-torrefacto-roast hover:bg-stone-lion/20"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SeriesList;

