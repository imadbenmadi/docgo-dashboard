import { useMemo } from "react";
import ReactQuill from "react-quill";
import PropTypes from "prop-types";
import "react-quill/dist/quill.snow.css";
import "./RichTextEditor.css";

const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Commencez à écrire...",
    readOnly = false,
    height = "200px",
    theme = "snow",
    className = "",
    label,
    error,
    required = false,
}) => {
    // Custom toolbar configuration
    const modules = useMemo(
        () => ({
            toolbar: readOnly
                ? false
                : {
                      container: [
                          [{ header: [1, 2, 3, 4, 5, 6, false] }],
                          [{ font: [] }],
                          [{ size: ["small", false, "large", "huge"] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ color: [] }, { background: [] }],
                          [{ script: "sub" }, { script: "super" }],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ indent: "-1" }, { indent: "+1" }],
                          [{ direction: "rtl" }],
                          [{ align: [] }],
                          ["blockquote", "code-block"],
                          ["clean"],
                      ],
                  },
            clipboard: {
                matchVisual: false,
            },
        }),
        [readOnly]
    );

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "list",
        "bullet",
        "indent",
        "direction",
        "align",
        "blockquote",
        "code-block",
        "link",
        "clean",
    ];

    const handleChange = (content) => {
        if (onChange) {
            onChange(content);
        }
    };

    return (
        <div className={`rich-text-editor-wrapper ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className={`rich-text-editor ${readOnly ? "read-only" : ""}`}>
                <ReactQuill
                    value={value || ""}
                    onChange={handleChange}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    theme={theme}
                    modules={modules}
                    formats={formats}
                    style={{
                        height: readOnly ? "auto" : height,
                        minHeight: readOnly ? "auto" : height,
                    }}
                />
            </div>

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

RichTextEditor.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    readOnly: PropTypes.bool,
    height: PropTypes.string,
    theme: PropTypes.string,
    className: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
};

export default RichTextEditor;
