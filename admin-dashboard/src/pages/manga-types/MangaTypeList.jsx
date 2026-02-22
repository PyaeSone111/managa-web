import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function MangaTypeList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['manga-types'],
    queryFn: () => adminApi.getMangaTypes(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteMangaType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['manga-types'] });
      queryClient.refetchQueries({ queryKey: ['manga-types'] });
    },
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Error: ' + (error.message || 'Failed to delete manga type'));
      }
    }
  };

  const types = data?.data || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manga Types</h1>
          <Link
            to="/dashboard/manga-types/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Type
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : types.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No manga types found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Series Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {types.map((type) => (
                  <tr key={type.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{type.name}</td>
                    <td className="px-6 py-4 text-gray-500">{type.slug}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{type.series_count || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/dashboard/manga-types/${type.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(type.id, type.name)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deleteMutation.isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MangaTypeList;
