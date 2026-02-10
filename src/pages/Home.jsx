import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="bg-white">

            <header className="py-5 mb-5 position-relative overflow-hidden">
                <div className="container py-5 mt-4">
                    <div className="row align-items-center">
                        <div className="col-lg-6 text-center text-lg-start z-1">
                            <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2 mb-4 fw-bold letter-spacing-1">
                                <i className="bi bi-stars me-1"></i> SIMPLIFY YOUR SHARED EXPENSES
                            </span>
                            <h1 className="display-3 fw-bold text-dark mb-4 lh-sm">
                                Less stress when <br />
                                sharing expenses <br/>
                                <span className="text-success">with anyone.</span>
                            </h1>
                            <p className="lead text-secondary mb-5" style={{ maxWidth: "500px", margin: "0 auto 0 0" }}>
                                Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
                            </p>
                            <div className="d-flex justify-content-center justify-content-lg-start gap-3">
                                <Link
                                    to="/register"
                                    className="btn btn-success btn-lg px-5 rounded-pill shadow-lg fw-bold text-white hover-scale"
                                >
                                    Sign Up For Free
                                </Link>
                                <a
                                    href="#features"
                                    className="btn btn-outline-secondary btn-lg px-5 rounded-pill fw-bold"
                                >
                                    Watch Demo
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-6 mt-5 mt-lg-0 position-relative">
                            <div className="position-absolute top-50 start-50 translate-middle bg-success rounded-circle opacity-10 blur-3xl" style={{ width: "400px", height: "400px", filter: "blur(80px)", zIndex: -1 }}></div>
                            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="App Preview" className="img-fluid rounded-4 shadow-lg border border-light" />
                        </div>
                    </div>
                </div>
            </header>

            <section id="features" className="container py-5 mb-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold h1 mb-3">The easiest way to share debts</h2>
                    <p className="text-secondary mx-auto" style={{ maxWidth: "600px" }}>
                        From simple trips to complex bills, we make it easy to figure out who owes who.
                    </p>
                </div>

                <div className="row g-4 pt-4">
                    <div className="col-md-4">
                        <div className="p-4 rounded-4 bg-light h-100 hover-scale transition-all border border-light text-center text-md-start">
                            <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex mb-4 text-success display-6">
                                <i className="bi bi-people"></i>
                            </div>
                            <h3 className="fw-bold h4">Groups & Friends</h3>
                            <p className="text-secondary mt-2">
                                Organize expenses for any situation. Trips, housemates, or just lunch with friends.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 rounded-4 bg-light h-100 hover-scale transition-all border border-light text-center text-md-start">
                             <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex mb-4 text-success display-6">
                                <i className="bi bi-calculator"></i>
                            </div>
                            <h3 className="fw-bold h4">Total Clarity</h3>
                            <p className="text-secondary mt-2">
                                We do the math for you. Add expenses and we'll tell you exactly who owes who.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-4 rounded-4 bg-light h-100 hover-scale transition-all border border-light text-center text-md-start">
                             <div className="bg-white p-3 rounded-circle shadow-sm d-inline-flex mb-4 text-success display-6">
                                <i className="bi bi-phone"></i>
                            </div>
                            <h3 className="fw-bold h4">Access Anywhere</h3>
                            <p className="text-secondary mt-2">
                                Log your expenses on the go. Available on web and mobile devices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

             <section className="bg-success text-white py-5 mt-5">
                <div className="container py-5 text-center">
                    <h2 className="display-4 fw-bold mb-4">Start organizing your expenses</h2>
                    <p className="lead opacity-75 mb-5">Register now and never argue about bills again.</p>
                    <Link
                        to="/register"
                        className="btn btn-light btn-lg px-5 rounded-pill shadow-lg fw-bold text-success hover-scale"
                    >
                        Get Started
                    </Link>
                </div>
            </section>
            
        </div>
    );
}

export default Home;
