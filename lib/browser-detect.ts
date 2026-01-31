/**
 * Browser detection utilities for feature capability checks.
 * Used primarily for export format selection (WebM vs MP4).
 */

export interface BrowserInfo {
  isSafari: boolean;
  isIOS: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  supportsWebM: boolean;
  supportsGif: boolean;
  preferredVideoFormat: 'webm' | 'gif';
}

/**
 * Detect browser and platform from user agent.
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // SSR fallback - assume modern browser
    return {
      isSafari: false,
      isIOS: false,
      isChrome: true,
      isFirefox: false,
      isEdge: false,
      supportsWebM: true,
      supportsGif: true,
      preferredVideoFormat: 'webm',
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  
  // iOS detection (includes iPad with desktop mode)
  const isIOS = /iphone|ipad|ipod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Safari detection (excludes Chrome/Firefox on iOS which report as Safari)
  const isSafari = /safari/.test(ua) && 
    !/chrome/.test(ua) && 
    !/firefox/.test(ua) &&
    !/edg/.test(ua);
  
  const isChrome = /chrome/.test(ua) && !/edg/.test(ua);
  const isFirefox = /firefox/.test(ua);
  const isEdge = /edg/.test(ua);

  // WebM support check via MediaRecorder
  const supportsWebM = checkWebMSupport();
  
  // GIF support - all browsers support GIF
  const supportsGif = true;

  // Safari and iOS should prefer GIF since WebM encoding is problematic
  const preferredVideoFormat: 'webm' | 'gif' = 
    (isSafari || isIOS || !supportsWebM) ? 'gif' : 'webm';

  return {
    isSafari,
    isIOS,
    isChrome,
    isFirefox,
    isEdge,
    supportsWebM,
    supportsGif,
    preferredVideoFormat,
  };
}

/**
 * Check if browser supports WebM video encoding via MediaRecorder.
 */
function checkWebMSupport(): boolean {
  if (typeof MediaRecorder === 'undefined') {
    return false;
  }

  // Check for WebM MIME type support
  const webmTypes = [
    'video/webm',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
  ];

  for (const mimeType of webmTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if browser supports MP4 video encoding via MediaRecorder.
 * Note: Most browsers don't support MP4 encoding natively via MediaRecorder.
 * We use a frame-based encoding approach instead.
 */
export function checkMP4RecorderSupport(): boolean {
  if (typeof MediaRecorder === 'undefined') {
    return false;
  }

  const mp4Types = [
    'video/mp4',
    'video/mp4;codecs=avc1',
    'video/mp4;codecs=h264',
  ];

  for (const mimeType of mp4Types) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return true;
    }
  }

  return false;
}

/**
 * Get user-friendly browser name for display.
 */
export function getBrowserName(): string {
  const info = detectBrowser();
  
  if (info.isIOS) return 'iOS Safari';
  if (info.isSafari) return 'Safari';
  if (info.isChrome) return 'Chrome';
  if (info.isFirefox) return 'Firefox';
  if (info.isEdge) return 'Edge';
  
  return 'Unknown Browser';
}

/**
 * Get recommended export format with reason.
 */
export function getRecommendedFormat(): { format: 'webm' | 'gif'; reason: string } {
  const info = detectBrowser();
  
  if (info.isSafari || info.isIOS) {
    return {
      format: 'gif',
      reason: 'Safari/iOS has limited WebM support. GIF recommended.',
    };
  }
  
  if (!info.supportsWebM) {
    return {
      format: 'gif',
      reason: 'Your browser does not support WebM encoding.',
    };
  }
  
  return {
    format: 'webm',
    reason: 'WebM provides good quality and file size.',
  };
}
