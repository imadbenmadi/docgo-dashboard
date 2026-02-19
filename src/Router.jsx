import { createBrowserRouter } from "react-router-dom";
import Manage_Videos from "./pages/Courses/Course/Manage_Videos";
import CourseDetails from "./pages/Courses/CourseDetails";
import Courses from "./pages/Courses/Courses";
import EditCourse from "./pages/Courses/EditCourse";
import VideoView from "./pages/Courses/Video/VideoView";
import DashboardLayout from "./pages/DashboardLayout";
// import EditCourseNew from "./pages/Courses/EditCourseNew";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import Statistics from "./pages/Statistics";

import AllSpecialties from "./pages/AllSpecialties";

import AddCountrySpecialty from "./components/otherPrameters/AddCountrySpecialty";
import Contact_info from "./pages/Contact_info";
// import SecurityWithFakeData from "./pages/SecurityWithFakeData";
import CourseBuilder from "./components/Courses/CourseraStyle/CourseBuilder";
import AddCourse from "./pages/AddCourse";
import Contact from "./pages/Contact";
import SectionManagement from "./pages/Courses/SectionManagement";
import DatabaseManagement from "./pages/DatabaseManagement";
import FAQPage from "./pages/FAQPage";
import PaymentInfo from "./pages/PaymentInfo";
import AdminPaymentDashboard from "./pages/Payments";
import AddProgram from "./pages/Programs/AddProgram";
import EditProgram from "./pages/Programs/Edit_Program";
import ProgramDetails from "./pages/Programs/ProgramDetails";
import Programs from "./pages/Programs/Programs";
import Users from "./pages/Users";
import MediaModerationCenter from "./pages/Moderation/MediaModerationCenter";
import ProgramApplications from "./pages/Applications/ProgramApplications";
import CourseApplications from "./pages/Applications/CourseApplications";
import Enrollments from "./pages/Enrollments/Enrollments";

const uploadsCheckEnabled =
    String(import.meta.env.VITE_CHECK_UPLOADS || "").toLowerCase() === "true";

const dashboardChildren = [
    // the "home" dashboard
    // { index: true, element: <Dashboard /> },
    { index: true, element: <Statistics /> },

    // other protected pages
    {
        path: "Courses/Add",
        element: <AddCourse />,
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
        path: "Courses/:courseId/sections",
        element: <SectionManagement />,
    },
    {
        path: "Courses/:courseId/Videos/:videoId",
        element: <VideoView />,
    },
    {
        path: "coursera-courses/:courseId/builder",
        element: <CourseBuilder />,
    },

    {
        path: "Security",
        element: <Security />,
    },
    {
        path: "AddCountrySpecialty",
        element: <AddCountrySpecialty />,
    },
    {
        path: "ContactInfo",
        element: <Contact_info />,
    },
    {
        path: "PaymentInfo",
        element: <PaymentInfo />,
    },
    {
        path: "AllPayments",
        element: <AdminPaymentDashboard />,
    },
    {
        path: "PaymentManagement",
        element: <AdminPaymentDashboard />,
    },
    {
        path: "statistics/*",
        element: <Statistics />,
    },
    {
        path: "AllSpecialties",
        element: <AllSpecialties />,
    },
    {
        path: "Programs",
        element: <Programs />,
    },
    {
        path: "Programs/Add",
        element: <AddProgram />,
    },
    {
        path: "Programs/:programId/Edit",
        element: <EditProgram />,
    },
    {
        path: "Programs/:programId",
        element: <ProgramDetails />,
    },
    {
        path: "FAQ",
        element: <FAQPage />,
    },
    {
        path: "Contact/*",
        element: <Contact />,
    },
    {
        path: "DatabaseManagement",
        element: <DatabaseManagement />,
    },
    {
        path: "Users",
        element: <Users />,
    },
    {
        path: "Applications/Programs",
        element: <ProgramApplications />,
    },
    {
        path: "Applications/Courses",
        element: <CourseApplications />,
    },
    {
        path: "Enrollments",
        element: <Enrollments />,
    },
];

if (uploadsCheckEnabled) {
    dashboardChildren.push({
        path: "Moderation",
        element: <MediaModerationCenter />,
    });
}

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
                children: [...dashboardChildren].map((r) => ({
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
