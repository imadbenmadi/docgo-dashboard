import { useCallback, useEffect, useState } from "react";
import { Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import reviewsAdminAPI from "../../API/Reviews";

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ))}
    <span className="ml-1 text-xs text-gray-500">
      {Number(rating).toFixed(1)}
    </span>
  </div>
);
StarDisplay.propTypes = { rating: PropTypes.number };

const ReviewsTable = ({ type }) => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const fetchFn =
          type === "course"
            ? reviewsAdminAPI.getCourseReviews
            : reviewsAdminAPI.getProgramReviews;
        const res = await fetchFn({ page, limit: 20 });
        setReviews(res.data.reviews || []);
        setPagination(
          res.data.pagination || { total: 0, page: 1, totalPages: 1 },
        );
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    },
    [type],
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "Delete this review permanently?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      const deleteFn =
        type === "course"
          ? reviewsAdminAPI.deleteCourseReview
          : reviewsAdminAPI.deleteProgramReview;
      await deleteFn(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete review.",
        confirmButtonText: "OK",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const entityKey = type === "course" ? "Course" : "Program";

  return (
    <div>
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No reviews found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">
                  {type === "course" ? "Course" : "Program"}
                </th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => {
                const entity = review[entityKey];
                const user = review.user;
                const fullName = user
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    user.email
                  : "Unknown";
                return (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                      {entity?.Title || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {fullName}
                      </div>
                      {user?.email && (
                        <div className="text-xs text-gray-400">
                          {user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StarDisplay rating={review.Rate} />
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-gray-600 line-clamp-2 text-xs">
                        {review.Comment || (
                          <span className="italic text-gray-400">
                            No comment
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {pagination.total} avis au total
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReviews(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchReviews(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
ReviewsTable.propTypes = { type: PropTypes.string.isRequired };

const Ratings = () => {
  const [activeTab, setActiveTab] = useState("course");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Les avis</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Gérez les avis des cours et des programmes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab("course")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "course"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Cours
        </button>
        <button
          onClick={() => setActiveTab("program")}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "program"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Programmes
        </button>
      </div>

      <ReviewsTable key={activeTab} type={activeTab} />
    </div>
  );
};

export default Ratings;
