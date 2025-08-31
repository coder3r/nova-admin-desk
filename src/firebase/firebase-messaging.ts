import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCFpZhDbUb1IPIjxrQFWemPB_Zw_KqEp84",
  authDomain: "codemarket-5ed9e.firebaseapp.com",
  projectId: "codemarket-5ed9e",
  storageBucket: "codemarket-5ed9e.appspot.com",
  messagingSenderId: "209957695729",
  appId: "1:209957695729:web:f23a610197010ada6db950",
  measurementId: "G-PKMS5CS9QY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IS_DEVELOPMENT =
  import.meta.env.DEV || import.meta.env.NODE_ENV === "development";

// Global state for permission management
let isRequestingPermission = false;
let permissionResult = null;
let currentAdminToken = null;

// VAPID Key for push notifications
const VAPID_KEY =
  "BNjNZeSzNkVILO5fnWugd3cMTnEzcH6sxLsFnQFiem8bMZU3Ci6l-tuDcp11uomxUatj2NNO2NwI0UWJMjT6M5o";

// LocalStorage keys for different contexts
const STORAGE_KEYS = {
  ADMIN_TOKEN: "fcm_admin_notification_token",
  ADMIN_SETUP: "fcm_admin_notifications_configured",
  ADMIN_TIMESTAMP: "fcm_admin_setup_timestamp",
  USER_TOKEN: "fcm_user_notification_token",
  USER_SETUP: "fcm_user_notifications_enabled",
  USER_TIMESTAMP: "fcm_user_setup_timestamp",
  PERMISSION_DENIED: "fcm_push_permission_denied",
  LAST_TOKEN_VALIDATION: "fcm_last_token_check",
};

// Production-safe logging utility
const logger = {
  log: (...args) => IS_DEVELOPMENT && console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  info: (...args) => IS_DEVELOPMENT && console.info(...args),
};

// Helper function to check if notification permission is already granted
export const hasNotificationPermission = () => {
  if (!("Notification" in window)) {
    return false;
  }
  return Notification.permission === "granted";
};

// Helper function to check if service worker is already registered
export const checkServiceWorkerRegistration = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js"
    );
    return registration;
  } catch (error) {
    logger.error("Service worker registration check failed:", error);
    return null;
  }
};

// Helper function to validate stored token with backend
export const validateStoredToken = async (adminToken, userType = "admin") => {
  const tokenKey =
    userType === "admin" ? STORAGE_KEYS.ADMIN_TOKEN : STORAGE_KEYS.USER_TOKEN;
  const setupKey =
    userType === "admin" ? STORAGE_KEYS.ADMIN_SETUP : STORAGE_KEYS.USER_SETUP;

  const storedToken = localStorage.getItem(tokenKey);
  const setupComplete = localStorage.getItem(setupKey);

  if (!storedToken || setupComplete !== "true") {
    return null;
  }

  try {
    const endpoint =
      userType === "admin" ? "/admin/verify-token" : "/user/verify-token";
    const response = await axios.post(
      `${API_BASE_URL}${endpoint}`,
      { token: storedToken },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data.success) {
      // Update last validation timestamp
      localStorage.setItem(
        STORAGE_KEYS.LAST_TOKEN_VALIDATION,
        Date.now().toString()
      );
      return storedToken;
    } else {
      // Token invalid, clear storage
      const timestampKey =
        userType === "admin"
          ? STORAGE_KEYS.ADMIN_TIMESTAMP
          : STORAGE_KEYS.USER_TIMESTAMP;
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(setupKey);
      localStorage.removeItem(timestampKey);
      return null;
    }
  } catch (error) {
    logger.warn(
      `${userType} token validation failed, keeping stored token:`,
      error.message
    );
    return storedToken;
  }
};

// Check if notification setup should be skipped
export const shouldSkipNotificationSetup = (userType = "admin") => {
  if (localStorage.getItem(STORAGE_KEYS.PERMISSION_DENIED) === "true") {
    return true;
  }

  const timestampKey =
    userType === "admin"
      ? STORAGE_KEYS.ADMIN_TIMESTAMP
      : STORAGE_KEYS.USER_TIMESTAMP;
  const setupTimestamp = localStorage.getItem(timestampKey);

  if (setupTimestamp) {
    const setupTime = parseInt(setupTimestamp);
    const currentTime = Date.now();
    // Don't setup again for 24 hours after setup
    if (currentTime - setupTime < 24 * 60 * 60 * 1000) {
      return true;
    }
  }

  return false;
};

