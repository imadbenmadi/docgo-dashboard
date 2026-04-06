import { ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { getMenuItems } from "../constants/menuItems";

/**
 * SubNavigation Component
 * Displays children routes of the currently active parent menu item
 * Appears as a horizontal bar below the main navbar
 */
const SubNavigation = () => {
  const location = useLocation();
  const menuItems = useMemo(() => getMenuItems(), []);

  // Get current parent and its children
  const { currentParent, children } = useMemo(() => {
    // Find the active menu item based on current location
    let activeParent = null;
    let childrenList = [];

    for (const item of menuItems) {
      if (item.hasSubmenu && item.subItems) {
        const isActive =
          item.link === location.pathname ||
          item.subItems.some(
            (sub) =>
              sub.link === location.pathname ||
              location.pathname.startsWith(sub.link + "/"),
          );

        if (isActive) {
          activeParent = item;
          childrenList = item.subItems || [];
          break;
        }
      }
    }

    return { currentParent: activeParent, children: childrenList };
  }, [menuItems, location.pathname]);

  // Don't show sub-navigation if no parent is active or no children
  if (!currentParent || !children || children.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-0 sticky top-0 z-40">
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Parent label */}
        <div className="flex items-center gap-2 pr-4 text-sm font-semibold text-gray-600 shrink-0">
          <span>{currentParent.label}</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        {/* Children navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-0">
          {children.map((child) => (
            <NavLink
              key={child.id}
              to={child.link}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
                }`
              }
              end
            >
              {child.icon && <child.icon className="w-4 h-4" />}
              <span>{child.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SubNavigation;
