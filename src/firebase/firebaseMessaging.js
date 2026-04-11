//import { getMessaging, onMessage, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebase";

export default async function listenForForegroundMessages(onReceive) {
  try {
	  
	  if (
		  typeof window === "undefined" ||
		  !("serviceWorker" in navigator) ||
		  !("Notification" in window)
		) {
		  console.warn("Messaging not supported in this environment");
		  return;
		}

		const { getMessaging, onMessage, isSupported } =
		  await import("firebase/messaging");
	  
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
      //console.log("📩 FCM Foreground Message:", payload);
	  
	  // 👇 SHOW notification manually
	  if (Notification.permission === "granted") {
		new Notification(payload.notification?.title ?? "Notification", {
		  body: payload.notification?.body,
		  icon: "/icon.png",
		  data: payload.data
		});
	  }
	  
      onReceive({
		  title: payload.notification?.title,
		  body: payload.notification?.body,
		  data: payload.data
		});
    });

  } catch (err) {
    console.warn("Firebase messaging disabled:", err.message);
  }
}
