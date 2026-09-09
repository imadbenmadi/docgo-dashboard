// Applications: the layer above the sidebar.
//
// The dashboard had 22 top-level menu entries in one flat list, which is more
// than anyone scans. This groups them the way the skate platform does -- a
// horizontal switcher picks an APPLICATION, and the sidebar then shows only
// that application's pages.
//
// Nothing about the pages themselves changes. `items` holds the ids already
// defined in constants/menuItems.js, so this file is purely a grouping and the
// two cannot disagree about what a page is or where it lives -- only about
// which application it belongs to. checkApplicationCoverage() below asserts
// that every menu item is claimed by exactly one application, so adding a page
// without filing it fails loudly instead of hiding it.
//
// Order matters: it is the order of the switcher, arranged by how often a day
// actually starts there.

export const APPLICATIONS = [
    {
        id: "overview",
        label: "Tableau de bord",
        labelEn: "Dashboard",
        icon: "LayoutDashboard",
        items: ["statistics"],
    },
    {
        id: "courses",
        label: "Cours",
        labelEn: "Courses",
        icon: "GraduationCap",
        items: ["courses"],
    },
    {
        id: "programs",
        label: "Programmes",
        labelEn: "Programs",
        icon: "Globe",
        items: ["programs"],
    },
    {
        id: "services",
        label: "Services",
        labelEn: "Services",
        icon: "Briefcase",
        // CVs and internships. Separate from Programs because they are a
        // different product with a different form, even though the pipeline
        // behind them is identical.
        items: ["other-services"],
    },
    {
        id: "applications",
        label: "Candidatures",
        labelEn: "Applications",
        icon: "ClipboardList",
        // Deliberately its own application rather than living under each
        // product: an admin reviewing today's applications wants them in one
        // place, not spread across four screens.
        items: ["applications", "enrollments"],
    },
    {
        id: "finance",
        label: "Finance",
        labelEn: "Finance",
        icon: "Wallet",
        // Income, outcome and the monthly report are not built yet -- see
        // docs/TODO2.md. When they are, they belong here.
        items: ["paiements", "coupons"],
    },
    {
        id: "users",
        label: "Utilisateurs",
        labelEn: "Users",
        icon: "Users",
        items: ["users", "user-options", "user-drive-links", "user-requests"],
    },
    {
        id: "communication",
        label: "Communication",
        labelEn: "Communication",
        icon: "Mail",
        items: ["emails", "contact", "faq", "ratings"],
    },
    {
        id: "website",
        label: "Site web",
        labelEn: "Website",
        icon: "Layout",
        items: ["homepage", "contact-info"],
    },
    {
        id: "hr",
        label: "RH",
        labelEn: "HR",
        icon: "UserCog",
        // Today this is only the admin list. Per-admin page permissions -- the
        // thing that makes it an HR application rather than a user list -- are
        // not built yet.
        items: ["admins"],
    },
    {
        id: "system",
        label: "Système",
        labelEn: "System",
        icon: "Settings",
        items: ["error-logs", "database-backup", "cloud-storage", "tools"],
    },
];

/** Which application owns this menu item id. */
export function applicationForItem(itemId) {
    return APPLICATIONS.find((app) => app.items.includes(itemId)) || null;
}

export function getApplication(appId) {
    return APPLICATIONS.find((a) => a.id === appId) || null;
}

export const DEFAULT_APPLICATION = APPLICATIONS[0].id;

/**
 * Every menu item must belong to exactly one application.
 *
 * A page filed nowhere becomes invisible the moment the sidebar is filtered by
 * application -- it is still routable, so nothing errors, and it simply stops
 * being reachable by clicking. That is a bad failure: silent, and only noticed
 * when somebody asks where a screen went. Called from the switcher in
 * development so it shows up while the change is being made.
 */
export function checkApplicationCoverage(menuItemIds) {
    const claimed = new Map();
    for (const app of APPLICATIONS) {
        for (const id of app.items) {
            if (claimed.has(id)) {
                claimed.set(id, [...claimed.get(id), app.id]);
            } else {
                claimed.set(id, [app.id]);
            }
        }
    }
    const unclaimed = menuItemIds.filter((id) => !claimed.has(id));
    const duplicated = [...claimed.entries()].filter(([, apps]) => apps.length > 1);
    const unknown = [...claimed.keys()].filter((id) => !menuItemIds.includes(id));
    return { unclaimed, duplicated, unknown, ok: !unclaimed.length && !duplicated.length && !unknown.length };
}
