import { useState } from "react";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const vaildate = () => {
    let newError = {};
    let isValid = true;

    if (formData.email.length === 0) {
      newError.email = "Email is required";
      isValid = false;
    }
    if (formData.password.length === 0) {
      newError.password = "Password is required";
      isValid = false;
    }
    setErrors(newError);
    return isValid;
  };
  const handleFormSubmit = async (event) => {
    // Prevent the default form submission behavior which is to do complete page reload
    event.preventDefault();
    if (vaildate()) {
      try {
        const body = {
          email: formData.email,
          password: formData.password,
        };
        const config = { withCredentials: true };
        const response = await axios.post(
          "http://localhost:5001/auth/login",
          body,
          config,
        );
        console.log(response);
        setMessage("User authenticated");
      } catch (error) {
        console.log(error);
        setErrors({
          message: "Something went wrong. Please try again later",
        });
      }
    } else {
      console.log("Form has errors");
    }
  };
  return (
    <div className="container text-center">
      <h3>Login to coninue</h3>
      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}

      <form>
        <div>
          <label>Email: </label>
          <input
            className="form-control"
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={handleChange}
          />
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
        </div>

        <div>
          <button className="btn btn-primary" onClick={handleFormSubmit}>
            {" "}
            Login{" "}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
