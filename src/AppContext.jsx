import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import apiClient from "./utils/apiClient";
import { getApiBaseUrl } from "./utils/apiBaseUrl";

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

// i  did isAuth true  Cause i need  to  develope and after  that i  will
// try  to  return it to false
const initialState = {
    isAuth: false,
    userId: null,
    userType: null,
    user: null,
    Notifications: null,
    loading: true,
};

const reducer = (state, action) => {
    switch (action.type) {
        case "LOGOUT":
            return {
                ...state,
                isAuth: false,
                userId: null,
                userType: null,
                user: null,
            };
        case "SET_AUTH":
            return {
                ...state,
                isAuth: action.payload,
            };
        case "SET_USER":
            return {
                ...state,
                user: action.payload,
                isAuth: !!action.payload,
                userId: action.payload?.id || null,
                userType: action.payload?.userType || null,
            };
        case "SET_NOTIFICATIONS":
            return {
                ...state,
                Notifications: action.payload,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const API_URL = getApiBaseUrl();

    // Configure axios defaults
    axios.defaults.withCredentials = true;

    const set_Auth = (isAuth) => {
        dispatch({ type: "SET_AUTH", payload: isAuth });
    };

    const store_logout = async () => {
        try {
            await apiClient.post(API_URL + "/Admin_Logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            dispatch({ type: "LOGOUT" });
        }
    };

    const set_user = (user) => {
        dispatch({ type: "SET_USER", payload: user });
    };

    const set_Notifications = (Notifications) => {
        dispatch({
            type: "SET_NOTIFICATIONS",
            payload: Notifications,
        });
    };

    const setLoading = (loading) => {
        dispatch({ type: "SET_LOADING", payload: loading });
    };

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_URL + "/Admin_CheckAuth", {
                timeout: 10000, // 10 second timeout
                validateStatus: () => true,
            });

            if (
                response.status === 200 ||
                response.status === 201 ||
                response.status < 300
            ) {
                set_Auth(true);
                return { success: true };
            } else {
                return { success: false };
            }
        } catch (error) {
            console.error("Auth check error:", error);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await apiClient.post(
                API_URL + "/Admin_Login",
                credentials,
                {
                    validateStatus: () => true,
                },
            );

            if (response.status === 200) {
                set_Auth(true);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: response.data?.message || "Login failed",
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const AppContextValue = {
        // All your existing values
        ...state,
        set_Notifications,
        store_logout,
        set_Auth,
        set_user,

        // New authentication methods
        checkAuthStatus,
        login,
        isAuthenticated: state.isAuth,
    };

    return (
        <AppContext.Provider value={AppContextValue}>
            {children}
        </AppContext.Provider>
    );
};
