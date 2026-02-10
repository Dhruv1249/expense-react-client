import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { serverEndpoint } from '../config/appConfig';
import { Link } from 'react-router-dom';

function Dashboard() {
    const user = useSelector((state) => state.userDetails);
    const [stats, setStats] = useState({
        totalPaid: 0,
        totalOwedToUser: 0,
        totalUserOwes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${serverEndpoint}/expenses/stats`, {
                    withCredentials: true
                });
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="container p-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="mb-5">
                <h2 className="fw-bold mb-1 display-6" style={{ letterSpacing: "-1px" }}>Dashboard</h2>
                <p className="text-secondary mb-0 fs-5">Overview of your expenses.</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                        <div className="card-body p-4 position-relative">
                             <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <i className="bi bi-wallet2 display-1 text-success"></i>
                             </div>
                            <h6 className="text-secondary text-uppercase fw-bold small mb-3">Total Paid</h6>
                            <h2 className="display-5 fw-bold mb-0 text-dark">₹{stats.totalPaid.toLocaleString()}</h2>
                            <p className="text-muted small mt-2 mb-0">Total amount you paid for expenses</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-success bg-opacity-10">
                        <div className="card-body p-4 position-relative">
                             <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <i className="bi bi-arrow-down-left-circle display-1 text-success"></i>
                             </div>
                            <h6 className="text-success text-uppercase fw-bold small mb-3">You are Owed</h6>
                            <h2 className="display-5 fw-bold mb-0 text-success">₹{stats.totalOwedToUser.toLocaleString()}</h2>
                            <p className="text-success text-opacity-75 small mt-2 mb-0">Total money people owe you</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-warning bg-opacity-10">
                        <div className="card-body p-4 position-relative">
                             <div className="position-absolute top-0 end-0 p-3 opacity-10">
                                <i className="bi bi-arrow-up-right-circle display-1 text-warning"></i>
                             </div>
                            <h6 className="text-warning text-uppercase fw-bold small mb-3">You Owe</h6>
                            <h2 className="display-5 fw-bold mb-0 text-warning">₹{stats.totalUserOwes.toLocaleString()}</h2>
                            <p className="text-warning text-opacity-75 small mt-2 mb-0">Total money you owe others</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                 <h4 className="fw-bold mb-0">Quick Actions</h4>
            </div>
            
            <div className="row g-3">
                 <div className="col-6 col-md-3">
                     <Link to="/groups" className="card border-0 shadow-sm rounded-4 text-decoration-none hover-scale transition-all h-100">
                        <div className="card-body p-4 text-center">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-flex mb-3">
                                <i className="bi bi-people text-primary fs-3"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0">View Groups</h6>
                        </div>
                     </Link>
                 </div>
                 {/* Add more quick actions later */}
            </div>
        </div>
    );
}

export default Dashboard;