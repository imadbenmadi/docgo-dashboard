import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ReactPaginate from "react-paginate";
import { useFormik } from "formik";
import * as Yup from "yup";

// Reused Question Components from QuizContent
const MultipleChoiceQuestion = ({ question, onEdit, onDelete }) => (
  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(question)}
          className="text-blue-600 hover:underline"
          aria-label={`Modifier la question ${question.text}`}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="text-red-600 hover:underline"
          aria-label={`Supprimer la question ${question.text}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="space-y-3 mt-4">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <span className="text-gray-700">
            {option.id}. {option.label}
          </span>
        </div>
      ))}
      <p className="text-sm text-gray-600 mt-2">
        <strong>Réponse correcte:</strong> {question.correctAnswer}
      </p>
    </div>
  </div>
);

const CheckboxQuestion = ({ question, onEdit, onDelete }) => (
  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(question)}
          className="text-blue-600 hover:underline"
          aria-label={`Modifier la question ${question.text}`}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="text-red-600 hover:underline"
          aria-label={`Supprimer la question ${question.text}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="space-y-3 mt-4">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <span className="text-gray-700">
            {option.id}. {option.label}
          </span>
        </div>
      ))}
      <p className="text-sm text-gray-600 mt-2">
        <strong>Réponses correctes:</strong> {question.correctAnswer.join(", ")}
      </p>
    </div>
  </div>
);

