import axios from "axios";

// Set base URL if needed
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Enable credentials for all requests
axios.defaults.withCredentials = true;

export default axios;
