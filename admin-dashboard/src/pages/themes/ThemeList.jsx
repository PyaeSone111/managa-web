import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import Layout from '../../components/common/Layout';

function ThemeList() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['themes'],
    queryFn: () => adminApi.getThemes(),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => adminApi.activateTheme(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.refetchQueries({ queryKey: ['themes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteTheme(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.refetchQueries({ queryKey: ['themes'] });
    },
  });

  const handleActivate = async (id, name) => {
    try {
      await activateMutation.mutateAsync(id);
      alert(`"${name}" is now the active theme. The frontend will use it on next load.`);
    } catch (err) {
      alert('Failed to activate theme: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete theme "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      alert('Failed to delete theme: ' + (err.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indiana-clay" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-indiana-clay/20 border border-indiana-clay/30 rounded-lg p-4">
          <p className="text-indiana-clay">Error loading themes: {error.message}</p>
        </div>
      </Layout>
    );
  }

  const themes = data?.data || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-torrefacto-roast">Themes</h1>
        </div>
        <p className="text-stone-lion">
          Choose which theme is shown on the frontend. Only one theme can be active at a time.
        </p>

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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-torrefacto-roast uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bonaire divide-y divide-stone-lion/20">
              {themes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-stone-lion">
                    No themes found. Run the theme seeder.
                  </td>
                </tr>
              ) : (
                themes.map((theme) => (
                  <tr key={theme.id} className="hover:bg-stone-lion/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-torrefacto-roast">{theme.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-lion">
                      {theme.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {theme.is_active ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                          Active (shown on frontend)
                        </span>
                      ) : (
                        <span className="text-sm text-stone-lion">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!theme.is_active && (
                        <button
                          onClick={() => handleActivate(theme.id, theme.name)}
                          disabled={activateMutation.isPending}
                          className="text-indiana-clay hover:text-indiana-clay/80 disabled:opacity-50"
                        >
                          Set active
                        </button>
                      )}
                      {!theme.is_active && (
                        <button
                          onClick={() => handleDelete(theme.id, theme.name)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      )}
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

export default ThemeList;
