import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import Layout from '../components/common/Layout';

function Dashboard() {
  const { data: seriesData } = useQuery({
    queryKey: ['admin-series-stats'],
    queryFn: () => adminApi.getSeries({ per_page: 1 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-stats'],
    queryFn: () => adminApi.getCategories(),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags-stats'],
    queryFn: () => adminApi.getTags(),
  });

  const totalSeries = seriesData?.pagination?.total || 0;
  const totalCategories = categoriesData?.data?.length || 0;
  const totalTags = tagsData?.data?.length || 0;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-navy">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Total Series</h3>
            <p className="text-3xl font-bold text-navy">{totalSeries}</p>
          </div>
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Total Chapters</h3>
            <p className="text-3xl font-bold text-navy">-</p>
          </div>
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Categories</h3>
            <p className="text-3xl font-bold text-navy">{totalCategories}</p>
          </div>
          <div className="glass-card rounded-lg p-6">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Tags</h3>
            <p className="text-3xl font-bold text-navy">{totalTags}</p>
          </div>
        </div>

        <div className="glass-card rounded-lg p-6">
          <h2 className="text-xl font-bold text-navy mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/series/create"
              className="p-4 border-2 border-dashed border-dockside-blue rounded-lg hover:border-red-orange hover:bg-red-orange/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-navy">Add Series</h3>
              <p className="text-sm text-stone-lion mt-1">Create a new manga series</p>
            </Link>
            <Link
              to="/dashboard/chapters/create"
              className="p-4 border-2 border-dashed border-dockside-blue rounded-lg hover:border-red-orange hover:bg-red-orange/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-navy">Add Chapter</h3>
              <p className="text-sm text-stone-lion mt-1">Upload a new chapter</p>
            </Link>
            <Link
              to="/dashboard/categories/create"
              className="p-4 border-2 border-dashed border-dockside-blue rounded-lg hover:border-red-orange hover:bg-red-orange/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-navy">Manage Categories</h3>
              <p className="text-sm text-stone-lion mt-1">Edit categories</p>
            </Link>
            <Link
              to="/dashboard/tags/create"
              className="p-4 border-2 border-dashed border-dockside-blue rounded-lg hover:border-red-orange hover:bg-red-orange/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-navy">Manage Tags</h3>
              <p className="text-sm text-stone-lion mt-1">Edit tags</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;

