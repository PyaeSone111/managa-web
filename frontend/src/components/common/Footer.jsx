import { Link } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';
import GetAppButton from './GetAppButton';

const EXPLORE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse' },
  { to: '/browse?sort=latest', label: 'Latest Updates' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/download', label: 'Mobile App (Coming soon)' },
];

const LEGAL_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/contact', label: 'Contact Us' },
];

function FooterLinkList({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="text-sm text-white/80 hover:text-mango transition-colors duration-200"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  const { logoUrl } = useBranding();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy text-white border-t border-white/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src={logoUrl || '/logo.png'}
                alt="Myangar"
                className="h-9 w-auto brightness-0 invert opacity-95"
              />
            </Link>
            <p className="text-sm text-white/65 leading-relaxed max-w-sm">
              Read Yote Pya, manga, manhwa, and webtoons online. Discover new chapters, rankings,
              and your next favorite series on Myangar.
            </p>
            <GetAppButton size="sm" />
          </div>

          {/* Explore */}
          <div className="lg:col-span-3">
            <FooterLinkList title="Explore" links={EXPLORE_LINKS} />
          </div>

          {/* Legal */}
          <div className="lg:col-span-4">
            <FooterLinkList title="Legal & Support" links={LEGAL_LINKS} />
            <p className="mt-6 text-xs text-white/45 leading-relaxed max-w-xs">
              By using Myangar you agree to our privacy policy. For support or takedown requests,
              contact us via the form on our contact page.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/45">
            &copy; {year} Myangar. All rights reserved.
          </p>
          <p className="text-xs text-white/35">
            Made for readers who love Burmese comics &amp; webtoons
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
