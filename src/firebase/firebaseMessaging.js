import { getMessaging, onMessage, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebase";

export default async function listenForForegroundMessages(onReceive) {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM not supported in this browser");
      return;
    }

    if (!firebaseApp?.options?.projectId) {
      console.warn("Firebase not configured. Notifications disabled.");
      return;
    }

    const messaging = getMessaging(firebaseApp);

    onMessage(messaging, (payload) => {
      console.log("📩 FCM Foreground Message:", payload);
      onReceive(payload);
    });

  } catch (err) {
    console.warn("Firebase messaging disabled:", err.message);
  }
}
