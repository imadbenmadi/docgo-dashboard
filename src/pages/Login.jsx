import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useAppContext } from "../AppContext";
import logo from "../assets/logo.png";

export const SignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuth } = useAppContext();

    // Get the intended destination from location state, or default to dashboard
    const from = location.state?.from?.pathname || "/";

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuth) {
            navigate(from, { replace: true });
        }
    }, [isAuth, navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Veuillez remplir tous les champs",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await login({ email, password });

            if (result.success) {
                // Success notification
                Swal.fire({
                    icon: "success",
                    title: "Connexion réussie!",
                    text: "Bienvenue!",
                    confirmButtonColor: "#3b82f6",
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    // Navigate to intended destination or home page
                    navigate(from, { replace: true });
                });
            } else {
                // Error notification
                Swal.fire({
                    icon: "error",
                    title: "Erreur de connexion",
                    text: result.message || "Email ou mot de passe incorrect",
                    confirmButtonColor: "#3b82f6",
                });
            }
        } catch (error) {
            // Handle network or other errors
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Une erreur s'est produite. Veuillez réessayer.",
                confirmButtonColor: "#3b82f6",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex">
            

            {/* Right side - Login form */}
            <div className="w-full flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center flex-col justify-center items-center mb-8">
                        <img
                            src={logo}
                            alt="Logo"
                            className="object-contain w-20 h-20 mx-auto aspect-square relative z-10"
                        />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Se connecter
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Votre email / Numéro de téléphone"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Connexion...
                                    </>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignInForm;
