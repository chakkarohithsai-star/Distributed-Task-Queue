import { useEffect } from "react";
// importing routes
import AppRoutes from "./routes/AppRoutes";

// app component
function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "dark");
      }
    }
  }, []);

  return (
    <AppRoutes />
  );
}

// exporting app
export default App;