// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAx3qpmuyzMU80wASxeW_Xxvf0eG1ggDVk",
  authDomain: "diamond-realty-8bf53.firebaseapp.com",
  projectId: "diamond-realty-8bf53",
  storageBucket: "diamond-realty-8bf53.firebasestorage.app",
  messagingSenderId: "94445078896",
  appId: "1:94445078896:web:884253fd800978bd68e7b5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("Background message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png"
  });
});
