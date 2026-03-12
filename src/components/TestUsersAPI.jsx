import { useState } from "react";
import usersAPI from "../API/Users";

const TestUsersAPI = () => {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await usersAPI.getUsers({
        page: 1,
        limit: 10,
      });
      setResponse(result);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500 max-w-md">
      <h3 className="font-bold mb-2">🧪 API Tester</h3>
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Users API"}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="mt-2 p-2 bg-green-100 rounded text-sm max-h-60 overflow-auto">
          <strong>Response:</strong>
          <pre className="text-xs mt-1">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestUsersAPI;
