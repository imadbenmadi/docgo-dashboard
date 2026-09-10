import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Archive,
  AlertTriangle,
  Calendar,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ApplicationsAPI from "../../API/Applications";
import { getApiBaseUrl } from "../../utils/apiBaseUrl";

const API_URL = getApiBaseUrl();

// eslint-disable-next-line no-unused-vars
const getScreenshotUrl = (payment) => {
  if (!payment) return null;
  if (payment.imageData) {
    const mimeType = payment.imageMimeType || "image/jpeg";
    const base64 =
      typeof payment.imageData === "string"
        ? payment.imageData
        : btoa(String.fromCharCode(...new Uint8Array(payment.imageData)));
    return `data:${mimeType};base64,${base64}`;
  }
  if (payment.screenshot) return `${API_URL}${payment.screenshot}`;
  return null;
};

const RemovedEnrollments = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [courseRecords, setCourseRecords] = useState([]);
  const [programRecords, setProgramRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRes, programRes] = await Promise.all([
        ApplicationsAPI.getRemovedCourseEnrollments(),
        ApplicationsAPI.getRemovedProgramEnrollments(),
      ]);
      if (courseRes.success) setCourseRecords(courseRes.data || []);
      if (programRes.success) setProgramRecords(programRes.data || []);
    } catch {
      toast.error("Failed to load removed enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const q = search.toLowerCase();
  const filteredCourses = courseRecords.filter(
    (r) =>
      !q ||
      `${r.userFirstName} ${r.userLastName}`.toLowerCase().includes(q) ||
      (r.userEmail || "").toLowerCase().includes(q) ||
      (r.courseTitle || "").toLowerCase().includes(q),
  );
  const filteredPrograms = programRecords.filter(
    (r) =>
      !q ||
      `${r.userFirstName} ${r.userLastName}`.toLowerCase().includes(q) ||
      (r.userEmail || "").toLowerCase().includes(q) ||
      (r.programTitle || "").toLowerCase().includes(q),
  );

  const activeList =
    activeTab === "courses" ? filteredCourses : filteredPrograms;

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Archive className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Removed Enrollments
            </h1>
            <p className="text-sm text-gray-500">
              Archive of enrollments removed by admins. Payment screenshots are
              preserved.
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <strong>Archive:</strong> an enrolment that was taken away, kept
          with the payment that bought it. These rows are never removed, which
          is the point of them &mdash; they are the only remaining record that
          the enrolment existed. The original payment is also still in the
          payments section.
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "courses"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Courses
            <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
              {courseRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "programs"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Programs
            <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
              {programRecords.length}
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 flex items-center justify-end px-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, course…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading…
          </div>
        ) : activeList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Archive className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-base font-medium">No records found</p>
            <p className="text-sm mt-1">
              {search
                ? "Try a different search term"
                : "No enrollments have been archived yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    User
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {activeTab === "courses" ? "Course" : "Program"}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Enrolled
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Removed
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Removed By
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {activeList.map((record) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.userFirstName} {record.userLastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.userEmail}
                            </div>
                            {record.User?.university && (
                              <div className="text-xs text-gray-500">
                                {record.User.university}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                        <div className="truncate font-medium">
                          {activeTab === "courses"
                            ? record.courseTitle
                            : record.programTitle}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID:{" "}
                          {activeTab === "courses"
                            ? record.CourseId
                            : record.ProgramId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              record.paymentType === "free"
                                ? "bg-purple-100 text-purple-700"
                                : record.paymentType === "ccp"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {record.paymentType || "Unknown"}
                          </span>
                          {record.paymentAmount > 0 && (
                            <span className="text-xs text-gray-500">
                              {record.paymentAmount} DZD
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.enrollmentDate
                            ? new Date(
                                record.enrollmentDate,
                              ).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {record.createdAt
                            ? new Date(record.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {record.removedByName || "Admin"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-gray-400">
                          Kept permanently
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemovedEnrollments;
