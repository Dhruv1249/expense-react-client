import { useState } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useSelector } from "react-redux";

function ExpenseCard({ expense, onSettle }) {
    const user = useSelector((state) => state.userDetails);
    const [settling, setSettling] = useState(null);

    const isPayer = expense.payer?._id === user?._id;

    const handleSettle = async (debtorId) => {
        setSettling(debtorId);
        try {
            await axios.post(
                `${serverEndpoint}/expenses/settle`,
                { expenseId: expense._id, debtorId },
                { withCredentials: true }
            );
            onSettle(expense._id, debtorId);
        } catch (error) {
            console.error("Error settling expense:", error);
        } finally {
            setSettling(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Helper to display user with username
    const getUserDisplay = (userData) => {
        if (!userData) return "Unknown";
        if (userData.username) {
            return `${userData.name || userData.email} (@${userData.username})`;
        }
        return userData.name || userData.email;
    };

    // Short display for split list
    const getUserShortDisplay = (userData) => {
        if (!userData) return "Unknown";
        if (userData.username) {
            return `@${userData.username}`;
        }
        return userData.name || userData.email;
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 className="fw-bold mb-1">{expense.description}</h6>
                        <small className="text-muted">
                            <i className="bi bi-calendar-event me-1"></i>
                            {formatDate(expense.date)}
                        </small>
                    </div>
                    <div className="text-end">
                        <span className="fs-5 fw-bold text-primary">
                            ₹{expense.amount.toLocaleString()}
                        </span>
                        <div>
                            <span className={`badge rounded-pill bg-${expense.splitType === 'EQUAL' ? 'info' : expense.splitType === 'PERCENTAGE' ? 'warning' : 'secondary'} bg-opacity-10 text-${expense.splitType === 'EQUAL' ? 'info' : expense.splitType === 'PERCENTAGE' ? 'warning' : 'secondary'} small`}>
                                {expense.splitType}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-light rounded-3 p-3 mb-3">
                    <small className="text-muted d-block mb-2 fw-bold text-uppercase">
                        <i className="bi bi-credit-card me-1"></i> Paid by
                    </small>
                    <span className="fw-medium">
                        {getUserDisplay(expense.payer)}
                        {isPayer && <span className="badge bg-primary ms-2">You</span>}
                    </span>
                </div>

                <div>
                    <small className="text-muted d-block mb-2 fw-bold text-uppercase">
                        <i className="bi bi-pie-chart me-1"></i> Split Details
                    </small>
                    <div className="list-group list-group-flush rounded-3 border">
                        {expense.splits?.map((split, index) => (
                            <div
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center py-2 px-3"
                            >
                                <div>
                                    <span className="small fw-medium">
                                        {getUserShortDisplay(split.user)}
                                    </span>
                                    {split.user?.name && split.user?.username && (
                                        <span className="text-muted small ms-1">
                                            ({split.user.name})
                                        </span>
                                    )}
                                    {split.user?._id === user?._id && (
                                        <span className="badge bg-primary bg-opacity-10 text-primary ms-2 small">You</span>
                                    )}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-medium">₹{split.amount?.toFixed(2)}</span>
                                    {split.status === "SETTLED" ? (
                                        <span className="badge bg-success bg-opacity-10 text-success">
                                            <i className="bi bi-check-circle me-1"></i>Settled
                                        </span>
                                    ) : (
                                        <>
                                            <span className="badge bg-warning bg-opacity-10 text-warning">
                                                Pending
                                            </span>
                                            {isPayer && split.user?._id !== user?._id && (
                                                <button
                                                    className="btn btn-sm btn-outline-success rounded-pill px-3"
                                                    onClick={() => handleSettle(split.user._id)}
                                                    disabled={settling === split.user._id}
                                                >
                                                    {settling === split.user._id ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        "Mark Paid"
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExpenseCard;
