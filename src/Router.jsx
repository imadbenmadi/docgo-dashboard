import { createBrowserRouter } from "react-router-dom";
import AddPDFs from "./components/Courses/AddPDFs";
import AddCourse from "./pages/Courses/AddCourse";
import AddCourseNew from "./pages/Courses/AddCourseNew";
import Courses from "./pages/Courses/Courses";
import CourseDetails from "./pages/Courses/CourseDetails";
import Manage_Videos from "./pages/Courses/Course/Manage_Videos";
import AllPayments from "./pages/AllPayments";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./pages/DashboardLayout ";
import EditCourse from "./pages/Courses/EditCourse";
// import EditCourseNew from "./pages/Courses/EditCourseNew";
import Login from "./pages/Login";
import Security from "./pages/Security";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";

import AllSpecialties from "./pages/AllSpecialties";

import AddCountrySpecialty from "./components/otherPrameters/AddCountrySpecialty";
import SecurityWithFakeData from "./pages/SecurityWithFakeData";
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // this is the layout for all protected/dashboard routes
            {
                path: "/",
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    // the "home" dashboard
                    // { index: true, element: <Dashboard /> },
                    { index: true, element: <Statistics /> },

                    // other protected pages
                    {
                        path: "AddCourse",
                        element: <AddCourseNew />,
                    },
                    {
                        path: "Courses",
                        element: <Courses />,
                    },
                    {
                        path: "Courses/:courseId",
                        element: <CourseDetails />,
                    },
                    {
                        path: "Courses/:courseId/Edit",
                        element: <EditCourse />,
                    },
                    {
                        path: "Courses/:courseId/Videos",
                        element: <Manage_Videos />,
                    },
                    {
                        path: "AddPDFs/:courseId",
                        element: <AddPDFs />,
                    },
                    {
                        path: "Security",
                        element: <SecurityWithFakeData />,
                    },
                    {
                        path: "AddCountrySpecialty",
                        element: <AddCountrySpecialty />,
                    },
                    {
                        path: "AllPayments",
                        element: <AllPayments />,
                    },
                    {
                        path: "statistics/*",
                        element: <Statistics />,
                    },
                    {
                        path: "AllSpecialties",
                        element: <AllSpecialties />,
                    },
                ].map((r) => ({
                    ...r,
                    element: <ProtectedRoute>{r.element}</ProtectedRoute>,
                })),
            },

            // public login page
            { path: "Login", element: <Login /> },

            // 404 catch-all route - must be last
            { path: "*", element: <NotFound /> },
        ],
    },
]);

export default router;
