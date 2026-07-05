function getPageNumbers(current, last, maxVisible = 7) {
  if (last <= 1) return [];

  const pages = new Set([1, last, current]);
  for (let i = current - 2; i <= current + 2; i += 1) {
    if (i > 1 && i < last) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  });

  return result.slice(0, maxVisible + 2);
}

function Pagination({ page, lastPage, total, perPage, onPageChange, className = '' }) {
  if (!lastPage || lastPage <= 1) return null;

  const from = total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = total > 0 ? Math.min(page * perPage, total) : 0;
  const pageNumbers = getPageNumbers(page, lastPage);

  return (
    <nav
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 ${className}`}
      aria-label="Pagination"
    >
      <p className="text-sm text-sidewalk-grey order-2 sm:order-1">
        Showing {from}–{to} of {total} series
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-2 text-sm border border-quarzo rounded-lg bg-white text-black-feather disabled:opacity-40 disabled:cursor-not-allowed hover:bg-quarzo/30 transition-all"
        >
          Previous
        </button>

        {pageNumbers.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-sidewalk-grey">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`min-w-[2.5rem] px-3 py-2 text-sm border rounded-lg transition-all ${
                item === page
                  ? 'border-ruskin-blue bg-ruskin-blue text-white'
                  : 'border-quarzo bg-white text-black-feather hover:bg-quarzo/30'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className="px-3 py-2 text-sm border border-quarzo rounded-lg bg-white text-black-feather disabled:opacity-40 disabled:cursor-not-allowed hover:bg-quarzo/30 transition-all"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
