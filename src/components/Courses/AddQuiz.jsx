import { useState } from "react";
import {
  HelpCircle,
  Plus,
  X,
  Edit,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AddQuiz({ courseId, formik }) {
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    type: "multiple-choice",
    questions: [],
  });
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    correctAnswers: [], // For multiple choice questions
  });
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [errors, setErrors] = useState({});

  const validateQuestion = () => {
    const newErrors = {};

    if (!newQuestion.question.trim()) {
      newErrors.question = "La question est requise";
    }

    if (newQuiz.type === "multiple-choice") {
      if (newQuestion.options.some((option) => !option.trim())) {
        newErrors.options = "Toutes les options doivent être remplies";
      }
      if (newQuestion.correctAnswers.length === 0) {
        newErrors.correctAnswer = "Sélectionnez au moins une bonne réponse";
      }
    } else if (newQuiz.type === "true-false") {
      if (!newQuestion.correctAnswer) {
        newErrors.correctAnswer = "Sélectionnez la bonne réponse";
      }
    } else if (newQuiz.type === "short-answer") {
      if (!newQuestion.correctAnswer.trim()) {
        newErrors.correctAnswer = "La réponse correcte est requise";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuestion = () => {
    if (!validateQuestion()) return;

    const questionToAdd = {
      id: Date.now(),
      question: newQuestion.question,
      type: newQuiz.type,
      options:
        newQuiz.type === "multiple-choice"
          ? [...newQuestion.options]
          : newQuiz.type === "true-false"
          ? ["Vrai", "Faux"]
          : null,
      correctAnswer:
        newQuiz.type === "multiple-choice" ? null : newQuestion.correctAnswer,
      correctAnswers:
        newQuiz.type === "multiple-choice"
          ? [...newQuestion.correctAnswers]
          : null,
    };

    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, questionToAdd],
    });

    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      correctAnswers: [],
    });
    setErrors({});
  };

  const handleDeleteQuestion = async (questionId) => {
    const result = await Swal.fire({
      title: "Supprimer la question ?",
      text: "Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all mr-2",
        cancelButton:
          "px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all",
        title: "text-xl font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
      },
    });

    if (result.isConfirmed) {
      setNewQuiz({
        ...newQuiz,
        questions: newQuiz.questions.filter((q) => q.id !== questionId),
      });
      Swal.fire({
        title: "Supprimé !",
        text: "La question a été supprimée avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
        },
      });
    }
  };

  const handleAddQuiz = () => {
    if (!newQuiz.title.trim()) {
      Swal.fire({
        title: "Erreur",
        text: "Le titre du quiz est requis",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all",
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
        },
      });
      return;
    }
    if (newQuiz.questions.length === 0) {
      Swal.fire({
        title: "Erreur",
        text: "Ajoutez au moins une question",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all",
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
        },
      });
      return;
    }

    const quizToAdd = {
      id: Date.now(),
      title: newQuiz.title,
      description: newQuiz.description,
      type: newQuiz.type,
      questions: [...newQuiz.questions],
    };

    setQuizzes([...quizzes, quizToAdd]);
    setNewQuiz({
      title: "",
      description: "",
      type: "multiple-choice",
      questions: [],
    });
    resetQuestionForm();
    setShowQuizSection(false);

    // Update formik values
    if (formik) {
      formik.setFieldValue("quizzes", [...quizzes, quizToAdd]);
    }

    Swal.fire({
      title: "Succès !",
      text: "Le quiz a été créé avec succès.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        title: "text-xl font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
      },
    });
  };

  const handleDeleteQuiz = async (quizId) => {
    const result = await Swal.fire({
      title: "Supprimer le quiz ?",
      text: "Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      buttonsStyling: false,
      customClass: {
        confirmButton:
          "px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all mr-2",
        cancelButton:
          "px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all",
        title: "text-xl font-semibold text-gray-800",
        htmlContainer: "text-gray-600",
      },
    });

    if (result.isConfirmed) {
      const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);

      // Update formik values
      if (formik) {
        formik.setFieldValue("quizzes", updatedQuizzes);
      }

      Swal.fire({
        title: "Supprimé !",
        text: "Le quiz a été supprimé avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          title: "text-xl font-semibold text-gray-800",
          htmlContainer: "text-gray-600",
        },
      });
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleCorrectAnswerToggle = (option) => {
    const currentCorrectAnswers = [...newQuestion.correctAnswers];
    const index = currentCorrectAnswers.indexOf(option);

    if (index > -1) {
      currentCorrectAnswers.splice(index, 1);
    } else {
      currentCorrectAnswers.push(option);
    }

    setNewQuestion({ ...newQuestion, correctAnswers: currentCorrectAnswers });
  };

  const handleTrueFalseClick = (value) => {
    setNewQuestion({ ...newQuestion, correctAnswer: value });
  };

  const handleQuizTypeChange = (type) => {
    setNewQuiz({ ...newQuiz, type });
    resetQuestionForm();
  };

  const renderQuestionForm = () => {
    switch (newQuiz.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Options de Réponse *
              </label>
              {errors.options && (
                <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.options}
                </p>
              )}
              <div className="space-y-3">
                {newQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleCorrectAnswerToggle(option)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        newQuestion.correctAnswers.includes(option)
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {newQuestion.correctAnswers.includes(option) && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-gray-600 font-medium w-6">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              {errors.correctAnswer && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.correctAnswer}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                💡 Cliquez sur les cases à cocher pour sélectionner les bonnes
                réponses
              </p>
            </div>
          </div>
        );

      case "true-false":
        return (
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              Réponse Correcte *
            </label>
            {errors.correctAnswer && (
              <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.correctAnswer}
              </p>
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleTrueFalseClick("Vrai")}
                className={`flex-1 px-6 py-4 rounded-xl border-2 font-medium transition-all transform hover:scale-105 ${
                  newQuestion.correctAnswer === "Vrai"
                    ? "bg-green-500 border-green-500 text-white shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:border-green-400"
                }`}
              >
                ✓ Vrai
              </button>
              <button
                type="button"
                onClick={() => handleTrueFalseClick("Faux")}
                className={`flex-1 px-6 py-4 rounded-xl border-2 font-medium transition-all transform hover:scale-105 ${
                  newQuestion.correctAnswer === "Faux"
                    ? "bg-red-500 border-red-500 text-white shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:border-red-400"
                }`}
              >
                ✗ Faux
              </button>
            </div>
          </div>
        );

      case "short-answer":
        return (
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Réponse Correcte *
            </label>
            {errors.correctAnswer && (
              <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.correctAnswer}
              </p>
            )}
            <input
              type="text"
              value={newQuestion.correctAnswer}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  correctAnswer: e.target.value,
                })
              }
              placeholder="Entrez la réponse correcte"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderQuestionDisplay = (question) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    question.correctAnswers?.includes(option)
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {question.correctAnswers?.includes(option) && (
                    <Check className="w-3 h-3" />
                  )}
                </div>
                <span className="text-gray-600 text-sm">
                  {String.fromCharCode(65 + optIndex)}.
                </span>
                <span
                  className={`text-sm ${
                    question.correctAnswers?.includes(option)
                      ? "text-green-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {option}
                </span>
              </div>
            ))}
          </div>
        );

      case "true-false":
        return (
          <div className="flex gap-4">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                question.correctAnswer === "Vrai"
                  ? "bg-green-100 text-green-800 font-medium"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              ✓ Vrai
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                question.correctAnswer === "Faux"
                  ? "bg-red-100 text-red-800 font-medium"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              ✗ Faux
            </span>
          </div>
        );

      case "short-answer":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <span className="text-green-800 font-medium">
              Réponse: {question.correctAnswer}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800">
            Quiz d'Évaluation
          </h2>
          <p className="text-gray-600 mt-1">
            Créez des quiz interactifs pour évaluer les connaissances de vos
            étudiants
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowQuizSection(!showQuizSection)}
          className={`px-6 py-3 rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg ${
            showQuizSection
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          }`}
        >
          {showQuizSection ? (
            <>
              <X className="w-5 h-5" />
              Fermer
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Ajouter un Quiz
            </>
          )}
        </button>
      </div>

      {showQuizSection && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 mb-6 shadow-lg">
          <div className="space-y-6">
            {/* Quiz Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Titre du Quiz *
                </label>
                <input
                  type="text"
                  value={newQuiz.title}
                  onChange={(e) =>
                    setNewQuiz({ ...newQuiz, title: e.target.value })
                  }
                  placeholder="Entrez le titre du quiz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Type de Quiz
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      value: "multiple-choice",
                      label: "Choix Multiple",
                      icon: "☑️",
                    },
                    { value: "true-false", label: "Vrai/Faux", icon: "⚖️" },
                    {
                      value: "short-answer",
                      label: "Réponse Courte",
                      icon: "✍️",
                    },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleQuizTypeChange(type.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        newQuiz.type === type.value
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={newQuiz.description}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, description: e.target.value })
                }
                placeholder="Décrivez le quiz et ses objectifs"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
              />
            </div>

            {/* Question Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {newQuiz.questions.length + 1}
                </span>
                Ajouter une Question
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Question *
                  </label>
                  {errors.question && (
                    <p className="text-red-500 text-sm mb-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.question}
                    </p>
                  )}
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: e.target.value,
                      })
                    }
                    placeholder="Entrez votre question"
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {renderQuestionForm()}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter la Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {newQuiz.questions.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    {newQuiz.questions.length}
                  </span>
                  Questions du Quiz
                </h3>
                <div className="space-y-4">
                  {newQuiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          Question {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 mb-3 pl-8">
                        {question.question}
                      </p>
                      <div className="pl-8">
                        {renderQuestionDisplay(question)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddQuiz}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
            >
              <Check className="w-5 h-5" />
              Créer le Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      {quizzes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
              {quizzes.length}
            </span>
            Quiz créés
          </h3>
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      {quiz.title}
                    </h4>
                  </div>
                  {quiz.description && (
                    <p className="text-gray-600 mb-3 ml-13">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-13">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {quiz.type === "multiple-choice"
                        ? "☑️ Choix Multiple"
                        : quiz.type === "true-false"
                        ? "⚖️ Vrai/Faux"
                        : "✍️ Réponse Courte"}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {quiz.questions.length} Question
                      {quiz.questions.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs">
                    ?
                  </span>
                  Questions:
                </h5>
                <div className="space-y-3">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-blue-600">
                          {index + 1}.
                        </span>
                        <span className="flex-1">{question.question}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {quizzes.length === 0 && !showQuizSection && (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-2xl">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-xl font-medium mb-2">Aucun quiz créé</p>
          <p className="text-sm">
            Créez des quiz interactifs pour évaluer les connaissances de vos
            étudiants
          </p>
        </div>
      )}
    </section>
  );
}
