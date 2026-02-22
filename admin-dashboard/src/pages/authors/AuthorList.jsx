import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function AuthorList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['authors', search],
    queryFn: () => adminApi.getAuthors({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteAuthor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authors'] });
      queryClient.refetchQueries({ queryKey: ['authors'] });
    },
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Error: ' + (error.message || 'Failed to delete author'));
      }
    }
  };

  const authors = data?.data || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Authors</h1>
          <Link
            to="/dashboard/authors/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Author
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : authors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No authors found</div>
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
                    Series Count
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {author.image_url ? (
                          <img
                            src={author.image_url}
                            alt={author.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg">
                              {author.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{author.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{author.slug}</td>
                    <td className="px-6 py-4 text-gray-500">{author.series_count || 0}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/dashboard/authors/${author.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(author.id, author.name)}
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

export default AuthorList;
