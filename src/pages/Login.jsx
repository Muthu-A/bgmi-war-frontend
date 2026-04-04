import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false); // Toggle state

  const navigate = useNavigate();
  const bgPath = "/bgImage.png";

  const handleAction = async () => {
    if (!username || !password) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      if (isForgotMode) {
        // FORGOT PASSWORD LOGIC
        await API.post("/auth/forgot-password", {
          username,
          newPassword: password, // We use the password field as the 'new' password
        });
        setUsername("");
        setPassword("");
        toast.success("Password updated successfully! You can now login.");
        setIsForgotMode(false); // Switch back to login
      } else {
        // LOGIN LOGIC
        const res = await API.post("/auth/login", {
          username,
          password, // We use the password field as the 'new' password
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgPath})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/90 rounded-3xl shadow-xl p-10 backdrop-blur-md border border-gray-800">
        <h2 className="text-4xl font-bold text-yellow-400 text-center mb-2 italic">
          {isForgotMode ? "RESET ACCESS" : "BotSquad War"}
        </h2>
        <p className="text-gray-500 text-[10px] text-center uppercase tracking-[0.3em] mb-8 font-bold">
          {isForgotMode ? "Set your new credentials" : "Enter the battleground"}
        </p>

        {/* Username */}
        <div className="flex items-center bg-gray-800 rounded-xl mb-4 p-3 border border-transparent focus-within:border-yellow-500/50 transition-all">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
          />
        </div>

        {/* Password (Reused as New Password in Forgot Mode) */}
        <div className="flex items-center bg-gray-800 rounded-xl mb-6 p-3 border border-transparent focus-within:border-yellow-500/50 transition-all">
          <input
            type="password"
            placeholder={isForgotMode ? "Enter New Password" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
          />
        </div>

        {/* Dynamic Button using your custom Button component */}
        <Button
          onClick={handleAction}
          loading={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black py-3 rounded-xl mb-4 transition-all uppercase italic"
        >
          {isForgotMode ? "Update Password" : "Login"}
        </Button>

        {/* Toggle between modes */}
        <button
          onClick={() => {
            setIsForgotMode(!isForgotMode);
            setMessage("");
          }}
          className="w-full text-xs text-gray-400 hover:text-yellow-500 transition-colors"
        >
          {isForgotMode ? "← Back to Login" : "Forgot Password?"}
        </button>

        {message && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 p-2 rounded-lg">
            <p className="text-red-500 text-xs text-center font-bold uppercase">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
