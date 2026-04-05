import { useEffect, useState, useRef } from "react";
import { Loader2, Mail, Send, Search, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import emailsAPI from "../../API/Emails";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";

const ContactUserEmailPage = () => {
  const [sending, setSending] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");

  // Load users with debouncing
  const loadUsers = async (search = "") => {
    setUsersLoading(true);
    try {
      const res = await emailsAPI.getUsersForCampaign({
        search,
        page: 1,
        limit: 100,
      });
      if (res?.success) {
        setUsers(res.users || []);
      }
    } catch {
      toast.error("Unable to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Load initial users on mount
  useEffect(() => {
    loadUsers("");
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers(usersSearch);
    }, 300);

    return () => clearTimeout(timeout);
  }, [usersSearch]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowDropdown(false);
    setUsersSearch("");
  };

  const handleSendEmail = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!htmlContent.trim()) {
      toast.error("Email content is required");
      return;
    }

    setSending(true);
    try {
      const res = await emailsAPI.sendEmailToUser(
        selectedUser.id,
        subject,
        htmlContent,
      );

      if (res?.success) {
        toast.success(`Email sent to ${selectedUser.email}`, {
          duration: 3000,
        });
        // Reset form
        setSelectedUser(null);
        setSubject("");
        setHtmlContent("");
      } else {
        toast.error(res?.message || "Failed to send email");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact User</h1>
            <p className="text-sm text-gray-600">
              Send personalized emails to specific users
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Select User
            </h2>

            {/* Selected user display */}
            {selectedUser ? (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 break-all">
                      {selectedUser.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUsersSearch("");
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : null}

            {/* Search box */}
            <div className="relative mb-4" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={usersSearch}
                  onChange={(e) => {
                    setUsersSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={selectedUser !== null}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                {usersLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && !selectedUser && users.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {showDropdown &&
                !selectedUser &&
                users.length === 0 &&
                !usersLoading && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                    <p className="text-sm text-gray-600">No users found</p>
                  </div>
                )}
            </div>

            {/* Info box */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Select a user to send them a personalized email. Only active
                  users with valid email addresses are shown.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Composition Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              disabled={!selectedUser || sending}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
            />
          </div>

          {/* Email Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Email Content <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={htmlContent}
              onChange={setHtmlContent}
              readOnly={!selectedUser || sending}
              placeholder="Write your email message here..."
              height="300px"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setSelectedUser(null);
                setSubject("");
                setHtmlContent("");
              }}
              disabled={sending || (!selectedUser && !subject && !htmlContent)}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Clear
            </button>
            <button
              onClick={handleSendEmail}
              disabled={
                !selectedUser ||
                !subject.trim() ||
                !htmlContent.trim() ||
                sending
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          {selectedUser && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Email will be sent to <strong>{selectedUser.email}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUserEmailPage;
