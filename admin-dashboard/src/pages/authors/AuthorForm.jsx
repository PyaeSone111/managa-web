import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';
import ImageUpload from '../../components/common/ImageUpload';

function AuthorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    image_url: '',
  });

  const { data: authorData } = useQuery({
    queryKey: ['author', id],
    queryFn: () => adminApi.getAuthorById(id),
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (isEdit && authorData?.data) {
      setFormData({
        name: authorData.data.name || '',
        slug: authorData.data.slug || '',
        bio: authorData.data.bio || '',
        image_url: authorData.data.image_url || '',
      });
    }
  }, [isEdit, authorData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? adminApi.updateAuthor(id, data) : adminApi.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['authors']);
      navigate('/dashboard/authors');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to save author'));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Author' : 'Create New Author'}
          </h1>
          <button
            onClick={() => navigate('/dashboard/authors')}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <ImageUpload
            label="Author Image"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            type="avatar"
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/authors')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : isEdit ? 'Update Author' : 'Create Author'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AuthorForm;
