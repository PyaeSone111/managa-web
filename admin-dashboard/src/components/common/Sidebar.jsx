import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/series', label: 'Series', icon: '📚' },
    { path: '/dashboard/chapters', label: 'Chapters', icon: '📖' },
    { path: '/dashboard/categories', label: 'Categories', icon: '🏷️' },
    { path: '/dashboard/tags', label: 'Tags', icon: '🔖' },
    { path: '/dashboard/authors', label: 'Authors', icon: '✍️' },
    { path: '/dashboard/manga-types', label: 'Manga Types', icon: '📑' },
    { path: '/dashboard/themes', label: 'Themes', icon: '🎨' },
  ];

  return (
    <aside className="w-64 bg-torrefacto-roast text-bonaire min-h-screen fixed left-0 top-0 z-40 hidden lg:block border-r border-stone-lion/30">
      <div className="p-6 h-full flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-8 text-bonaire">Manga Admin</h1>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-indiana-clay text-white'
                    : 'text-stone-lion hover:bg-stone-lion/30'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-lion hover:bg-stone-lion/30 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

