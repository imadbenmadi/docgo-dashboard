import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { APPLICATIONS, checkApplicationCoverage } from "../constants/applications";
import { getMenuItems } from "../constants/menuItems";
import { useActiveApplication } from "../hooks/useActiveApplication";
import {
    LayoutDashboard,
    GraduationCap,
    Globe,
    Briefcase,
    ClipboardList,
    Wallet,
    Users,
    Mail,
    Layout,
    UserCog,
    Settings,
} from "lucide-react";

const ICONS = {
    LayoutDashboard,
    GraduationCap,
    Globe,
    Briefcase,
    ClipboardList,
    Wallet,
    Users,
    Mail,
    Layout,
    UserCog,
    Settings,
};

const STORAGE_KEY = "dashboard.application";

/**
 * The horizontal application bar.
 *
 * Twenty-two top-level menu entries in one list is more than anyone scans, so
 * this picks an application and the sidebar shows only its pages.
 *
 * The selected application is DERIVED from the current route, not stored as
 * the source of truth. Storing it means the two can disagree -- you deep-link
 * to a finance page, the bar still says Courses, and the sidebar shows the
 * wrong list. localStorage is only used to choose where to land when the route
 * says nothing, which is a preference rather than state.
 */
const ApplicationSwitcher = ({ isCollapsed }) => {
    const menuItems = useMemo(() => getMenuItems(false), []);
    // Shared with the sidebar, so the highlighted tab and the filtered list
    // can never disagree about which application you are in.
    const activeApplication = useActiveApplication();
    const activeId = activeApplication?.id;

    // Remember it only as a landing preference for next time.
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, activeId);
        } catch {
            /* private mode, or site data blocked -- the bar still works */
        }
    }, [activeId]);

    // A page filed under no application is still routable but unreachable by
    // clicking, which is a silent failure. Say so while it is being made.
    useEffect(() => {
        if (!import.meta.env.DEV) return;
        const report = checkApplicationCoverage(menuItems.map((m) => m.id));
        if (!report.ok) {
            console.warn(
                "[applications] menu items not reachable from any application:",
                report,
            );
        }
    }, [menuItems]);

    // Where clicking an application lands: its first page that has a path.
    const landingPath = (app) => {
        for (const itemId of app.items) {
            const item = menuItems.find((m) => m.id === itemId);
            if (!item) continue;
            const target = item.link || (item.subItems || []).find((s) => s.link)?.link;
            if (target) return target;
        }
        return null;
    };

    return (
        <nav
            aria-label="Applications"
            className="w-full border-b border-gray-200 bg-white overflow-x-auto"
        >
            <ul className="flex items-stretch gap-1 px-2 min-w-max">
                {APPLICATIONS.map((app) => {
                    const Icon = ICONS[app.icon] || Layout;
                    const isActive = app.id === activeId;
                    const to = landingPath(app);
                    if (!to) return null; // an application with no reachable page
                    return (
                        <li key={app.id}>
                            <Link
                                to={to}
                                aria-current={isActive ? "page" : undefined}
                                title={app.labelEn}
                                className={[
                                    "flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm",
                                    "border-b-2 transition-colors",
                                    isActive
                                        ? "border-blue-600 text-blue-700 font-medium"
                                        : "border-transparent text-zinc-700 hover:text-blue-700 hover:border-gray-300",
                                ].join(" ")}
                            >
                                <Icon size={16} aria-hidden="true" />
                                <span className={isCollapsed ? "sr-only sm:not-sr-only" : ""}>
                                    {app.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default ApplicationSwitcher;