// Main function to request notification permission
export const requestNotificationPermission = async (
  adminToken,
  userType = "admin"
) => {
  currentAdminToken = adminToken;

  // Prevent multiple concurrent requests
  if (isRequestingPermission) {
    while (isRequestingPermission) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return permissionResult;
  }

  // Return cached result if available and successful
  if (permissionResult && permissionResult.success) {
    logger.log(`Using cached ${userType} permission result`);
    return permissionResult;
  }

  isRequestingPermission = true;
  permissionResult = null;

  try {
    if (!adminToken) {
      throw new Error(
        `${
          userType === "admin" ? "Admin" : "User"
        } token is required for notification setup`
      );
    }

    // Step 1: Check if permission is already granted
    if (!hasNotificationPermission()) {
      logger.log(`Requesting ${userType} notification permission...`);
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        if (permission === "denied") {
          localStorage.setItem(STORAGE_KEYS.PERMISSION_DENIED, "true");
        }
        throw new Error(
          `Notification permission ${permission} for ${userType}`
        );
      }
    }

    // Step 2: Check service worker support
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker not supported in this browser");
    }

    // Step 3: Check HTTPS requirement (except localhost)
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      throw new Error("FCM requires HTTPS in production environment");
    }

    // Step 4: Get or register service worker
    let swRegistration = await checkServiceWorkerRegistration();

    if (!swRegistration) {
      logger.log(`Registering service worker for ${userType}...`);
      try {
        swRegistration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/",
            updateViaCache: "none",
          }
        );

        await navigator.serviceWorker.ready;
        logger.log(`Service worker registered successfully for ${userType}`);
      } catch (swError) {
        logger.error(
          `Service worker registration failed for ${userType}:`,
          swError
        );
        throw new Error("Failed to register service worker");
      }
    }

    // Step 5: Check if we have a valid token
    const existingToken = await validateStoredToken(adminToken, userType);

    if (existingToken) {
      // Silent return - no logs for existing valid tokens in production
      permissionResult = {
        success: true,
        token: existingToken,
        message: `Using existing ${userType} notification token`,
        isFirstTimeSetup: false,
        userType,
      };
      return permissionResult;
    }

    // Step 6: Generate new token
    logger.log(`Generating new ${userType} FCM token...`);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      throw new Error(
        `Failed to generate ${userType} FCM token - no token received`
      );
    }

    logger.log(`${userType} FCM token generated successfully`);

    // Step 7: Save token to backend
    logger.log(`Saving ${userType} token to backend...`);
    const endpoint =
      userType === "admin" ? "/admin/save-token" : "/user/save-token";
    const response = await axios.post(
      `${API_BASE_URL}${endpoint}`,
      { token },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data.success) {
      // Save to localStorage with appropriate keys
      const tokenKey =
        userType === "admin"
          ? STORAGE_KEYS.ADMIN_TOKEN
          : STORAGE_KEYS.USER_TOKEN;
      const setupKey =
        userType === "admin"
          ? STORAGE_KEYS.ADMIN_SETUP
          : STORAGE_KEYS.USER_SETUP;
      const timestampKey =
        userType === "admin"
          ? STORAGE_KEYS.ADMIN_TIMESTAMP
          : STORAGE_KEYS.USER_TIMESTAMP;

      localStorage.setItem(tokenKey, token);
      localStorage.setItem(setupKey, "true");
      localStorage.setItem(timestampKey, Date.now().toString());
      localStorage.removeItem(STORAGE_KEYS.PERMISSION_DENIED);

      permissionResult = {
        success: true,
        token,
        message: `${
          userType === "admin" ? "Admin" : "User"
        } notification system configured successfully`,
        isFirstTimeSetup: true,
        userType,
      };

      // Only log success message in development
      logger.log(`${userType} notification system configured successfully`);

      return permissionResult;
    } else {
      throw new Error(
        response.data.message || `Backend returned failure for ${userType}`
      );
    }
  } catch (err) {
    logger.error(`${userType} notification setup error:`, err.message);

    if (err.message.includes("permission denied")) {
      localStorage.setItem(STORAGE_KEYS.PERMISSION_DENIED, "true");
    }

    if (err.message.includes("token")) {
      const tokenKey =
        userType === "admin"
          ? STORAGE_KEYS.ADMIN_TOKEN
          : STORAGE_KEYS.USER_TOKEN;
      const setupKey =
        userType === "admin"
          ? STORAGE_KEYS.ADMIN_SETUP
          : STORAGE_KEYS.USER_SETUP;
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(setupKey);
    }

    permissionResult = {
      success: false,
      error: err.message,
      code: err.code || "UNKNOWN_ERROR",
      userType,
    };
    return permissionResult;
  } finally {
    isRequestingPermission = false;
  }
};

