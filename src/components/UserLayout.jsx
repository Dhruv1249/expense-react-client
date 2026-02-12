import { useState } from "react";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";

function UserLayout({ children }) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="d-flex" style={{ backgroundColor: "#f6f9f8", minHeight: "100vh" }}>
            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowSidebar(false)}
                />
            )}
            
            <Sidebar showMobile={showSidebar} onClose={() => setShowSidebar(false)} />
            
            <div className="flex-grow-1 d-flex flex-column main-content-wrapper">
                {/* Mobile Header */}
                <div className="d-md-none bg-white border-bottom p-3 d-flex align-items-center justify-content-between sticky-top">
                    <Link to="/dashboard" className="text-decoration-none fw-bold fs-5 text-dark">
                        <i className="bi bi-wallet2 text-success me-2"></i>
                        MergeMoney
                    </Link>
                    <button 
                        className="btn btn-light border-0 shadow-none"
                        onClick={() => setShowSidebar(!showSidebar)}
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>
                </div>

                <div className="p-4 flex-grow-1 overflow-y-auto">
                    <style>
                        {`
                            .main-content-wrapper {
                                margin-left: 0;
                                height: 100vh;
                            }
                            @media (min-width: 768px) {
                                .main-content-wrapper {
                                    margin-left: 250px;
                                }
                            }
                        `}
                    </style>
                    <div className="container-fluid" style={{ maxWidth: "1200px" }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLayout;
