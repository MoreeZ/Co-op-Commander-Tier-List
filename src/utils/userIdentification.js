import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Initialize FingerprintJS
const fpPromise = FingerprintJS.load();

// Generate a browser fingerprint
export const generateFingerprint = async () => {
  try {
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return null;
  }
};

// Get device information (non-PII)
export const getDeviceInfo = () => {
  const deviceInfo = {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Add more non-PII device information as needed
  };
  
  return deviceInfo;
};

// Check if user has submitted before using localStorage
export const hasSubmittedLocally = () => {
  return localStorage.getItem('sc2_tierlist_submitted') === 'true';
};

// Mark user as having submitted
export const markAsSubmitted = () => {
  localStorage.setItem('sc2_tierlist_submitted', 'true');
};

// Store user ID in localStorage for future editing
export const storeUserId = (userId) => {
  if (userId) {
    localStorage.setItem('sc2_tierlist_user_id', userId);
  }
};

// Get stored user ID from localStorage
export const getStoredUserId = () => {
  return localStorage.getItem('sc2_tierlist_user_id');
};

// Multi-layer check if user has submitted before
export const checkMultiLayerSubmission = async (supabaseCheckFn) => {
  // First check: Local storage
  if (hasSubmittedLocally()) {
    return true;
  }
  
  // Second check: Browser fingerprint
  const fingerprint = await generateFingerprint();
  if (!fingerprint) {
    return false; // Cannot determine, assume not submitted
  }
  
  // Third check: Check against database
  const userId = await supabaseCheckFn(fingerprint);
  return !!userId;
};

// Create user identification data
export const createUserIdentificationData = async () => {
  const fingerprint = await generateFingerprint();
  const deviceInfo = getDeviceInfo();
  
  return {
    fingerprint,
    user_agent: navigator.userAgent,
    device_info: deviceInfo,
    // Note: IP address will be handled server-side in a real implementation
    // For this demo, we'll rely on Supabase's built-in IP handling
  };
};