// Function to check if setup is needed
export const checkNotificationSetupStatus = (userType = "admin") => {
  const hasPermission = hasNotificationPermission();
  const tokenKey =
    userType === "admin" ? STORAGE_KEYS.ADMIN_TOKEN : STORAGE_KEYS.USER_TOKEN;
  const setupKey =
    userType === "admin" ? STORAGE_KEYS.ADMIN_SETUP : STORAGE_KEYS.USER_SETUP;

  const hasToken = localStorage.getItem(tokenKey);
  const setupComplete = localStorage.getItem(setupKey) === "true";

  return {
    hasPermission,
    hasToken: !!hasToken,
    setupComplete,
    needsSetup: !hasPermission || !hasToken || !setupComplete,
    userType,
  };
};

// Function to clear notification setup (call on logout)
export const clearNotificationSetup = (userType = "admin") => {
  permissionResult = null;
  isRequestingPermission = false;
  currentAdminToken = null;

  if (userType === "admin") {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SETUP);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TIMESTAMP);
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_SETUP);
    localStorage.removeItem(STORAGE_KEYS.USER_TIMESTAMP);
  }

  // Only log cleanup in development
  logger.log(`${userType} notification setup cache cleared`);
};

// Function to cleanup old service workers
export const cleanupOldServiceWorkers = async () => {
  try {
    if (!("serviceWorker" in navigator)) return false;

    const registrations = await navigator.serviceWorker.getRegistrations();
    let cleaned = false;

    for (const registration of registrations) {
      if (!registration.scope.includes("/firebase-messaging-sw.js")) {
        await registration.unregister();
        logger.log("Unregistered old service worker:", registration.scope);
        cleaned = true;
      }
    }

    return cleaned;
  } catch (error) {
    logger.error("Error cleaning up service workers:", error);
    return false;
  }
};

// Function to initialize notifications for admin or user
export const initializeNotifications = async (
  adminToken,
  userType = "admin"
) => {
  const status = checkNotificationSetupStatus(userType);

  if (!status.needsSetup) {
    // Silent check - no logs for already configured notifications in production
    const validToken = await validateStoredToken(adminToken, userType);

    if (validToken) {
      // Silent initialization of existing setup
      listenToForegroundMessages(userType);

      return {
        success: true,
        token: validToken,
        message: `${
          userType === "admin" ? "Admin" : "User"
        } device notifications already configured`,
        isFirstTimeSetup: false,
        userType,
      };
    }
  }

  // First-time setup will have its own logs
  return await requestNotificationPermission(adminToken, userType);
};

