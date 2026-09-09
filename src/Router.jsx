import { lazy } from "react";
import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom";
import AppErrorScreen from "./components/AppErrorScreen";
const CourseDetails = lazy(() => import("./pages/Courses/CourseDetails"));
const CourseProgress = lazy(() => import("./pages/Courses/CourseProgress"));
const CourseProgressDetails = lazy(() => import("./pages/Courses/CourseProgressDetails"));
const Courses = lazy(() => import("./pages/Courses/Courses"));
const EditCourse = lazy(() => import("./pages/Courses/EditCourse"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
// import EditCourseNew from "./pages/Courses/EditCourseNew";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Security = lazy(() => import("./pages/Security"));
const Statistics = lazy(() => import("./pages/Statistics"));
import OverviewStats from "./components/Statistics/OverviewStats";
import VisitAnalytics from "./components/Statistics/VisitAnalytics";
import ContentAnalytics from "./components/Statistics/ContentAnalytics";
import UserAnalytics from "./components/Statistics/UserAnalytics";
import PaymentAnalytics from "./components/Statistics/PaymentAnalytics";
import FavoritesAnalytics from "./components/Statistics/FavoritesAnalytics";
import SearchAnalytics from "./components/Statistics/SearchAnalytics";
import LoginLogs from "./components/Statistics/LoginLogs";

const AllSpecialties = lazy(() => import("./pages/AllSpecialties"));
import AddCountrySpecialty from "./components/otherPrameters/AddCountrySpecialty";
const Contact_info = lazy(() => import("./pages/Contact_info"));
const AddCourse = lazy(() => import("./pages/AddCourse"));
const Contact = lazy(() => import("./pages/Contact"));
const SectionManagement = lazy(() => import("./pages/Courses/SectionManagement"));
const CertificatesPage = lazy(() => import("./pages/Certificates/CertificatesPage"));
const CertificateDesignerPage = lazy(() => import("./pages/Certificates/CertificateDesignerPage"));
// The full Fabric.js designer. It supports per-course designs, thumbnails and
// element binding; the older CertificateDesignerPage above is the cut-down
// duplicate that used to be wired here.
const CertificateDesigner = lazy(() => import("./pages/Courses/CertificateDesigner"));
const AdminCertificateTemplates = lazy(() => import("./pages/Courses/AdminCertificates"));
const DatabaseManagement = lazy(() => import("./pages/DatabaseManagement"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PaymentInfo = lazy(() => import("./pages/PaymentInfo"));
const AdminPaymentDashboard = lazy(() => import("./pages/Payments"));
const ServicePayments = lazy(() => import("./pages/Payments/ServicePayments"));
const HistoricalPaymentsPage = lazy(() => import("./pages/HistoricalPaymentsPage"));
const AddProgram = lazy(() => import("./pages/Programs/AddProgram"));
const EditProgram = lazy(() => import("./pages/Programs/Edit_Program"));
const ProgramDetails = lazy(() => import("./pages/Programs/ProgramDetails"));
const Programs = lazy(() => import("./pages/Programs/Programs"));
const Users = lazy(() => import("./pages/Users"));
const MediaModerationCenter = lazy(() => import("./pages/Moderation/MediaModerationCenter"));
const ContentModerationResults = lazy(() => import("./pages/Moderation/ContentModerationResults"));
const ProgramApplications = lazy(() => import("./pages/Applications/ProgramApplications"));
const CourseApplications = lazy(() => import("./pages/Applications/CourseApplications"));
const ApplicationsLayout = lazy(() => import("./pages/Applications/index"));
const Enrollments = lazy(() => import("./pages/Enrollments/Enrollments"));
const RemovedEnrollments = lazy(() => import("./pages/Enrollments/RemovedEnrollments"));
const Coupons = lazy(() => import("./pages/Coupons/Coupons"));
const HomePageManagement = lazy(() => import("./pages/HomePageManagement/index"));
const ContentEditor = lazy(() => import("./pages/HomePageManagement/ContentEditor"));
const FeaturedItems = lazy(() => import("./pages/HomePageManagement/FeaturedItems"));
const UserOptions = lazy(() => import("./pages/Management/UserOptions"));
const StudyInsights = lazy(() => import("./pages/RegisterOptions/StudyInsights"));
const ErrorLogs = lazy(() => import("./pages/ErrorLogs"));
const ForgotPasswordRequests = lazy(() => import("./pages/ForgotPasswordRequests"));
const DeleteAccountRequests = lazy(() => import("./pages/DeleteAccountRequests"));
const Ratings = lazy(() => import("./pages/Ratings/index"));
const QRCodeBuilder = lazy(() => import("./pages/Tools/QRCodeBuilder"));
const AdminsPage = lazy(() => import("./pages/Admins"));
const DatabaseBackup = lazy(() => import("./pages/DatabaseBackup"));
const CloudStorage = lazy(() => import("./pages/CloudStorage"));
const EmailsLayout = lazy(() => import("./pages/Emails/EmailsLayout"));
const WelcomeEmailPage = lazy(() => import("./pages/Emails/WelcomeEmailPage"));
const LoginAttemptEmailPage = lazy(() => import("./pages/Emails/LoginAttemptEmailPage"));
const MarketingEmailPage = lazy(() => import("./pages/Emails/MarketingEmailPage"));
const PaymentApprovedEmailPage = lazy(() => import("./pages/Emails/PaymentApprovedEmailPage"));
const PaymentRejectedEmailPage = lazy(() => import("./pages/Emails/PaymentRejectedEmailPage"));
const PasswordResetEmailPage = lazy(() => import("./pages/Emails/PasswordResetEmailPage"));
const ContactUserEmailPage = lazy(() => import("./pages/Emails/ContactUserEmailPage"));
const Notifications = lazy(() => import("./pages/Notifications"));
const UserDriveLinkManagement = lazy(() => import("./pages/UserDriveLinks"));
const CVServiceSettings = lazy(() => import("./pages/OtherServices/CVServiceSettings"));
const CVCatalogue = lazy(() => import("./pages/CV/CVCatalogue"));
const InternshipManagement = lazy(() => import("./pages/OtherServices/InternshipManagement"));
const CVApplications = lazy(() => import("./pages/OtherServices/CVApplications"));
const InternshipApplications = lazy(() => import("./pages/OtherServices/InternshipApplications"));
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
    path: "Courses/Deleted",
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
    element: <CertificatesPage />,
  },
  // Certificate template list. AdminCertificates navigates to
  // /CertificateDesigner and /CertificateDesigner/:id — neither route existed,
  // so every button on that page was a dead link. That is why the designer
  // "did not work".
  {
    path: "CertificateTemplates",
    element: <AdminCertificateTemplates />,
  },
  {
    path: "CertificateDesigner",
    element: <CertificateDesigner />,
  },
  {
    path: "CertificateDesigner/:templateId",
    element: <CertificateDesigner />,
  },
  // Legacy paths kept alive, pointed at the same designer so there is only one.
  {
    path: "Certificates/Designer",
    element: <CertificateDesigner />,
  },
  {
    path: "Certificates/Edit/:templateId",
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
  // CV and paid-internship receipts. Same review flow as course/program
  // payments, which live on the pages above.
  {
    path: "ServicePayments",
    element: <ServicePayments />,
  },
  {
    path: "PaymentHistory",
    element: <HistoricalPaymentsPage />,
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
    path: "Programs/Deleted",
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
    path: "CloudStorage",
    element: <CloudStorage />,
  },
  {
    path: "Users",
    element: <Users />,
  },
  {
    path: "UserDriveLinks",
    element: <UserDriveLinkManagement />,
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
    path: "Emails",
    element: <EmailsLayout />,
    children: [
      { index: true, element: <Navigate to="Welcome" replace /> },
      { path: "Welcome", element: <WelcomeEmailPage /> },
      { path: "LoginAttempts", element: <LoginAttemptEmailPage /> },
      { path: "PaymentApproved", element: <PaymentApprovedEmailPage /> },
      { path: "PaymentRejected", element: <PaymentRejectedEmailPage /> },
      { path: "PasswordReset", element: <PasswordResetEmailPage /> },
      { path: "Marketing", element: <MarketingEmailPage /> },
      { path: "ContactUser", element: <ContactUserEmailPage /> },
    ],
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
    path: "UserOptions",
    element: <UserOptions />,
  },
  {
    path: "UserOptions/Insights",
    element: <StudyInsights />,
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
  {
    path: "Notifications",
    element: <Notifications />,
  },
  // Two products, two route trees. The pages are unchanged; what has gone is
  // the shared parent that rendered its own tab bar to switch between them --
  // the sidebar does that now.
  { path: "CV", element: <Navigate to="/CV/services" replace /> },
  { path: "CV/services", element: <CVCatalogue /> },
  // The old single-service form, still reachable and still working.
  { path: "CV/settings", element: <CVServiceSettings /> },
  { path: "CV/applications", element: <CVApplications /> },
  { path: "Internships", element: <InternshipManagement /> },
  { path: "Internships/applications", element: <InternshipApplications /> },

  // Anything that still points at the old paths keeps working.
  { path: "OtherServices", element: <Navigate to="/CV/services" replace /> },
  {
    path: "OtherServices/cv-service",
    element: <Navigate to="/CV/services" replace />,
  },
  {
    path: "OtherServices/cv-applications",
    element: <Navigate to="/CV/applications" replace />,
  },
  {
    path: "OtherServices/internships",
    element: <Navigate to="/Internships" replace />,
  },
  {
    path: "OtherServices/internship-applications",
    element: <Navigate to="/Internships/applications" replace />,
  },
];

if (uploadsCheckEnabled) {
  dashboardChildren.push({
    path: "Moderation",
    element: <MediaModerationCenter />,
  });
}

/**
 * Bridges React Router's error to the shared screen. Kept here rather than in
 * AppErrorScreen so that component stays usable from a plain error boundary
 * too, where there is no router to ask.
 */
function RouteError() {
  const error = useRouteError();
  return <AppErrorScreen error={error} app="dashboard" />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // Without this, any thrown error reaches React Router's default screen --
    // the one that says "Hey developer" to whoever happened to hit the bug and
    // tells nobody who could fix it.
    errorElement: <RouteError />,
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
