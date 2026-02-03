import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";

function Logout({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = async() => {
    try { 
      await axios.post(`${serverEndpoint}/auth/logout`,
        {},
        { withCredentials: true });
      document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setUser(null);
      navigate('/login');
    } catch(error) {
      console.log(error);
      navigate('/login');
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return null;
}

export default Logout;
