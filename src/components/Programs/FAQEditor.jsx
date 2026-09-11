import PropTypes from "prop-types";
import { Plus, Trash2 } from "lucide-react";

/**
 * The programme FAQs.
 *
 * ProgramFAQSection has displayed these on the public page since it was
 * written, and neither AddProgram nor Edit_Program had anywhere to enter one -
 * so the section only ever appeared for programmes seeded directly into the
 * database.
 *
 * Stored as the column stores them: an array of { question, answer }. Rows
 * with neither filled in are dropped on the way out, so an admin can leave a
 * blank row behind without it reaching the page.
 */
const FAQEditor = ({ value, onChange }) => {
    const faqs = Array.isArray(value) ? value : [];

    const update = (next) => {
        onChange(next.filter((f) => f.question?.trim() || f.answer?.trim()));
    };

    const setAt = (index, patch) =>
        update(faqs.map((f, i) => (i === index ? { ...f, ...patch } : f)));

    return (
        <div className="mt-8 border-t pt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">
                        Frequently asked questions
                    </h3>
                    <p className="text-sm text-gray-500">
                        Shown on the programme page, under the description.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() =>
                        onChange([...faqs, { question: "", answer: "" }])
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    <Plus className="h-4 w-4" /> Add a question
                </button>
            </div>

            {faqs.length === 0 && (
                <p className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                    No questions yet. The section is hidden on the programme
                    page until there is at least one.
                </p>
            )}

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="rounded-xl border-2 border-emerald-100 bg-white/80 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <span className="mt-2.5 text-sm font-semibold text-gray-400">
                                {index + 1}
                            </span>
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={faq.question || ""}
                                    onChange={(e) =>
                                        setAt(index, { question: e.target.value })
                                    }
                                    placeholder="What does this programme cost?"
                                    className="w-full rounded-lg border-2 border-emerald-200 px-3 py-2 font-medium focus:border-emerald-500 focus:outline-none"
                                />
                                <textarea
                                    value={faq.answer || ""}
                                    onChange={(e) =>
                                        setAt(index, { answer: e.target.value })
                                    }
                                    rows={2}
                                    placeholder="The answer people are looking for."
                                    className="w-full rounded-lg border-2 border-emerald-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    update(faqs.filter((_, i) => i !== index))
                                }
                                className="mt-1 rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

FAQEditor.propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
};

export default FAQEditor;
