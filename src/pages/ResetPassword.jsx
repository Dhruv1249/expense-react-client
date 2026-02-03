import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { serverEndpoint } from "../config/appConfig";
function ResetPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") setEmail(value);
    if (name === "otp") setOtp(value);
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  const validateEmail = () => {
    let newError = {};
    let isValid = true;

    if (email.length === 0) {
      newError.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newError.email = "Email is invalid";
      isValid = false;
    }
    setErrors(newError);
    return isValid;
  };

  const validateOtpAndPassword = () => {
    let newError = {};
    let isValid = true;

    if (otp.length === 0) {
      newError.otp = "OTP is required";
      isValid = false;
    } else if (otp.length !== 6) {
      newError.otp = "OTP must be 6 digits";
      isValid = false;
    }

    if (newPassword.length === 0) {
      newError.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 6) {
      newError.newPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    if (confirmPassword.length === 0) {
      newError.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newError.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newError);
    return isValid;
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (validateEmail()) {
      setLoading(true);
      try {
        const body = { email };
        const response = await axios.post(
          `${serverEndpoint}/auth/reset-password`,
          body
        );
        setMessage(response.data.message);
        setErrors({});
        setStep(2);
      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later";
        setErrors({
          message: errorMessage,
        });
        setMessage("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (validateOtpAndPassword()) {
      setLoading(true);
      try {
        const body = { email, otp, newPassword };
        const response = await axios.post(
          `${serverEndpoint}/auth/verify-otp-reset-password`,
          body
        );
        setMessage(response.data.message);
        setErrors({});
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later";
        setErrors({
          message: errorMessage,
        });
        setMessage("");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container text-center mt-5">
      <h3>Reset Password</h3>
      <p className="text-muted">
        {step === 1 
          ? "Enter your email to receive a password reset OTP" 
          : "Enter the OTP sent to your email and create a new password"}
      </p>
      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}
      {message && (
        <div className="alert alert-success">{message}</div>
      )}
      <div className="row justify-content-center">
        <div className="col-6">
          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="mb-3">
                <label className="form-label">Email: </label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={handleChange}
                />
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </div>

              <div>
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label className="form-label">Email: </label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={email}
                  disabled
                  readOnly
                />
              </div>

              <div className="mb-3">
                <label className="form-label">OTP: </label>
                <input
                  className="form-control"
                  type="text"
                  name="otp"
                  value={otp}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  onChange={handleChange}
                />
                {errors.otp && <div className="text-danger">{errors.otp}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">New Password: </label>
                <input
                  className="form-control"
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  placeholder="Enter new password"
                  onChange={handleChange}
                />
                {errors.newPassword && <div className="text-danger">{errors.newPassword}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm Password: </label>
                <input
                  className="form-control"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  placeholder="Confirm new password"
                  onChange={handleChange}
                />
                {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-secondary" 
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setErrors({});
                    setMessage("");
                  }}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <p className="mt-3">
        Remember your password? <Link to="/login">Login here</Link>
      </p>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default ResetPassword;
