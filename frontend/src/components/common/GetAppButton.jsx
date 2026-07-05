import { Link } from 'react-router-dom';
import { FaMobileAlt } from 'react-icons/fa';

export const APP_DOWNLOAD_ENABLED = false;

const sizeStyles = {
  sm: {
    btn: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
    icon: 'w-3.5 h-3.5',
  },
  lg: {
    btn: 'px-8 py-3.5 text-base sm:text-lg gap-2.5 rounded-full',
    icon: 'w-5 h-5',
  },
};

export default function GetAppButton({
  as = 'link',
  to = '/download',
  href,
  download,
  target,
  rel,
  size = 'sm',
  className = '',
  onClick,
  icon: Icon = FaMobileAlt,
  children = 'Get App',
  enabled = APP_DOWNLOAD_ENABLED,
  tone = 'dark',
}) {
  const { btn, icon } = sizeStyles[size];
  const gapClass = size === 'lg' ? 'gap-2.5' : 'gap-1.5';
  const disabledTone =
    tone === 'light'
      ? 'bg-navy/10 border border-navy/20 text-navy/75'
      : 'bg-white/10 border border-white/25 text-white/85';

  if (!enabled) {
    return (
      <span
        className={`inline-flex items-center justify-center font-semibold cursor-not-allowed opacity-90 ${btn} ${disabledTone} ${className}`}
        aria-disabled="true"
      >
        <span className={`inline-flex items-center ${gapClass}`}>
          {Icon && <Icon className={icon} />}
          Coming soon...
        </span>
      </span>
    );
  }

  const content = (
    <>
      <span className="get-app-btn__shine" aria-hidden="true" />
      <span className={`relative z-[1] inline-flex items-center ${gapClass}`}>
        {Icon && <Icon className={icon} />}
        {children}
      </span>
    </>
  );

  const classes = `get-app-btn relative inline-flex items-center justify-center overflow-hidden font-semibold text-white transition-transform duration-200 hover:-translate-y-px active:translate-y-0 ${btn} ${className}`;

  if (as === 'a') {
    return (
      <a
        href={href}
        download={download}
        target={target}
        rel={rel}
        onClick={onClick}
        className={classes}
      >
        {content}
      </a>
    );
  }

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} onClick={onClick} className={classes}>
      {content}
    </Link>
  );
}
