import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../config/appConfig";
import ExpenseCard from "../components/ExpenseCard";
import AddExpenseModal from "../components/AddExpenseModal";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import GroupSettingsModal from "../components/GroupSettingsModal";

function GroupExpenses() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.userDetails);
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [memberEmail, setMemberEmail] = useState("");
    const [sidebarLoading, setSidebarLoading] = useState(null);
    const [sidebarError, setSidebarError] = useState("");
    const [sidebarSuccess, setSidebarSuccess] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [groupStats, setGroupStats] = useState({ totalSpent: 0, pendingCount: 0, settledCount: 0, pendingAmount: 0 });
    const [settleLoading, setSettleLoading] = useState(false);
    const EXPENSES_PER_PAGE = 10;

    const fetchGroupDetails = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/groups/${groupId}`,
                { withCredentials: true }
            );
            setGroup(response.data);
        } catch (error) {
            console.error("Error fetching group:", error);
        }
    };

    const fetchExpenses = async (page = 1) => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/expenses/group/${groupId}?page=${page}&limit=${EXPENSES_PER_PAGE}`,
                { withCredentials: true }
            );
            setExpenses(response.data.expenses);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
            setTotalExpenses(response.data.totalExpenses);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    const fetchGroupStats = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/expenses/group-stats/${groupId}`,
                { withCredentials: true }
            );
            setGroupStats(response.data);
        } catch (error) {
            console.error("Error fetching group stats:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGroupDetails(), fetchExpenses(1), fetchGroupStats()]);
            setLoading(false);
        };
        loadData();
    }, [groupId]);

    // Check current user role
    const currentUserMember = group?.members?.find(
        (m) => m.user?._id === user?._id
    );
    const isAdmin = currentUserMember?.role === "admin";
    const isManager = currentUserMember?.role === "manager";
    const canManage = isAdmin || isManager;

    const handleExpenseAdded = () => {
        setCurrentPage(1);
        fetchExpenses(1);
        fetchGroupStats();
    };

    const handleSettleAll = async () => {
        if (!window.confirm("Settle ALL pending payments in this group? This cannot be undone.")) return;
        setSettleLoading(true);
        try {
            await axios.post(
                `${serverEndpoint}/expenses/settle-group`,
                { groupId },
                { withCredentials: true }
            );
            await Promise.all([fetchExpenses(currentPage), fetchGroupStats()]);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to settle group");
        } finally {
            setSettleLoading(false);
        }
    };

    const isExpenseSettled = (expense) => {
        return expense.splits.every((split) => split.status === "SETTLED");
    };

    const handleSettle = (expenseId, debtorId) => {
        setExpenses((prev) =>
            prev.map((expense) => {
                if (expense._id === expenseId) {
                    return {
                        ...expense,
                        splits: expense.splits.map((split) =>
                            split.user?._id === debtorId
                                ? { ...split, status: "SETTLED" }
                                : split
                        ),
                    };
                }
                return expense;
            })
        );
        fetchGroupStats();
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchExpenses(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- Sidebar: Role Change ---
    const handleRoleChange = async (memberId, newRole) => {
        setSidebarLoading(`role-${memberId}`);
        try {
            const response = await axios.put(
                `${serverEndpoint}/groups/update-role`,
                { groupId, userId: memberId, newRole },
                { withCredentials: true }
            );
            if (response.data.group) {
                setGroup(response.data.group);
            }
            setSidebarSuccess("Role updated");
            setTimeout(() => setSidebarSuccess(""), 3000);
        } catch (error) {
            setSidebarError(error.response?.data?.message || "Failed to update role");
            setTimeout(() => setSidebarError(""), 4000);
        } finally {
            setSidebarLoading(null);
        }
    };

    // --- Sidebar: Add member ---
    const handleAddMember = async () => {
        if (!memberEmail.trim()) return;
        setSidebarLoading("add");
        setSidebarError("");
        try {
            const response = await axios.post(
                `${serverEndpoint}/groups/add-members`,
                { groupId, emails: [memberEmail.trim()] },
                { withCredentials: true }
            );
            if (response.data.notFound?.length > 0) {
                setSidebarError(`Not found: ${response.data.notFound.join(", ")}`);
                setTimeout(() => setSidebarError(""), 4000);
            }
            if (response.data.added?.length > 0) {
                setSidebarSuccess(`Added ${response.data.added.join(", ")}`);
                setTimeout(() => setSidebarSuccess(""), 3000);
                await fetchGroupDetails();
            }
            setMemberEmail("");
        } catch (error) {
            setSidebarError(error.response?.data?.message || "Failed to add member");
            setTimeout(() => setSidebarError(""), 4000);
        } finally {
            setSidebarLoading(null);
        }
    };

    // --- Sidebar: Remove member ---
    const handleRemoveMember = async (email) => {
        if (!window.confirm(`Remove ${email} from this group?`)) return;
        setSidebarLoading(`remove-${email}`);
        try {
            await axios.post(
                `${serverEndpoint}/groups/remove-member`,
                { groupId, email },
                { withCredentials: true }
            );
            setSidebarSuccess("Member removed");
            setTimeout(() => setSidebarSuccess(""), 3000);
            await fetchGroupDetails();
        } catch (error) {
            setSidebarError(error.response?.data?.message || "Failed to remove member");
            setTimeout(() => setSidebarError(""), 4000);
        } finally {
            setSidebarLoading(null);
        }
    };

    // --- Header: Leave Group ---
    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await axios.post(
                `${serverEndpoint}/groups/remove-member`,
                { groupId, email: user.email },
                { withCredentials: true }
            );
            navigate("/groups");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to leave group");
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

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <nav aria-label="Expense pagination" className="mt-4">
                <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    </li>
                    {startPage > 1 && (
                        <>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                            </li>
                            {startPage > 2 && (
                                <li className="page-item disabled">
                                    <span className="page-link">…</span>
                                </li>
                            )}
                        </>
                    )}
                    {pages.map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => handlePageChange(page)}>
                                {page}
                            </button>
                        </li>
                    ))}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <li className="page-item disabled">
                                    <span className="page-link">…</span>
                                </li>
                            )}
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                                    {totalPages}
                                </button>
                            </li>
                        </>
                    )}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
                <p className="text-center text-muted small mt-2 mb-0">
                    Page {currentPage} of {totalPages} • {totalExpenses} total expenses
                </p>
            </nav>
        );
    };

    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    if (loading) {
        return (
            <div
                className="container p-5 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-border text-success"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">
                    Loading expenses...
                </p>
            </div>
        );
    }

    const handleExpenseClick = (expense) => {
        setSelectedExpense(expense);
        setShowDetailsModal(true);
    };

    const handleExpenseUpdate = (updatedExpense) => {
        setExpenses((prev) =>
            prev.map((e) => (e._id === updatedExpense._id ? updatedExpense : e))
        );
        setSelectedExpense(updatedExpense);
        fetchGroupStats();
    };

    return (
        <div className="py-2">
            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div className="mb-3 mb-md-0">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1 small text-muted">
                            <li className="breadcrumb-item"><Link to="/dashboard" className="text-secondary text-decoration-none">Groups</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{group?.name}</li>
                        </ol>
                    </nav>
                    <div className="d-flex align-items-center">
                        <h2 className="fw-bold mb-0 me-3 display-6" style={{ letterSpacing: "-1px" }}>{group?.name}</h2>
                        <span className="badge bg-light text-secondary border fw-normal">{group?.members?.length || 0} members</span>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {!isAdmin && (
                        <button
                            className="btn btn-outline-warning rounded-pill px-3 fw-bold d-flex align-items-center"
                            onClick={handleLeaveGroup}
                            title="Leave Group"
                        >
                            <i className="bi bi-box-arrow-left me-2"></i> Leave
                        </button>
                    )}
                    {canManage && groupStats.pendingCount > 0 && (
                        <button
                            className="btn btn-outline-success rounded-pill px-3 fw-bold d-flex align-items-center"
                            onClick={handleSettleAll}
                            disabled={settleLoading}
                            title="Settle all pending payments"
                        >
                            {settleLoading ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                                <i className="bi bi-check2-all me-2"></i>
                            )}
                            Settle All
                        </button>
                    )}
                    <button
                        className="btn btn-light rounded-pill px-3 fw-bold d-flex align-items-center"
                        onClick={() => setShowSettingsModal(true)}
                        title="Group Settings"
                    >
                        <i className="bi bi-gear me-2"></i> Settings
                    </button>
                    <button 
                        className="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Add Expense
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <div className="card-body p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <i className="bi bi-wallet2 display-1 text-success"></i>
                            </div>
                            <h6 className="text-secondary text-uppercase fw-bold small mb-3">Total Spent</h6>
                            <h2 className="display-5 fw-bold mb-0 text-dark">₹{groupStats.totalSpent.toLocaleString()}</h2>
                            <p className="text-muted small mt-2 mb-0">All expenses combined</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden ${groupStats.pendingCount > 0 ? 'bg-warning bg-opacity-10' : ''}`}>
                        <div className="card-body p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <i className="bi bi-hourglass-split display-1 text-warning"></i>
                            </div>
                            <h6 className={`text-uppercase fw-bold small mb-3 ${groupStats.pendingCount > 0 ? 'text-warning' : 'text-secondary'}`}>Pending</h6>
                            <h2 className={`display-5 fw-bold mb-0 ${groupStats.pendingCount > 0 ? 'text-warning' : 'text-dark'}`}>₹{groupStats.pendingAmount.toLocaleString()}</h2>
                            <p className={`small mt-2 mb-0 ${groupStats.pendingCount > 0 ? 'text-warning text-opacity-75' : 'text-muted'}`}>{groupStats.pendingCount} pending expenses</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-success bg-opacity-10">
                        <div className="card-body p-4 position-relative">
                            <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <i className="bi bi-check-circle display-1 text-success"></i>
                            </div>
                            <h6 className="text-success text-uppercase fw-bold small mb-3">Settled</h6>
                            <h2 className="display-5 fw-bold mb-0 text-success">{groupStats.settledCount}</h2>
                            <p className="text-success text-opacity-75 small mt-2 mb-0">{groupStats.settledCount} settled expenses</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">Recent Transactions</h4>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-light text-secondary"><i className="bi bi-filter"></i></button>
                            <button className="btn btn-sm btn-light text-secondary"><i className="bi bi-search"></i></button>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4 py-3 text-secondary text-uppercase small fw-bold">Date</th>
                                        <th className="border-0 py-3 text-secondary text-uppercase small fw-bold">Expense Name</th>
                                        <th className="border-0 py-3 text-secondary text-uppercase small fw-bold">Payer</th>
                                        <th className="border-0 py-3 text-secondary text-uppercase small fw-bold text-center">Status</th>
                                        <th className="border-0 py-3 text-secondary text-uppercase small fw-bold text-end pe-4">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense._id} style={{ cursor: "pointer" }} onClick={() => handleExpenseClick(expense)}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark">{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                                        <i className="bi bi-receipt text-secondary fs-5"></i>
                                                    </div>
                                                    <span className="fw-bold text-dark">{expense.description}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "24px", height: "24px", fontSize: "10px", aspectRatio: "1/1" }}>
                                                        {expense.payer?.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-secondary small">{expense.payer?.username === user?.username ? "You" : expense.payer?.username}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                {isExpenseSettled(expense) ? (
                                                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-check-circle-fill me-1"></i>Settled
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning bg-opacity-10 text-warning fw-bold px-2 py-1" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-hourglass-split me-1"></i>Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <span className="fw-bold text-dark">₹{expense.amount.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                No expenses yet. Add your first expense!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     {renderPagination()}
                </div>
                
                {/* Enhanced Sidebar */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                         <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Group Members</h5>
                            <button
                                className="btn btn-sm btn-link text-success fw-bold text-decoration-none p-0"
                                onClick={() => setShowSettingsModal(true)}
                            >
                                <i className="bi bi-gear me-1"></i>Manage
                            </button>
                         </div>
                         <div className="card-body px-4">
                            {/* Sidebar Messages */}
                            {sidebarError && (
                                <div className="alert alert-danger py-1 px-2 small border-0 mb-3 d-flex align-items-center">
                                    <i className="bi bi-exclamation-circle me-1"></i>
                                    {sidebarError}
                                </div>
                            )}
                            {sidebarSuccess && (
                                <div className="alert alert-success py-1 px-2 small border-0 mb-3 d-flex align-items-center">
                                    <i className="bi bi-check-circle me-1"></i>
                                    {sidebarSuccess}
                                </div>
                            )}

                            <div className="list-group list-group-flush">
                                {group?.members?.map((member, index) => {
                                    const isCurrentUser = member.user?._id === user?._id;
                                    const email = member.user?.email || "";

                                    return (
                                        <div key={index} className="list-group-item border-0 px-0 py-3 d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center min-width-0">
                                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 fw-bold text-secondary flex-shrink-0" style={{ width: "40px", height: "40px", aspectRatio: "1/1" }}>
                                                    {(member.user?.username || member.user?.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-width-0">
                                                    <div className="fw-bold text-dark mb-0 lh-1 d-flex align-items-center gap-1">
                                                        <span className="text-truncate" style={{ maxWidth: "100px" }}>
                                                            {member.user?.username || member.user?.name}
                                                        </span>
                                                        {isCurrentUser && <span className="text-muted small">(You)</span>}
                                                    </div>
                                                    <span className={getRoleBadgeClass(member.role)} style={{ marginTop: "2px" }}>
                                                        {member.role}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-1">
                                                {/* Quick role change (admin only) */}
                                                {isAdmin && !isCurrentUser && (
                                                    <select
                                                        className="form-select form-select-sm border-0 bg-light fw-bold"
                                                        style={{ width: "90px", fontSize: "0.7rem" }}
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                                                        disabled={sidebarLoading === `role-${member.user._id}`}
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="manager">Manager</option>
                                                        <option value="member">Member</option>
                                                        <option value="viewer">Viewer</option>
                                                    </select>
                                                )}
                                                {/* Remove button (admin/manager, not self) */}
                                                {canManage && !isCurrentUser && (
                                                    <button
                                                        className="btn btn-sm btn-link text-danger p-0 ms-1"
                                                        onClick={() => handleRemoveMember(email)}
                                                        disabled={sidebarLoading === `remove-${email}`}
                                                        title="Remove member"
                                                    >
                                                        {sidebarLoading === `remove-${email}` ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <i className="bi bi-x-circle"></i>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Inline Add Member */}
                            {canManage && (
                                <div className="mt-3 pt-3 border-top">
                                    <label className="form-label small fw-bold text-uppercase text-muted mb-2">
                                        <i className="bi bi-person-plus me-1"></i> Add Member
                                    </label>
                                    <div className="input-group input-group-sm">
                                        <input
                                            type="email"
                                            className="form-control bg-light border-0 px-3"
                                            placeholder="email@example.com"
                                            value={memberEmail}
                                            onChange={(e) => setMemberEmail(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
                                        />
                                        <button
                                            className="btn btn-success px-3 fw-bold"
                                            onClick={handleAddMember}
                                            disabled={sidebarLoading === "add"}
                                        >
                                            {sidebarLoading === "add" ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                <i className="bi bi-plus-lg"></i>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Leave Group (non-admin) */}
                            {!isAdmin && (
                                <div className="mt-3 pt-3 border-top">
                                    <button
                                        className="btn btn-outline-warning btn-sm rounded-pill w-100 fw-bold"
                                        onClick={handleLeaveGroup}
                                    >
                                        <i className="bi bi-box-arrow-left me-1"></i> Leave Group
                                    </button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            <AddExpenseModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSuccess={handleExpenseAdded}
                groupId={groupId}
                members={group?.members || []}
            />

            {/* Expense Details Modal */}
            <ExpenseDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                expense={selectedExpense}
                currentUser={user}
                onUpdate={handleExpenseUpdate}
            />

            {/* Group Settings Modal */}
            <GroupSettingsModal
                show={showSettingsModal}
                onHide={() => setShowSettingsModal(false)}
                group={group}
                onGroupUpdate={(updatedGroup) => setGroup(updatedGroup)}
                onGroupDelete={() => navigate("/groups")}
                onLeaveGroup={() => navigate("/groups")}
            />
        </div>
    );
}

export default GroupExpenses;
