import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./pages/DashboardLayout ";
import SignInDashboard from "./pages/SignInDashboard";
import Dashboard from "./pages/Dashboard";
// import DashboardLayout from "../layouts/DashboardLayout";
// import Dashboard from "../pages/Dashboard/Dashboard";
// import AllUsers from "../pages/Users/AllUsers";
// import AllCourses from "../pages/Courses/AllCourses";
// import AddCourse from "../pages/Courses/AddCourse";
// import CourseDetail from "../pages/Courses/CourseDetail";
// import AddQuiz from "../pages/Courses/AddQuiz";
// import AddPDF from "../pages/Courses/AddPDF";
// import Specialties from "../pages/Specialties/Specialties";
// import AddSpecialty from "../pages/Specialties/AddSpecialty";
// import StudyAbroad from "../pages/StudyAbroad/StudyAbroad";
// import SignInDashboard from "./pages/SignInDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      //   {
      //     path: "users",
      //     element: <AllUsers />,
      //   },
      //   {
      //     path: "courses",
      //     children: [
      //       {
      //         path: "",
      //         element: <AllCourses />,
      //       },
      //       {
      //         path: "add",
      //         element: <AddCourse />,
      //       },
      //       {
      //         path: ":courseId",
      //         element: <CourseDetail />,
      //       },
      //       {
      //         path: ":courseId/add-quiz",
      //         element: <AddQuiz />,
      //       },
      //       {
      //         path: ":courseId/add-pdf",
      //         element: <AddPDF />,
      //       },
      //     ],
      //   },
      //   {
      //     path: "specialties",
      //     children: [
      //       {
      //         path: "",
      //         element: <Specialties />,
      //       },
      //       {
      //         path: "add",
      //         element: <AddSpecialty />,
      //       },
      //     ],
      //   },
      //   {
      //     path: "study-abroad",
      //     element: <StudyAbroad />,
      //   },
    ],
  },
  {
    path: "/SignInDashboard",
    element: <SignInDashboard />,
  },
]);

export default router;