// Function to completely disable notifications for current device
export const disableNotificationsForDevice = async (userType = "admin") => {
  try {
    const tokenKey =
      userType === "admin" ? STORAGE_KEYS.ADMIN_TOKEN : STORAGE_KEYS.USER_TOKEN;
    const currentToken = localStorage.getItem(tokenKey);

    if (currentToken) {
      try {
        await deleteToken(messaging);
        logger.log(`${userType} FCM token revoked from Firebase`);
      } catch (deleteError) {
        logger.warn(
          `Could not revoke ${userType} FCM token:`,
          deleteError.message
        );
      }

      if (currentAdminToken) {
        try {
          const endpoint =
            userType === "admin" ? "/admin/remove-token" : "/user/remove-token";
          await axios.post(
            `${API_BASE_URL}${endpoint}`,
            { token: currentToken },
            {
              headers: {
                Authorization: `Bearer ${currentAdminToken}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            }
          );
          logger.log(`${userType} token removed from backend`);
        } catch (backendError) {
          logger.warn(
            `Could not remove ${userType} token from backend:`,
            backendError.message
          );
        }
      }
    }

    // Clear localStorage
    clearNotificationSetup(userType);
    localStorage.setItem(STORAGE_KEYS.PERMISSION_DENIED, "true");

    // Reset cached result
    permissionResult = null;
    isRequestingPermission = false;

    // Unregister service worker if no other user type is using it
    try {
      const otherUserType = userType === "admin" ? "user" : "admin";
      const otherTokenKey =
        otherUserType === "admin"
          ? STORAGE_KEYS.ADMIN_TOKEN
          : STORAGE_KEYS.USER_TOKEN;
      const hasOtherUserToken = localStorage.getItem(otherTokenKey);

      if (!hasOtherUserToken) {
        const registration = await navigator.serviceWorker.getRegistration(
          "/firebase-messaging-sw.js"
        );
        if (registration) {
          await registration.unregister();
          logger.log("Service worker unregistered");
        }
      }
    } catch (swError) {
      logger.warn("Could not unregister service worker:", swError.message);
    }

    logger.log(`${userType} device notifications completely disabled`);
    return true;
  } catch (error) {
    logger.error(`Error disabling ${userType} notifications:`, error);
    return false;
  }
};

// Function to listen to foreground messages
export const listenToForegroundMessages = (userType = "admin") => {
  try {
    onMessage(messaging, (payload) => {
      // Only log message reception in development
      logger.log(`${userType} foreground message received:`, payload);

      const { title, body, icon, image } = payload.notification || {};

      if (Notification.permission === "granted" && title && body) {
        const notification = new Notification(title, {
          body,
          icon: icon || "/logo192.png",
          tag: `${userType}-push`,
          requireInteraction: true,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();

          if (payload.data && payload.data.url) {
            window.location.href = payload.data.url;
          }
        };

        // Play notification sound
        try {
          const soundFile =
            userType === "admin"
              ? "/sounds/admin-notify.mp3"
              : "/sounds/notify.mp3";
          const audio = new Audio(soundFile);
          audio.play().catch(() => {
            // Silent fail for sound - no logs in production
            logger.log(`Could not play ${userType} notification sound`);
          });
        } catch (audioError) {
          logger.warn(`${userType} audio playback error:`, audioError);
        }
      }
    });

    // Only log listener activation in development
    logger.log(`${userType} foreground message listener activated`);
  } catch (error) {
    logger.error(`Error setting up ${userType} foreground messages:`, error);
  }
};

// Function to get current FCM token
export const getCurrentFCMToken = (userType = "admin") => {
  const tokenKey =
    userType === "admin" ? STORAGE_KEYS.ADMIN_TOKEN : STORAGE_KEYS.USER_TOKEN;
  return localStorage.getItem(tokenKey);
};

// Function to check if FCM is supported
export const isFCMSupported = () => {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    messaging !== null
  );
};

// Function to manually refresh FCM token
export const refreshFCMToken = async (adminToken, userType = "admin") => {
  try {
    if (!adminToken) {
      throw new Error(
        `${
          userType === "admin" ? "Admin" : "User"
        } token required for token refresh`
      );
    }

    const currentToken = getCurrentFCMToken(userType);
    if (currentToken) {
      try {
        await deleteToken(messaging);
      } catch (deleteError) {
        logger.warn(
          `Could not delete old ${userType} token:`,
          deleteError.message
        );
      }
    }

    // Clear local storage for this user type
    clearNotificationSetup(userType);

    return await requestNotificationPermission(adminToken, userType);
  } catch (error) {
    logger.error(`Error refreshing ${userType} FCM token:`, error);
    return { success: false, error: error.message, userType };
  }
};

// Export messaging instance and storage keys for other uses
export { messaging, STORAGE_KEYS };