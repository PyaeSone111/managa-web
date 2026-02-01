import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function CategoryList() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete category: ' + error.message);
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
          <p className="text-indiana-clay">Error loading categories: {error.message}</p>
        </div>
      </Layout>
    );
  }

  const categories = data?.data || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-torrefacto-roast">Categories Management</h1>
          <Link
            to="/dashboard/categories/create"
            className="px-4 py-2 bg-indiana-clay text-white rounded-lg hover:bg-indiana-clay/90 transition-colors"
          >
            + Add New Category
          </Link>
        </div>

        <div className="bg-bonaire rounded-lg shadow overflow-hidden border border-stone-lion/20">
          <table className="min-w-full divide-y divide-stone-lion/20">
            <thead className="bg-stone-lion/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-torrefacto-roast uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-torrefacto-roast uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-torrefacto-roast uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-torrefacto-roast uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bonaire divide-y divide-stone-lion/20">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-stone-lion">
                    No categories found. Create your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-stone-lion/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-torrefacto-roast">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-lion">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-lion">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/dashboard/categories/${category.id}/edit`}
                        className="text-indiana-clay hover:text-indiana-clay/80"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
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
      </div>
    </Layout>
  );
}

export default CategoryList;

