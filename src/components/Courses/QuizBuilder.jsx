import { useState } from "react";
import PropTypes from "prop-types";
import {
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon,
    DocumentTextIcon,
    ListBulletIcon,
} from "@heroicons/react/24/outline";

const QuizBuilder = ({ quizData, onUpdate, disabled = false }) => {
    const [quiz, setQuiz] = useState(
        quizData || {
            title: "",
            description: "",
            questions: [],
            timeLimit: 0, // 0 means no time limit
            passingScore: 70,
        }
    );

    const addQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            type: "multiple-choice",
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            explanation: "",
        };

        const updatedQuiz = {
            ...quiz,
            questions: [...quiz.questions, newQuestion],
        };
        setQuiz(updatedQuiz);
        if (onUpdate) onUpdate(updatedQuiz);
    };

    const removeQuestion = (questionId) => {
        const updatedQuiz = {
            ...quiz,
            questions: quiz.questions.filter((q) => q.id !== questionId),
        };
        setQuiz(updatedQuiz);
        if (onUpdate) onUpdate(updatedQuiz);
    };

    const updateQuestion = (questionId, field, value) => {
        const updatedQuiz = {
            ...quiz,
            questions: quiz.questions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
            ),
        };
        setQuiz(updatedQuiz);
        if (onUpdate) onUpdate(updatedQuiz);
    };

    const updateQuizInfo = (field, value) => {
        const updatedQuiz = { ...quiz, [field]: value };
        setQuiz(updatedQuiz);
        if (onUpdate) onUpdate(updatedQuiz);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                    Quiz Configuration
                </h4>
                <div className="flex items-center space-x-2">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-600">
                        {quiz.questions.length} questions
                    </span>
                </div>
            </div>

            {/* Quiz Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quiz Title
                    </label>
                    <input
                        type="text"
                        value={quiz.title}
                        onChange={(e) =>
                            updateQuizInfo("title", e.target.value)
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                        placeholder="Enter quiz title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Limit (minutes)
                    </label>
                    <input
                        type="number"
                        value={quiz.timeLimit}
                        onChange={(e) =>
                            updateQuizInfo(
                                "timeLimit",
                                parseInt(e.target.value) || 0
                            )
                        }
                        disabled={disabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                        placeholder="0 = No limit"
                        min="0"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Description
                </label>
                <textarea
                    value={quiz.description}
                    onChange={(e) =>
                        updateQuizInfo("description", e.target.value)
                    }
                    disabled={disabled}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    placeholder="Enter quiz description"
                />
            </div>

            {/* Questions Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-medium text-gray-700">
                        Questions
                    </h5>
                    <button
                        onClick={addQuestion}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-md hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Question
                    </button>
                </div>

                {quiz.questions.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                        <QuestionMarkCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                            No questions added yet
                        </p>
                        <button
                            onClick={addQuestion}
                            disabled={disabled}
                            className="mt-2 text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
                        >
                            Add your first question
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quiz.questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h6 className="text-sm font-medium text-gray-900">
                                        Question {index + 1}
                                    </h6>
                                    <button
                                        onClick={() =>
                                            removeQuestion(question.id)
                                        }
                                        disabled={disabled}
                                        className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Question
                                        </label>
                                        <input
                                            type="text"
                                            value={question.question}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    question.id,
                                                    "question",
                                                    e.target.value
                                                )
                                            }
                                            disabled={disabled}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                            placeholder="Enter your question"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Answer Options
                                        </label>
                                        <div className="space-y-2">
                                            {question.options.map(
                                                (option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                updateQuestion(
                                                                    question.id,
                                                                    "correctAnswer",
                                                                    optIndex
                                                                )
                                                            }
                                                            disabled={disabled}
                                                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                                question.correctAnswer ===
                                                                optIndex
                                                                    ? "border-green-500 bg-green-500"
                                                                    : "border-gray-300 hover:border-green-400"
                                                            } disabled:opacity-50`}
                                                            title="Mark as correct answer"
                                                        >
                                                            {question.correctAnswer ===
                                                                optIndex && (
                                                                <CheckCircleIcon className="h-3 w-3 text-white" />
                                                            )}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions =
                                                                    [
                                                                        ...question.options,
                                                                    ];
                                                                newOptions[
                                                                    optIndex
                                                                ] =
                                                                    e.target.value;
                                                                updateQuestion(
                                                                    question.id,
                                                                    "options",
                                                                    newOptions
                                                                );
                                                            }}
                                                            disabled={disabled}
                                                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                                            placeholder={`Option ${
                                                                optIndex + 1
                                                            }`}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Explanation (optional)
                                        </label>
                                        <textarea
                                            value={question.explanation}
                                            onChange={(e) =>
                                                updateQuestion(
                                                    question.id,
                                                    "explanation",
                                                    e.target.value
                                                )
                                            }
                                            disabled={disabled}
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                                            placeholder="Explain why this is the correct answer"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {quiz.questions.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                    <h6 className="text-sm font-medium text-purple-900 mb-2">
                        Quiz Summary
                    </h6>
                    <div className="text-sm text-purple-800 space-y-1">
                        <p>• {quiz.questions.length} questions</p>
                        <p>
                            • Time limit:{" "}
                            {quiz.timeLimit
                                ? `${quiz.timeLimit} minutes`
                                : "No limit"}
                        </p>
                        <p>• Passing score: {quiz.passingScore}%</p>
                    </div>
                </div>
            )}
        </div>
    );
};

QuizBuilder.propTypes = {
    quizData: PropTypes.object,
    onUpdate: PropTypes.func,
    disabled: PropTypes.bool,
};

export default QuizBuilder;
