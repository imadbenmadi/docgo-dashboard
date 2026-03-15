import { createBrowserRouter, Navigate } from "react-router-dom";
import CourseDetails from "./pages/Courses/CourseDetails";
import CourseProgress from "./pages/Courses/CourseProgress";
import CourseProgressDetails from "./pages/Courses/CourseProgressDetails";
import Courses from "./pages/Courses/Courses";
import EditCourse from "./pages/Courses/EditCourse";
import DashboardLayout from "./pages/DashboardLayout";
// import EditCourseNew from "./pages/Courses/EditCourseNew";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Security from "./pages/Security";
import Statistics from "./pages/Statistics";
import OverviewStats from "./components/Statistics/OverviewStats";
import VisitAnalytics from "./components/Statistics/VisitAnalytics";
import ContentAnalytics from "./components/Statistics/ContentAnalytics";
import UserAnalytics from "./components/Statistics/UserAnalytics";
import PaymentAnalytics from "./components/Statistics/PaymentAnalytics";
import FavoritesAnalytics from "./components/Statistics/FavoritesAnalytics";
import SearchAnalytics from "./components/Statistics/SearchAnalytics";
import LoginLogs from "./components/Statistics/LoginLogs";

import AllSpecialties from "./pages/AllSpecialties";

import AddCountrySpecialty from "./components/otherPrameters/AddCountrySpecialty";
import Contact_info from "./pages/Contact_info";
// import SecurityWithFakeData from "./pages/SecurityWithFakeData";
import AddCourse from "./pages/AddCourse";
import Contact from "./pages/Contact";
import SectionManagement from "./pages/Courses/SectionManagement";
import AdminCertificates from "./pages/Courses/AdminCertificates";
import CertificateDesigner from "./pages/Courses/CertificateDesigner";
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
import ContentModerationResults from "./pages/Moderation/ContentModerationResults";
import ProgramApplications from "./pages/Applications/ProgramApplications";
import CourseApplications from "./pages/Applications/CourseApplications";
import ApplicationsLayout from "./pages/Applications/index";
import Enrollments from "./pages/Enrollments/Enrollments";
import RemovedEnrollments from "./pages/Enrollments/RemovedEnrollments";
import Coupons from "./pages/Coupons/Coupons";
import HomePageManagement from "./pages/HomePageManagement/index";
import ContentEditor from "./pages/HomePageManagement/ContentEditor";
import FeaturedItems from "./pages/HomePageManagement/FeaturedItems";
import FilterOptions from "./pages/HomePageManagement/FilterOptions";
import RegisterOptions from "./pages/RegisterOptions/index";
import StudyInsights from "./pages/RegisterOptions/StudyInsights";
import ErrorLogs from "./pages/ErrorLogs";
import ForgotPasswordRequests from "./pages/ForgotPasswordRequests";
import DeleteAccountRequests from "./pages/DeleteAccountRequests";
import Ratings from "./pages/Ratings/index";
import QRCodeBuilder from "./pages/Tools/QRCodeBuilder";
import AdminsPage from "./pages/Admins";
import DatabaseBackup from "./pages/DatabaseBackup";

const uploadsCheckEnabled =
  String(import.meta.env.VITE_CHECK_UPLOADS || "").toLowerCase() === "true";

const dashboardChildren = [
  { index: true, element: <Navigate to="statistics" replace /> },

  {
    path: "statistics",
    element: <Statistics />,
    children: [
      { index: true, element: <OverviewStats /> },
      { path: "visits", element: <VisitAnalytics /> },
      { path: "content", element: <ContentAnalytics /> },
      { path: "users", element: <UserAnalytics /> },
      { path: "payments", element: <PaymentAnalytics /> },
      { path: "favorites", element: <FavoritesAnalytics /> },
      { path: "searches", element: <SearchAnalytics /> },
      { path: "registrations", element: <StudyInsights /> },
      { path: "logins", element: <LoginLogs /> },
    ],
  },

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
    path: "Courses/progress",
    element: <CourseProgress />,
  },
  {
    path: "Courses/progress/:courseId",
    element: <CourseProgressDetails />,
  },
  {
    path: "Courses/:courseId/Edit",
    element: <EditCourse />,
  },
  {
    path: "Courses/:courseId/sections",
    element: <SectionManagement />,
  },
  {
    path: "Certificates",
    element: <AdminCertificates />,
  },
  {
    path: "CertificateDesigner",
    element: <CertificateDesigner />,
  },
  {
    path: "CertificateDesigner/:templateId",
    element: <CertificateDesigner />,
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
    path: "DatabaseBackup",
    element: <DatabaseBackup />,
  },
  {
    path: "Users",
    element: <Users />,
  },
  {
    path: "Admins",
    element: <AdminsPage />,
  },
  {
    path: "Applications",
    element: <ApplicationsLayout />,
    children: [
      { index: true, element: <CourseApplications /> },
      { path: "Courses", element: <CourseApplications /> },
      { path: "Programs", element: <ProgramApplications /> },
    ],
  },
  {
    path: "Enrollments",
    element: <Enrollments />,
  },
  {
    path: "Enrollments/Removed",
    element: <RemovedEnrollments />,
  },
  {
    path: "Coupons",
    element: <Coupons />,
  },
  {
    path: "HomePageManagement",
    element: <HomePageManagement />,
  },
  {
    path: "HomePageManagement/Content",
    element: <ContentEditor />,
  },
  {
    path: "HomePageManagement/Featured",
    element: <FeaturedItems />,
  },
  {
    path: "HomePageManagement/FilterOptions",
    element: <FilterOptions />,
  },
  {
    path: "RegisterOptions",
    element: <RegisterOptions />,
  },
  {
    path: "RegisterOptions/Insights",
    element: <StudyInsights />,
  },
  {
    path: "ErrorLogs",
    element: <ErrorLogs />,
  },
  {
    path: "ForgotPasswordRequests",
    element: <ForgotPasswordRequests />,
  },
  {
    path: "DeleteAccountRequests",
    element: <DeleteAccountRequests />,
  },
  {
    path: "ContentModeration",
    element: <ContentModerationResults />,
  },
  {
    path: "Ratings",
    element: <Ratings />,
  },
  {
    path: "Tools/QRCode",
    element: <QRCodeBuilder />,
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
