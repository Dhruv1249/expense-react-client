import { useEffect, useState } from "react";
import axios from 'axios';
import { serverEndpoint } from '../config/appConfig';
import { useDispatch, useSelector } from "react-redux";
import { SET_USER } from "../redux/user/action";

// Define packs matching your server constants
const CREDITS_PACK = [
    { price: 1, credits: 10, recommended: false },
    { price: 4, credits: 50, recommended: true },
    { price: 7, credits: 100, recommended: false },
];

function ManagePayments() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.userDetails); // Get from Redux
    const [loading, setLoading] = useState(false); 
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const refreshProfile = async () => {
             try {
                const response = await axios.get(
                    `${serverEndpoint}/profile/get-user-info`,
                    { withCredentials: true }
                );
                dispatch({ type: SET_USER, payload: response.data.user });
            } catch (error) {
                console.error("Failed to refresh profile", error);
            }
        };
        refreshProfile();
    }, [dispatch]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const paymentResponseHandler = async (credits, payment) => {
        try {
            const response = await axios.post(
                `${serverEndpoint}/payments/verify-order`,
                {
                    razorpay_order_id: payment.razorpay_order_id,
                    razorpay_payment_id: payment.razorpay_payment_id,
                    razorpay_signature: payment.razorpay_signature,
                    credits: credits
                },
                { withCredentials: true }
            );
            
            // Update Redux state with new user data showing updated credits
            dispatch({ type: SET_USER, payload: response.data.user });
            setMessage(`Payment successful! ${credits} credits added to your account.`);
            setErrors({});
        } catch (error) {
            console.error(error);
            setErrors({ message: 'Payment verification failed. Please contact support if money was deducted.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (credits) => {
        setLoading(true);
        setErrors({});
        setMessage(null);

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            setErrors({ message: "Razorpay SDK failed to load. Please check your internet connection." });
            setLoading(false);
            return;
        }

        try {
            // 1. Create Order
            const orderResponse = await axios.post(
                `${serverEndpoint}/payments/create-order`,
                { credits },
                { withCredentials: true }
            );
            const order = orderResponse.data.order;

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: order.amount,
                currency: "INR",
                name: "MergeMoney",
                description: `Buy ${credits} Credits`,
                order_id: order.id,
                handler: (response) => paymentResponseHandler(credits, response),
                theme: { color: "#10b981" },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            // Loading stays true until handler or dismiss called

        } catch (error) {
            console.error(error);
            setErrors({ message: 'Unable to initiate payment. Please try again.' });
            setLoading(false);
        }
    };

    return (
        <div className="py-4">
            <h2 className="fw-bold mb-4">Manage Credits</h2>
            
            {message && (
                <div className="alert alert-success d-flex align-items-center shadow-sm border-0 rounded-3 mb-4">
                    <i className="bi bi-check-circle-fill fs-4 me-2"></i>
                    <div>{message}</div>
                </div>
            )}
            {errors.message && (
                <div className="alert alert-danger d-flex align-items-center shadow-sm border-0 rounded-3 mb-4">
                    <i className="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
                    <div>{errors.message}</div>
                </div>
            )}
            
            <div className="card border-0 shadow-sm rounded-4 mb-5 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h5 className="text-secondary mb-1">Current Balance</h5>
                        <h2 className="display-5 fw-bold text-dark mb-0">{user?.credits || 0} <span className="fs-4 text-muted">Credits</span></h2>
                    </div>
                    <div className="text-end d-none d-sm-block">
                        <i className="bi bi-coin text-warning display-4"></i>
                    </div>
                </div>
                <hr className="my-4 opacity-10" />
                <p className="text-muted mb-0">
                    <i className="bi bi-info-circle me-1"></i>
                    Credits are used to create new expense groups. Each group creation costs 1 credit.
                </p>
            </div>

            <h4 className="fw-bold mb-3 text-secondary text-uppercase small ls-1">Select a Pack</h4>
            <div className="row g-4">
                {CREDITS_PACK.map((pack, index) => (
                    <div className="col-md-4" key={index}>
                        <div className={`card h-100 border-0 shadow-sm rounded-4 text-center transition-all ${pack.recommended ? 'ring-2 ring-success' : ''}`} 
                             style={{ transform: pack.recommended ? 'scale(1.02)' : 'scale(1)' }}>
                            {pack.recommended && (
                                <div className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success px-3 py-2 shadow-sm">
                                    MOST POPULAR
                                </div>
                            )}
                            <div className="card-body p-4 d-flex flex-column">
                                <h3 className="fw-bold text-primary mb-1">{pack.credits} Credits</h3>
                                <p className="display-4 fw-bold my-3 text-dark">₹{pack.price}</p>
                                <div className="mt-auto">
                                    <button 
                                        className={`btn w-100 py-2 fw-bold rounded-pill ${pack.recommended ? 'btn-success shadow' : 'btn-outline-success'}`}
                                        onClick={() => handlePayment(pack.credits)}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2" />
                                        ) : (
                                            "Buy Now"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
             <style>
                {`
                    .transition-all {
                        transition: all 0.3s ease;
                    }
                    .transition-all:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important;
                    }
                    .ls-1 {
                        letter-spacing: 1px;
                    }
                    .ring-2 {
                        box-shadow: 0 0 0 2px #10b981;
                    }
                `}
            </style>
        </div>
    );
}

export default ManagePayments;
