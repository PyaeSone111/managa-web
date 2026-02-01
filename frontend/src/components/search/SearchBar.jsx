import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { FaSearch } from 'react-icons/fa';

function SearchBar({ onSearch, placeholder = 'Search series...' }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 sm:flex-none sm:w-48 md:w-64 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-silver-grass/40 rounded-lg glass-effect text-white placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-bracken-green transition-all"
      />
      <button
        type="submit"
        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-bracken-green text-white border border-silver-grass/40 rounded-lg hover:bg-bracken-fern transition-all duration-200 whitespace-nowrap"
      >
        <FaSearch className="w-4 h-4" />
        Search
      </button>
    </form>
  );
}

export default SearchBar;

