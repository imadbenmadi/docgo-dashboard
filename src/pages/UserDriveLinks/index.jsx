import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Edit2,
  Plus,
  Trash2,
  Link as LinkIcon,
  Search,
  Loader,
} from "lucide-react";

const UserDriveLinkManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ driveLink: "", description: "" });
  const [addingUserId, setAddingUserId] = useState(null);
  const [addForm, setAddForm] = useState({ driveLink: "", description: "" });
  const [processingUserId, setProcessingUserId] = useState(null);

  // Fetch all users with drive links
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/Admin/drive-links");
      if (response.data.success) {
        setUsers(response.data.data || []);
        setFilteredUsers(response.data.data || []);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error", "Error"),
        text:
          error.response?.data?.message ||
          t("error_loading_users", "Error loading users"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Add drive link
  const handleAdd = async (userId) => {
    if (!addForm.driveLink.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("warning", "Warning"),
        text: t("drive_link_required", "Please enter a drive link"),
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(addForm.driveLink);
    } catch {
      Swal.fire({
        icon: "error",
        title: t("invalid_url", "Invalid URL"),
        text: t("please_enter_valid_url", "Please enter a valid URL"),
      });
      return;
    }

    setProcessingUserId(userId);
    try {
      const response = await axios.post(`/Admin/drive-links/${userId}`, {
        driveLink: addForm.driveLink.trim(),
        description: addForm.description.trim() || null,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: t("success", "Success"),
          text: t("drive_link_added", "Drive link added successfully"),
        });
        await loadUsers();
        setAddingUserId(null);
        setAddForm({ driveLink: "", description: "" });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error", "Error"),
        text:
          error.response?.data?.message ||
          t("error_adding_drive_link", "Error adding drive link"),
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Edit drive link
  const handleEdit = (user) => {
    const driveLink = user.UserDriveLink;
    setEditingUserId(user.id);
    setEditForm({
      driveLink: driveLink?.driveLink || "",
      description: driveLink?.description || "",
    });
  };

  // Save edit
  const handleSaveEdit = async (userId) => {
    if (!editForm.driveLink.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("warning", "Warning"),
        text: t("drive_link_required", "Please enter a drive link"),
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(editForm.driveLink);
    } catch {
      Swal.fire({
        icon: "error",
        title: t("invalid_url", "Invalid URL"),
        text: t("please_enter_valid_url", "Please enter a valid URL"),
      });
      return;
    }

    setProcessingUserId(userId);
    try {
      const response = await axios.patch(`/Admin/drive-links/${userId}`, {
        driveLink: editForm.driveLink.trim(),
        description: editForm.description.trim() || null,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: t("success", "Success"),
          text: t("drive_link_updated", "Drive link updated successfully"),
        });
        await loadUsers();
        setEditingUserId(null);
        setEditForm({ driveLink: "", description: "" });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error", "Error"),
        text:
          error.response?.data?.message ||
          t("error_updating_drive_link", "Error updating drive link"),
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  // Delete drive link
  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: t("confirm_delete", "Confirm Delete"),
      text: t(
        "confirm_delete_drive_link",
        "Are you sure you want to delete this drive link?",
      ),
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("delete", "Delete"),
      cancelButtonText: t("cancel", "Cancel"),
    });

    if (!confirm.isConfirmed) return;

    setProcessingUserId(userId);
    try {
      const response = await axios.delete(`/Admin/drive-links/${userId}`);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: t("success", "Success"),
          text: t("drive_link_deleted", "Drive link deleted successfully"),
        });
        await loadUsers();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error", "Error"),
        text:
          error.response?.data?.message ||
          t("error_deleting_drive_link", "Error deleting drive link"),
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t("loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t("drive_links_management", "Drive Links Management")}
            </h1>
          </div>
          <p className="text-gray-600">
            {t(
              "manage_user_drive_links",
              "Manage Google Drive or other file sharing links for users",
            )}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t(
                "search_users",
                "Search users by name or email...",
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm
                ? t("no_users_found", "No users found matching your search")
                : t("no_users", "No users available")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("user", "User")}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("email", "Email")}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("drive_link", "Drive Link")}
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      {t("actions", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const hasDriveLink = !!user.UserDriveLink;
                    const isEditing = editingUserId === user.id;
                    const isAdding = addingUserId === user.id;
                    const isProcessing = processingUserId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profilePicture && (
                              <img
                                src={user.profilePicture}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.accountType}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="url"
                                placeholder={t(
                                  "enter_drive_link",
                                  "Enter drive link URL",
                                )}
                                value={editForm.driveLink}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    driveLink: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                              />
                              <input
                                type="text"
                                placeholder={t(
                                  "description_optional",
                                  "Description (optional)",
                                )}
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(user.id)}
                                  disabled={isProcessing}
                                  className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? t("saving", "Saving...")
                                    : t("save", "Save")}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setEditForm({
                                      driveLink: "",
                                      description: "",
                                    });
                                  }}
                                  disabled={isProcessing}
                                  className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50"
                                >
                                  {t("cancel", "Cancel")}
                                </button>
                              </div>
                            </div>
                          ) : isAdding ? (
                            <div className="space-y-2">
                              <input
                                type="url"
                                placeholder={t(
                                  "enter_drive_link",
                                  "Enter drive link URL",
                                )}
                                value={addForm.driveLink}
                                onChange={(e) =>
                                  setAddForm({
                                    ...addForm,
                                    driveLink: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                              />
                              <input
                                type="text"
                                placeholder={t(
                                  "description_optional",
                                  "Description (optional)",
                                )}
                                value={addForm.description}
                                onChange={(e) =>
                                  setAddForm({
                                    ...addForm,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAdd(user.id)}
                                  disabled={isProcessing}
                                  className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? t("adding", "Adding...")
                                    : t("add", "Add")}
                                </button>
                                <button
                                  onClick={() => {
                                    setAddingUserId(null);
                                    setAddForm({
                                      driveLink: "",
                                      description: "",
                                    });
                                  }}
                                  disabled={isProcessing}
                                  className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 disabled:opacity-50"
                                >
                                  {t("cancel", "Cancel")}
                                </button>
                              </div>
                            </div>
                          ) : hasDriveLink ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={user.UserDriveLink.driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm truncate"
                              >
                                {t("open_link", "Open link")}
                              </a>
                              {user.UserDriveLink.description && (
                                <span className="text-xs text-gray-500">
                                  ({user.UserDriveLink.description})
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              {t("no_link", "No link")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {!isEditing && !isAdding && (
                              <>
                                {hasDriveLink ? (
                                  <>
                                    <button
                                      onClick={() => handleEdit(user)}
                                      disabled={isProcessing}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                      title={t("edit", "Edit")}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(user.id)}
                                      disabled={isProcessing}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                      title={t("delete", "Delete")}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => setAddingUserId(user.id)}
                                    disabled={isProcessing}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                    title={t("add_link", "Add link")}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">
              {t("total_users", "Total Users")}
            </p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">
              {t("with_drive_links", "With Drive Links")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.UserDriveLink).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">
              {t("without_drive_links", "Without Drive Links")}
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {users.filter((u) => !u.UserDriveLink).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDriveLinkManagement;