const TextAreaQuestion = ({ question, onEdit, onDelete }) => (
  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-800">{question.text}</h3>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(question)}
          className="text-blue-600 hover:underline"
          aria-label={`Modifier la question ${question.text}`}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="text-red-600 hover:underline"
          aria-label={`Supprimer la question ${question.text}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <p className="text-sm text-gray-600 mt-2">
      <strong>Réponse correcte:</strong> {question.correctAnswer}
    </p>
  </div>
);

const MySwal = withReactContent(Swal);

const AddQuiz = () => {
  const { id } = useParams(); // Course ID from URL
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
  });

  // Formik for quiz creation/editing
  const formik = useFormik({
    initialValues: {
      title: "",
      questions: [],
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required("Le titre du quiz est requis")
        .min(3, "Le titre doit contenir au moins 3 caractères"),
      questions: Yup.array()
        .min(1, "Ajoutez au moins une question")
        .of(
          Yup.object().shape({
            text: Yup.string().required("Le texte de la question est requis"),
            type: Yup.string().required("Le type de question est requis"),
            options: Yup.array().when("type", {
              is: (val) => val === "multiple-choice" || val === "checkbox",
              then: Yup.array()
                .min(2, "Ajoutez au moins deux options")
                .of(
                  Yup.object().shape({
                    id: Yup.string().required(),
                    label: Yup.string().required("L'option est requise"),
                  })
                ),
              otherwise: Yup.array().notRequired(),
            }),
            correctAnswer: Yup.mixed().required(
              "La réponse correcte est requise"
            ),
          })
        ),
    }),
    onSubmit: async (values) => {
      try {
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
          ? `/api/courses/${id}/quizzes/${currentQuizId}`
          : `/api/courses/${id}/quizzes`;

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok)
          throw new Error("Erreur lors de l'enregistrement du quiz");
        // const quiz = await response.json();
        const quiz = {
          id: isEditing ? currentQuizId : Date.now().toString(),
          title: values.title,
          questions: values.questions,
        };

        setQuizzes((prev) =>
          isEditing
            ? prev.map((q) => (q.id === quiz.id ? quiz : q))
            : [...prev, quiz]
        );
        formik.resetForm();
        setIsEditing(false);
        setCurrentQuizId(null);
        MySwal.fire({
          icon: "success",
          title: "Succès",
          text: isEditing
            ? "Quiz mis à jour avec succès!"
            : "Quiz ajouté avec succès!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Erreur",
          text: error.message,
          confirmButtonColor: "#ef4444",
        });
      }
    },
  });

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/courses/${id}/quizzes?page=${pagination.currentPage}&pageSize=${pagination.pageSize}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des quizzes");
        const data = await response.json();
        setQuizzes(data.quizzes || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.totalPages || 1,
        }));
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Erreur",
          text: error.message,
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, [id, pagination.currentPage]);

  // Handle quiz deletion
  const handleDeleteQuiz = async (quizId, quizTitle) => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "Confirmer la suppression",
      text: `Voulez-vous supprimer le quiz "${quizTitle}" ?`,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/courses/${id}/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error("Erreur lors de la suppression du quiz");
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
      MySwal.fire({
        icon: "success",
        title: "Succès",
        text: "Quiz supprimé avec succès!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: error.message,
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Handle quiz editing
  const handleEditQuiz = (quiz) => {
    formik.setValues({
      title: quiz.title,
      questions: quiz.questions,
    });
    setIsEditing(true);
    setCurrentQuizId(quiz.id);
  };

  // Handle question addition
  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      text: "",
      type: "multiple-choice",
      options: [
        { id: "A", label: "" },
        { id: "B", label: "" },
      ],
      correctAnswer: "",
    };
    formik.setFieldValue("questions", [
      ...formik.values.questions,
      newQuestion,
    ]);
  };

  // Handle question editing
  const handleEditQuestion = (question) => {
    const updatedQuestions = formik.values.questions.map((q) =>
      q.id === question.id ? question : q
    );
    formik.setFieldValue("questions", updatedQuestions);
  };

  // Handle question deletion
  const handleDeleteQuestion = (questionId) => {
    formik.setFieldValue(
      "questions",
      formik.values.questions.filter((q) => q.id !== questionId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gérer les Quizzes du Cours
        </h1>
        <p className="text-gray-600 mt-1">
          Ajoutez, modifiez ou supprimez des quizzes pour ce cours.
        </p>
      </div>

      {/* Quiz Form */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isEditing ? "Modifier le Quiz" : "Ajouter un Nouveau Quiz"}
        </h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Titre du Quiz *
            </label>
            <input
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le titre du quiz"
              aria-required="true"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>
            )}
          </div>

          {/* Questions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Questions
            </h3>
            {formik.values.questions.map((question) => (
              <div key={question.id} className="mb-4">
                {question.type === "multiple-choice" && (
                  <MultipleChoiceQuestion
                    question={question}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                )}
                {question.type === "checkbox" && (
                  <CheckboxQuestion
                    question={question}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                )}
                {question.type === "text" && (
                  <TextAreaQuestion
                    question={question}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                )}
              </div>
            ))}
            {formik.touched.questions && formik.errors.questions && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.questions}
              </p>
            )}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une Question
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={formik.isSubmitting}
              aria-disabled={formik.isSubmitting}
            >
              {isEditing ? "Mettre à jour le Quiz" : "Ajouter le Quiz"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  formik.resetForm();
                  setIsEditing(false);
                  setCurrentQuizId(null);
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <p className="text-lg">Aucun quiz ajouté</p>
          <p className="text-sm">
            Ajoutez des quizzes pour tester les connaissances des étudiants.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-3 gap-4 bg-gray-100 border-b border-gray-200 px-6 py-4 text-sm font-semibold text-gray-700 rounded-t-lg">
                  <div>Titre du Quiz</div>
                  <div>Nombre de Questions</div>
                  <div className="text-center">Actions</div>
                </div>
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="grid grid-cols-3 gap-4 border-b border-gray-200 py-4 px-6 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <div>{quiz.title}</div>
                    <div>{quiz.questions.length}</div>
                    <div className="flex justify-center gap-2">
                      <button
                        className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={() => handleEditQuiz(quiz)}
                        aria-label={`Modifier le quiz ${quiz.title}`}
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        aria-label={`Supprimer le quiz ${quiz.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:hidden space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="font-semibold">Titre:</div>
                  <div>{quiz.title}</div>
                  <div className="font-semibold">Questions:</div>
                  <div>{quiz.questions.length}</div>
                  <div className="font-semibold">Actions:</div>
                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <ReactPaginate
          previousLabel={"Précédent"}
          nextLabel={"Suivant"}
          breakLabel={"..."}
          pageCount={pagination.totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={({ selected }) =>
            setPagination((prev) => ({ ...prev, currentPage: selected + 1 }))
          }
          containerClassName={"flex items-center justify-center mt-6 gap-2"}
          pageClassName={
            "px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-gray-100"
          }
          pageLinkClassName={"text-gray-700"}
          activeClassName={"bg-blue-500 text-white border-blue-500"}
          previousClassName={`px-3 py-1 rounded-lg border text-sm ${
            pagination.currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          nextClassName={`px-3 py-1 rounded-lg border text-sm ${
            pagination.currentPage === pagination.totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          breakClassName={"px-3 py-1 text-sm"}
          forcePage={pagination.currentPage - 1}
        />
      )}
    </div>
  );
};

export default AddQuiz;
