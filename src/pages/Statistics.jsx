import React from "react";
import { Routes, Route } from "react-router-dom";
import OverviewStats from "../components/Statistics/OverviewStats";
import VisitAnalytics from "../components/Statistics/VisitAnalytics";
import ContentAnalytics from "../components/Statistics/ContentAnalytics";
import UserAnalytics from "../components/Statistics/UserAnalytics";
import PaymentAnalytics from "../components/Statistics/PaymentAnalytics";
import FavoritesAnalytics from "../components/Statistics/FavoritesAnalytics";
import SearchAnalytics from "../components/Statistics/SearchAnalytics";
import StudyInsights from "./RegisterOptions/StudyInsights";
import LoginLogs from "../components/Statistics/LoginLogs";

const Statistics = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route index element={<OverviewStats />} />
                <Route path="visits" element={<VisitAnalytics />} />
                <Route path="content" element={<ContentAnalytics />} />
                <Route path="users" element={<UserAnalytics />} />
                <Route path="payments" element={<PaymentAnalytics />} />
                <Route path="favorites" element={<FavoritesAnalytics />} />
                <Route path="searches" element={<SearchAnalytics />} />
                <Route path="registrations" element={<StudyInsights />} />
                <Route path="logins" element={<LoginLogs />} />
            </Routes>
        </div>
    );
};

export default Statistics;
