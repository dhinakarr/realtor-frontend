// firebase/registerDevice.js
import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import API from "../api/api";

export async function registerDevice() {
  try {
    //console.log("🔔 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    //console.log("Permission:", permission);

    if (permission !== "granted") {
      console.warn("Permission not granted");
      return;
    }

    //console.log("📡 Getting FCM token...");
    const deviceToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    //console.log("FCM token:", deviceToken);

    if (!deviceToken) {
      console.warn("No FCM token returned");
      return;
    }

    await API.post("/api/alerts/device", {
      deviceToken,
      platform: "WEB"
    });

    //console.log("✅ FCM token registered with backend");
  } catch (err) {
    console.error("❌ FCM registration failed", err);
  }
}
