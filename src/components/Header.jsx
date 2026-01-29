import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="container">
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default Header;
