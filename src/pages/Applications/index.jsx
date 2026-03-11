import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, GraduationCap } from "lucide-react";

const ApplicationsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCoursesTab =
    location.pathname.endsWith("/Courses") ||
    location.pathname.endsWith("/Courses/");
  const isProgramsTab =
    location.pathname.endsWith("/Programs") ||
    location.pathname.endsWith("/Programs/");

  return (
    <div>
      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Applications</h1>
        <div className="flex gap-1">
          <button
            onClick={() => navigate("/Applications/Courses")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              isCoursesTab
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Applications
          </button>
          <button
            onClick={() => navigate("/Applications/Programs")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              isProgramsTab
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Program Applications
          </button>
        </div>
      </div>

      {/* Sub-route content */}
      <Outlet />
    </div>
  );
};

export default ApplicationsLayout;
