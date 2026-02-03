import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { serverEndpoint } from "../config/appConfig";
function Register({ setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  
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
    const navigate = useNavigate();
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      try {
        const body = {
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
        setUser(response.data.user);
        console.log(response);
        setMessage("User authenticated");
        navigate("/",{replace:true});
      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later";
        setErrors({
          message: errorMessage,
        });
      }
    } else {
      console.log("Form has errors");
    }
  };

  return (
    <div className="container text-center">
      <h3>Register to continue</h3>
      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}
      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div>
          <label>Name: </label>
          <input
            className="form-control"
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
          />
          {errors.name && <div className="text-danger">{errors.name}</div>}
        </div>
        <div>
          <label>Email: </label>
          <input
            className="form-control"
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={handleChange}
          />
          {errors.email && <div className="text-danger">{errors.email}</div>}
        </div>
        <div>
          <label>Password: </label>
          <input
            className="form-control"
            type="password"
            name="password"
            placeholder="Enter password"
            onChange={handleChange}
          />
          {errors.password && <div className="text-danger">{errors.password}</div>}
        </div>
        <div>
          <label>Confirm Password: </label>
          <input
            className="form-control"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            onChange={handleChange}
          />
          {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
        </div>

        <div>
          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </div>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;