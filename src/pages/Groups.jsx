import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useEffect, useState } from "react";
import GroupCard from "../components/GroupCard";
import CreateGroupModal from "../components/CreateGroupModal";

function Groups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGroups, setTotalGroups] = useState(0);
    const GROUPS_PER_PAGE = 9;

    const fetchGroups = async (page = 1) => {
        try {
            const response = await axios.get(
                `${serverEndpoint}/groups/my-groups?page=${page}&limit=${GROUPS_PER_PAGE}`,
                { withCredentials: true }
            );
            setGroups(response.data.groups);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
            setTotalGroups(response.data.totalGroups);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupUpdateSuccess = (data) => {
        setGroups((prevGroups) => {
            const exists = prevGroups.some((group) => group._id === data._id);
            if (exists) {
                return prevGroups.map((group) =>
                    group._id === data._id ? data : group
                );
            } else {
                // Refetch first page when a new group is created
                fetchGroups(1);
                return prevGroups;
            }
        });
    };

    const handleGroupDelete = (groupId) => {
        setGroups((prevGroups) => prevGroups.filter((g) => g._id !== groupId));
        setTotalGroups((prev) => prev - 1);
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchGroups(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        fetchGroups(1);
    }, []);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <nav aria-label="Groups pagination" className="mt-5">
                <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    </li>
                    {startPage > 1 && (
                        <>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                            </li>
                            {startPage > 2 && (
                                <li className="page-item disabled">
                                    <span className="page-link">…</span>
                                </li>
                            )}
                        </>
                    )}
                    {pages.map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => handlePageChange(page)}>
                                {page}
                            </button>
                        </li>
                    ))}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <li className="page-item disabled">
                                    <span className="page-link">…</span>
                                </li>
                            )}
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                                    {totalPages}
                                </button>
                            </li>
                        </>
                    )}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
                <p className="text-center text-muted small mt-2 mb-0">
                    Page {currentPage} of {totalPages} • {totalGroups} total groups
                </p>
            </nav>
        );
    };

    if (loading) {
        return (
            <div
                className="container p-5 d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                <div
                    className="spinner-grow text-primary"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted fw-medium">
                    Syncing your circles...
                </p>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1 display-6" style={{ letterSpacing: "-1px" }}>Dashboard</h2>
                    <p className="text-secondary mb-0 fs-5">Manage your groups and expenses.</p>
                </div>
                <button
                    className="btn btn-success px-4 py-2 fw-bold d-flex align-items-center shadow-sm"
                    onClick={() => setShow(true)}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    New Group
                </button>
            </div>

            {/* Stats Summary could go here */}
            
            {groups.length === 0 && !loading && (
                 <div className="text-center py-5">
                    <div className="bg-white rounded-circle d-inline-flex p-4 mb-4 shadow-sm" style={{ width: "100px", height: "100px", alignItems: "center", justifyContent: "center" }}>
                        <i className="bi bi-people text-success" style={{ fontSize: "3rem" }}></i>
                    </div>
                    <h4 className="fw-bold mb-2">No groups yet</h4>
                    <p className="text-secondary mb-4">Create a group to start splitting expenses with friends.</p>
                    <button className="btn btn-outline-success px-4 fw-bold" onClick={() => setShow(true)}>
                        Create a Group
                    </button>
                </div>
            )}

            {groups.length > 0 && (
                <>
                    <h5 className="fw-bold text-secondary text-uppercase mb-3 small" style={{ letterSpacing: "1px" }}>Your Groups</h5>
                    <div className="row g-4 animate__animated animate__fadeIn">
                        {groups.map((group) => (
                            <div className="col-md-6 col-lg-4" key={group._id}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 hover-scale transition-all" style={{ transition: "transform 0.2s" }}>
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="d-flex align-items-start justify-content-between mb-3">
                                            <div className="bg-success bg-opacity-10 p-3 rounded-3">
                                                <i className="bi bi-collection-fill text-success fs-3"></i>
                                            </div>
                                            {/* Options dropdown could go here */}
                                        </div>
                                        <h5 className="fw-bold mb-1 text-dark">{group.name}</h5>
                                        <p className="text-secondary small mb-4 flex-grow-1">{group.description || "No description provided."}</p>
                                        
                                        <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-people text-secondary me-2"></i>
                                                <span className="text-secondary small fw-bold">{group.members?.length || 0} members</span>
                                            </div>
                                            <a href={`#/groups/${group._id}`} className="btn btn-sm btn-light text-success fw-bold rounded-pill px-3">
                                                View <i className="bi bi-arrow-right ms-1"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {renderPagination()}

            <CreateGroupModal
                show={show}
                onHide={() => setShow(false)}
                onSuccess={handleGroupUpdateSuccess}
            />
        </div>
    );
}

export default Groups;
