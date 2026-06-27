const DEVICE_KEY = "hirehub:device-token";
const ISSUED_KEY = "hirehub:fcm";

function deviceFallback(): string {
  if (typeof window === "undefined") return "web";
  let token = window.localStorage.getItem(DEVICE_KEY);
  if (!token) {
    token = `web-${crypto.randomUUID()}`;
    window.localStorage.setItem(DEVICE_KEY, token);
  }
  return token;
}

function remember(token: string): string {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ISSUED_KEY, token);
  }
  return token;
}

export function getStoredFcmToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ISSUED_KEY);
}

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

function isConfigured(): boolean {
  return Boolean(
    config.apiKey &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId &&
      vapidKey,
  );
}

async function resolveToken(): Promise<string> {
  if (
    typeof window === "undefined" ||
    !isConfigured() ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    return deviceFallback();
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return deviceFallback();

    const params = new URLSearchParams(
      Object.entries(config).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {}),
    );
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${params.toString()}`,
    );

    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getMessaging, getToken, isSupported } = await import(
      "firebase/messaging"
    );
    if (!(await isSupported())) return deviceFallback();

    const app = getApps().length ? getApp() : initializeApp(config);
    const token = await getToken(getMessaging(app), {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token || deviceFallback();
  } catch {
    return deviceFallback();
  }
}

export async function getFcmToken(): Promise<string> {
  return remember(await resolveToken());
}
