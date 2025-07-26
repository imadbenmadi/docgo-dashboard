import { createBrowserRouter } from "react-router-dom";
import AddPDFs from "./components/Courses/AddPDFs";
import AddCourse from "./pages/Courses/AddCourse";
import AddCourseNew from "./pages/Courses/AddCourseNew";
import AllCourses from "./pages/Courses/AllCourses";
import AllPayments from "./pages/AllPayments";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./pages/DashboardLayout ";
import EditCourse from "./pages/EditCourse";
import EditCourseNew from "./pages/Courses/EditCourseNew";
import Login from "./pages/Login";
import Security from "./pages/Security";
import Statistics from "./pages/Statistics";
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
                        path: "AllCourses",
                        element: <AllCourses />,
                    },
                    {
                        path: "edit-Course/:courseId",
                        element: <EditCourseNew />,
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
        ],
    },
]);

export default router;
