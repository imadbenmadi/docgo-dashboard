import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { courseProgressAPI } from "../../API/Courses";
import ImageWithFallback from "../../components/Common/ImageWithFallback";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://backend.healthpathglobal.com";

function getProfilePicSrc(link) {
  if (!link) return null;
  if (typeof link === "string" && link.startsWith("http")) return link;
  return `${API_URL}${link}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-yellow-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
};

const CourseProgressDetails = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await courseProgressAPI.getCourseUserProgress(courseId);
        setData(res.data);
      } catch (err) {
        const apiMessage = err.response?.data?.message;
        const isDeleted = err.response?.status === 410;
        setError(
          isDeleted
            ? "Ce cours est supprimé. Son détail de progression n'est plus accessible."
            : apiMessage || err.message || "Failed to load progress data",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!data) return null;

  const filteredUsers = (data.users || []).filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const totalItems = data.totalItems || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/Courses/progress"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to all courses
        </Link>
        <div className="flex items-center gap-4">
          <ImageWithFallback
            src={data.course?.thumbnail}
            alt={data.course?.title}
            className="w-14 h-14 rounded-xl object-cover bg-gray-100 shadow"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {data.course?.title}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {data.totalEnrolled} enrolled &nbsp;·&nbsp; {totalItems} items
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Items Done
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">
                Progress
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.userId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* User info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getProfilePicSrc(user.profilePicture) ? (
                        <img
                          src={getProfilePicSrc(user.profilePicture)}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {user.firstName?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800 leading-tight">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Items done */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700">
                    {user.completedItems} / {user.totalItems}
                  </td>

                  {/* Progress bar */}
                  <td className="px-6 py-4 min-w-[160px]">
                    <ProgressBar
                      value={
                        user.overallProgress ?? user.enrollmentProgress ?? 0
                      }
                    />
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4 text-center">
                    {(() => {
                      const pct =
                        user.overallProgress ?? user.enrollmentProgress ?? 0;
                      return pct >= 100 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      ) : pct > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          <ClockIcon className="w-3.5 h-3.5" />
                          In Progress
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          Not Started
                        </span>
                      );
                    })()}
                  </td>

                  {/* Last active */}
                  <td className="px-6 py-4 text-center text-sm text-gray-500">
                    {formatDate(user.lastAccessed)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseProgressDetails;
