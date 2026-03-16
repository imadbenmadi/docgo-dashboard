import { Archive, BarChart2, BookOpen, CheckCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseProgressAPI } from "../../API/Courses";
import ImageWithFallback from "../../components/Common/ImageWithFallback";

const CourseProgress = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await courseProgressAPI.getAllCoursesProgress();
        setCourses(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          Course Progress Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Click a course to see per-user progress details.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No courses found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Avg Progress
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className={`transition-colors ${
                    course.isDeleted
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "hover:bg-blue-50 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!course.isDeleted) {
                      navigate(`/Courses/progress/${course.id}`);
                    }
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <span className="font-medium text-gray-800">
                          {course.title}
                        </span>
                        {course.isDeleted && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                            <Archive className="w-3 h-3" />
                            Supprimé
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <Users className="w-4 h-4 text-blue-500" />
                      {course.totalEnrolled}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-blue-600">
                        {course.avgProgress}%
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${course.avgProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {course.isDeleted ? (
                      <span className="inline-flex items-center gap-1 text-gray-400 font-medium">
                        <Archive className="w-4 h-4" />
                        Verrouillé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        {course.fullyCompleted}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
