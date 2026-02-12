import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

function Sidebar({ showMobile, onClose }) {
    const user = useSelector((state) => state.userDetails);

    const getInitials = (name) => {
        return name?.charAt(0).toUpperCase() || "U";
    };

    return (
        <aside
            className={`flex-column flex-shrink-0 p-3 bg-white ${showMobile ? "d-flex position-fixed start-0 shadow-lg" : "d-none d-md-flex"}`}
            style={{ 
                width: "250px", 
                height: "100vh", 
                position: "fixed", 
                left: 0, 
                top: 0,
                borderRight: "1px solid #e2e8f0",
                zIndex: 1050,
                transition: "transform 0.3s ease-in-out"
            }}
        >
            <div className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-decoration-none px-2 justify-content-between w-100">
                <div className="d-flex align-items-center">
                    <i className="bi bi-wallet2 fs-2 text-success me-2"></i>
                    <span className="fs-4 fw-bold text-dark" style={{ letterSpacing: "-0.5px" }}>MergeMoney</span>
                </div>
                {showMobile && (
                    <button className="btn btn-link text-muted p-0 d-md-none" onClick={onClose}>
                        <i className="bi bi-x-lg fs-5"></i>
                    </button>
                )}
            </div>
            
            <hr className="my-4 opacity-10" />
            
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-1">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center px-3 py-2 rounded-3 text-secondary ${isActive ? "bg-success bg-opacity-10 text-success fw-bold" : ""}`}>
                        <i className="bi bi-grid me-3 fs-5"></i>
                        Dashboard
                    </NavLink>
                </li>
                <li className="nav-item mb-1">
                    <NavLink to="/groups" className={({ isActive }) => `nav-link d-flex align-items-center px-3 py-2 rounded-3 text-secondary ${isActive ? "bg-success bg-opacity-10 text-success fw-bold" : ""}`}>
                        <i className="bi bi-people me-3 fs-5"></i>
                        Groups
                    </NavLink>
                </li>
                <li className="nav-item mb-1">
                    <NavLink to="/manage-payments" className={({ isActive }) => `nav-link d-flex align-items-center px-3 py-2 rounded-3 text-secondary ${isActive ? "bg-success bg-opacity-10 text-success fw-bold" : ""}`}>
                        <i className="bi bi-credit-card me-3 fs-5"></i>
                        Manage Credits
                    </NavLink>
                </li>
                <li className="nav-item mb-1">
                    <NavLink to="/subscriptions" className={({ isActive }) => `nav-link d-flex align-items-center px-3 py-2 rounded-3 text-secondary ${isActive ? "bg-primary bg-opacity-10 text-primary fw-bold" : ""}`}>
                        <i className="bi bi-star me-3 fs-5"></i>
                        Upgrade to Pro
                    </NavLink>
                </li>
            </ul>
            
            <div className="mt-auto pt-3 border-top">
                <div className="d-flex align-items-center px-2 py-2">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm flex-shrink-0" style={{ width: "40px", height: "40px", fontSize: "1.2rem", fontWeight: "600", aspectRatio: "1/1" }}>
                        {getInitials(user?.name)}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-bold text-dark text-truncate">{user?.name}</div>
                        <div className="text-muted small text-truncate">Credits: {user?.credits || 0}</div>
                    </div>
                    <div className="dropdown">
                        <NavLink to="/logout" className="btn btn-link text-danger p-0 ms-2" title="Sign out">
                            <i className="bi bi-box-arrow-right fs-5"></i>
                        </NavLink>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
