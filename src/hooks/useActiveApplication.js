import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
    applicationForItem,
    getApplication,
    DEFAULT_APPLICATION,
} from "../constants/applications";
import { getMenuItems } from "../constants/menuItems";

const STORAGE_KEY = "dashboard.application";

/**
 * Which application the current route belongs to, derived from the URL.
 *
 * Shared by the switcher and the sidebar so the two cannot disagree.
 * localStorage is consulted only when the route matches no page.
 */
export function useActiveApplication() {
    const location = useLocation();
    const menuItems = useMemo(() => getMenuItems(false), []);

    return useMemo(() => {
        const path = location.pathname;

        // Flatten parents and children to one list of (menu item id -> path),
        // then match the LONGEST path first so a specific child wins over its
        // parent's prefix.
        const flat = [];
        for (const item of menuItems) {
            if (item.link) flat.push({ id: item.id, path: item.link });
            for (const sub of item.subItems || []) {
                if (sub.link) flat.push({ id: item.id, path: sub.link });
            }
        }
        flat.sort((a, b) => b.path.length - a.path.length);

        const hit = flat.find((f) => path === f.path || path.startsWith(f.path + "/"));
        if (hit) {
            const app = applicationForItem(hit.id);
            if (app) return app;
        }

        let remembered = null;
        try {
            remembered = localStorage.getItem(STORAGE_KEY);
        } catch {
            /* private mode or blocked site data - fall through to the default */
        }
        return getApplication(remembered) || getApplication(DEFAULT_APPLICATION);
    }, [location.pathname, menuItems]);
}
