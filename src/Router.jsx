import { createBrowserRouter } from "react-router-dom";
import AddPDFs from "./components/Courses/AddPDFs";
import AddCourse from "./pages/AddCourse";
import AllCourses from "./pages/AllCourses";
import AllPayments from "./pages/AllPayments";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./pages/DashboardLayout ";
import EditCourse from "./pages/EditCourse";
import Login from "./pages/Login";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
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
// import Login from "./pages/Login";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "AllPayments",
                element: (
                    <ProtectedRoute>
                        <AllPayments />
                    </ProtectedRoute>
                ),
            },
            {
                path: "AddCourse",
                element: (
                    <ProtectedRoute>
                        <AddCourse />
                    </ProtectedRoute>
                ),
            },
            {
                path: "AllCourses",
                element: (
                    <ProtectedRoute>
                        <AllCourses />
                    </ProtectedRoute>
                ),
            },
            {
                path: "edit-Course/:courseId",
                element: (
                    <ProtectedRoute>
                        <EditCourse />
                    </ProtectedRoute>
                ),
            },
            {
                path: "AddPDFs/:courseId",
                element: (
                    <ProtectedRoute>
                        <AddPDFs />
                    </ProtectedRoute>
                ),
            },
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
        path: "/Login",
        element: <Login />,
    },
]);

export default router;
