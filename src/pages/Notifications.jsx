import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient";
import { Bell, Check } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const resolveDashboardLink = (notification) => {
    if (!notification) return null;

    // Prefer explicit non-admin links
    if (
      typeof notification.link === "string" &&
      notification.link &&
      !notification.link.toLowerCase().startsWith("/admin")
    ) {
      return notification.link;
    }

    switch (notification.type) {
      case "payment_received":
      case "ccp_receipt_uploaded":
        return "/AllPayments";
      case "other_service_payment_submitted":
        return "/OtherServices/service-payments";
      case "cv_application_submitted":
        return "/OtherServices/cv-applications";
      case "internship_application_submitted":
        return "/OtherServices/internship-applications";
      case "contact_message":
        return "/Contact";
      case "program_application":
        return "/Applications/Programs";
      case "course_application":
        return "/Applications/Courses";
      case "course":
        return "/Courses";
      case "program":
        return "/Programs";
      default:
        return null;
    }
  };

  const TYPE_META = {
    payment_received: { label: "Payment", color: "bg-green-100 text-green-800" },
    ccp_receipt_uploaded: {
      label: "New payment request",
      color: "bg-emerald-100 text-emerald-800",
    },
    other_service_payment_submitted: {
      label: "Service payment request",
      color: "bg-emerald-100 text-emerald-800",
    },
    cv_application_submitted: {
      label: "CV application",
      color: "bg-indigo-100 text-indigo-800",
    },
    internship_application_submitted: {
      label: "Internship application",
      color: "bg-indigo-100 text-indigo-800",
    },
    program_application: {
      label: "Program application",
      color: "bg-indigo-100 text-indigo-800",
    },
    course_application: {
      label: "Course application",
      color: "bg-indigo-100 text-indigo-800",
    },
    contact_message: { label: "Contact", color: "bg-amber-100 text-amber-800" },
    course: { label: "New course", color: "bg-sky-100 text-sky-800" },
    program: { label: "New program", color: "bg-sky-100 text-sky-800" },
    new_enrollment: {
      label: "Enrollment",
      color: "bg-purple-100 text-purple-800",
    },
  };

  const typeMeta = (type) =>
    TYPE_META[type] || { label: type || "Notification", color: "bg-gray-100 text-gray-700" };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/Admin/notifications", {
        params: { page: 1, limit: 50, status: "all" },
      });

      if (response.data?.success) {
        setItems(response.data.notifications || []);
      } else {
        setItems([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load notifications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await apiClient.patch(`/Admin/notifications/${id}/read`);
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch("/Admin/notifications/read-all");
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded"
        >
          <Check className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {error ? (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="p-8 text-center text-gray-600">Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center text-gray-600">No notifications.</div>
      ) : (
        <div className="divide-y">
          {items.map((n) => (
            <div key={n.id} className="py-4 flex items-start justify-between">
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      n.status === "unread"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {n.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      typeMeta(n.type).color
                    }`}
                  >
                    {typeMeta(n.type).label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {n.title}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {resolveDashboardLink(n) ? (
                  <button
                    type="button"
                    onClick={() => navigate(resolveDashboardLink(n))}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Open
                  </button>
                ) : null}

                {n.status === "unread" ? (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
