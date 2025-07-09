import {
  BookOpen,
  Users,
  Plus,
  FileText,
  Settings,
  Globe,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";

import Swal from "sweetalert2";

const Sidebar = ({ activeItem, setActiveItem, closeSidebar }) => {
  // Function to show alert
  const showAlert = (type, title, text) => {
    Swal.fire({
      icon: type,
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    });
  };

  // Handle item click
  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    // Close sidebar on mobile when item is clicked
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const menuItems = [
    {
      id: "users",
      label: "Tous les utilisateurs",
      icon: Users,
      hasSubmenu: true,
    },
    {
      id: "study-abroad",
      label: "Étudier à l'étranger",
      icon: Globe,
      isSubmenu: true,
    },
    {
      id: "courses",
      label: "Apprendre des cours",
      icon: BookOpen,
      isSubmenu: true,
      active: true,
    },
    { id: "add-course", label: "Ajouter un nouveau cours", icon: Plus },
    { id: "add-quiz", label: "Ajouter un quiz / PDF", icon: FileText },
    {
      id: "add-category",
      label: "Ajouter une nouvelle catégorie",
      icon: Plus,
    },
    { id: "all-courses", label: "Tous les cours", icon: BookOpen },
    {
      id: "specialties",
      label: "Ajouter des spécialités / pays",
      icon: Settings,
    },
  ];

  return (
    <nav className="w-full bg-white h-screen flex flex-col shadow-lg">
      {/* Mobile Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
        <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
        <button
          onClick={closeSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto pt-4 md:pt-8 pb-4">
        <div className="px-4 md:px-6">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeItem === item.id || item.active
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-zinc-800 hover:bg-gray-50"
                  } ${item.isSubmenu ? "ml-4" : ""}`}
                  onClick={() => handleItemClick(item.id)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-sm leading-tight">
                    {item.label}
                  </span>
                  {item.hasSubmenu && (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 md:p-6 border-t border-gray-200">
        <button
          className="flex items-center gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg p-3 transition-all duration-200 w-full"
          onClick={() =>
            showAlert(
              "warning",
              "Déconnexion",
              "Êtes-vous sûr de vouloir vous déconnecter?"
            )
          }
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Se déconnecter</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
