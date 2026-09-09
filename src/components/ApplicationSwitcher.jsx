import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { APPLICATIONS, checkApplicationCoverage } from "../constants/applications";
import { getMenuItems } from "../constants/menuItems";
import { useActiveApplication } from "../hooks/useActiveApplication";
import {
    LayoutDashboard,
    GraduationCap,
    Globe,
    Briefcase,
    ClipboardList,
    FileText,
    Wallet,
    Users,
    Mail,
    Layout,
    UserCog,
    Settings,
    ChevronDown,
} from "lucide-react";

const ICONS = {
    LayoutDashboard,
    GraduationCap,
    Globe,
    Briefcase,
    ClipboardList,
    FileText,
    Wallet,
    Users,
    Mail,
    Layout,
    UserCog,
    Settings,
};

const STORAGE_KEY = "dashboard.application";

/**
 * Horizontal application bar. Picking an application filters the sidebar to
 * that application's pages.
 *
 * The active application is derived from the route rather than stored, so a
 * deep link cannot leave the bar and the sidebar disagreeing. localStorage
 * only decides where to land when the route matches nothing.
 */
const ApplicationSwitcher = ({ isCollapsed }) => {
    const menuItems = useMemo(() => getMenuItems(false), []);
    // Shared with the sidebar, so the highlighted tab and the filtered list
    // can never disagree about which application you are in.
    const activeApplication = useActiveApplication();
    const activeId = activeApplication?.id;

    // Held here rather than per tab so opening one closes the others.
    const [openId, setOpenId] = useState(null);

    // Remember it only as a landing preference for next time.
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, activeId);
        } catch {
            /* private mode, or site data blocked - the bar still works */
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

    /** Every page inside an application, flattened, for its dropdown. */
    const pagesOf = (app) => {
        const pages = [];
        for (const itemId of app.items) {
            const item = menuItems.find((m) => m.id === itemId);
            if (!item) continue;
            if (item.subItems?.length) {
                for (const sub of item.subItems) {
                    if (sub.link) pages.push({ label: sub.label, link: sub.link });
                }
            } else if (item.link) {
                pages.push({ label: item.label, link: item.link });
            }
        }
        return pages;
    };

    return (
        <nav
            aria-label="Applications"
            className="w-full border-b border-gray-200 bg-white"
        >
            <ul className="flex flex-wrap items-stretch gap-0.5 px-2">
                {APPLICATIONS.map((app) => {
                    const Icon = ICONS[app.icon] || Layout;
                    const isActive = app.id === activeId;
                    const to = landingPath(app);
                    if (!to) return null; // an application with no reachable page
                    return (
                        <ApplicationTab
                            key={app.id}
                            app={app}
                            Icon={Icon}
                            isActive={isActive}
                            to={to}
                            pages={pagesOf(app)}
                            isCollapsed={isCollapsed}
                            openId={openId}
                            setOpenId={setOpenId}
                        />
                    );
                })}
            </ul>
        </nav>
    );
};

/**
 * One application: a link, plus a dropdown of the pages inside it.
 *
 * Clicking the name still goes straight to the application, so the common case
 * costs one click as before. The caret is for the other case - jumping to a
 * specific page in an application you are not in, which used to mean going
 * there and then hunting the second bar.
 */
const ApplicationTab = ({
    app,
    Icon,
    isActive,
    to,
    pages,
    isCollapsed,
    openId,
    setOpenId,
}) => {
    const navigate = useNavigate();
    const ref = useRef(null);
    const isOpen = openId === app.id;

    // Close on an outside click or Escape. Without both, a menu opened by
    // accident stays open over the content until something else is clicked.
    useEffect(() => {
        if (!isOpen) return undefined;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpenId(null);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpenId(null);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [isOpen, setOpenId]);

    const go = (link) => {
        setOpenId(null);
        navigate(link);
    };

    return (
        <li ref={ref} className="relative">
            <div
                className={[
                    "flex items-stretch border-b-2 transition-colors",
                    isActive
                        ? "border-blue-600"
                        : "border-transparent hover:border-gray-300",
                ].join(" ")}
            >
                <Link
                    to={to}
                    aria-current={isActive ? "page" : undefined}
                    title={app.labelEn}
                    onClick={() => setOpenId(null)}
                    className={[
                        "flex items-center gap-2 whitespace-nowrap py-2.5 pl-3 text-sm",
                        pages.length > 1 ? "pr-1" : "pr-3",
                        isActive
                            ? "text-blue-700 font-medium"
                            : "text-zinc-700 hover:text-blue-700",
                    ].join(" ")}
                >
                    <Icon size={16} aria-hidden="true" />
                    <span className={isCollapsed ? "sr-only sm:not-sr-only" : ""}>
                        {app.label}
                    </span>
                </Link>

                {pages.length > 1 && (
                    <button
                        type="button"
                        aria-label={`${app.label} pages`}
                        aria-expanded={isOpen}
                        aria-haspopup="menu"
                        onClick={() => setOpenId(isOpen ? null : app.id)}
                        className={[
                            "px-1.5 text-gray-400 hover:text-blue-700",
                            isActive ? "text-blue-600" : "",
                        ].join(" ")}
                    >
                        <ChevronDown
                            size={14}
                            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                        />
                    </button>
                )}
            </div>

            {isOpen && (
                <ul
                    role="menu"
                    className="absolute left-0 top-full z-50 mt-0.5 min-w-[15rem] max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                    {pages.map((page) => (
                        <li key={page.link} role="none">
                            <button
                                role="menuitem"
                                type="button"
                                onClick={() => go(page.link)}
                                className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            >
                                {page.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

export default ApplicationSwitcher;
