import { useState } from "react";
import {
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon,
    DocumentTextIcon,
    ListBulletIcon,
} from "@heroicons/react/24/outline";

const QuizBuilder = ({ quizData, onUpdate }) => {
    const [quiz, setQuiz] = useState(
        quizData || {
            title: "",
            description: "",
            questions: [],
            timeLimit: 0, // 0 means no time limit
            passingScore: 70,
            randomizeQuestions: false,
            showCorrectAnswers: true,
        }
    );

    // Question types
    const questionTypes = [
        {
            value: "multiple-choice",
            label: "Multiple Choice",
            icon: ListBulletIcon,
        },
        { value: "true-false", label: "True/False", icon: CheckCircleIcon },
        {
            value: "short-answer",
            label: "Short Answer",
            icon: DocumentTextIcon,
        },
        { value: "essay", label: "Essay Question", icon: DocumentTextIcon },
    ];

    // Update quiz and notify parent
    const updateQuiz = (updates) => {
        const newQuiz = { ...quiz, ...updates };
        setQuiz(newQuiz);
        onUpdate(newQuiz);
    };

    // Add new question
    const addQuestion = (type) => {
        const newQuestion = {
            id: Date.now(),
            type,
            question: "",
            points: 1,
            required: true,
            ...(type === "multiple-choice" && {
                options: [
                    { id: 1, text: "", isCorrect: false },
                    { id: 2, text: "", isCorrect: false },
                ],
            }),
            ...(type === "true-false" && {
                correctAnswer: true,
            }),
            ...(type === "short-answer" && {
                correctAnswer: "",
                caseSensitive: false,
            }),
            ...(type === "essay" && {
                rubric: "",
                maxWords: 0,
            }),
        };

        updateQuiz({
            questions: [...quiz.questions, newQuestion],
        });
    };

    // Update question
    const updateQuestion = (questionId, updates) => {
        const updatedQuestions = quiz.questions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
        );
        updateQuiz({ questions: updatedQuestions });
    };

    // Delete question
    const deleteQuestion = (questionId) => {
        const updatedQuestions = quiz.questions.filter(
            (q) => q.id !== questionId
        );
        updateQuiz({ questions: updatedQuestions });
    };

    // Add option to multiple choice question
    const addOption = (questionId) => {
        const question = quiz.questions.find((q) => q.id === questionId);
        const newOption = {
            id: Date.now(),
            text: "",
            isCorrect: false,
        };

        updateQuestion(questionId, {
            options: [...question.options, newOption],
        });
    };

    // Update option
    const updateOption = (questionId, optionId, updates) => {
        const question = quiz.questions.find((q) => q.id === questionId);
        const updatedOptions = question.options.map((opt) =>
            opt.id === optionId ? { ...opt, ...updates } : opt
        );
        updateQuestion(questionId, { options: updatedOptions });
    };

    // Delete option
    const deleteOption = (questionId, optionId) => {
        const question = quiz.questions.find((q) => q.id === questionId);
        if (question.options.length <= 2) return; // Minimum 2 options

        const updatedOptions = question.options.filter(
            (opt) => opt.id !== optionId
        );
        updateQuestion(questionId, { options: updatedOptions });
    };

    // Set correct answer for multiple choice
    const setCorrectAnswer = (questionId, optionId) => {
        const question = quiz.questions.find((q) => q.id === questionId);
        const updatedOptions = question.options.map((opt) => ({
            ...opt,
            isCorrect: opt.id === optionId,
        }));
        updateQuestion(questionId, { options: updatedOptions });
    };

    // Render question based on type
    const renderQuestion = (question, index) => {
        return (
            <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
                {/* Question Header */}
                <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-900">
                        Question {index + 1} -{" "}
                        {
                            questionTypes.find((t) => t.value === question.type)
                                ?.label
                        }
                    </h4>
                    <button
                        onClick={() => deleteQuestion(question.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Question"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                    </label>
                    <textarea
                        value={question.question}
                        onChange={(e) =>
                            updateQuestion(question.id, {
                                question: e.target.value,
                            })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter your question here..."
                        required
                    />
                </div>

                {/* Question Settings */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Points
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) =>
                                updateQuestion(question.id, {
                                    points: parseInt(e.target.value) || 1,
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) =>
                                    updateQuestion(question.id, {
                                        required: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Required
                            </span>
                        </label>
                    </div>
                </div>

                {/* Question Type Specific Fields */}
                {question.type === "multiple-choice" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Answer Options
                        </label>
                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        checked={option.isCorrect}
                                        onChange={() =>
                                            setCorrectAnswer(
                                                question.id,
                                                option.id
                                            )
                                        }
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) =>
                                            updateOption(
                                                question.id,
                                                option.id,
                                                { text: e.target.value }
                                            )
                                        }
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter option text..."
                                    />
                                    {question.options.length > 2 && (
                                        <button
                                            onClick={() =>
                                                deleteOption(
                                                    question.id,
                                                    option.id
                                                )
                                            }
                                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                            title="Delete Option"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => addOption(question.id)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Option
                            </button>
                        </div>
                    </div>
                )}

                {question.type === "true-false" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answer
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    checked={question.correctAnswer === true}
                                    onChange={() =>
                                        updateQuestion(question.id, {
                                            correctAnswer: true,
                                        })
                                    }
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    True
                                </span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    checked={question.correctAnswer === false}
                                    onChange={() =>
                                        updateQuestion(question.id, {
                                            correctAnswer: false,
                                        })
                                    }
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    False
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {question.type === "short-answer" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Correct Answer
                            </label>
                            <input
                                type="text"
                                value={question.correctAnswer}
                                onChange={(e) =>
                                    updateQuestion(question.id, {
                                        correctAnswer: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter the correct answer..."
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={question.caseSensitive}
                                    onChange={(e) =>
                                        updateQuestion(question.id, {
                                            caseSensitive: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Case sensitive
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {question.type === "essay" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grading Rubric (Optional)
                            </label>
                            <textarea
                                value={question.rubric}
                                onChange={(e) =>
                                    updateQuestion(question.id, {
                                        rubric: e.target.value,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Enter grading criteria or rubric..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Words (0 = no limit)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={question.maxWords}
                                onChange={(e) =>
                                    updateQuestion(question.id, {
                                        maxWords: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Quiz Settings */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                    Quiz Settings
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quiz Title
                        </label>
                        <input
                            type="text"
                            value={quiz.title}
                            onChange={(e) =>
                                updateQuiz({ title: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter quiz title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Limit (minutes, 0 = no limit)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={quiz.timeLimit}
                            onChange={(e) =>
                                updateQuiz({
                                    timeLimit: parseInt(e.target.value) || 0,
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passing Score (%)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={quiz.passingScore}
                            onChange={(e) =>
                                updateQuiz({
                                    passingScore:
                                        parseInt(e.target.value) || 70,
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2 pt-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={quiz.randomizeQuestions}
                                onChange={(e) =>
                                    updateQuiz({
                                        randomizeQuestions: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Randomize questions
                            </span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={quiz.showCorrectAnswers}
                                onChange={(e) =>
                                    updateQuiz({
                                        showCorrectAnswers: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                                Show correct answers after submission
                            </span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quiz Description
                    </label>
                    <textarea
                        value={quiz.description}
                        onChange={(e) =>
                            updateQuiz({ description: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter quiz description..."
                    />
                </div>
            </div>

            {/* Questions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                        Questions ({quiz.questions.length})
                    </h4>
                </div>

                {/* Question List */}
                <div className="space-y-4">
                    {quiz.questions.map((question, index) =>
                        renderQuestion(question, index)
                    )}
                </div>

                {/* Add Question Buttons */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <QuestionMarkCircleIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Add a New Question
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {questionTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    onClick={() => addQuestion(type.value)}
                                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    <IconComponent className="h-5 w-5 text-gray-600" />
                                    <span className="text-xs text-gray-700">
                                        {type.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quiz Summary */}
            {quiz.questions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Quiz Summary
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p>Total Questions: {quiz.questions.length}</p>
                        <p>
                            Total Points:{" "}
                            {quiz.questions.reduce(
                                (sum, q) => sum + q.points,
                                0
                            )}
                        </p>
                        <p>
                            Estimated Time:{" "}
                            {Math.max(1, Math.ceil(quiz.questions.length * 2))}{" "}
                            minutes
                        </p>
                        {quiz.timeLimit > 0 && (
                            <p>Time Limit: {quiz.timeLimit} minutes</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizBuilder;
