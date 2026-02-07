function LoadingSpinner({ size = 'md', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div
        className={`${sizeClasses[size]} border-4 border-quarzo border-t-ruskin-blue rounded-full animate-spin`}
      ></div>
    </div>
  );
}

export default LoadingSpinner;
