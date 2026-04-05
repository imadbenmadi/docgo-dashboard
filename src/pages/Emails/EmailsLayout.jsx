import {
  Mail,
  Receipt,
  ShieldAlert,
  Sparkles,
  XCircle,
  Key,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  {
    to: "/Emails/Welcome",
    label: "Welcome",
    icon: Sparkles,
  },
  {
    to: "/Emails/LoginAttempts",
    label: "Login Attempts",
    icon: ShieldAlert,
  },
  {
    to: "/Emails/PaymentApproved",
    label: "Payment Approved",
    icon: Receipt,
  },
  {
    to: "/Emails/PaymentRejected",
    label: "Payment Rejected",
    icon: XCircle,
  },
  {
    to: "/Emails/PasswordReset",
    label: "Password Reset",
    icon: Key,
  },
  {
    to: "/Emails/Marketing",
    label: "Marketing",
    icon: Mail,
  },
];

const EmailsLayout = () => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Emails</h1>
        <p className="text-gray-600 mt-2">
          Gérez les templates automatiques et les campagnes marketing depuis un
          éditeur riche.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default EmailsLayout;
