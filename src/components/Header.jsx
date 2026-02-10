import { Link } from "react-router-dom";

function Header() {
    return (
        <nav className="navbar navbar-expand-lg py-3 sticky-top bg-white border-bottom border-light">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center fw-bold text-dark fs-4" to="/">
                     <i className="bi bi-wallet2 text-success me-2"></i>
                     MergeMoney
                </Link>
                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
                        <li className="nav-item">
                            <Link className="btn btn-outline-success rounded-pill px-4 fw-bold" to="/login">
                                Log In
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="btn btn-success rounded-pill px-4 fw-bold shadow-sm text-white" to="/register">
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;