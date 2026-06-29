import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../../services/adminLoginServices";
import MacraLogo from "../../assets/logo/Macra.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem("adminToken", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2CD377]" />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src={MacraLogo} alt="Macra" className="h-12 w-auto mb-3" />
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200 px-8 py-10 flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              placeholder="example@macra.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20 transition placeholder-gray-300 font-medium"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#2CD377] focus:ring-2 focus:ring-[#2CD377]/20 transition placeholder-gray-300 font-medium"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-red-500 text-xs font-medium text-center">{error}</p>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#2CD377] hover:bg-[#25bc6a] active:scale-95 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2CD377]/30 mt-1 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 mt-6 font-medium">© 2025 Macra. All rights reserved.</p>

      </div>
    </div>
  );
};

export default Login;