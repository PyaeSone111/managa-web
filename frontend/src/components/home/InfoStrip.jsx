function InfoStrip() {
  const items = [
    { label: 'Free to read' },
    { label: 'Updated regularly' },
    { label: 'High quality' },
  ];

  return (
    <div className="w-full border-b border-quarzo py-2.5 sm:py-3 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-8 gap-y-1 text-xs sm:text-sm text-sidewalk-grey">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center">
              {i > 0 && <span className="mr-4 sm:mr-8 text-quarzo">&middot;</span>}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InfoStrip;
