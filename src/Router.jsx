import { createBrowserRouter } from "react-router-dom";
import Courses from "./pages/Courses/Courses";
import CourseDetails from "./pages/Courses/CourseDetails";
import Manage_Videos from "./pages/Courses/Course/Manage_Videos";
import VideoView from "./pages/Courses/Video/VideoView";
import DashboardLayout from "./pages/DashboardLayout";
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
import Contact_info from "./pages/Contact_info";
// import SecurityWithFakeData from "./pages/SecurityWithFakeData";
import Programs from "./pages/Programs/Programs";
import AddProgram from "./pages/Programs/AddProgram";
import EditProgram from "./pages/Programs/Edit_Program";
import ProgramDetails from "./pages/Programs/ProgramDetails";
import CourseBuilder from "./components/Courses/CourseraStyle/CourseBuilder";
import SectionManagement from "./pages/Courses/SectionManagement";
import Contact from "./pages/Contact";
import FAQPage from "./pages/FAQPage";
import DatabaseManagement from "./pages/DatabaseManagement";
import PaymentInfo from "./pages/PaymentInfo";
import AdminPaymentDashboard from "./pages/Payments";
import AddCourse from "./pages/AddCourse";
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
            // element: <AllPayments /> />,

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
