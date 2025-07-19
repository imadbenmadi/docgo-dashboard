import { useState } from "react";
import {
  HelpCircle,
  Plus,
  X,
  Trash2,
  Check,
  AlertCircle,
  Edit3,
} from "lucide-react";

export default function AddQuiz({ formik, showAlert }) {
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [editingQuizIndex, setEditingQuizIndex] = useState(null); // Track which quiz is being edited
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    correctAnswers: [],
  });
  const [errors, setErrors] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);

  const mockShowAlert = (type, title, message) => {
    console.log(`${type}: ${title} - ${message}`);
    alert(`${title}: ${message}`);
  };

  const alertFunction = showAlert || mockShowAlert;

  // Initialize a new quiz if creating one
  const getCurrentQuiz = () => {
    if (editingQuizIndex !== null) {
      return (
        formik.values.quiz[editingQuizIndex] || {
          title: "",
          description: "",
          type: "multiple-choice",
          questions: [],
        }
      );
    }
    return {
      title: "",
      description: "",
      type: "multiple-choice",
      questions: [],
    };
  };

  const currentQuiz = getCurrentQuiz();

  const validateQuestion = () => {
    const newErrors = {};
    if (!newQuestion.question.trim()) {
      newErrors.question = "La question est requise";
    }
    if (currentQuiz.type === "multiple-choice") {
      if (newQuestion.options.some((option) => !option.trim())) {
        newErrors.options = "Toutes les options doivent être remplies";
      }
      if (newQuestion.correctAnswers.length === 0) {
        newErrors.correctAnswer = "Sélectionnez au moins une bonne réponse";
      }
    } else if (currentQuiz.type === "true-false") {
      if (!newQuestion.correctAnswer) {
        newErrors.correctAnswer = "Sélectionnez la bonne réponse";
      }
    } else if (currentQuiz.type === "short-answer") {
      if (!newQuestion.correctAnswer.trim()) {
        newErrors.correctAnswer = "La réponse correcte est requise";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOrUpdateQuestion = () => {
    if (!validateQuestion()) return;

    const questionToAdd = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      question: newQuestion.question,
      type: currentQuiz.type,
      options:
        currentQuiz.type === "multiple-choice"
          ? [...newQuestion.options]
          : currentQuiz.type === "true-false"
          ? ["Vrai", "Faux"]
          : null,
      correctAnswer:
        currentQuiz.type === "multiple-choice"
          ? null
          : newQuestion.correctAnswer,
      correctAnswers:
        currentQuiz.type === "multiple-choice"
          ? [...newQuestion.correctAnswers]
          : null,
    };

    let updatedQuizzes = [...formik.values.quiz];
    let updatedQuestions =
      editingQuizIndex !== null
        ? [...updatedQuizzes[editingQuizIndex].questions]
        : [];

    if (editingQuestion) {
      updatedQuestions = updatedQuestions.map((q) =>
        q.id === editingQuestion.id ? questionToAdd : q
      );
      alertFunction("success", "Succès", "Question modifiée avec succès !");
    } else {
      updatedQuestions.push(questionToAdd);
      alertFunction("success", "Succès", "Question ajoutée avec succès !");
    }

    if (editingQuizIndex !== null) {
      updatedQuizzes[editingQuizIndex] = {
        ...updatedQuizzes[editingQuizIndex],
        questions: updatedQuestions,
      };
    } else {
      updatedQuizzes.push({
        ...currentQuiz,
        questions: updatedQuestions,
      });
    }

    formik.setFieldValue("quiz", updatedQuizzes);
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
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question, quizIndex) => {
    setNewQuestion({
      question: question.question,
      options: question.options || ["", "", "", ""],
      correctAnswer: question.correctAnswer || "",
      correctAnswers: question.correctAnswers || [],
    });
    setEditingQuestion(question);
    setEditingQuizIndex(quizIndex);
  };

  const handleDeleteQuestion = (questionId, quizIndex) => {
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible."
    );

    if (confirmDelete) {
      const updatedQuizzes = [...formik.values.quiz];
      updatedQuizzes[quizIndex].questions = updatedQuizzes[
        quizIndex
      ].questions.filter((q) => q.id !== questionId);
      formik.setFieldValue("quiz", updatedQuizzes);
      alertFunction("success", "Succès", "Question supprimée avec succès !");
    }
  };

  const handleSaveQuiz = () => {
    if (!currentQuiz.title.trim()) {
      alertFunction("error", "Erreur", "Le titre du quiz est requis");
      return;
    }
    if (currentQuiz.questions.length === 0) {
      alertFunction("error", "Erreur", "Ajoutez au moins une question");
      return;
    }

    const updatedQuizzes = [...formik.values.quiz];
    if (editingQuizIndex !== null) {
      updatedQuizzes[editingQuizIndex] = currentQuiz;
    } else {
      updatedQuizzes.push(currentQuiz);
    }
    formik.setFieldValue("quiz", updatedQuizzes);
    setShowQuizSection(false);
    setEditingQuizIndex(null);
    alertFunction("success", "Succès", "Quiz sauvegardé avec succès !");
  };

  const handleCancelEdit = () => {
    resetQuestionForm();
    setShowQuizSection(false);
    setEditingQuizIndex(null);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleCorrectAnswerToggle = (index) => {
    const currentCorrectAnswers = [...newQuestion.correctAnswers];
    const idx = currentCorrectAnswers.indexOf(index);
    if (idx > -1) {
      currentCorrectAnswers.splice(idx, 1);
    } else {
      currentCorrectAnswers.push(index);
    }
    setNewQuestion({ ...newQuestion, correctAnswers: currentCorrectAnswers });
  };

  const handleTrueFalseClick = (value) => {
    setNewQuestion({ ...newQuestion, correctAnswer: value });
  };

  const handleQuizTypeChange = (type) => {
    const updatedQuizzes = [...formik.values.quiz];
    if (editingQuizIndex !== null) {
      updatedQuizzes[editingQuizIndex] = { ...currentQuiz, type };
      formik.setFieldValue("quiz", updatedQuizzes);
    }
    resetQuestionForm();
  };

  const renderQuestionForm = () => {
    switch (currentQuiz.type) {
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
                      onClick={() => handleCorrectAnswerToggle(index)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        newQuestion.correctAnswers.includes(index)
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {newQuestion.correctAnswers.includes(index) && (
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
                    question.correctAnswers?.includes(optIndex)
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {question.correctAnswers?.includes(optIndex) && (
                    <Check className="w-3 h-3" />
                  )}
                </div>
                <span className="text-gray-600 text-sm">
                  {String.fromCharCode(65 + optIndex)}.
                </span>
                <span
                  className={`text-sm ${
                    question.correctAnswers?.includes(optIndex)
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
            Créez ou modifiez un quiz interactif pour évaluer les connaissances
            de vos étudiants
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowQuizSection(!showQuizSection);
            if (!showQuizSection) setEditingQuizIndex(null); // Reset to create new quiz
          }}
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
              <Edit3 className="w-5 h-5" />
              Créer un Quiz
            </>
          )}
        </button>
      </div>

      {showQuizSection && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingQuizIndex !== null ? "Modifier le Quiz" : "Créer un Quiz"}
            </h3>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Titre du Quiz *
                </label>
                <input
                  type="text"
                  value={currentQuiz.title}
                  onChange={(e) => {
                    const updatedQuizzes = [...formik.values.quiz];
                    if (editingQuizIndex !== null) {
                      updatedQuizzes[editingQuizIndex] = {
                        ...currentQuiz,
                        title: e.target.value,
                      };
                      formik.setFieldValue("quiz", updatedQuizzes);
                    } else {
                      formik.setFieldValue("quiz", [
                        ...updatedQuizzes,
                        { ...currentQuiz, title: e.target.value },
                      ]);
                    }
                  }}
                  placeholder="Entrez le titre du quiz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {formik.touched.quiz?.[editingQuizIndex]?.title &&
                  formik.errors.quiz?.[editingQuizIndex]?.title && (
                    <p className="text-red-500 text-sm mt-2">
                      {formik.errors.quiz[editingQuizIndex].title}
                    </p>
                  )}
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
                        currentQuiz.type === type.value
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
                value={currentQuiz.description}
                onChange={(e) => {
                  const updatedQuizzes = [...formik.values.quiz];
                  if (editingQuizIndex !== null) {
                    updatedQuizzes[editingQuizIndex] = {
                      ...currentQuiz,
                      description: e.target.value,
                    };
                    formik.setFieldValue("quiz", updatedQuizzes);
                  }
                }}
                placeholder="Décrivez le quiz et ses objectifs"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
              />
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {currentQuiz.questions.length + 1}
                </span>
                {editingQuestion
                  ? "Modifier la Question"
                  : "Ajouter une Question"}
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
                  onClick={handleAddOrUpdateQuestion}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  {editingQuestion
                    ? "Modifier la Question"
                    : "Ajouter la Question"}
                </button>
              </div>
            </div>

            {currentQuiz.questions.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                    {currentQuiz.questions.length}
                  </span>
                  Questions du Quiz
                </h3>
                <div className="space-y-4">
                  {currentQuiz.questions.map((question, index) => (
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
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditQuestion(
                                question,
                                editingQuizIndex || formik.values.quiz.length
                              )
                            }
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteQuestion(
                                question.id,
                                editingQuizIndex || formik.values.quiz.length
                              )
                            }
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              onClick={handleSaveQuiz}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
            >
              <Check className="w-5 h-5" />
              Sauvegarder le Quiz
            </button>
          </div>
        </div>
      )}

      {!showQuizSection && formik.values.quiz.length > 0 && (
        <div className="space-y-4">
          {formik.values.quiz.map((quiz, quizIndex) => (
            <div
              key={quizIndex}
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
                  onClick={() => {
                    setShowQuizSection(true);
                    setEditingQuizIndex(quizIndex);
                  }}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
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

      {!showQuizSection && formik.values.quiz.length === 0 && (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-2xl">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Aucun Quiz Créé</h3>
          <p className="text-gray-600">
            Cliquez sur le bouton "Créer un Quiz" pour commencer à créer votre
            quiz d'évaluation.
          </p>
          <button
            type="button"
            onClick={() => setShowQuizSection(true)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Créer un Quiz
          </button>
        </div>
      )}
    </section>
  );
}
