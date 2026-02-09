import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-7422337469648732';

/**
 * Place a Google AdSense ad.
 * @param {string} adSlot - Ad unit slot ID from AdSense
 * @param {string} [adFormat='auto'] - e.g. 'auto', 'rectangle', 'fluid' (in-feed)
 * @param {string} [adLayoutKey] - For fluid/in-feed units (e.g. '+1w+rz-i-q+3f')
 * @param {boolean} [fullWidthResponsive=true] - Ignored when adFormat is 'fluid'
 * @param {string} [className] - Wrapper class
 * @param {object} [style] - Inline style for the wrapper
 */
export default function GoogleAd({ adSlot, adFormat = 'auto', adLayoutKey, fullWidthResponsive = true, className = '', style = {} }) {
  const insRef = useRef(null);

  useEffect(() => {
    if (!adSlot || typeof window === 'undefined' || !window.adsbygoogle) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push error', e);
    }
  }, [adSlot]);

  if (!adSlot) {
    return null;
  }

  const isFluid = adFormat === 'fluid';
  const insProps = {
    ref: insRef,
    className: 'adsbygoogle',
    style: { display: 'block' },
    'data-ad-client': AD_CLIENT,
    'data-ad-slot': adSlot,
    'data-ad-format': adFormat,
  };
  if (isFluid && adLayoutKey) {
    insProps['data-ad-layout-key'] = adLayoutKey;
  }
  if (!isFluid) {
    insProps['data-full-width-responsive'] = fullWidthResponsive ? 'true' : 'false';
  }

  return (
    <div className={`min-h-[90px] flex items-center justify-center bg-gray-100/50 rounded-lg overflow-hidden ${className}`} style={style}>
      <ins {...insProps} />
    </div>
  );
}
