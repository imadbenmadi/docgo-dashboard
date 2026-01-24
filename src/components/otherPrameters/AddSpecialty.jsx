import { useState } from "react";
import Swal from "sweetalert2";

const AddSpecialty = ({
    setCurrentPage,
    isEditing,
    selectedSpecialty,
    countries,
    setCountries,
}) => {
    const [specialty, setSpecialty] = useState(
        isEditing ? selectedSpecialty?.specialty || "" : "",
    );
    const [countryId, setCountryId] = useState(
        isEditing ? selectedSpecialty?.countryId || "" : "",
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `/api/specialties/${countryId}/${specialty}`
                : "/api/specialties";
            const body = JSON.stringify({ countryId, specialty });

            // Simulate API call
            // const response = await fetch(url, {
            //   method,
            //   headers: { "Content-Type": "application/json" },
            //   body,
            // });
            // if (!response.ok) throw new Error(`Failed to ${isEditing ? "update" : "add"} specialty`);

            // Update countries state
            setCountries(
                countries.map((country) =>
                    country.id === parseInt(countryId)
                        ? {
                              ...country,
                              specialties: isEditing
                                  ? country.specialties.map((s) =>
                                        s === selectedSpecialty.specialty
                                            ? specialty
                                            : s,
                                    )
                                  : [...country.specialties, specialty],
                          }
                        : country,
                ),
            );

            Swal.fire({
                icon: "success",
                title: isEditing
                    ? "Spécialité mise à jour !"
                    : "Spécialité ajoutée !",
                text: `La spécialité a été ${isEditing ? "mise à jour" : "ajoutée"} avec succès.`,
                confirmButtonColor: "#3B82F6",
                timer: 2000,
                timerProgressBar: true,
            });
            setCurrentPage("list");
        } catch (error) {
            console.error(
                `Error ${isEditing ? "updating" : "adding"} specialty:`,
                error,
            );
            Swal.fire({
                icon: "error",
                title: `Échec de ${isEditing ? "la mise à jour" : "l'ajout"}`,
                text: `Une erreur s'est produite lors de ${isEditing ? "la mise à jour" : "l'ajout"} de la spécialité. Veuillez réessayer.`,
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
                    {isEditing ? "Edit Specialty" : "Add Specialty"}
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
                                Country
                            </label>
                            <select
                                value={countryId}
                                onChange={(e) => setCountryId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            >
                                <option value="">Select a country</option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Specialty
                            </label>
                            <input
                                type="text"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
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
                                  ? "Update Specialty"
                                  : "Add Specialty"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSpecialty;
