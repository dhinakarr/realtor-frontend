import { useEffect, useState } from "react";
import API from "../api/api";
import listenForForegroundMessages from "../firebase/firebaseMessaging";

export default function useNotifications(user) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const loadUnreadCount = async () => {
    const res = await API.get("/api/alerts/unread-count");
    setUnreadCount(res.data);
  };
  
  const markAllAsRead = async () => {
	  await API.post("/api/alerts/mark-all-read");
	  setNotifications((prev) =>
		prev.map((n) => ({ ...n, read: true }))
	  );
	  setUnreadCount(0);
	};


  const loadNotifications = async () => {
    const res = await API.get("/api/alerts");
    setNotifications(res.data);
  };

  const markAsRead = async (id) => {
    await API.put(`/api/alerts/${id}/read`);
    loadUnreadCount();
    loadNotifications();
  };

  useEffect(() => {
	  if (!user) return;

	  listenForForegroundMessages((msg) => {
		setNotifications((prev) => [msg, ...prev]);
		setUnreadCount((c) => c + 1);
	  });
   
  }, [user]);

  return {
    unreadCount,
    notifications,
    loadNotifications,
    markAsRead
  };
}
