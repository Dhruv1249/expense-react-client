import axios from "axios";
import { useState, useEffect } from "react";
import { serverEndpoint } from "../config/appConfig";
import { useSelector } from "react-redux";

function GroupSettingsModal({ show, onHide, group, onGroupUpdate, onGroupDelete, onLeaveGroup }) {
    const user = useSelector((state) => state.userDetails);
    const [activeTab, setActiveTab] = useState("members");
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [memberEmail, setMemberEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(null);

    // Determine user role in this group
    const currentUserMember = group?.members?.find(
        (m) => m.user?._id === user?._id
    );
    const isAdmin = currentUserMember?.role === "admin";
    const isManager = currentUserMember?.role === "manager";
    const canManage = isAdmin || isManager;

    useEffect(() => {
        if (group) {
            setFormData({
                name: group.name || "",
                description: group.description || "",
            });
        }
        setErrors({});
        setSuccessMsg("");
    }, [group, show]);

    // ---- General Tab: Edit Group Info ----
    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (formData.name.trim().length < 3)
            newErrors.name = "Name must be at least 3 characters";
        if (formData.description.trim().length < 3)
            newErrors.description = "Description must be at least 3 characters";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading("info");
        try {
            const response = await axios.put(
                `${serverEndpoint}/groups/update`,
                {
                    groupId: group._id,
                    name: formData.name,
                    description: formData.description,
                },
                { withCredentials: true }
            );
            onGroupUpdate(response.data.group || response.data);
            setSuccessMsg("Group info updated successfully!");
            setErrors({});
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error) {
            setErrors({ message: error.response?.data?.message || "Failed to update group" });
        } finally {
            setLoading(null);
        }
    };

    // ---- Members Tab: Add Member ----
    const handleAddMember = async () => {
        if (!memberEmail.trim()) return;

        setLoading("add");
        setErrors({});
        try {
            const response = await axios.post(
                `${serverEndpoint}/groups/add-members`,
                { groupId: group._id, emails: [memberEmail.trim()] },
                { withCredentials: true }
            );

            if (response.data.notFound?.length > 0) {
                setErrors({ message: `User not found: ${response.data.notFound.join(", ")}` });
            }
            if (response.data.added?.length > 0) {
                setSuccessMsg(`Added: ${response.data.added.join(", ")}`);
                setTimeout(() => setSuccessMsg(""), 3000);
                // Refresh group data
                await refreshGroup();
            }
            setMemberEmail("");
        } catch (error) {
            setErrors({ message: error.response?.data?.message || "Failed to add member" });
        } finally {
            setLoading(null);
        }
    };

    // ---- Members Tab: Remove Member ----
    const handleRemoveMember = async (email) => {
        if (!window.confirm(`Remove ${email} from this group?`)) return;

        setLoading(`remove-${email}`);
        try {
            await axios.post(
                `${serverEndpoint}/groups/remove-member`,
                { groupId: group._id, email },
                { withCredentials: true }
            );
            setSuccessMsg("Member removed");
            setTimeout(() => setSuccessMsg(""), 3000);
            await refreshGroup();
        } catch (error) {
            setErrors({ message: error.response?.data?.message || "Failed to remove member" });
        } finally {
            setLoading(null);
        }
    };

    // ---- Members Tab: Change Role ----
    const handleRoleChange = async (memberId, newRole) => {
        setLoading(`role-${memberId}`);
        try {
            const response = await axios.put(
                `${serverEndpoint}/groups/update-role`,
                { groupId: group._id, userId: memberId, newRole },
                { withCredentials: true }
            );
            if (response.data.group) {
                onGroupUpdate(response.data.group);
            }
            setSuccessMsg("Role updated");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error) {
            setErrors({ message: error.response?.data?.message || "Failed to update role" });
        } finally {
            setLoading(null);
        }
    };

    // ---- Leave Group ----
    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;

        setLoading("leave");
        try {
            await axios.post(
                `${serverEndpoint}/groups/remove-member`,
                { groupId: group._id, email: user.email },
                { withCredentials: true }
            );
            onHide();
            onLeaveGroup && onLeaveGroup();
        } catch (error) {
            setErrors({ message: error.response?.data?.message || "Failed to leave group" });
        } finally {
            setLoading(null);
        }
    };

    // ---- Danger Zone: Delete Group ----
    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to DELETE this entire group? This cannot be undone.")) return;

        setLoading("delete");
        try {
            await axios.delete(
                `${serverEndpoint}/groups/${group._id}`,
                { withCredentials: true }
            );
            onHide();
            onGroupDelete && onGroupDelete();
        } catch (error) {
            setErrors({ message: error.response?.data?.message || "Failed to delete group" });
        } finally {
            setLoading(null);
        }
    };

    // Helper: Refresh group data from server
    const refreshGroup = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/groups/${group._id}`,
                { withCredentials: true }
            );
            onGroupUpdate(response.data);
        } catch (err) {
            console.error("Failed to refresh group", err);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case "admin": return "role-badge role-badge-admin";
            case "manager": return "role-badge role-badge-manager";
            case "member": return "role-badge role-badge-member";
            case "viewer": return "role-badge role-badge-viewer";
            default: return "role-badge";
        }
    };

    if (!show || !group) return null;

    const tabs = [
        { key: "members", label: "Members", icon: "bi-people-fill" },
    ];
    if (canManage) {
        tabs.unshift({ key: "general", label: "General", icon: "bi-gear-fill" });
        tabs.push({ key: "danger", label: "Danger Zone", icon: "bi-exclamation-triangle-fill" });
    }

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(4px)",
            }}
            onClick={(e) => e.target === e.currentTarget && onHide()}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                    {/* Modal Header */}
                    <div className="modal-header border-0 px-4 pt-4 pb-0">
                        <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                                <i className="bi bi-gear-fill text-success fs-4"></i>
                            </div>
                            <div>
                                <h5 className="fw-bold mb-0">Group Settings</h5>
                                <small className="text-muted">{group.name}</small>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close shadow-none"
                            onClick={onHide}
                        ></button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="px-4 pt-3">
                        <ul className="nav nav-pills settings-tabs gap-2">
                            {tabs.map((tab) => (
                                <li key={tab.key} className="nav-item">
                                    <button
                                        className={`nav-link settings-tab d-flex align-items-center gap-2 ${
                                            activeTab === tab.key ? "active" : ""
                                        } ${tab.key === "danger" ? "settings-tab-danger" : ""}`}
                                        onClick={() => { setActiveTab(tab.key); setErrors({}); setSuccessMsg(""); }}
                                    >
                                        <i className={`bi ${tab.icon}`}></i>
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Messages */}
                    <div className="px-4 pt-3">
                        {errors.message && (
                            <div className="alert alert-danger py-2 small border-0 mb-0 d-flex align-items-center">
                                <i className="bi bi-exclamation-circle me-2"></i>
                                {errors.message}
                            </div>
                        )}
                        {successMsg && (
                            <div className="alert alert-success py-2 small border-0 mb-0 d-flex align-items-center">
                                <i className="bi bi-check-circle me-2"></i>
                                {successMsg}
                            </div>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="modal-body px-4 py-4">
                        {/* ===== GENERAL TAB ===== */}
                        {activeTab === "general" && canManage && (
                            <form onSubmit={handleInfoSubmit}>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-lg bg-light border-0 fs-6 ${
                                            errors.name ? "is-invalid" : ""
                                        }`}
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">{errors.name}</div>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">
                                        Description
                                    </label>
                                    <textarea
                                        className={`form-control form-control-lg bg-light border-0 fs-6 ${
                                            errors.description ? "is-invalid" : ""
                                        }`}
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    ></textarea>
                                    {errors.description && (
                                        <div className="invalid-feedback">{errors.description}</div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
                                    disabled={loading === "info"}
                                >
                                    {loading === "info" ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </form>
                        )}

                        {/* ===== MEMBERS TAB ===== */}
                        {activeTab === "members" && (
                            <div>
                                {/* Add Member Section */}
                                {canManage && (
                                    <div className="bg-light rounded-3 p-3 mb-4">
                                        <label className="form-label small fw-bold text-secondary text-uppercase mb-2">
                                            <i className="bi bi-person-plus me-1"></i> Invite New Member
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="email"
                                                className="form-control border-0 bg-white"
                                                placeholder="Enter email address..."
                                                value={memberEmail}
                                                onChange={(e) => setMemberEmail(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
                                            />
                                            <button
                                                className="btn btn-success px-4 fw-bold"
                                                onClick={handleAddMember}
                                                disabled={loading === "add"}
                                            >
                                                {loading === "add" ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-plus-lg me-1"></i> Add
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Member List */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-secondary text-uppercase small mb-0">
                                        {group.members?.length || 0} Members
                                    </h6>
                                </div>

                                <div className="member-list" style={{ maxHeight: "350px", overflowY: "auto" }}>
                                    {group.members?.map((member, index) => {
                                        const memberUser = member.user;
                                        const isCurrentUser = memberUser?._id === user?._id;
                                        const memberEmail = memberUser?.email || "";

                                        return (
                                            <div
                                                key={index}
                                                className="member-list-item d-flex align-items-center justify-content-between p-3 rounded-3 mb-2"
                                            >
                                                <div className="d-flex align-items-center flex-grow-1 min-width-0">
                                                    <div
                                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            fontSize: "0.85rem",
                                                            aspectRatio: "1/1",
                                                        }}
                                                    >
                                                        {(memberUser?.username || memberUser?.name || "?")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div className="min-width-0">
                                                        <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                                            <span className="text-truncate" style={{ maxWidth: "150px" }}>
                                                                {memberUser?.username || memberUser?.name || "Unknown"}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: "0.65rem" }}>
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <small className="text-muted text-truncate d-block" style={{ maxWidth: "200px" }}>
                                                            {memberEmail}
                                                        </small>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                                    {/* Role Badge or Dropdown */}
                                                    {isAdmin && !isCurrentUser ? (
                                                        <select
                                                            className="form-select form-select-sm border-0 bg-light fw-bold"
                                                            style={{ width: "110px", fontSize: "0.75rem" }}
                                                            value={member.role}
                                                            onChange={(e) =>
                                                                handleRoleChange(memberUser._id, e.target.value)
                                                            }
                                                            disabled={loading === `role-${memberUser._id}`}
                                                        >
                                                            <option value="admin">Admin</option>
                                                            <option value="manager">Manager</option>
                                                            <option value="member">Member</option>
                                                            <option value="viewer">Viewer</option>
                                                        </select>
                                                    ) : (
                                                        <span className={getRoleBadgeClass(member.role)}>
                                                            {member.role}
                                                        </span>
                                                    )}

                                                    {/* Remove Button */}
                                                    {canManage && !isCurrentUser && (
                                                        <button
                                                            className="btn btn-sm btn-light text-danger rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{ width: "32px", height: "32px" }}
                                                            onClick={() => handleRemoveMember(memberEmail)}
                                                            disabled={loading === `remove-${memberEmail}`}
                                                            title="Remove member"
                                                        >
                                                            {loading === `remove-${memberEmail}` ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <i className="bi bi-x-lg" style={{ fontSize: "0.7rem" }}></i>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Leave Group */}
                                {!isAdmin && (
                                    <div className="mt-4 pt-3 border-top">
                                        <button
                                            className="btn btn-outline-warning rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
                                            onClick={handleLeaveGroup}
                                            disabled={loading === "leave"}
                                        >
                                            {loading === "leave" ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <i className="bi bi-box-arrow-left"></i>
                                            )}
                                            Leave Group
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== DANGER ZONE TAB ===== */}
                        {activeTab === "danger" && isAdmin && (
                            <div>
                                <div className="danger-zone rounded-3 p-4 mb-3">
                                    <div className="d-flex align-items-start">
                                        <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3 flex-shrink-0">
                                            <i className="bi bi-trash3-fill text-danger fs-5"></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold text-danger mb-1">Delete this group</h6>
                                            <p className="text-muted small mb-3">
                                                Once you delete a group, there is no going back. All expenses and member data
                                                associated with this group will be permanently removed.
                                            </p>
                                            <button
                                                className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
                                                onClick={handleDeleteGroup}
                                                disabled={loading === "delete"}
                                            >
                                                {loading === "delete" ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-trash3 me-2"></i>
                                                        Delete Group Permanently
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer border-0 px-4 pb-4">
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4 fw-medium"
                            onClick={onHide}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupSettingsModal;
