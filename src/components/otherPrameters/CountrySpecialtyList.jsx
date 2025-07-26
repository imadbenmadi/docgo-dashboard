import React from "react";
import Swal from "sweetalert2";

const CountrySpecialtyList = ({
  setCurrentPage,
  setIsEditing,
  setSelectedCountry,
  setSelectedSpecialty,
  countries,
  setCountries,
}) => {
  const handleEditCountry = (country) => {
    setIsEditing(true);
    setSelectedCountry(country);
    setCurrentPage("addCountry");
  };

  const handleEditSpecialty = (specialty, countryId) => {
    setIsEditing(true);
    setSelectedSpecialty({ specialty, countryId });
    setCurrentPage("addSpecialty");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className=" mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 ">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 leading-tight mb-8 sm:mb-10 lg:mb-12 text-center sm:text-left">
          Countries & Specialties
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center sm:justify-start">
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedCountry(null);
              setCurrentPage("addCountry");
            }}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Add Country
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedSpecialty(null);
              setCurrentPage("addSpecialty");
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            Add Specialty
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-6">
          {countries.map((country) => (
            <div key={country.id} className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  {country.name} ({country.code})
                </h2>
                <button
                  onClick={() => handleEditCountry(country)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-base text-center sm:text-right"
                >
                  Edit Country
                </button>
              </div>
              <ul className="mt-2">
                {country.specialties.map((specialty, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b gap-2 sm:gap-0"
                  >
                    <span className="text-sm sm:text-base">{specialty}</span>
                    <button
                      onClick={() => handleEditSpecialty(specialty, country.id)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-base text-center sm:text-right"
                    >
                      Edit Specialty
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountrySpecialtyList;
