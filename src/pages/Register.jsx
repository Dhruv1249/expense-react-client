import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { serverEndpoint } from "../config/appConfig";
import { useDispatch } from 'react-redux';
import { SET_USER } from "../redux/user/action";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null });
  
  // Debounced username check
  const checkUsername = useCallback(async (username) => {
    if (username.length < 3) {
      setUsernameStatus({ checking: false, available: null });
      return;
    }
    
    setUsernameStatus({ checking: true, available: null });
    
    try {
      const response = await axios.post(
        `${serverEndpoint}/auth/check-username`,
        { username },
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
      if (formData.username.length >= 3) {
        checkUsername(formData.username);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.username, checkUsername]);
  
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let newError = {};
    let isValid = true;

    if (formData.username.length < 3) {
      newError.username = "Username must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-z0-9_]+$/i.test(formData.username)) {
      newError.username = "Username can only contain letters, numbers, and underscores";
      isValid = false;
    } else if (usernameStatus.available === false) {
      newError.username = "Username is not available";
      isValid = false;
    }
    if (formData.name.length === 0) {
      newError.name = "Name is required";
      isValid = false;
    }
    if (formData.email.length === 0) {
      newError.email = "Email is required";
      isValid = false;
    }
    if (formData.password.length === 0) {
      newError.password = "Password is required";
      isValid = false;
    }
    if (formData.confirmPassword.length === 0) {
      newError.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newError.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    setErrors(newError);
    return isValid;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      try {
        const body = {
          username: formData.username.toLowerCase(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };
        const config = { withCredentials: true };
        const response = await axios.post(
          `${serverEndpoint}/auth/register`,
          body,
          config,
        );
        dispatch({
          type: SET_USER,
          payload: response.data.user
        });
        setMessage("User registered successfully");
        navigate("/", { replace: true });
      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later";
        setErrors({
          message: errorMessage,
        });
      }
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "500px" }}>
      <div className="bg-white rounded-4 shadow-sm p-4 border">
        <div className="text-center mb-4">
          <div className="bg-primary bg-opacity-10 d-inline-flex p-3 rounded-circle mb-3">
            <i className="bi bi-person-plus-fill text-primary fs-3"></i>
          </div>
          <h3 className="fw-bold">Create Account</h3>
          <p className="text-muted">Join us to start tracking expenses</p>
        </div>

        {errors.message && (
          <div className="alert alert-danger">{errors.message}</div>
        )}
        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium">Username</label>
            <div className="input-group">
              <span className="input-group-text">@</span>
              <input
                className={`form-control ${errors.username ? 'is-invalid' : usernameStatus.available === true ? 'is-valid' : ''}`}
                type="text"
                name="username"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="off"
              />
              {usernameStatus.checking && (
                <span className="input-group-text">
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                </span>
              )}
            </div>
            {errors.username && <div className="text-danger small mt-1">{errors.username}</div>}
            {usernameStatus.available === true && (
              <div className="text-success small mt-1">
                <i className="bi bi-check-circle me-1"></i>Username is available
              </div>
            )}
            {usernameStatus.available === false && !errors.username && (
              <div className="text-danger small mt-1">
                <i className="bi bi-x-circle me-1"></i>Username is taken
              </div>
            )}
            <small className="text-muted">3-20 characters, letters, numbers, underscores only</small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Full Name</label>
            <input
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Email</label>
            <input
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Password</label>
            <input
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium">Confirm Password</label>
            <input
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          <button 
            className="btn btn-primary w-100 py-2 fw-bold rounded-pill" 
            type="submit"
            disabled={usernameStatus.checking}
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already have an account? <Link to="/login" className="text-decoration-none fw-medium">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;