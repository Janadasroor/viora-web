'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage, getValidationErrors } from "@/utils/errorUtils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import style from "../../Title.module.css"
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, resendVerificationCode } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await login(email, password);
      console.log("User:", response);

      // Check if email is verified
      if (response.success && response.data && response.data.user) {
        const user = response.data.user;

        // Check for unverified email (0 means unverified)
        if (!user.emailVerified) {
          await resendVerificationCode(email, user.userId);
          // Redirect to verify email page if not verified
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
      }

      // If verified, redirect to feed
      router.push("/feed");
    } catch (err: any) {
      console.log(err);
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      const validationErrors = getValidationErrors(err);
      if (validationErrors) {
        setFieldErrors(validationErrors);
        setError("Please correct the errors below");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4 dark:from-gray-900 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className={`${style.title} text-center font-bold text-2xl text-gray-800 dark:text-white mb-2`}>
          Viora
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          Sign in to continue to Viora
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
              }}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
              }}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>
            )}
            <div className="text-right mt-1">
              <Link href="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm p-3 rounded-lg text-center border border-red-100 dark:border-red-800"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
