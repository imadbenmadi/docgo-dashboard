import React, { useState } from "react";
import CountrySpecialtyList from "./CountrySpecialtyList";
import AddCountry from "./AddCountry";
import AddSpecialty from "./AddSpecialty";

const AddCountrySpecialty = () => {
  const [currentPage, setCurrentPage] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [countries, setCountries] = useState([
    {
      id: 1,
      name: "United States",
      code: "US",
      specialties: ["Cardiology", "Neurology"],
    },
    {
      id: 2,
      name: "United Kingdom",
      code: "UK",
      specialties: ["Oncology", "Pediatrics"],
    },
  ]);

  return (
    <div>
      {currentPage === "list" && (
        <CountrySpecialtyList
          setCurrentPage={setCurrentPage}
          setIsEditing={setIsEditing}
          setSelectedCountry={setSelectedCountry}
          setSelectedSpecialty={setSelectedSpecialty}
          countries={countries}
          setCountries={setCountries}
        />
      )}
      {currentPage === "addCountry" && (
        <AddCountry
          setCurrentPage={setCurrentPage}
          isEditing={isEditing}
          selectedCountry={selectedCountry}
          countries={countries}
          setCountries={setCountries}
        />
      )}
      {currentPage === "addSpecialty" && (
        <AddSpecialty
          setCurrentPage={setCurrentPage}
          isEditing={isEditing}
          selectedSpecialty={selectedSpecialty}
          countries={countries}
          setCountries={setCountries}
        />
      )}
    </div>
  );
};

export default AddCountrySpecialty;
