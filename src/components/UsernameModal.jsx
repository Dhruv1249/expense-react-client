import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function UsernameModal({ show, onClose, googleData, onSuccess }) {
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null });

    // Debounced username check
    const checkUsername = useCallback(async (usernameToCheck) => {
        if (usernameToCheck.length < 3) {
            setUsernameStatus({ checking: false, available: null });
            return;
        }

        setUsernameStatus({ checking: true, available: null });

        try {
            const response = await axios.post(
                `${serverEndpoint}/auth/check-username`,
                { username: usernameToCheck },
                { withCredentials: true }
            );
            setUsernameStatus({ checking: false, available: response.data.available });
        } catch (error) {
            setUsernameStatus({ checking: false, available: false });
        }
    }, []);

    // Debounce the username check
    useEffect(() => {
        const timer = setTimeout(() => {
            if (username.length >= 3) {
                checkUsername(username);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username, checkUsername]);

    const isValidUsername = (username) => {
        if (!username || username.length < 3 || username.length > 20) return false;
        return /^[a-z0-9_]+$/i.test(username);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isValidUsername(username)) {
            setError("Username must be 3-20 characters, containing only letters, numbers, and underscores");
            return;
        }

        if (usernameStatus.available === false) {
            setError("Username is not available");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${serverEndpoint}/auth/complete-google-signup`,
                {
                    username: username.toLowerCase(),
                    googleData: googleData
                },
                { withCredentials: true }
            );

            onSuccess(response.data.user);
        } catch (error) {
            console.log(error);
            setError(error.response?.data?.message || "Failed to complete signup");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header border-0 pb-0">
                            <div className="w-100 text-center">
                                <div className="bg-success bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
                                    <i className="bi bi-google text-success fs-3"></i>
                                </div>
                                <h5 className="fw-bold mb-1">Almost there!</h5>
                                <p className="text-muted small mb-0">
                                    Welcome, {googleData?.name}! Choose a unique username to complete your account.
                                </p>
                            </div>
                        </div>

                        <div className="modal-body pt-4">
                            {error && (
                                <div className="alert alert-danger py-2 small">{error}</div>
                            )}

                            <div className="mb-3">
                                <label className="form-label fw-medium">Choose your username</label>
                                <div className="input-group">
                                    <span className="input-group-text">@</span>
                                    <input
                                        type="text"
                                        className={`form-control ${usernameStatus.available === false ? 'is-invalid' : usernameStatus.available === true ? 'is-valid' : ''}`}
                                        placeholder="yourname"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        autoFocus
                                        autoComplete="off"
                                    />
                                    {usernameStatus.checking && (
                                        <span className="input-group-text">
                                            <span className="spinner-border spinner-border-sm text-secondary"></span>
                                        </span>
                                    )}
                                </div>
                                {usernameStatus.available === true && (
                                    <div className="text-success small mt-1">
                                        <i className="bi bi-check-circle me-1"></i>Username is available
                                    </div>
                                )}
                                {usernameStatus.available === false && (
                                    <div className="text-danger small mt-1">
                                        <i className="bi bi-x-circle me-1"></i>Username is taken
                                    </div>
                                )}
                                <small className="text-muted">3-20 characters, letters, numbers, underscores only</small>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0">
                            <button
                                type="button"
                                className="btn btn-light rounded-pill px-4"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success rounded-pill px-4 fw-bold"
                                disabled={loading || usernameStatus.checking || usernameStatus.available !== true}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creating...
                                    </>
                                ) : (
                                    "Complete Signup"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UsernameModal;
