import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Type,
} from "lucide-react";

const TextEditor = ({ content, onChange, error, label, required = false }) => {
  const editorRef = useRef(null);
  const [currentFontSize, setCurrentFontSize] = useState(16);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || "";
      validateContent(content || "");
      if (showLineNumbers) updateLineNumbers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const execCommand = (command, value = null) => {
    // Some commands like undo, redo don't normally take value
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      setTimeout(() => {
        handleContentChange();
      }, 0);
    }
  };

  const changeFontSize = (size) => {
    const sizeMap = {
      12: "1",
      14: "2",
      16: "3",
      18: "4",
      20: "5",
      24: "6",
      32: "7",
    };
    setCurrentFontSize(parseInt(size));
    execCommand("fontSize", sizeMap[size] || "3");
  };

  const changeTextColor = (color) => {
    setTextColor(color);
    execCommand("foreColor", color);
  };

  const formatHeading = (level) => {
    execCommand("formatBlock", `h${level}`);
  };

  const removeFormatting = () => {
    execCommand("removeFormat");
  };

  const getTextContent = () => {
    if (!editorRef.current) return "";
    return editorRef.current.innerText || editorRef.current.textContent || "";
  };

  const validateContent = (htmlContent) => {
    const textContent = getTextContent().trim();
    if (required && !textContent) {
      onChange && onChange(htmlContent, false, "This field is required");
      return false;
    } else {
      onChange && onChange(htmlContent, true, "");
      return true;
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      if (showLineNumbers) updateLineNumbers();
      validateContent(htmlContent);
    }
  };

  const updateLineNumbers = () => {
    if (!editorRef.current) return;
    const text = getTextContent();
    const lineCount = text.split("\n").length;
    // Update line numbers display
    const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join(
      "\n"
    );
    const lineNumberElement =
      editorRef.current.previousElementSibling?.querySelector(
        ".line-number-content"
      );
    if (lineNumberElement) {
      lineNumberElement.style.whiteSpace = "pre";
      lineNumberElement.textContent = lineNumbers;
    }
  };

  const handleKeyUp = () => {
    setIsTouched(true);
    handleContentChange();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    setTimeout(handleContentChange, 0);
  };

  const handleInput = () => {
    setIsTouched(true);
    handleContentChange();
  };

  const handleBlur = () => {
    setIsTouched(true);
    handleContentChange();
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`border-2 rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
          isTouched && error
            ? "border-red-500 ring-2 ring-red-200"
            : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-3 border-b bg-gray-50">
          {/* Text Formatting */}
          <div className="flex gap-1 mr-3 border-r border-gray-300 pr-3">
            <button
              type="button"
              onClick={() => execCommand("bold")}
              aria-label="Bold"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              aria-label="Italic"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("underline")}
              aria-label="Underline"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Font Size & Color */}
          <div className="flex gap-2 mr-3 border-r border-gray-300 pr-3 items-center">
            <div className="flex items-center gap-1">
              <Type size={14} className="text-gray-500" />
              <select
                onChange={(e) => changeFontSize(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={currentFontSize}
              >
                {[12, 14, 16, 18, 20, 24, 32].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </div>
            <input
              type="color"
              onChange={(e) => changeTextColor(e.target.value)}
              className="w-8 h-8 p-1 border border-gray-200 rounded cursor-pointer hover:bg-blue-100"
              title="Text Color"
              value={textColor}
              aria-label="Text Color"
            />
          </div>

          {/* Alignment */}
          <div className="flex gap-1 mr-3 border-r border-gray-300 pr-3">
            <button
              type="button"
              onClick={() => execCommand("justifyLeft")}
              aria-label="Align Left"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyCenter")}
              aria-label="Align Center"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyRight")}
              aria-label="Align Right"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 mr-3 border-r border-gray-300 pr-3">
            <button
              type="button"
              onClick={() => execCommand("insertUnorderedList")}
              aria-label="Unordered List"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("insertOrderedList")}
              aria-label="Ordered List"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("formatBlock", "blockquote")}
              aria-label="Blockquote"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <Quote size={16} />
            </button>
          </div>

          {/* Other */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => execCommand("undo")}
              aria-label="Undo"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <Undo2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("redo")}
              aria-label="Redo"
              className="editor-icon-btn hover:bg-gray-200 p-1 rounded"
            >
              <Redo2 size={16} />
            </button>
            <button
              type="button"
              onClick={removeFormatting}
              className="p-2 hover:bg-red-100 hover:text-red-600 rounded text-xs"
              aria-label="Clear Formatting"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className={`relative ${showLineNumbers ? "flex" : ""}`}>
          {showLineNumbers && (
            <div className="line-numbers bg-gray-50 border-r border-gray-200 p-4 text-right text-sm text-gray-500 font-mono select-none min-w-12">
              <div
                className="line-number-content"
                style={{ lineHeight: `${currentFontSize * 1.6}px` }}
              />
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            className={`p-4 min-h-48 focus:outline-none bg-white text-gray-800 leading-relaxed flex-1 ${
              showLineNumbers ? "editor-with-numbers" : ""
            }`}
            style={{
              fontSize: `${currentFontSize}px`,
              lineHeight: `${currentFontSize * 1.6}px`,
              color: textColor,
            }}
            onBlur={handleBlur}
            onInput={handleInput}
            onKeyUp={handleKeyUp}
            onPaste={handlePaste}
            suppressContentEditableWarning={true}
            data-placeholder="Start typing your content here..."
          />
        </div>
      </div>

      {isTouched && error && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <p className="text-red-500 text-sm font-medium">{error}</p>
        </div>
      )}

      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
          opacity: 0.7;
        }

        [contenteditable] ul {
          list-style-type: disc;
          margin: 0.8em 0;
          padding-left: 2em;
        }

        [contenteditable] ol {
          list-style-type: decimal;
          margin: 0.8em 0;
          padding-left: 2em;
        }

        [contenteditable] li {
          margin: 0.3em 0;
          line-height: 1.5;
        }

        .line-numbers {
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
