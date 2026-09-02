import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/common/AuthCard";

const FIELDS = [
  { name: "name", label: "Your full name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone (optional)", type: "text", required: false },
  { name: "storeName", label: "Store name", type: "text" },
  {
    name: "storeDescription",
    label: "Store description (optional)",
    type: "text",
    required: false,
  },
  { name: "password", label: "Password", type: "password" },
];

export default function RegisterVendor() {
  const { registerVendor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    storeDescription: "",
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
      await registerVendor(form);
      // New vendors land in a pending state — send them to their profile,
      // where the pending status will be visible, rather than the dashboard.
      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Start selling on BazaarNG"
      subtitle="Your store will be reviewed before it goes live."
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
            {loading ? "Submitting..." : "Register store"}
          </button>
        </div>
      </form>

      <p className="text-sm text-neutral-600 text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium">
          Log in
        </Link>
      </p>
      <p className="text-sm text-neutral-600 text-center mt-2">
        Just here to shop?{" "}
        <Link to="/register" className="text-primary-600 font-medium">
          Create a customer account
        </Link>
      </p>
    </AuthCard>
  );
}
