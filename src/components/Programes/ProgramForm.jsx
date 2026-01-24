import { ErrorMessage, Field, Form, Formik } from "formik";
import { ChevronDown, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import TextEditor from "./TextEditor";

// Validation schema using Yup
const validationSchema = Yup.object({
    title: Yup.string()
        .min(3, "Program title must be at least 3 characters long")
        .required("Program title is required"),
    price: Yup.string()
        .matches(
            /^\$?\d+([,.]?\d+)*$/,
            "Please enter a valid price format (e.g., $25,000 or 25000)",
        )
        .required("Price is required"),
    country: Yup.string().required("Please select a country"),
    specialty: Yup.string().required("Please select a specialty"),
    duration: Yup.string().required("Duration is required"),
    university: Yup.string()
        .min(2, "University name must be at least 2 characters long")
        .required("University is required"),
    applicationDeadline: Yup.date()
        .min(
            new Date().toISOString().split("T")[0],
            "Application deadline cannot be in the past",
        )
        .required("Application deadline is required"),
    description: Yup.string()
        .test(
            "description-length",
            "Description must be at least 10 characters long",
            (value) => {
                const cleanValue = value
                    ?.replace(/<[^>]*>/g, "")
                    .replace(/ /g, " ")
                    .trim();
                return cleanValue && cleanValue.length >= 10;
            },
        )
        .required("Description is required"),
    requirements: Yup.string()
        .test(
            "requirements-length",
            "Requirements must be at least 5 characters long",
            (value) => {
                const cleanValue = value
                    ?.replace(/<[^>]*>/g, "")
                    .replace(/ /g, " ")
                    .trim();
                return cleanValue && cleanValue.length >= 5;
            },
        )
        .required("Requirements are required"),
});

const ProgramForm = ({
    isEditing,
    selectedProgram,
    handleSubmit,
    setCurrentPage,
    setIsEditing,
    setSelectedProgram,
}) => {
    const [countries, setCountries] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingSpecialties, setLoadingSpecialties] = useState(true);

    const fileInputRef = useRef(null);
    const descriptionRef = useRef(null);
    const requirementsRef = useRef(null);

    // Fetch countries from backend
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const response = await fetch("/api/countries");
                if (!response.ok) throw new Error("Failed to fetch countries");
                const data = await response.json();
                setCountries(data);
            } catch (error) {
                console.error("Error fetching countries:", error);
                setCountries([
                    { id: 1, name: "United States", code: "US" },
                    { id: 2, name: "United Kingdom", code: "UK" },
                    { id: 3, name: "Canada", code: "CA" },
                ]);
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Fetch specialties from backend
    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                setLoadingSpecialties(true);
                const response = await fetch("/api/specialties");
                if (!response.ok)
                    throw new Error("Failed to fetch specialties");
                const data = await response.json();
                setSpecialties(data);
            } catch (error) {
                console.error("Error fetching specialties:", error);
                setSpecialties([
                    { id: 1, name: "Computer Science", category: "Technology" },
                    {
                        id: 2,
                        name: "Business Administration",
                        category: "Business",
                    },
                    { id: 3, name: "Medicine", category: "Healthcare" },
                    { id: 4, name: "Engineering", category: "Technology" },
                ]);
            } finally {
                setLoadingSpecialties(false);
            }
        };

        fetchSpecialties();
    }, []);

    const handleImageUpload = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: "error",
                    title: "Fichier trop volumineux",
                    text: "La taille de l'image doit être inférieure à 5 Mo",
                    confirmButtonColor: "#3B82F6",
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setFieldValue("Image", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const initialValues =
        isEditing && selectedProgram
            ? selectedProgram
            : {
                  title: "",
                  price: "",
                  country: "",
                  specialty: "",
                  duration: "",
                  university: "",
                  description: "",
                  requirements: "",
                  applicationDeadline: "",
                  Image: "",
              };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="mx-auto px-6 py-16">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
                    <div>
                        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 leading-tight">
                            {isEditing ? "Edit Program" : "Add Program"}
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full"></div>
                    </div>

                    <button
                        onClick={() => {
                            setCurrentPage("programs");
                            setIsEditing(false);
                            setSelectedProgram(null);
                        }}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                        Back to Programs
                    </button>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            // Get updated content from editors
                            const description =
                                descriptionRef.current?.getContent?.() ||
                                values.description;
                            const requirements =
                                requirementsRef.current?.getContent?.() ||
                                values.requirements;

                            const submissionData = {
                                ...values,
                                description,
                                requirements,
                                id: isEditing ? selectedProgram.id : Date.now(),
                            };

                            await handleSubmit(submissionData);

                            Swal.fire({
                                icon: "success",
                                title: isEditing
                                    ? "Programme mis à jour !"
                                    : "Programme créé !",
                                text: isEditing
                                    ? "Le programme a été mis à jour avec succès."
                                    : "Le nouveau programme a été créé avec succès.",
                                confirmButtonColor: "#3B82F6",
                                timer: 2000,
                                timerProgressBar: true,
                            }).then(() => {
                                if (!isEditing) {
                                    resetForm();
                                    if (descriptionRef.current?.clearContent) {
                                        descriptionRef.current.clearContent();
                                    }
                                    if (requirementsRef.current?.clearContent) {
                                        requirementsRef.current.clearContent();
                                    }
                                }
                            });
                        } catch (error) {
                            console.error("Error submitting form:", error);
                            Swal.fire({
                                icon: "error",
                                title: "Échec de la soumission",
                                text: "Une erreur s'est produite lors de l'enregistrement du programme. Veuillez réessayer.",
                                confirmButtonColor: "#3B82F6",
                            });
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ setFieldValue, values, errors, touched }) => (
                        <Form className="bg-white rounded-3xl shadow-xl p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                {/* Program Title */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Program Title *
                                    </label>
                                    <Field
                                        name="title"
                                        type="text"
                                        className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                            errors.title && touched.title
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="Enter program title"
                                    />
                                    <ErrorMessage
                                        name="title"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Price *
                                    </label>
                                    <Field
                                        name="price"
                                        type="text"
                                        className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                            errors.price && touched.price
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="e.g., $25,000 or 25000"
                                    />
                                    <ErrorMessage
                                        name="price"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>

                                {/* Country Dropdown */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Country *
                                    </label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            name="country"
                                            className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none bg-white ${
                                                errors.country &&
                                                touched.country
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            disabled={loadingCountries}
                                        >
                                            <option value="">
                                                {loadingCountries
                                                    ? "Loading countries..."
                                                    : "Select a country"}
                                            </option>
                                            {countries.map((country) => (
                                                <option
                                                    key={country.id}
                                                    value={country.name}
                                                >
                                                    {country.name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ChevronDown
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                            size={20}
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="country"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>

                                {/* Specialty Dropdown */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Specialty *
                                    </label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            name="specialty"
                                            className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 appearance-none bg-white ${
                                                errors.specialty &&
                                                touched.specialty
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            disabled={loadingSpecialties}
                                        >
                                            <option value="">
                                                {loadingSpecialties
                                                    ? "Loading specialties..."
                                                    : "Select a specialty"}
                                            </option>
                                            {specialties.map((specialty) => (
                                                <option
                                                    key={specialty.id}
                                                    value={specialty.name}
                                                >
                                                    {specialty.name}{" "}
                                                    {specialty.category &&
                                                        `(${specialty.category})`}
                                                </option>
                                            ))}
                                        </Field>
                                        <ChevronDown
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                                            size={20}
                                        />
                                    </div>
                                    <ErrorMessage
                                        name="specialty"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Duration *
                                    </label>
                                    <Field
                                        name="duration"
                                        type="text"
                                        className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                            errors.duration && touched.duration
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="e.g., 1 Year, 2 Years"
                                    />
                                    <ErrorMessage
                                        name="duration"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>

                                {/* University */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        University *
                                    </label>
                                    <Field
                                        name="university"
                                        type="text"
                                        className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                            errors.university &&
                                            touched.university
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                        placeholder="Enter university name"
                                    />
                                    <ErrorMessage
                                        name="university"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>

                                {/* Application Deadline */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Application Deadline *
                                    </label>
                                    <Field
                                        name="applicationDeadline"
                                        type="date"
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        className={`w-full md:w-1/2 p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ${
                                            errors.applicationDeadline &&
                                            touched.applicationDeadline
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    <ErrorMessage
                                        name="applicationDeadline"
                                        component="p"
                                        className="text-red-500 text-sm mt-2"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="mb-10">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Program Image
                                </label>
                                <div className="flex items-center gap-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg"
                                    >
                                        <Upload size={20} />
                                        Upload Image
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleImageUpload(e, setFieldValue)
                                        }
                                        className="hidden"
                                    />
                                    {values.Image && (
                                        <div className="relative">
                                            <img
                                                src={values.Image}
                                                alt="Preview"
                                                className="w-24 h-24 object-cover rounded-xl shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFieldValue("Image", "")
                                                }
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description Editor */}
                            <TextEditor
                                label="Program Description *"
                                content={values.description}
                                onChange={(content) =>
                                    setFieldValue("description", content)
                                }
                                error={
                                    errors.description && touched.description
                                        ? errors.description
                                        : ""
                                }
                                editorRef={descriptionRef}
                            />

                            {/* Requirements Editor */}
                            <TextEditor
                                label="Requirements *"
                                content={values.requirements}
                                onChange={(content) =>
                                    setFieldValue("requirements", content)
                                }
                                error={
                                    errors.requirements && touched.requirements
                                        ? errors.requirements
                                        : ""
                                }
                                editorRef={requirementsRef}
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] font-bold text-lg shadow-xl"
                            >
                                {isEditing
                                    ? "Update Program"
                                    : "Create Program"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default ProgramForm;
