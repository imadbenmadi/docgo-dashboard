// Status Badge Component - Made more compact
const StatusBadgeDashboard = ({ status, type }) => {
  const styles = {
    Paid: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Failed: "bg-red-100 text-red-600",
    Completed: "bg-blue-100 text-blue-600",
    "In Progress": "bg-purple-100 text-purple-600",
    Suspended: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadgeDashboard;
