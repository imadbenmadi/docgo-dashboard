import { useState } from "react";
import {
  HelpCircle,
  Plus,
  X,
  Trash2,
  Check,
  AlertCircle,
  Edit2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AddQuiz({ courseId, formik }) {
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [savedQuiz, setSavedQuiz] = useState(null); // Store the saved quiz
  const [isQuizActive, setIsQuizActive] = useState(false); // Track if quiz is active
  const [quiz, setQuiz] = useState({
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
  const [errors, setErrors] = useState({});

  const validateQuestion = () => {
    const newErrors = {};

    if (!newQuestion.question.trim()) {
      newErrors.question = "La question est requise";
    }

    if (quiz.type === "multiple-choice") {
      if (newQuestion.options.some((option) => !option.trim())) {
        newErrors.options = "Toutes les options doivent être remplies";
      }
      if (newQuestion.correctAnswers.length === 0) {
        newErrors.correctAnswer = "Sélectionnez au moins une bonne réponse";
      }
    } else if (quiz.type === "true-false") {
      if (!newQuestion.correctAnswer) {
        newErrors.correctAnswer = "Sélectionnez la bonne réponse";
      }
    } else if (quiz.type === "short-answer") {
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
      type: quiz.type,
      options:
        quiz.type === "multiple-choice"
          ? [...newQuestion.options]
          : quiz.type === "true-false"
          ? ["Vrai", "Faux"]
          : null,
      correctAnswer:
        quiz.type === "multiple-choice" ? null : newQuestion.correctAnswer,
      correctAnswers:
        quiz.type === "multiple-choice"
          ? [...newQuestion.correctAnswers]
          : null,
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, questionToAdd],
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
    });

    if (result.isConfirmed) {
      const updatedQuiz = {
        ...quiz,
        questions: quiz.questions.filter((q) => q.id !== questionId),
      };
      setQuiz(updatedQuiz);

      // If quiz is already saved, update the saved version too
      if (savedQuiz) {
        setSavedQuiz(updatedQuiz);
        if (formik) {
          formik.setFieldValue("quiz", updatedQuiz);
        }
      }

      Swal.fire({
        title: "Supprimé !",
        text: "La question a été supprimée avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const handleSaveQuiz = () => {
    if (!quiz.title.trim()) {
      Swal.fire({
        title: "Erreur",
        text: "Le titre du quiz est requis",
        icon: "error",
      });
      return;
    }
    if (quiz.questions.length === 0) {
      Swal.fire({
        title: "Erreur",
        text: "Ajoutez au moins une question",
        icon: "error",
      });
      return;
    }

    const quizToSave = {
      id: Date.now(),
      title: quiz.title,
      description: quiz.description,
      type: quiz.type,
      questions: [...quiz.questions],
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Save the quiz and make it active
    setSavedQuiz(quizToSave);
    setIsQuizActive(true);

    // Update formik values
    if (formik) {
      formik.setFieldValue("quiz", quizToSave);
    }

    Swal.fire({
      title: "Succès !",
      text: "Le quiz a été sauvegardé et activé avec succès.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });

    // Don't reset the quiz state - keep it for editing
    resetQuestionForm();
    setShowQuizSection(false);
  };

  const handleEditQuiz = () => {
    setShowQuizSection(true);
  };

  const handleDeleteSavedQuiz = async () => {
    const result = await Swal.fire({
      title: "Supprimer le quiz ?",
      text: "Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      setSavedQuiz(null);
      setIsQuizActive(false);
      setQuiz({
        title: "",
        description: "",
        type: "multiple-choice",
        questions: [],
      });

      if (formik) {
        formik.setFieldValue("quiz", null);
      }

      Swal.fire({
        title: "Supprimé !",
        text: "Le quiz a été supprimé avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
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
    setQuiz({ ...quiz, type });
    resetQuestionForm();
  };

  const renderQuestionForm = () => {
    switch (quiz.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
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
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleCorrectAnswerToggle(option)}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                        newQuestion.correctAnswers.includes(option)
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {newQuestion.correctAnswers.includes(option) && (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    <span className="text-gray-600 font-medium w-4 sm:w-6 text-sm sm:text-base">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                💡 Cliquez sur les cases à cocher pour sélectionner les bonnes
                réponses
              </p>
            </div>
          </div>
        );

      case "true-false":
        return (
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
              Réponse Correcte *
            </label>
            {errors.correctAnswer && (
              <p className="text-red-500 text-sm mb-3 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.correctAnswer}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handleTrueFalseClick("Vrai")}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-medium transition-all transform hover:scale-105 text-sm sm:text-base ${
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
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-medium transition-all transform hover:scale-105 text-sm sm:text-base ${
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
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
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
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center ${
                    question.correctAnswers?.includes(option)
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {question.correctAnswers?.includes(option) && (
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                </div>
                <span className="text-gray-600 text-xs sm:text-sm">
                  {String.fromCharCode(65 + optIndex)}.
                </span>
                <span
                  className={`text-xs sm:text-sm ${
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
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                question.correctAnswer === "Vrai"
                  ? "bg-green-100 text-green-800 font-medium"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              ✓ Vrai
            </span>
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
            <span className="text-green-800 font-medium text-sm sm:text-base">
              Réponse: {question.correctAnswer}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="mb-8 sm:mb-12 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Quiz d'Évaluation
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Créez un quiz interactif pour évaluer les connaissances de vos
              étudiants
            </p>
          </div>
        </div>
        {!savedQuiz && (
          <button
            type="button"
            onClick={() => setShowQuizSection(!showQuizSection)}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base shrink-0 ${
              showQuizSection
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            }`}
          >
            {showQuizSection ? (
              <>
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Fermer</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Créer un Quiz</span>
                <span className="sm:hidden">Créer</span>
              </>
            )}
          </button>
        )}
      </div>

      {showQuizSection && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 mb-6 shadow-lg">
          <div className="space-y-4 sm:space-y-6">
            {/* Quiz Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Titre du Quiz *
                </label>
                <input
                  type="text"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="Entrez le titre du quiz"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  Type de Quiz
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        quiz.type === type.value
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <span className="block sm:inline">{type.icon}</span>
                      <span className="block sm:inline sm:ml-1">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) =>
                  setQuiz({ ...quiz, description: e.target.value })
                }
                placeholder="Décrivez le quiz et ses objectifs"
                rows="3"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm text-sm sm:text-base"
              />
            </div>

            {/* Question Form */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm sm:text-base">
                  {quiz.questions.length + 1}
                </span>
                <span className="text-sm sm:text-xl">Ajouter une Question</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2">
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                  />
                </div>

                {renderQuestionForm()}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ajouter la Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {quiz.questions.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm sm:text-base">
                    {quiz.questions.length}
                  </span>
                  <span className="text-sm sm:text-xl">Questions du Quiz</span>
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <h4 className="text-base sm:text-lg font-medium text-gray-800 flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm sm:text-lg">
                            Question {index + 1}
                          </span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 mb-3 pl-6 sm:pl-8 text-sm sm:text-base">
                        {question.question}
                      </p>
                      <div className="pl-6 sm:pl-8">
                        {renderQuestionDisplay(question)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleSaveQuiz}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 text-sm sm:text-base"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                Sauvegarder le Quiz
              </button>
              {savedQuiz && (
                <button
                  type="button"
                  onClick={() => setShowQuizSection(false)}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Show saved/active quiz */}
      {savedQuiz && !showQuizSection && (
        <div className="bg-white rounded-xl border-2 border-green-200 p-4 sm:p-6 shadow-lg relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="  
w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                >
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                  {savedQuiz.title}
                </h2>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {savedQuiz.description || "Aucune description fournie"}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleEditQuiz}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg text-sm sm:text-base"
              >
                <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Modifier
              </button>
              <button
                type="button"
                onClick={handleDeleteSavedQuiz}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Supprimer
              </button>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {savedQuiz.questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h4 className="text-base sm:text-lg font-medium text-gray-800 flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-lg">
                      Question {index + 1}
                    </span>
                  </h4>
                </div>
                <p className="text-gray-700 mb-3 pl-6 sm:pl-8 text-sm sm:text-base">
                  {question.question}
                </p>
                <div className="pl-6 sm:pl-8">
                  {renderQuestionDisplay(question)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
