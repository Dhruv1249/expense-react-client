import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const validate = () => {
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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        const body = { email };
        const response = await axios.post(
          "http://localhost:5001/auth/reset-password",
          body
        );
        setMessage(response.data.message);
        setErrors({});
        setEmail("");
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
      <p className="text-muted">Enter your email to receive a password reset OTP</p>
      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}
      {message && (
        <div className="alert alert-success">{message}</div>
      )}
      <div className="row justify-content-center">
        <div className="col-6">
          <form onSubmit={handleFormSubmit}>
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
