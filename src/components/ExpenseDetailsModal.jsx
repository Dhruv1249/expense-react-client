import axios from "axios";
import { useState } from "react";
import { serverEndpoint } from "../config/appConfig";

function ExpenseDetailsModal({ show, onHide, expense, currentUser, onUpdate }) {
    const [loading, setLoading] = useState(null); // stores the ID of the user being settled

    if (!show || !expense) return null;

    const isPayer = expense.payer._id === currentUser._id;

    const handleSettle = async (debtorId) => {
        setLoading(debtorId);
        try {
            const response = await axios.post(
                `${serverEndpoint}/expenses/settle`,
                { expenseId: expense._id, debtorId },
                { withCredentials: true }
            );
            
            // Call parent update to reflect changes in the list
            if (onUpdate) {
                onUpdate(response.data.expense);
            }
        } catch (error) {
            console.error("Error settling expense:", error);
            alert(error.response?.data?.message || "Failed to settle expense");
        } finally {
            setLoading(null);
        }
    };

    return (
         <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                    <div className="modal-header border-0 pb-0 p-4">
                        <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="bi bi-receipt text-success fs-3"></i>
                            </div>
                            <div>
                                <h5 className="fw-bold mb-1">{expense.description}</h5>
                                <p className="text-secondary small mb-0">
                                    Paid by <span className="fw-bold text-dark">{isPayer ? "You" : expense.payer.username}</span> • {new Date(expense.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close shadow-none"
                            onClick={onHide}
                        ></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <h2 className="display-4 fw-bold mb-0 text-success" style={{ letterSpacing: "-1px" }}>
                                ₹{expense.amount.toLocaleString()}
                            </h2>
                            <span className="badge bg-light text-secondary border mb-2">
                                {expense.splitType} SPLIT
                            </span>
                        </div>

                        <h6 className="text-uppercase text-secondary small fw-bold mb-3">Split Details</h6>
                        <div className="d-flex flex-column gap-3">
                            {expense.splits.map((split) => {
                                const isMe = split.user._id === currentUser._id;
                                const isSettled = split.status === "SETTLED";
                                const isPayerSelf = split.user._id === expense.payer._id;

                                return (
                                    <div key={split.user._id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border border-light">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-white d-flex align-items-center justify-content-center me-3 fw-bold shadow-sm" style={{ width: "40px", height: "40px" }}>
                                                {(split.user.username || split.user.name || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark lh-1 mb-1">
                                                    {isMe ? "You" : (split.user.username || split.user.name)}
                                                    {isPayerSelf && <span className="text-muted small ms-1">(Payer)</span>}
                                                </div>
                                                <div className="small text-secondary">
                                                    ₹{split.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {isPayerSelf ? (
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">
                                                    <i className="bi bi-check-circle-fill me-1"></i> Paid
                                                </span>
                                            ) : isSettled ? (
                                                <span className="badge bg-success text-white rounded-pill px-3">
                                                    <i className="bi bi-check-lg me-1"></i> Settled
                                                </span>
                                            ) : (
                                                <>
                                                    {isPayer ? (
                                                        <button 
                                                            className="btn btn-sm btn-outline-success rounded-pill fw-bold"
                                                            onClick={() => handleSettle(split.user._id)}
                                                            disabled={loading === split.user._id}
                                                        >
                                                            {loading === split.user._id ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                "Mark Paid"
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3">
                                                            Pending
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="modal-footer border-0 px-4 pb-4">
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
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

export default ExpenseDetailsModal;
