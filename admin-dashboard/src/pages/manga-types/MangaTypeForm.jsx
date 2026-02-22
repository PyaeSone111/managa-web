import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function MangaTypeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const { data: typeData } = useQuery({
    queryKey: ['manga-type', id],
    queryFn: () => adminApi.getMangaTypeById(id),
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (isEdit && typeData?.data) {
      setFormData({
        name: typeData.data.name || '',
        slug: typeData.data.slug || '',
        description: typeData.data.description || '',
      });
    }
  }, [isEdit, typeData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? adminApi.updateMangaType(id, data) : adminApi.createMangaType(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['manga-types'] });
      queryClient.refetchQueries({ queryKey: ['manga-types'] });
      navigate('/dashboard/manga-types');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to save manga type'));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Manga Type' : 'Create New Manga Type'}
          </h1>
          <button
            onClick={() => navigate('/dashboard/manga-types')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Manga, Manhwa, Manhua"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Auto-generated if empty"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of this type"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/manga-types')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : isEdit ? 'Update Type' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default MangaTypeForm;
