import { useEffect, useState } from "react";
import axios from 'axios';
import { serverEndpoint } from '../config/appConfig';
import { useDispatch, useSelector } from "react-redux";
import { SET_USER } from "../redux/user/action";

const PLANS = [
    {
        type: "MONTHLY",
        name: "Monthly",
        price: 10,
        period: "/month",
        features: [
            "Unlimited Expense Groups",
            "Advanced Analytics",
            "Priority Support",
            "Ad-free Experience"
        ],
        recommended: false
    },
    {
        type: "YEARLY",
        name: "Yearly",
        price: 100,
        period: "/year",
        features: [
            "All Monthly Features",
            "2 Months Free",
            "Early Access to New Features",
            "Exclusive Badges"
        ],
        recommended: true
    }
];

function Subscriptions() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.userDetails);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);

    // Refresh user profile on mount to get latest subscription status
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

    const subscriptionResponseHandler = async (response) => {
        try {
            const verifyResponse = await axios.post(
                `${serverEndpoint}/payments/verify-subscription`,
                {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_subscription_id: response.razorpay_subscription_id,
                    razorpay_signature: response.razorpay_signature
                },
                { withCredentials: true }
            );
            
            // Update Redux state
            dispatch({ type: SET_USER, payload: verifyResponse.data.user });
            setMessage("Subscription activated successfully! Welcome to Pro.");
            setErrors({});
        } catch (error) {
            console.error(error);
            setErrors({ message: 'Subscription verification failed. Please contact support.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planType) => {
        setLoading(true);
        setErrors({});
        setMessage(null);

        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            setErrors({ message: "Razorpay SDK failed to load." });
            setLoading(false);
            return;
        }

        try {
            // 1. Create Subscription
            const subResponse = await axios.post(
                `${serverEndpoint}/payments/create-subscription`,
                { planType },
                { withCredentials: true }
            );
            const subscription = subResponse.data.subscription;

            // 2. Open Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                subscription_id: subscription.id,
                name: "MergeMoney Pro",
                description: `${planType} Subscription`,
                handler: subscriptionResponseHandler,
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

        } catch (error) {
            console.error(error);
            setErrors({ message: 'Unable to initiate subscription. Please try again.' });
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm("Are you sure you want to cancel your subscription? You will lose access at the end of the billing cycle.")) {
            return;
        }

        setLoading(true);
        setMessage(null);
        setErrors({});

        try {
            const response = await axios.post(
                `${serverEndpoint}/payments/cancel-subscription`,
                {},
                { withCredentials: true }
            );
            
            // Subscriptions are usually cancelled at period end, but status update depends on backend logic
            // For immediate cancellation (as implemented in backend), status becomes 'cancelled'
            setMessage(response.data.message);
            
            // Refresh profile to reflect status change
            const profileResponse = await axios.get(
                `${serverEndpoint}/profile/get-user-info`,
                { withCredentials: true }
            );
            dispatch({ type: SET_USER, payload: profileResponse.data.user });

        } catch (error) {
            console.error("Error cancelling subscription:", error);
            setErrors({ message: error.response?.data?.message || 'Failed to cancel subscription.' });
        } finally {
            setLoading(false);
        }
    };

    const isSubscribed = user?.subscription?.status === 'active';

    return (
        <div className="py-4">
            <h2 className="fw-bold mb-4">Upgrade to Pro</h2>
            
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

            {isSubscribed ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-success bg-opacity-10 mb-5">
                    <div className="mb-3">
                        <i className="bi bi-patch-check-fill text-success" style={{ fontSize: "4rem" }}></i>
                    </div>
                    <h2 className="fw-bold text-success">You are a Pro Member!</h2>
                    <p className="text-secondary fs-5">Enjoying unlimited access until {user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : 'N/A'}</p>
                    
                    <button 
                        className="btn btn-outline-danger px-4 py-2 mt-3 rounded-pill fw-bold"
                        onClick={handleCancelSubscription}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner-border spinner-border-sm me-2"/> : null}
                        Cancel Subscription
                    </button>
                </div>
            ) : (
                <div className="row g-4 justify-content-center">
                    {PLANS.map((plan, index) => (
                        <div className="col-md-5 col-lg-4" key={index}>
                            <div className={`card h-100 border-0 shadow-sm rounded-4 text-center transition-all ${plan.recommended ? 'ring-2 ring-primary' : ''}`}
                                 style={{ transform: plan.recommended ? 'scale(1.02)' : 'scale(1)' }}>
                                {plan.recommended && (
                                    <div className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary px-3 py-2 shadow-sm">
                                        BEST VALUE
                                    </div>
                                )}
                                <div className="card-body p-5 d-flex flex-column">
                                    <h4 className="fw-bold text-secondary text-uppercase small ls-1 mb-3">{plan.name}</h4>
                                    <h2 className="display-4 fw-bold text-dark mb-0">₹{plan.price}<span className="fs-5 text-muted fw-normal">{plan.period}</span></h2>
                                    
                                    <hr className="my-4 opacity-10" />
                                    
                                    <ul className="list-unstyled text-start mb-4">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="mb-3 d-flex align-items-center">
                                                <i className="bi bi-check-circle-fill text-success me-3 fs-5"></i>
                                                <span className="text-secondary fw-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    <div className="mt-auto">
                                        <button 
                                            className={`btn w-100 py-3 fw-bold rounded-pill ${plan.recommended ? 'btn-primary shadow' : 'btn-outline-primary'}`}
                                            onClick={() => handleSubscribe(plan.type)}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2" />
                                            ) : (
                                                `Choose ${plan.name}`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                        box-shadow: 0 0 0 2px #0d6efd;
                    }
                `}
            </style>
        </div>
    );
}

export default Subscriptions;
