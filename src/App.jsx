import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import AppLayout from "./components/AppLayout";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import UserLayout from "./components/UserLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
function App() {
  const [userDetails, setUserDetails] = useState(null);
  const isUserLoggedIn = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/auth/is-user-logged-in",
        {},
        { withCredentials: true },
      );

      setUserDetails(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    isUserLoggedIn();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            userDetails ? (
              <Navigate to="/dashboard" />
            ) : (
              <AppLayout>
                <Home />
              </AppLayout>
            )
          }
        />
        <Route
          path="/register"
          element={
            userDetails ? (
              <Navigate to="/dashboard" />
            ) : (
              <Register setUser={setUserDetails} />
            )
          }
        />

        <Route
          path="/login"
          element={
            userDetails ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setUser={setUserDetails} />
            )
          }
        />

        <Route
          path="/reset-password"
          element={
            userDetails ? <Navigate to="/dashboard" /> : <ResetPassword />
          }
        />

        <Route
          path="/dashboard"
          element={
            userDetails ? (
              <UserLayout>
                <Dashboard user={userDetails} />
              </UserLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/logout"
          element={
            userDetails ? (
              <Logout setUser={setUserDetails} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
