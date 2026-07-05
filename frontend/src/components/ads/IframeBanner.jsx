import { ADS } from '../../constants/ads';

function IframeBanner({ className = '', tall = false }) {
  return (
    <div
      className={`flex justify-center w-full overflow-hidden ${className}`}
      aria-label="Advertisement"
    >
      <iframe
        src={ADS.iframeBannerUrl}
        title="Advertisement"
        className="w-full max-w-[728px] border-0 rounded-xl bg-quarzo/20 shadow-sm"
        style={{
          minHeight: tall ? 280 : 90,
          maxHeight: tall ? 320 : 120,
          aspectRatio: tall ? undefined : '728 / 90',
        }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
      />
    </div>
  );
}

export default IframeBanner;
