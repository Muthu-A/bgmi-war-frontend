import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Matches from "./pages/Matches";
import TodayWar from "./pages/TodayWar";
import Login from "./pages/Login";

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
        <Route path="/today-war" element={<PrivateRoute><TodayWar /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Private route to protect dashboard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default App;