import { useState } from "react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
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
  const handleFormSubmit = (event) => {
    // Prevent the default form submission behavior which is to do complete page reload
    event.preventDefault();
    if (vaildate()) {
      console.log("Form submitted");
    } else {
      console.log("Form has errors");
    }
  };
  return (
    <div className="container text-center">
      <h3>Login</h3>

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
