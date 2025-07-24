import { useState } from "react";
import Swal from "sweetalert2";

const AddCountry = ({
  setCurrentPage,
  isEditing,
  selectedCountry,
  countries,
  setCountries,
}) => {
  const [name, setName] = useState(isEditing ? selectedCountry.name : "");
  const [code, setCode] = useState(isEditing ? selectedCountry.code : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `/api/countries/${selectedCountry.id}`
        : "/api/countries";
      const body = JSON.stringify({
        name,
        code,
        specialties: isEditing ? selectedCountry.specialties : [],
      });

      // Simulate API call
      // const response = await fetch(url, {
      //   method,
      //   headers: { "Content-Type": "application/json" },
      //   body,
      // });
      // if (!response.ok) throw new Error(`Failed to ${isEditing ? "update" : "add"} country`);

      // Update countries state
      if (isEditing) {
        setCountries(
          countries.map((country) =>
            country.id === selectedCountry.id
              ? { ...country, name, code }
              : country
          )
        );
      } else {
        const newCountry = {
          id: countries.length + 1, // Simple ID generation; replace with API response ID in real app
          name,
          code,
          specialties: [],
        };
        setCountries([...countries, newCountry]);
      }

      Swal.fire({
        icon: "success",
        title: isEditing ? "Country Updated!" : "Country Added!",
        text: `The country has been successfully ${
          isEditing ? "updated" : "added"
        }.`,
        confirmButtonColor: "#3B82F6",
        timer: 2000,
        timerProgressBar: true,
      });
      setCurrentPage("list");
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} country:`,
        error
      );
      Swal.fire({
        icon: "error",
        title: `${isEditing ? "Update" : "Add"} Failed`,
        text: `There was an error ${
          isEditing ? "updating" : "adding"
        } the country. Please try again.`,
        confirmButtonColor: "#3B82F6",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="mx-auto px-6 py-16">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 leading-tight mb-12">
          {isEditing ? "Edit Country" : "Add Country"}
        </h1>
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-lg mx-auto">
          <div
            className="mb-4 cursor-pointer"
            onClick={() => setCurrentPage("list")}
          >
            <span className="text-blue-600 hover:text-blue-800 font-semibold">
              ← Back to List
            </span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Country Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Country Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Processing..."
                : isEditing
                ? "Update Country"
                : "Add Country"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCountry;
