import React from "react";
import { Loader2 } from "lucide-react";

const StatsCardDashboard = ({
  icon: Icon,
  title,
  value,
  percentage,
  trend,
  trendText,
  loading,
}) => {
  const trendColor = trend === "positive" ? "text-green-600" : "text-red-500";
  const trendBgColor = trend === "positive" ? "bg-green-100" : "bg-red-100";

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-blue-50 rounded-md">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-xs font-medium text-zinc-600">{title}</h3>
      </div>

      <div className="mb-2">
        {loading ? (
          <div className="flex items-center gap-1">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-xl font-bold text-zinc-400">---</span>
          </div>
        ) : (
          <span className="text-2xl font-bold text-zinc-800">{value}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <div
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${trendBgColor} ${trendColor}`}
        >
          {percentage}
        </div>
        <span className={`text-xs ${trendColor}`}>{trendText}</span>
      </div>
    </div>
  );
};

export default StatsCardDashboard;
