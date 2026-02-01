import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function TagForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  const { data: tagResponse } = useQuery({
    queryKey: ['tag', id],
    queryFn: () => adminApi.getTagById(id),
    enabled: isEdit && !!id,
  });

  const tagData = tagResponse?.data;

  useEffect(() => {
    if (isEdit && tagData) {
      setFormData({
        name: tagData.name || '',
        slug: tagData.slug || '',
      });
    }
  }, [isEdit, tagData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? adminApi.updateTag(id, data) : adminApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      navigate('/dashboard/tags');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to save tag'));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Tag' : 'Create New Tag'}
          </h1>
          <button
            onClick={() => navigate('/dashboard/tags')}
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/tags')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : isEdit ? 'Update Tag' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default TagForm;

