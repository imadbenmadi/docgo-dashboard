import { useState } from "react";
import CVServiceSettings from "./CVServiceSettings";
import InternshipManagement from "./InternshipManagement";
import CVApplications from "./CVApplications";
import InternshipApplications from "./InternshipApplications";
import "./OtherServices.css";

export default function OtherServicesAdmin() {
  const [activeTab, setActiveTab] = useState("cv-service");

  const tabs = [
    { id: "cv-service", label: "CV Service", icon: "📝" },
    { id: "internships", label: "Internships", icon: "💼" },
    { id: "cv-applications", label: "CV Applications", icon: "✅" },
    {
      id: "internship-applications",
      label: "Internship Applications",
      icon: "🎯",
    },
  ];

  return (
    <div className="other-services-container">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-300">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "border-b-4 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "cv-service" && <CVServiceSettings />}
        {activeTab === "internships" && <InternshipManagement />}
        {activeTab === "cv-applications" && <CVApplications />}
        {activeTab === "internship-applications" && <InternshipApplications />}
      </div>
    </div>
  );
}
