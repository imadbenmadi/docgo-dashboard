import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import apiClient from "../utils/apiClient";
import { useNavigation } from "../context/NavigationContext";

const PageHeader = () => {
  const { pageTitle } = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const response = await apiClient.get(
          "/Admin/notifications/unread-count",
        );
        if (!cancelled && response.data?.success) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch {
        if (!cancelled) setUnreadCount(0);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mb-8 pb-6 border-b-2 border-gray-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {pageTitle}
          </h1>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
        </div>

        <Link
          to="/Notifications"
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] leading-[18px] rounded-full text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;
