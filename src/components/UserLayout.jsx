import Sidebar from "./Sidebar";

function UserLayout({ children }) {
    return (
        <div className="d-flex" style={{ backgroundColor: "#f6f9f8", minHeight: "100vh" }}>
            <Sidebar />
            <div className="flex-grow-1 p-4" style={{ marginLeft: "250px", overflowY: "auto" }}>
                <div className="container-fluid" style={{ maxWidth: "1200px" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default UserLayout;
