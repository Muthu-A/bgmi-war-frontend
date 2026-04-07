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
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${bgPath})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="rounded-2xl p-8 border border-yellow-500/20 mb-8 text-center">
          <div className="text-5xl mb-4">⚔️</div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 italic">
            Battleground War Admin
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            "Command Your Tournament - Manage the Esports Arena"
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-xl font-bold text-blue-400">🎮</div>
              <div className="text-xs text-gray-400 mt-1">Admin Control</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-xl font-bold text-purple-400">⚡</div>
              <div className="text-xs text-gray-400 mt-1">Real-time Management</div>
            </div>
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-xl font-bold text-green-400">🏆</div>
              <div className="text-xs text-gray-400 mt-1">Tournament Power</div>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md mx-auto bg-gray-900/90 rounded-3xl shadow-2xl p-10 backdrop-blur-md border border-gray-800">
          <h2 className="text-3xl font-bold text-yellow-400 text-center mb-2 italic">
            {isForgotMode ? "🔐 RESET ACCESS" : "⚔️ Battle Terminal"}
          </h2>
          <p className="text-gray-500 text-[10px] text-center uppercase tracking-[0.3em] mb-8 font-bold">
            {isForgotMode ? "Secure your admin credentials" : "Administrator Login Portal"}
          </p>

          {/* Username */}
          <div className="flex items-center bg-gray-800 rounded-xl mb-4 p-3 border border-transparent focus-within:border-yellow-500/50 transition-all">
            <span className="text-yellow-400 mr-2">👤</span>
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
            <span className="text-yellow-400 mr-2">🔑</span>
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
            {isForgotMode ? "🔄 Update Password" : "⚡ Enter Arena"}
          </Button>

          {/* Toggle between modes */}
          <button
            onClick={() => {
              setIsForgotMode(!isForgotMode);
              setMessage("");
            }}
            className="w-full text-xs text-gray-400 hover:text-yellow-500 transition-colors"
          >
            {isForgotMode ? "← Back to Login" : "🔐 Forgot Password?"}
          </button>

          {message && (
            <div className="mt-4 bg-red-500/10 border border-red-500/50 p-3 rounded-lg">
              <p className="text-red-500 text-xs text-center font-bold uppercase">
                ⚠️ {message}
              </p>
            </div>
          )}

          {/* Admin Info */}
          <div className="mt-6 pt-4 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">
              "With great power comes great responsibility."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
