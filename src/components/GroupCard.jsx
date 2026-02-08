import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { serverEndpoint } from "../config/appConfig";
import { useSelector } from "react-redux";
import EditGroupModal from "./EditGroupModal";

function GroupCard({ group, onUpdate, onDelete }) {
    const user = useSelector((state) => state.userDetails);
    const [showMembers, setShowMembers] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [errors, setErrors] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(null);

    // Handle both data formats: membersEmail (legacy) or members (server format)
    const members = group.members || [];
    const membersEmail = group.membersEmail || members.map(m => m.user?.email || m.user).filter(Boolean);

    // Find current user's role in this group
    const currentUserMember = members.find(
        (m) => m.user?._id === user?._id || m.user === user?._id
    );
    const isAdmin = currentUserMember?.role === "admin";
    const isManager = currentUserMember?.role === "manager";
    const canManage = isAdmin || isManager;

    const handleShowMember = () => setShowMembers(!showMembers);

    const handleAddMember = async () => {
        if (memberEmail.length === 0) return;

        setLoading("add");
        try {
            const response = await axios.post(
                `${serverEndpoint}/groups/add-members`,
                {
                    groupId: group._id,
                    emails: [memberEmail],
                },
                { withCredentials: true }
            );
            setMemberEmail("");
            setErrors({});
            
            if (response.data.added?.length > 0) {
                // Trigger parent to refresh - add to local membersEmail list
                const updatedMembersEmail = [...membersEmail, ...response.data.added];
                onUpdate && onUpdate({ ...group, membersEmail: updatedMembersEmail });
            }
            if (response.data.notFound?.length > 0) {
                setErrors({ message: `User not found: ${response.data.notFound.join(", ")}` });
            }
        } catch (error) {
            console.log(error);
            setErrors({ message: error.response?.data?.message || "Unable to add member" });
        } finally {
            setLoading(null);
        }
    };

    const handleRemoveMember = async (email) => {
        if (!window.confirm(`Remove ${email} from this group?`)) return;

        setLoading(`remove-${email}`);
        try {
            await axios.post(
                `${serverEndpoint}/groups/remove-member`,
                {
                    groupId: group._id,
                    email: email,
                },
                { withCredentials: true }
            );
            // Update local state
            const updatedMembersEmail = membersEmail.filter((e) => e !== email);
            const updatedMembers = members.filter((m) => (m.user?.email || m.user) !== email);
            onUpdate && onUpdate({
                ...group,
                membersEmail: updatedMembersEmail,
                members: updatedMembers,
            });
        } catch (error) {
            console.log(error);
            setErrors({ message: error.response?.data?.message || "Unable to remove member" });
        } finally {
            setLoading(null);
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;

        setLoading("leave");
        try {
            await axios.post(
                `${serverEndpoint}/groups/remove-member`,
                {
                    groupId: group._id,
                    email: user.email,
                },
                { withCredentials: true }
            );
            onDelete && onDelete(group._id);
        } catch (error) {
            console.log(error);
            setErrors({ message: error.response?.data?.message || "Unable to leave group" });
        } finally {
            setLoading(null);
        }
    };

    const handleDeleteGroup = async () => {
        if (!window.confirm("Are you sure you want to DELETE this entire group? This cannot be undone.")) return;

        setLoading("delete");
        try {
            await axios.delete(
                `${serverEndpoint}/groups/${group._id}`,
                { withCredentials: true }
            );
            onDelete && onDelete(group._id);
        } catch (error) {
            console.log(error);
            setErrors({ message: error.response?.data?.message || "Unable to delete group" });
        } finally {
            setLoading(null);
        }
    };

    const handleEditSuccess = (updatedGroup) => {
        onUpdate && onUpdate({
            ...group,
            name: updatedGroup.group?.name || updatedGroup.name,
            description: updatedGroup.group?.description || updatedGroup.description,
        });
    };

    // Get display name for a member
    const getMemberDisplay = (member) => {
        if (typeof member === 'string') return member;
        return member.user?.email || member.user?.name || 'Unknown';
    };

    const getMemberInitial = (member) => {
        const display = getMemberDisplay(member);
        return display.charAt(0).toUpperCase();
    };

    return (
        <>
            <div className="card h-100 border-0 shadow-sm rounded-4 transition-hover">
                <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary mb-2">
                            <i className="bi bi-collection-fill fs-4"></i>
                        </div>
                        <div className="d-flex gap-1">
                            {canManage && (
                                <button
                                    className="btn btn-sm btn-light rounded-circle"
                                    onClick={() => setShowEditModal(true)}
                                    title="Edit Group"
                                >
                                    <i className="bi bi-pencil text-secondary"></i>
                                </button>
                            )}
                            {isAdmin ? (
                                <button
                                    className="btn btn-sm btn-light rounded-circle"
                                    onClick={handleDeleteGroup}
                                    disabled={loading === "delete"}
                                    title="Delete Group"
                                >
                                    {loading === "delete" ? (
                                        <span className="spinner-border spinner-border-sm text-danger"></span>
                                    ) : (
                                        <i className="bi bi-trash text-danger"></i>
                                    )}
                                </button>
                            ) : (
                                <button
                                    className="btn btn-sm btn-light rounded-circle"
                                    onClick={handleLeaveGroup}
                                    disabled={loading === "leave"}
                                    title="Leave Group"
                                >
                                    {loading === "leave" ? (
                                        <span className="spinner-border spinner-border-sm text-warning"></span>
                                    ) : (
                                        <i className="bi bi-box-arrow-right text-warning"></i>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <h5 className="fw-bold mb-1 text-dark text-truncate">
                        {group.name}
                    </h5>

                    <button
                        className="btn btn-sm text-primary p-0 text-start fw-medium mb-3"
                        onClick={handleShowMember}
                    >
                        <i className="bi bi-people-fill me-1"></i>
                        {membersEmail.length || members.length} Members{" "}
                        {showMembers ? "▴" : "▾"}
                    </button>

                    <p className="text-muted small mb-3 flex-grow-1">
                        {group.description || "No description provided."}
                    </p>

                    <Link
                        to={`/groups/${group._id}`}
                        className="btn btn-outline-primary btn-sm rounded-pill fw-bold mb-4 w-100 py-2"
                    >
                        View & Add Expenses
                    </Link>

                    {showMembers && (
                        <div className="bg-light rounded-3 p-3 mb-4 border-0 shadow-inner">
                            <h6 className="extra-small fw-bold text-uppercase text-secondary mb-3">
                                Member List
                            </h6>
                            <div
                                className="overflow-auto"
                                style={{ maxHeight: "150px" }}
                            >
                                {(membersEmail.length > 0 ? membersEmail : members).map((member, index) => {
                                    const email = typeof member === 'string' ? member : (member.user?.email || '');
                                    const displayName = getMemberDisplay(member);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="d-flex align-items-center justify-content-between mb-2 last-child-mb-0"
                                        >
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle bg-white border d-flex align-items-center justify-content-center me-2 fw-bold text-primary shadow-sm"
                                                    style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        fontSize: "10px",
                                                    }}
                                                >
                                                    {getMemberInitial(member)}
                                                </div>
                                                <span
                                                    className="small text-dark text-truncate"
                                                    title={displayName}
                                                    style={{ maxWidth: "120px" }}
                                                >
                                                    {displayName}
                                                </span>
                                                {email === user?.email && (
                                                    <span className="badge bg-primary ms-1 small">You</span>
                                                )}
                                            </div>
                                            {canManage && email !== user?.email && email && (
                                                <button
                                                    className="btn btn-sm btn-link text-danger p-0"
                                                    onClick={() => handleRemoveMember(email)}
                                                    disabled={loading === `remove-${email}`}
                                                    title="Remove member"
                                                >
                                                    {loading === `remove-${email}` ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <i className="bi bi-x-circle"></i>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {errors.message && (
                        <div className="alert alert-danger py-1 px-2 small border-0 mb-3">
                            {errors.message}
                        </div>
                    )}

                    {canManage && (
                        <div className="mt-auto pt-3 border-top">
                            <label className="form-label extra-small fw-bold text-uppercase text-muted mb-2">
                                Invite a Friend
                            </label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="email"
                                    className="form-control bg-light border-0 px-3"
                                    placeholder="email@example.com"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                />
                                <button
                                    className="btn btn-primary px-3 fw-bold"
                                    onClick={handleAddMember}
                                    disabled={loading === "add"}
                                >
                                    {loading === "add" ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        "Add"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EditGroupModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
                group={group}
            />
        </>
    );
}

export default GroupCard;
