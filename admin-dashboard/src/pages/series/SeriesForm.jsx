import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';
import ImageUpload from '../../components/common/ImageUpload';

function SeriesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '',
    cover_url: '',
    type: 'manga',
    status: 'ongoing',
    author: '',
    artist: '',
    year: new Date().getFullYear(),
    release_date: '',
    category_ids: [],
    tag_ids: [],
    author_ids: [], // [{id, role}]
    type_ids: [],
    alt_names: [], // [{name, language}]
    is_featured: false,
  });

  const { data: seriesResponse } = useQuery({
    queryKey: ['admin-series', id],
    queryFn: () => adminApi.getSeriesById(id),
    enabled: isEdit && !!id,
  });

  const seriesData = seriesResponse?.data;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi.getCategories(),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => adminApi.getTags(),
  });

  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: () => adminApi.getAuthors({ per_page: 100 }),
  });

  const { data: mangaTypesData } = useQuery({
    queryKey: ['manga-types'],
    queryFn: () => adminApi.getMangaTypes(),
  });

  useEffect(() => {
    if (isEdit && seriesData) {
      setFormData({
        title: seriesData.title || '',
        slug: seriesData.slug || '',
        description: seriesData.description || '',
        thumbnail_url: seriesData.thumbnail_url || '',
        cover_url: seriesData.cover_url || '',
        type: seriesData.type || 'manga',
        status: seriesData.status || 'ongoing',
        author: seriesData.author || '',
        artist: seriesData.artist || '',
        year: seriesData.year || new Date().getFullYear(),
        release_date: seriesData.release_date || '',
        category_ids: seriesData.categories?.map((c) => c.id) || [],
        tag_ids: seriesData.tags?.map((t) => t.id) || [],
        author_ids: seriesData.authors?.map((a) => ({ id: a.id, role: a.pivot?.role || 'author' })) || [],
        type_ids: seriesData.manga_types?.map((t) => t.id) || [],
        alt_names: seriesData.alt_names?.map((a) => ({ name: a.name, language: a.language || '' })) || [],
        is_featured: seriesData.is_featured || false,
      });
    }
  }, [isEdit, seriesData]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? adminApi.updateSeries(id, data) : adminApi.createSeries(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-series']);
      navigate('/dashboard/series');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(formData);
    } catch (error) {
      alert('Error: ' + (error.message || 'Failed to save series'));
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((id) => id !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  };

  const handleTypeToggle = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      type_ids: prev.type_ids.includes(typeId)
        ? prev.type_ids.filter((id) => id !== typeId)
        : [...prev.type_ids, typeId],
    }));
  };

  const handleAuthorAdd = (authorId) => {
    if (!formData.author_ids.find((a) => a.id === authorId)) {
      setFormData((prev) => ({
        ...prev,
        author_ids: [...prev.author_ids, { id: authorId, role: 'author' }],
      }));
    }
  };

  const handleAuthorRemove = (authorId) => {
    setFormData((prev) => ({
      ...prev,
      author_ids: prev.author_ids.filter((a) => a.id !== authorId),
    }));
  };

  const handleAuthorRoleChange = (authorId, role) => {
    setFormData((prev) => ({
      ...prev,
      author_ids: prev.author_ids.map((a) =>
        a.id === authorId ? { ...a, role } : a
      ),
    }));
  };

  const handleAltNameAdd = () => {
    setFormData((prev) => ({
      ...prev,
      alt_names: [...prev.alt_names, { name: '', language: '' }],
    }));
  };

  const handleAltNameRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      alt_names: prev.alt_names.filter((_, i) => i !== index),
    }));
  };

  const handleAltNameChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      alt_names: prev.alt_names.map((alt, i) =>
        i === index ? { ...alt, [field]: value } : alt
      ),
    }));
  };

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];
  const authors = authorsData?.data || [];
  const mangaTypes = mangaTypesData?.data || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Series' : 'Create New Series'}
          </h1>
          <button
            onClick={() => navigate('/dashboard/series')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          </div>

          {/* Alternate Names */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Alternate Names
              </label>
              <button
                type="button"
                onClick={handleAltNameAdd}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Name
              </button>
            </div>
            <div className="space-y-2">
              {formData.alt_names.map((alt, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={alt.name}
                    onChange={(e) => handleAltNameChange(index, 'name', e.target.value)}
                    placeholder="Alternative title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={alt.language}
                    onChange={(e) => handleAltNameChange(index, 'language', e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Lang</option>
                    <option value="en">EN</option>
                    <option value="jp">JP</option>
                    <option value="kr">KR</option>
                    <option value="cn">CN</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAltNameRemove(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    X
                  </button>
                </div>
              ))}
              {formData.alt_names.length === 0 && (
                <p className="text-sm text-gray-500 italic">No alternate names added</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              key="thumbnail"
              label="Thumbnail Image"
              value={formData.thumbnail_url}
              onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url }))}
              type="thumbnail"
            />
            <ImageUpload
              key="cover"
              label="Cover Image"
              value={formData.cover_url}
              onChange={(url) => setFormData((prev) => ({ ...prev, cover_url: url }))}
              type="cover"
            />
          </div>

          {/* Status, Year, Release Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Date
              </label>
              <input
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Legacy Author/Artist (for backward compatibility) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author (Legacy)
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Free text author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist (Legacy)
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Free text artist name"
              />
            </div>
          </div>

          {/* Authors (Many-to-Many) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authors (Linked)
            </label>
            <div className="border border-gray-300 rounded-lg p-4 space-y-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAuthorAdd(parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an author to add...</option>
                {authors
                  .filter((a) => !formData.author_ids.find((fa) => fa.id === a.id))
                  .map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
              </select>
              <div className="space-y-2">
                {formData.author_ids.map((authorEntry) => {
                  const author = authors.find((a) => a.id === authorEntry.id);
                  return (
                    <div key={authorEntry.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1 font-medium">{author?.name || `Author #${authorEntry.id}`}</span>
                      <select
                        value={authorEntry.role}
                        onChange={(e) => handleAuthorRoleChange(authorEntry.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="author">Author</option>
                        <option value="artist">Artist</option>
                        <option value="both">Both</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAuthorRemove(authorEntry.id)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Manga Types (Many-to-Many) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manga Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-gray-300 rounded-lg p-4">
              {mangaTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.type_ids.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-4">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.category_ids.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-4">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tag_ids.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured Series</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/series')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isLoading ? 'Saving...' : isEdit ? 'Update Series' : 'Create Series'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default SeriesForm;
