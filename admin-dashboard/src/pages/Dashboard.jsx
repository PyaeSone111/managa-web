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
        <h1 className="text-3xl font-bold text-torrefacto-roast">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="bg-bonaire rounded-lg shadow p-6 border border-stone-lion/20">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Total Series</h3>
            <p className="text-3xl font-bold text-torrefacto-roast">{totalSeries}</p>
          </div>
          <div className="bg-bonaire rounded-lg shadow p-6 border border-stone-lion/20">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Total Chapters</h3>
            <p className="text-3xl font-bold text-torrefacto-roast">-</p>
          </div>
          <div className="bg-bonaire rounded-lg shadow p-6 border border-stone-lion/20">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Categories</h3>
            <p className="text-3xl font-bold text-torrefacto-roast">{totalCategories}</p>
          </div>
          <div className="bg-bonaire rounded-lg shadow p-6 border border-stone-lion/20">
            <h3 className="text-sm font-medium text-stone-lion mb-2">Tags</h3>
            <p className="text-3xl font-bold text-torrefacto-roast">{totalTags}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-bonaire rounded-lg shadow p-6 border border-stone-lion/20">
          <h2 className="text-xl font-bold text-torrefacto-roast mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard/series/create"
              className="p-4 border-2 border-dashed border-stone-lion/40 rounded-lg hover:border-indiana-clay hover:bg-indiana-clay/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-torrefacto-roast">Add Series</h3>
              <p className="text-sm text-stone-lion mt-1">Create a new manga series</p>
            </Link>
            <Link
              to="/dashboard/chapters/create"
              className="p-4 border-2 border-dashed border-stone-lion/40 rounded-lg hover:border-indiana-clay hover:bg-indiana-clay/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-torrefacto-roast">Add Chapter</h3>
              <p className="text-sm text-stone-lion mt-1">Upload a new chapter</p>
            </Link>
            <Link
              to="/dashboard/categories/create"
              className="p-4 border-2 border-dashed border-stone-lion/40 rounded-lg hover:border-indiana-clay hover:bg-indiana-clay/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-torrefacto-roast">Manage Categories</h3>
              <p className="text-sm text-stone-lion mt-1">Edit categories</p>
            </Link>
            <Link
              to="/dashboard/tags/create"
              className="p-4 border-2 border-dashed border-stone-lion/40 rounded-lg hover:border-indiana-clay hover:bg-indiana-clay/10 transition text-left cursor-pointer"
            >
              <h3 className="font-semibold text-torrefacto-roast">Manage Tags</h3>
              <p className="text-sm text-stone-lion mt-1">Edit tags</p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;

