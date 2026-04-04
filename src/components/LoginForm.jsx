import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // 🔗 Fake API call (replace with Firebase / backend)
      await new Promise((res) => setTimeout(res, 1500));

      // ✅ Success redirect
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black transition">
        
        {/* 🌙 Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-5 right-5 text-sm px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-800"
        >
          {darkMode ? "Light" : "Dark"}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[300px] xs:max-w-sm sm:max-w-md
          backdrop-blur-xl
          bg-white/80 dark:bg-white/5
          border border-white/20
          rounded-2xl
          shadow-xl
          p-5 xs:p-6 sm:p-8"
        >

          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-center mb-5 sm:mb-6 text-gray-800 dark:text-gray-100">
            Welcome Back
          </h2>

          {error && (
            <p className="text-red-500 text-xs xs:text-sm text-center mb-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm xs:text-base
                rounded-lg border border-gray-300 dark:border-gray-700
                bg-white/70 dark:bg-white/10
                focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 pr-10 text-sm xs:text-base
                  rounded-lg border border-gray-300 dark:border-gray-700
                  bg-white/70 dark:bg-white/10
                  focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />

                {/* 🔐 Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm xs:text-base font-semibold rounded-lg
              bg-yellow-500 text-black
              hover:bg-yellow-400
              active:scale-95
              transition flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don't have an account? <span className="text-yellow-500 cursor-pointer">Sign up</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/*
To connect Firebase:
1. Install: npm install firebase
2. Import auth and use signInWithEmailAndPassword()
3. Replace fake API in handleSubmit
*/
