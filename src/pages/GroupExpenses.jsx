import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../config/appConfig";
import ExpenseCard from "../components/ExpenseCard";
import AddExpenseModal from "../components/AddExpenseModal";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import EditGroupModal from "../components/EditGroupModal";

function GroupExpenses() {
    const { groupId } = useParams();
    const user = useSelector((state) => state.userDetails);
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [roleLoading, setRoleLoading] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalExpenses, setTotalExpenses] = useState(0);
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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGroupDetails(), fetchExpenses(1)]);
            setLoading(false);
        };
        loadData();
    }, [groupId]);

    // Check if current user is admin
    const currentUserMember = group?.members?.find(
        (m) => m.user?._id === user?._id
    );
    const isAdmin = currentUserMember?.role === "admin";

    const handleExpenseAdded = () => {
        // Refetch first page to show the new expense at top
        setCurrentPage(1);
        fetchExpenses(1);
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

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchExpenses(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
    const [showEditModal, setShowEditModal] = useState(false);

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
                    <button 
                        className="btn btn-success rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Add Expense
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="card border-0 shadow-sm rounded-4 mb-5 overflow-hidden">
                <div className="card-body p-4">
                     <div className="row g-4 justify-content-center">
                        <div className="col-12 text-center">
                             <h6 className="text-secondary text-uppercase fw-bold small mb-3">Total Group Spending</h6>
                             <div className="d-flex align-items-center justify-content-center mb-2">
                                <h1 className="fw-bold mb-0 display-4" style={{ letterSpacing: "-2px" }}>₹{calculateTotalSpent().toLocaleString()}</h1>
                             </div>
                             <div className="d-flex justify-content-center gap-3 mt-3">
                                <div className="d-flex align-items-center small text-secondary">
                                    <span className="d-inline-block rounded-circle bg-success me-2" style={{width: "8px", height: "8px"}}></span>
                                    Total Spent
                                </div>
                             </div>
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
                                            <td className="text-end pe-4 py-3">
                                                <span className="fw-bold text-dark">₹{expense.amount.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {expenses.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
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
                
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                         <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Group Members</h5>
                            {isAdmin && <button className="btn btn-sm btn-link text-success fw-bold text-decoration-none p-0" onClick={() => setShowEditModal(true)}>Settings</button>}
                         </div>
                         <div className="card-body px-4">
                            <div className="list-group list-group-flush">
                                {group?.members?.map((member, index) => (
                                    <div key={index} className="list-group-item border-0 px-0 py-3 d-flex align-items-center">
                                         <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 fw-bold text-secondary flex-shrink-0" style={{ width: "40px", height: "40px", objectFit: "cover", aspectRatio: "1/1" }}>
                                            {(member.user?.username || member.user?.name || "?").charAt(0).toUpperCase()}
                                         </div>
                                         <div>
                                            <div className="fw-bold text-dark mb-0 lh-1">
                                                {member.user?.username || member.user?.name}
                                                {member.user?._id === user?._id && <span className="text-muted small ms-1">(You)</span>}
                                            </div>
                                            <small className="text-muted" style={{ fontSize: "0.8rem" }}>{member.role}</small>
                                         </div>
                                    </div>
                                ))}
                            </div>
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

            {/* Edit Group Modal */}
            <EditGroupModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                onSuccess={(updatedGroup) => setGroup(updatedGroup)}
                group={group}
            />
        </div>
    );
}

export default GroupExpenses;
