import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
