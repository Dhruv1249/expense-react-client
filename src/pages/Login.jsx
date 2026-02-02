import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {GoogleOAuthProvider,GoogleLogin} from '@react-oauth/google';
function Login({ setUser }) {
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

  const validate = () => {
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
    const navigate = useNavigate();
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
          "http://localhost:5001/auth/login",
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
const handleGoogleSuccess= async(authResponse) => {
  try{
    const body = {
    idToken: authResponse?.credential,
  }
const response = await axios.post("http://localhost:5001/auth/google-auth",
  body,{withCredentials: true});
  setUser(response.data.user);
}
catch(error){
  console.log(error);
  setUser({message:"Unable to process google sso"});
}
};
const handleGoogleFailure=(error) => {
  console.log(error);
  setErrors({
    message: 'Something went wrong while performing google single sign-on'
  });

};
  return (
    <div className="container text-center">
      <h3>Login to continue</h3>
      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}
      {message && (
        <div className="alert alert-success">{message}</div>
      )}
      <div className="row justify-consent-center">
        <div className="col-6">

      <form onSubmit={handleFormSubmit}>
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
          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </div>
      </form>
      </div>
      </div>
      <div className="row justify-consent-center">
        <div className="col-6">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure}/>
          </GoogleOAuthProvider>
        </div>
        </div>
      <p className="mt-3">
        <Link to="/reset-password">Forgot Password?</Link>
      </p>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;