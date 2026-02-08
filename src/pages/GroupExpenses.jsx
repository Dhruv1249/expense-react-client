import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../config/appConfig";
import ExpenseCard from "../components/ExpenseCard";
import AddExpenseModal from "../components/AddExpenseModal";

function GroupExpenses() {
    const { groupId } = useParams();
    const user = useSelector((state) => state.userDetails);
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [roleLoading, setRoleLoading] = useState(null);

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

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/expenses/group/${groupId}`,
                { withCredentials: true }
            );
            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGroupDetails(), fetchExpenses()]);
            setLoading(false);
        };
        loadData();
    }, [groupId]);

    // Check if current user is admin
    const currentUserMember = group?.members?.find(
        (m) => m.user?._id === user?._id
    );
    const isAdmin = currentUserMember?.role === "admin";

    const handleExpenseAdded = (newExpense) => {
        setExpenses((prev) => [newExpense, ...prev]);
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
    };

    const handleRoleChange = async (memberId, newRole) => {
        setRoleLoading(memberId);
        try {
            const response = await axios.put(
                `${serverEndpoint}/groups/update-role`,
                {
                    groupId: groupId,
                    userId: memberId,
                    newRole: newRole,
                },
                { withCredentials: true }
            );
            // Update group with new member roles
            if (response.data.group) {
                setGroup(response.data.group);
            }
        } catch (error) {
            console.error("Error updating role:", error);
            alert(error.response?.data?.message || "Failed to update role");
        } finally {
            setRoleLoading(null);
        }
    };

    const calculateTotalSpent = () => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    if (loading) {
        return (
            <div
                className="container p-5 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-grow text-primary"
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

    return (
        <div className="container py-5 px-4 px-md-5">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard" className="text-decoration-none">
                            <i className="bi bi-house-door me-1"></i>Groups
                        </Link>
                    </li>
                    <li className="breadcrumb-item active">
                        {group?.name || "Expenses"}
                    </li>
                </ol>
            </nav>

            {/* Group Header */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <div className="d-flex align-items-center mb-2">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                                <i className="bi bi-collection-fill text-primary fs-3"></i>
                            </div>
                            <div>
                                <h3 className="fw-bold mb-1">{group?.name}</h3>
                                <p className="text-muted mb-0 small">
                                    {group?.description || "No description"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <button
                            className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add Expense
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="row mt-4 g-3">
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3 text-center">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1">
                                Total Spent
                            </small>
                            <span className="fs-4 fw-bold text-primary">
                                ₹{calculateTotalSpent().toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3 text-center">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1">
                                Members
                            </small>
                            <span className="fs-4 fw-bold text-secondary">
                                {group?.members?.length || 0}
                            </span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light rounded-3 p-3 text-center">
                            <small className="text-muted text-uppercase fw-bold d-block mb-1">
                                Expenses
                            </small>
                            <span className="fs-4 fw-bold text-success">
                                {expenses.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4 border">
                <h5 className="fw-bold mb-3">
                    <i className="bi bi-people me-2 text-primary"></i>
                    Group Members
                    {isAdmin && (
                        <span className="badge bg-primary ms-2 small">
                            Admin
                        </span>
                    )}
                </h5>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Member</th>
                                <th>Role</th>
                                {isAdmin && <th className="text-end">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {group?.members?.map((member, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2 fw-bold text-primary"
                                                style={{
                                                    width: "36px",
                                                    height: "36px",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                {(member.user?.name || member.user?.email)
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-medium">
                                                    {member.user?.name || "Unknown"}
                                                    {member.user?._id === user?._id && (
                                                        <span className="badge bg-info ms-2 small">You</span>
                                                    )}
                                                </div>
                                                <small className="text-muted">
                                                    {member.user?.email}
                                                </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                member.role === "admin"
                                                    ? "bg-primary"
                                                    : member.role === "manager"
                                                    ? "bg-info"
                                                    : member.role === "viewer"
                                                    ? "bg-secondary"
                                                    : "bg-success"
                                            }`}
                                        >
                                            {member.role}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="text-end">
                                            {member.user?._id !== user?._id ? (
                                                <select
                                                    className="form-select form-select-sm w-auto d-inline-block"
                                                    value={member.role}
                                                    onChange={(e) =>
                                                        handleRoleChange(
                                                            member.user?._id,
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={roleLoading === member.user?._id}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="member">Member</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <span className="text-muted small">-</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-4">
                <h5 className="fw-bold mb-3">
                    <i className="bi bi-receipt me-2 text-success"></i>
                    Expenses
                </h5>

                {expenses.length === 0 ? (
                    <div className="bg-white rounded-4 shadow-sm p-5 text-center border">
                        <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                            <i
                                className="bi bi-receipt text-muted"
                                style={{ fontSize: "2.5rem" }}
                            ></i>
                        </div>
                        <h5 className="fw-bold">No Expenses Yet</h5>
                        <p className="text-muted mb-4">
                            Start tracking your shared expenses by adding the
                            first one!
                        </p>
                        <button
                            className="btn btn-outline-success rounded-pill px-4"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add First Expense
                        </button>
                    </div>
                ) : (
                    <div className="row">
                        {expenses.map((expense) => (
                            <div key={expense._id} className="col-lg-6">
                                <ExpenseCard
                                    expense={expense}
                                    onSettle={handleSettle}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            <AddExpenseModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSuccess={handleExpenseAdded}
                groupId={groupId}
                members={group?.members || []}
            />
        </div>
    );
}

export default GroupExpenses;
