import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/common/AuthCard";

const FIELDS = [
  { name: "name", label: "Full name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone (optional)", type: "text", required: false },
  { name: "password", label: "Password", type: "password" },
];

export default function Register() {
  const { registerCustomer, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerCustomer(form);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Browse, buy, and negotiate on KoboBuy."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-xs text-neutral-600 text-center mb-1"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required !== false}
              value={form[field.name]}
              onChange={handleChange}
              className="w-full h-10 rounded-lg border border-neutral-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        ))}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium whitespace-nowrap hover:bg-primary-800 disabled:opacity-60 transition"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-[10px] text-neutral-400 uppercase">or</span>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in failed. Please try again.")}
        />
      </div>

      <p className="text-sm text-neutral-600 text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium">
          Log in
        </Link>
      </p>
      <p className="text-sm text-neutral-600 text-center mt-2">
        Want to sell?{" "}
        <Link
          to="/register-vendor"
          className="bg-accent-50 text-accent-600 text-xs px-2 py-1 rounded-md font-medium"
        >
          Register as a vendor
        </Link>
      </p>
    </AuthCard>
  );
}
