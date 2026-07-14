import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { FaBook, FaDownload, FaStar, FaBookmark } from 'react-icons/fa';
import GetAppButton from '../components/common/GetAppButton';
import { AnimatedHomePhone, AnimatedBrowsePhone } from '../components/download/AnimatedPhoneMockups';
import { useBranding } from '../context/BrandingContext';
import { downloadApk } from '../utils/downloadApk';
import { getApkDownloadUrl } from '../utils/appDownload';

function FloatingIcon({ icon: Icon, color, className }) {
  return (
    <div
      className={`absolute flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
    </div>
  );
}

export default function DownloadApp() {
  const { appDownload, brandingReady, isFetching, refetchBranding } = useBranding();
  const { fileName, version, sizeMB } = appDownload;
  const apkUrl = getApkDownloadUrl(appDownload);

  useEffect(() => {
    refetchBranding();
  }, [refetchBranding]);

  const handleDownload = () => {
    if (!apkUrl) return;
    downloadApk(apkUrl, fileName);
  };

  const showLoading = isFetching || !brandingReady;

  return (
    <>
      <Helmet>
        <title>Get the App - Myangar</title>
        <meta
          name="description"
          content="Download the Myangar Android app. Read manga, manhwa, and manhua on your phone."
        />
      </Helmet>

      <div className="relative overflow-hidden bg-almond min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg
            className="absolute -top-24 -left-32 w-[520px] h-[520px] text-navy/[0.06]"
            viewBox="0 0 500 500"
            fill="currentColor"
          >
            <path d="M0,250 Q125,80 250,200 T500,150 L500,0 L0,0 Z" />
          </svg>
          <svg
            className="absolute top-1/4 -right-40 w-[600px] h-[600px] text-red-orange/[0.08]"
            viewBox="0 0 500 500"
            fill="currentColor"
          >
            <path d="M0,100 Q150,300 350,180 T500,400 L500,500 L0,500 Z" />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-48 text-navy/[0.04]"
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,120 C360,200 720,40 1080,100 C1260,130 1380,160 1440,140 L1440,200 L0,200 Z" />
          </svg>
          <div className="absolute top-[18%] left-[8%] w-72 h-72 rounded-full bg-mango/10 blur-3xl" />
          <div className="absolute bottom-[12%] right-[10%] w-80 h-80 rounded-full bg-red-orange/10 blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative flex justify-center items-center min-h-[340px] sm:min-h-[400px] lg:min-h-[480px]">
              <FloatingIcon icon={FaBook} color="#ff6e40" className="top-[8%] left-[12%] sm:left-[18%] animate-pulse" />
              <FloatingIcon icon={FaStar} color="#ffc13b" className="top-[22%] right-[8%] sm:right-[16%]" />
              <FloatingIcon icon={FaBookmark} color="#1e3d59" className="bottom-[28%] left-[6%] sm:left-[12%]" />

              <svg
                className="absolute inset-0 w-full h-full pointer-events-none text-navy/15"
                aria-hidden="true"
              >
                <path
                  d="M 120 80 Q 200 140 260 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 280 90 Q 340 160 380 120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 100 280 Q 180 220 240 260"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
              </svg>

              <div className="relative flex items-end gap-3 sm:gap-5">
                <AnimatedHomePhone />
                <AnimatedBrowsePhone />
              </div>

              <div className="absolute bottom-[6%] sm:bottom-[10%] right-[4%] sm:right-[12%] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy text-white text-[10px] sm:text-xs font-medium shadow-lg">
                <FaDownload className="w-3 h-3 text-mango" />
                Downloaded 1000+ times
              </div>
            </div>

            <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-red-orange uppercase mb-3">
                Android · {fileName.replace('.apk', '')} · v{version}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy leading-tight tracking-tight mb-3">
                MYANGAR
                <br />
                <span className="text-red-orange">MOBILE APP</span>
              </h1>
              <p className="text-sm sm:text-base font-bold text-navy/80 tracking-wide uppercase mb-4">
                Download and read manga for free
              </p>
              <p className="text-sm sm:text-base text-sidewalk-grey leading-relaxed mb-8">
                Take your library anywhere. Browse thousands of manga, manhwa, and manhua,
                save favorites, and pick up right where you left off — all from your Android phone.
              </p>

              <GetAppButton
                as="button"
                onClick={handleDownload}
                size="lg"
                icon={FaDownload}
                className="uppercase tracking-wide shadow-xl"
              >
                {showLoading ? 'Loading…' : 'Download Now'}
              </GetAppButton>

              {showLoading ? (
                <p className="mt-4 text-xs text-sidewalk-grey">Loading download info…</p>
              ) : !apkUrl ? (
                <p className="mt-4 text-xs text-red-orange">
                  APK download link is not configured yet. Please check back later.
                </p>
              ) : (
                <p className="mt-4 text-xs text-sidewalk-grey">
                  ~{sizeMB} MB · Android 7.0+ ·{' '}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="text-ruskin-blue hover:text-delta-green underline"
                  >
                    Direct download link
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="mt-14 sm:mt-20 max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-navy mb-4">How to install</h2>
              <ol className="grid sm:grid-cols-2 gap-3 text-sm text-navy/85">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-orange to-mango text-white text-xs font-bold flex items-center justify-center">1</span>
                  Download the APK using the button above.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-orange to-mango text-white text-xs font-bold flex items-center justify-center">2</span>
                  Open the file on your Android device.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-orange to-mango text-white text-xs font-bold flex items-center justify-center">3</span>
                  Allow installation from unknown sources if prompted.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-orange to-mango text-white text-xs font-bold flex items-center justify-center">4</span>
                  Follow the on-screen steps to finish setup.
                </li>
              </ol>
              <p className="text-xs text-sidewalk-grey mt-5 text-center">
                iOS is not available yet — use the website on iPhone or iPad in the meantime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
