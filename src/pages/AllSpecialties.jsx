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
            price: "25,000 DZD",
            country: "United Kingdom",
            duration: "1 Year",
            Image: "https://Images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400",
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
            price: "45,000 DZD",
            country: "United States",
            duration: "2 Years",
            Image: "https://Images.unsplash.com/photo-1551739440-5dd934d3a94a?w=400",
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
                setFieldValue("Image", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values) => {
        const description =
            descriptionRef.current?.innerHTML || values.description;
        const requirements =
            requirementsRef.current?.innerHTML || values.requirements;

        const programData = {
            ...values,
            description,
            requirements,
            id: isEditing ? selectedProgram.id : Date.now(),
        };

        // Show the data in a formatted alert
        Swal.fire({
            title: isEditing
                ? "Données du programme (Mode édition)"
                : "Données du programme (Mode création)",
            html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <strong>Titre :</strong> ${programData.title}<br>
          <strong>Prix :</strong> ${programData.price}<br>
          <strong>Pays :</strong> ${programData.country}<br>
          <strong>Durée :</strong> ${programData.duration}<br>
          <strong>Université :</strong> ${programData.university}<br>
          <strong>Date limite de candidature :</strong> ${
              programData.applicationDeadline
          }<br>
          <strong>Description :</strong> ${programData.description}<br>
          <strong>Prérequis :</strong> ${programData.requirements}<br>
          <strong>Image :</strong> ${
              programData.Image ? "Image téléchargée" : "Pas d'image"
          }<br>
          <strong>ID :</strong> ${programData.id}
        </div>
      `,
            width: 600,
            confirmButtonText: "Fermer",
        });

        // Update local state without backend call
        if (isEditing) {
            setPrograms(
                programs.map((p) =>
                    p.id === selectedProgram.id ? programData : p,
                ),
            );
            Swal.fire({
                title: "Programme mis à jour (Local uniquement)",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        } else {
            setPrograms([...programs, programData]);
            Swal.fire({
                title: "Programme créé (Local uniquement)",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        }

        // resetForm();
        setCurrentPage("programs");
        setIsEditing(false);
        setSelectedProgram(null);
    };

    const handleEdit = (program) => {
        setSelectedProgram(program);
        setIsEditing(true);
        setCurrentPage("add");
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Êtes-vous sûr ?",
            text: "Cette action est irréversible !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Oui, supprimer !",
            cancelButtonText: "Annuler",
        });

        if (result.isConfirmed) {
            // Remove backend call and just update local state
            setPrograms(programs.filter((p) => p.id !== id));

            // Display the deleted program data
            const deletedProgram = programs.find((p) => p.id === id);

            Swal.fire({
                title: "Programme supprimé (Local uniquement)",
                html: `
          <div style="text-align: left;">
            <strong>Programme supprimé :</strong><br>
            <strong>Titre :</strong> ${deletedProgram?.title}<br>
            <strong>ID :</strong> ${deletedProgram?.id}
          </div>
        `,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
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
