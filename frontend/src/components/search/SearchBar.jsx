import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

function SearchBar({ onSearch, placeholder = 'Search series...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 sm:flex-none sm:w-48 md:w-64 px-3 py-1.5 sm:py-2 text-sm border border-white/20 rounded-lg bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-ruskin-blue focus:bg-white/15 transition-all"
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-3 py-1.5 sm:py-2 text-sm bg-ruskin-blue text-white rounded-lg hover:bg-ruskin-blue/80 transition-all duration-200 whitespace-nowrap"
      >
        <FaSearch className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}

export default SearchBar;
