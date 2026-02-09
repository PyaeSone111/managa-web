import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Myangar</title>
        <meta name="description" content="Privacy Policy for Myangar. How we collect, use, and protect your information." />
      </Helmet>
      <div className="max-w-3xl mx-auto prose prose-delta-green">
        <h1 className="text-2xl sm:text-3xl font-bold text-black-feather mb-6">Privacy Policy</h1>
        <p className="text-sm text-sidewalk-grey mb-6">Last updated: {new Date().toLocaleDateString('en-US')}</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">1. Introduction</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            Myangar (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services for reading manga, manhwa, and manhua.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">2. Information We Collect</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed mb-2">
            We may collect information you provide directly (e.g., account registration, ratings, favorites, reading progress) and information collected automatically when you use our site (e.g., device type, IP address, pages visited). We use this to operate the service, personalize content, and improve your experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">3. Google AdSense &amp; Cookies</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed mb-2">
            We use Google AdSense to display advertisements. Google and its partners may use cookies and similar technologies to serve ads based on your visits and other sites. You can learn more and opt out of personalized advertising at{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-ruskin-blue hover:text-delta-green underline">
              Google Ads Settings
            </a>.
          </p>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            Our site uses an <a href="/ads.txt" className="text-ruskin-blue hover:text-delta-green underline">ads.txt</a> file to declare authorized digital sellers. For details, see{' '}
            <a href="https://support.google.com/adsense/answer/12171244" target="_blank" rel="noopener noreferrer" className="text-ruskin-blue hover:text-delta-green underline">
              Google&apos;s ads.txt help
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">4. How We Use Your Information</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            We use collected information to provide and improve our services, remember your preferences (e.g., favorites, reading progress), communicate with you, and comply with legal obligations. We do not sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">5. Data Security</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            We take reasonable measures to protect your data. Transmission over the internet is not fully secure; we encourage you to use a strong password and keep your account details private.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">6. Your Rights</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            Depending on your location, you may have the right to access, correct, or delete your personal data, or to object to or restrict certain processing. Contact us (see Contact Us page) to exercise these rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">7. Changes</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will reflect the latest version. Continued use of the site after changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-black-feather mb-3">8. Contact Us</h2>
          <p className="text-black-feather/90 text-sm leading-relaxed">
            For privacy-related questions or requests, please visit our <Link to="/contact" className="text-ruskin-blue hover:text-delta-green underline">Contact Us</Link> page.
          </p>
        </section>

        <p className="text-sm text-sidewalk-grey mt-8">
          &copy; {new Date().getFullYear()} Myangar. All rights reserved.
        </p>
      </div>
    </>
  );
}
