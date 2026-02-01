import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-bonaire">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 w-full lg:w-auto">
        {children}
      </main>
    </div>
  );
}

export default Layout;

