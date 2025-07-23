import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./pages/DashboardLayout ";
import Dashboard from "./pages/Dashboard";
import AllPayments from "./pages/AllPayments";
import AddCourse from "./pages/AddCourse";
import AllCourses from "./pages/AllCourses";
import EditCourse from "./pages/EditCourse";
import AddPDFs from "./components/Courses/AddPDFs";
import Security from "./pages/Security";
import AllSpecialties from "./pages/AllSpecialties";

import Login from "./pages/Login";

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
          // the “home” dashboard
          { index: true, element: <Dashboard /> },

          // other protected pages
          { path: "AllPayments", element: <AllPayments /> },
          { path: "AddCourse", element: <AddCourse /> },
          { path: "AllCourses", element: <AllCourses /> },
          { path: "edit-Course/:courseId", element: <EditCourse /> },
          { path: "AddPDFs/:courseId", element: <AddPDFs /> },
          { path: "Security", element: <Security /> },
          {
            path: "AllSpecialties",
            element: <AllSpecialties />,
          },
          //   { path: "AddSpecialty", element: <AddSpecialty /> },
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
