import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import apiClient from "../utils/apiClient";

/**
 * What the signed-in admin may open.
 *
 * The server enforces the same rule on every request; this only keeps the
 * menu to what will work and explains a page the admin cannot use.
 */

// Dashboard path -> permission area. Longest prefix wins.
const PATH_AREA = [
  ["/statistics", "statistics"],
  ["/Courses", "courses"],
  ["/Certificates", "courses"],
  ["/Programs", "programs"],
  ["/CV", "services"],
  ["/Internships", "services"],
  ["/OtherServices", "services"],
  ["/Orders", "orders"],
  ["/AllPayments", "orders"],
  ["/ServicePayments", "orders"],
  ["/PaymentHistory", "orders"],
  ["/PaymentInfo", "orders"],
  ["/Applications", "orders"],
  ["/Enrolments", "enrolments"],
  ["/Enrollments", "enrolments"],
  ["/Coupons", "coupons"],
  ["/Finance", "finance"],
  ["/Users", "users"],
  ["/UserDriveLinks", "users"],
  ["/UserOptions", "users"],
  ["/ForgotPasswordRequests", "users"],
  ["/DeleteAccountRequests", "users"],
  ["/Emails", "emails"],
  ["/FAQ", "faq"],
  ["/Courses/Meetings", "courses"],
  ["/Ratings", "ratings"],
  ["/ContactInfo", "content"],
  ["/Contact", "messages"],
  ["/HelpDesk", "tickets"],
  ["/Forms", "forms"],
  ["/HomePageManagement", "content"],
  ["/Moderation", "moderation"],
  ["/ErrorLogs", "system"],
  ["/CloudStorage", "system"],
  ["/DatabaseBackup", "system"],
  ["/HR", "hr"],
  ["/Admins", "hr"],
];

export const areaForPath = (path) => {
  const p = String(path || "").split("?")[0].toLowerCase();
  let best = null;
  for (const [prefix, area] of PATH_AREA) {
    const pre = prefix.toLowerCase();
    if ((p === pre || p.startsWith(`${pre}/`)) && (!best || pre.length > best[0].length)) {
      best = [pre, area];
    }
  }
  return best ? best[1] : null;
};

const AccessContext = createContext({
  ready: false,
  owner: false,
  areas: {},
  canOpen: () => true,
});

export const useAccess = () => useContext(AccessContext);

export const AccessProvider = ({ children }) => {
  const [state, setState] = useState({ ready: false, owner: false, areas: {} });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/Admin/my-access")
      .then(({ data }) => {
        if (cancelled) return;
        const d = data?.data || {};
        setState({
          ready: true,
          owner: Boolean(d.owner),
          areas: d.areas === "all" ? "all" : d.areas || {},
        });
      })
      .catch(() => {
        if (!cancelled) setState({ ready: true, owner: false, areas: {} });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const canOpen = (path) => {
      const area = areaForPath(path);
      if (!area) return true;
      if (state.owner || state.areas === "all") return true;
      if (area === "hr") return false;
      return Boolean(state.areas?.[area]);
    };
    return { ...state, canOpen };
  }, [state]);

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
};

AccessProvider.propTypes = { children: PropTypes.node };

/** Keep only the menu entries (and sub-entries) this admin may open. */
export const filterMenu = (items, canOpen) =>
  items
    .map((item) => {
      if (item.subItems?.length) {
        const subItems = item.subItems.filter((s) => !s.link || canOpen(s.link));
        return subItems.length ? { ...item, subItems } : null;
      }
      return !item.link || canOpen(item.link) ? item : null;
    })
    .filter(Boolean);
