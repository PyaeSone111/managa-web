import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-auto border-t border-quarzo bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link to="/privacy-policy" className="text-sm text-sidewalk-grey hover:text-delta-green transition-colors">
            Privacy Policy
          </Link>
          <Link to="/contact" className="text-sm text-sidewalk-grey hover:text-delta-green transition-colors">
            Contact Us
          </Link>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-sidewalk-grey">
            &copy; {new Date().getFullYear()} Myangar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
