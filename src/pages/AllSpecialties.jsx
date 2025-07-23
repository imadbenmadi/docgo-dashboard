import React, { useState, useRef } from "react";

import Swal from "sweetalert2";
import ProgramForm from "../components/Programes/ProgramForm";
import ProgramsList from "../components/Programes/ProgramsList";
import ProgramDetails from "../components/Programes/ProgramDetails";

const AllSpecialties = () => {
  const [currentPage, setCurrentPage] = useState("programs");
  const [programs, setPrograms] = useState([
    {
      id: 1,
      title: "Business Studies in London",
      price: "$25,000",
      country: "United Kingdom",
      duration: "1 Year",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
      description:
        "<p>Study business in the heart of London with access to leading companies and networking opportunities.</p>",
      requirements:
        "<ul><li>Bachelor's degree</li><li>IELTS 6.5+</li><li>Work experience preferred</li></ul>",
      applicationDeadline: "2024-12-01",
      university: "London Business School",
    },
    {
      id: 2,
      title: "Computer Science in Silicon Valley",
      price: "$45,000",
      country: "United States",
      duration: "2 Years",
      image: "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=400",
      description:
        "<p>Master's program in Computer Science with internship opportunities at top tech companies.</p>",
      requirements:
        "<ul><li>Computer Science degree</li><li>GRE scores</li><li>Programming portfolio</li></ul>",
      applicationDeadline: "2024-11-15",
      university: "Stanford University",
    },
  ]);

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);
  const descriptionRef = useRef(null);
  const requirementsRef = useRef(null);

  const handleImageUpload = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFieldValue("image", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    const description = descriptionRef.current?.innerHTML || values.description;
    const requirements =
      requirementsRef.current?.innerHTML || values.requirements;

    const programData = {
      ...values,
      description,
      requirements,
      id: isEditing ? selectedProgram.id : Date.now(),
    };

    try {
      // const method = isEditing ? "PUT" : "POST";
      // const endpoint = isEditing
      //   ? `/api/programs/${selectedProgram.id}`
      //   : "/api/programs";
      // const response = await fetch(endpoint, {
      //   method,
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(programData),
      // });

      // if (!response.ok) throw new Error("Failed to save program");

      if (isEditing) {
        setPrograms(
          programs.map((p) => (p.id === selectedProgram.id ? programData : p))
        );
        Swal.fire({
          icon: "success",
          title: "Program Updated",
          text: "The program has been updated successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setPrograms([...programs, programData]);
        Swal.fire({
          icon: "success",
          title: "Program Created",
          text: "The program has been created successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      resetForm();
      setCurrentPage("programs");
      setIsEditing(false);
      setSelectedProgram(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save program. Please try again.",
      });
    }
  };

  const handleEdit = (program) => {
    setSelectedProgram(program);
    setIsEditing(true);
    setCurrentPage("add");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/programs/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete program");

        setPrograms(programs.filter((p) => p.id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The program has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete program. Please try again.",
        });
      }
    }
  };

  const handleView = (program) => {
    setSelectedProgram(program);
    setCurrentPage("details");
  };

  return (
    <div>
      {currentPage === "programs" && (
        <ProgramsList
          programs={programs}
          setCurrentPage={setCurrentPage}
          handleView={handleView}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}
      {currentPage === "add" && (
        <ProgramForm
          isEditing={isEditing}
          selectedProgram={selectedProgram}
          fileInputRef={fileInputRef}
          descriptionRef={descriptionRef}
          requirementsRef={requirementsRef}
          handleImageUpload={handleImageUpload}
          handleSubmit={handleSubmit}
          setCurrentPage={setCurrentPage}
          setIsEditing={setIsEditing}
          setSelectedProgram={setSelectedProgram}
        />
      )}
      {currentPage === "details" && (
        <ProgramDetails
          selectedProgram={selectedProgram}
          setCurrentPage={setCurrentPage}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default AllSpecialties;
