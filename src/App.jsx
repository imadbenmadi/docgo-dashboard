import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./Router.jsx";
import "./index.css"; // Import Tailwind CSS

function App() {
  return <RouterProvider router={router} />;
}

export default App;
