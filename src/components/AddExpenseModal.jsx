import { useState, useEffect } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function AddExpenseModal({ show, onHide, onSuccess, groupId, members }) {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        splitType: "EQUAL",
        splitData: [],
    });
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (members && members.length > 0) {
            // Default: select all members for EQUAL split
            setSelectedMembers(members.map((m) => m.user._id));
            // Initialize splitData for percentage/exact
            setFormData((prev) => ({
                ...prev,
                splitData: members.map((m) => ({
                    user: m.user._id,
                    percentage: Math.floor(100 / members.length),
                    amount: 0,
                })),
            }));
        }
    }, [members]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleMemberToggle = (userId) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSplitDataChange = (userId, field, value) => {
        setFormData((prev) => ({
            ...prev,
            splitData: prev.splitData.map((item) =>
                item.user === userId
                    ? { ...item, [field]: parseFloat(value) || 0 }
                    : item
            ),
        }));
    };

    const validate = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
            isValid = false;
        }

        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            newErrors.amount = "Please enter a valid amount";
            isValid = false;
        }

        if (formData.splitType === "EQUAL" && selectedMembers.length === 0) {
            newErrors.members = "Select at least one member";
            isValid = false;
        }

        if (formData.splitType === "PERCENTAGE") {
            const total = formData.splitData.reduce(
                (sum, item) => sum + (item.percentage || 0),
                0
            );
            if (total !== 100) {
                newErrors.splitData = `Percentages must add up to 100% (currently ${total}%)`;
                isValid = false;
            }
        }

        if (formData.splitType === "EXACT") {
            const total = formData.splitData.reduce(
                (sum, item) => sum + (item.amount || 0),
                0
            );
            if (Math.abs(total - amount) > 0.01) {
                newErrors.splitData = `Split amounts must equal ₹${amount} (currently ₹${total.toFixed(2)})`;
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            let splitData;
            if (formData.splitType === "EQUAL") {
                splitData = selectedMembers;
            } else if (formData.splitType === "PERCENTAGE") {
                splitData = formData.splitData
                    .filter((item) => item.percentage > 0)
                    .map(({ user, percentage }) => ({ user, percentage }));
            } else {
                splitData = formData.splitData
                    .filter((item) => item.amount > 0)
                    .map(({ user, amount }) => ({ user, amount }));
            }

            const response = await axios.post(
                `${serverEndpoint}/expenses/add`,
                {
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    groupId,
                    splitType: formData.splitType,
                    splitData,
                },
                { withCredentials: true }
            );

            onSuccess(response.data.expense);
            setFormData({
                description: "",
                amount: "",
                splitType: "EQUAL",
                splitData: members.map((m) => ({
                    user: m.user._id,
                    percentage: Math.floor(100 / members.length),
                    amount: 0,
                })),
            });
            setSelectedMembers(members.map((m) => m.user._id));
            onHide();
        } catch (error) {
            console.error(error);
            setErrors({
                message:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(4px)",
            }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header border-0 pb-0 p-4">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                                <i className="bi bi-plus-circle-fill text-success fs-4"></i>
                            </div>
                            <h5 className="fw-bold mb-0">Add New Expense</h5>
                            <button
                                type="button"
                                className="btn-close shadow-none"
                                onClick={onHide}
                            ></button>
                        </div>

                        <div className="modal-body py-4 px-4">
                            {errors.message && (
                                <div className="alert alert-danger py-2 small border-0 mb-3">
                                    {errors.message}
                                </div>
                            )}

                            <div className="row g-3 mb-4">
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control form-control-lg bg-light border-0 fs-6 ${
                                            errors.description ? "is-invalid" : ""
                                        }`}
                                        name="description"
                                        placeholder="e.g., Dinner at restaurant"
                                        value={formData.description}
                                        onChange={onChange}
                                    />
                                    {errors.description && (
                                        <div className="invalid-feedback">
                                            {errors.description}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">
                                        Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control form-control-lg bg-light border-0 fs-6 ${
                                            errors.amount ? "is-invalid" : ""
                                        }`}
                                        name="amount"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={onChange}
                                    />
                                    {errors.amount && (
                                        <div className="invalid-feedback">
                                            {errors.amount}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-bold text-secondary text-uppercase mb-3">
                                    Split Type
                                </label>
                                <div className="btn-group w-100" role="group">
                                    {["EQUAL", "PERCENTAGE", "EXACT"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`btn ${
                                                formData.splitType === type
                                                    ? "btn-success"
                                                    : "btn-outline-success"
                                            }`}
                                            onClick={() =>
                                                setFormData({ ...formData, splitType: type })
                                            }
                                        >
                                            {type === "EQUAL" && <i className="bi bi-pie-chart me-2"></i>}
                                            {type === "PERCENTAGE" && <i className="bi bi-percent me-2"></i>}
                                            {type === "EXACT" && <i className="bi bi-currency-rupee me-2"></i>}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-light rounded-4 p-3">
                                <label className="form-label small fw-bold text-secondary text-uppercase mb-3">
                                    {formData.splitType === "EQUAL"
                                        ? "Select Members to Split With"
                                        : `Enter ${formData.splitType === "PERCENTAGE" ? "Percentage" : "Amount"} for Each`}
                                </label>

                                {errors.members && (
                                    <div className="alert alert-danger py-2 small mb-3">
                                        {errors.members}
                                    </div>
                                )}
                                {errors.splitData && (
                                    <div className="alert alert-warning py-2 small mb-3">
                                        {errors.splitData}
                                    </div>
                                )}

                                <div className="row g-2">
                                    {members?.map((member) => (
                                        <div key={member.user._id} className="col-md-6">
                                            <div className="border rounded-3 p-3 bg-white d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    {formData.splitType === "EQUAL" && (
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input me-3"
                                                            checked={selectedMembers.includes(
                                                                member.user._id
                                                            )}
                                                            onChange={() =>
                                                                handleMemberToggle(member.user._id)
                                                            }
                                                        />
                                                    )}
                                                    <div
                                                        className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center me-2 fw-bold text-success flex-shrink-0"
                                                        style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            fontSize: "12px",
                                                            aspectRatio: "1/1"
                                                        }}
                                                    >
                                                        {(member.user.username || member.user.name || member.user.email)
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="small fw-medium">
                                                            {member.user.username ? `@${member.user.username}` : member.user.name || member.user.email}
                                                        </span>
                                                        {member.user.username && member.user.name && (
                                                            <span className="text-muted small d-block">
                                                                {member.user.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {formData.splitType !== "EQUAL" && (
                                                    <div className="input-group input-group-sm" style={{ width: "100px" }}>
                                                        <input
                                                            type="number"
                                                            className="form-control text-end"
                                                            value={
                                                                formData.splitData.find(
                                                                    (s) => s.user === member.user._id
                                                                )?.[
                                                                    formData.splitType === "PERCENTAGE"
                                                                        ? "percentage"
                                                                        : "amount"
                                                                ] || 0
                                                            }
                                                            onChange={(e) =>
                                                                handleSplitDataChange(
                                                                    member.user._id,
                                                                    formData.splitType === "PERCENTAGE"
                                                                        ? "percentage"
                                                                        : "amount",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <span className="input-group-text">
                                                            {formData.splitType === "PERCENTAGE"
                                                                ? "%"
                                                                : "₹"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0 px-4 pb-4">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4 fw-medium"
                                onClick={onHide}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        ></span>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-lg me-2"></i>
                                        Add Expense
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddExpenseModal;
