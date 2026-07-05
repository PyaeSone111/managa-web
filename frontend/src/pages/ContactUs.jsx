import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'contact@myangar.com';

export default function ContactUs() {
  return (
    <>
      <Helmet>
        <title>Contact Us - Myangar</title>
        <meta name="description" content="Get in touch with Myangar. Send feedback, report issues, or ask questions." />
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-black-feather mb-2">Contact Us</h1>
        <p className="text-sidewalk-grey text-sm mb-8">
          We&apos;d love to hear from you. Use the options below to get in touch.
        </p>

        <div className="bg-white rounded-xl border border-quarzo shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-black-feather mb-2">Email</h2>
            <p className="text-sm text-black-feather/90 mb-2">
              For general inquiries, feedback, or support:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-block px-4 py-2 bg-delta-green text-white rounded-lg hover:bg-ruskin-blue transition-colors text-sm font-medium"
            >
              {CONTACT_EMAIL}
            </a>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black-feather mb-2">Privacy &amp; Data</h2>
            <p className="text-sm text-black-feather/90 mb-2">
              For privacy-related requests or questions about your data, see our{' '}
              <Link to="/privacy-policy" className="text-ruskin-blue hover:text-delta-green underline">
                Privacy Policy
              </Link>.
            </p>
          </section>
        </div>

        <p className="text-sm text-sidewalk-grey mt-8 text-center">
          We aim to respond within a few business days.
        </p>
      </div>
    </>
  );
}
