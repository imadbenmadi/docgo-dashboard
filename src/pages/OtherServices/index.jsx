import { NavLink, Outlet } from "react-router-dom";
import { Briefcase, FileText, ClipboardList, Users } from "lucide-react";

export default function OtherServicesAdmin() {
  const tabs = [
    { to: "cv-service", label: "CV Service", Icon: FileText },
    { to: "internships", label: "Internships", Icon: Briefcase },
    { to: "cv-applications", label: "CV Applications", Icon: ClipboardList },
    {
      to: "internship-applications",
      label: "Internship Applications",
      Icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 max-md:p-3">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl max-md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Other Services
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Configurez le CV Service, gérez les stages et traitez les demandes.
          </p>
        </div>

        {/* Sub-navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.Icon;

              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  end
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
