function Footer() {
  return (
    <footer className="mt-auto border-t border-quarzo bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-sm text-sidewalk-grey">
            &copy; {new Date().getFullYear()} Myangar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
