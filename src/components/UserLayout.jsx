import Sidebar from "./Sidebar";

function UserLayout({ children }) {
    return (
        <div className="d-flex" style={{ backgroundColor: "#f6f9f8", minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-grow-1 p-4 main-content-wrapper">
                <style>
                    {`
                        .main-content-wrapper {
                            margin-left: 0;
                            overflow-y: auto;
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
    );
}

export default UserLayout;
