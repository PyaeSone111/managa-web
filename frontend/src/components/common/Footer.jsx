function Footer() {
  return (
    <footer className="glass-effect mt-auto border-t border-silver-grass/20 rounded-t-xl transition-all duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-white">
            © {new Date().getFullYear()} Manga Web. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

