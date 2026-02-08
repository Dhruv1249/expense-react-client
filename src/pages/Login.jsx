import { useState } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { serverEndpoint } from "../config/appConfig";
import { useDispatch } from "react-redux";
import { SET_USER } from "../redux/user/action";
import { Link } from "react-router-dom";
import UsernameModal from "../components/UsernameModal";

function Login() {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    
    // Username modal state for Google SSO new users
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [googleData, setGoogleData] = useState(null);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let newErrors = {};
        let isValid = true;

        if (formData.email.length === 0) {
            newErrors.email = "Email is required";
            isValid = false;
        }

        if (formData.password.length === 0) {
            newErrors.password = "Password is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (validate()) {
            try {
                const body = {
                    email: formData.email,
                    password: formData.password,
                };
                const config = { withCredentials: true };
                const response = await axios.post(
                    `${serverEndpoint}/auth/login`,
                    body,
                    config
                );
                dispatch({
                    type: SET_USER,
                    payload: response.data.user,
                });
            } catch (error) {
                console.log(error);
                setErrors({
                    message: error.response?.data?.message || "Something went wrong, please try again",
                });
            }
        }
    };

    const handleGoogleSuccess = async (authResponse) => {
        try {
            const body = {
                idToken: authResponse?.credential,
            };
            const response = await axios.post(
                `${serverEndpoint}/auth/google-auth`,
                body,
                { withCredentials: true }
            );
            
            // Check if new user needs to set username
            if (response.data.needsUsername) {
                setGoogleData(response.data.googleData);
                setShowUsernameModal(true);
            } else {
                dispatch({
                    type: SET_USER,
                    payload: response.data.user,
                });
            }
        } catch (error) {
            console.log(error);
            setErrors({
                message: "Unable to process google sso, please try again",
            });
        }
    };

    const handleUsernameComplete = (user) => {
        setShowUsernameModal(false);
        setGoogleData(null);
        dispatch({
            type: SET_USER,
            payload: user,
        });
    };

    const handleUsernameModalClose = () => {
        setShowUsernameModal(false);
        setGoogleData(null);
    };

    const handleGoogleFailure = (error) => {
        console.log(error);
        setErrors({
            message:
                "Something went wrong while performing google single sign-on",
        });
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    {/* Main Login Card */}
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-5">
                            {/* Brand Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-dark">
                                    Welcome{" "}
                                    <span className="text-primary">Back</span>
                                </h2>
                                <p className="text-muted">
                                    Login to manage your expenses
                                </p>
                            </div>

                            {/* Global Alerts */}
                            {(message || errors.message) && (
                                <div className="alert alert-danger py-2 small border-0 shadow-sm mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {message || errors.message}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Email Address
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.email ? "is-invalid" : ""
                                        }`}
                                        type="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary">
                                        Password
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${
                                            errors.password ? "is-invalid" : ""
                                        }`}
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-primary w-100 btn-md rounded-pill fw-bold shadow-sm mb-4">
                                        Sign In
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="d-flex align-items-center my-2">
                                <hr className="flex-grow-1 text-muted" />
                                <span className="mx-3 text-muted small fw-bold">
                                    OR
                                </span>
                                <hr className="flex-grow-1 text-muted" />
                            </div>

                            {/* Google Social Login */}
                            <div className="d-flex justify-content-center w-100">
                                <GoogleOAuthProvider
                                    clientId={
                                        import.meta.env.VITE_GOOGLE_CLIENT_ID
                                    }
                                >
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleFailure}
                                        theme="outline"
                                        shape="pill"
                                        text="signin_with"
                                        width="500"
                                    />
                                </GoogleOAuthProvider>
                            </div>

                            {/* Register Link */}
                            <p className="text-center mt-4 mb-0">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-decoration-none fw-medium">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Username Modal for new Google SSO users */}
            <UsernameModal
                show={showUsernameModal}
                onClose={handleUsernameModalClose}
                googleData={googleData}
                onSuccess={handleUsernameComplete}
            />
        </div>
    );
}

export default Login;
