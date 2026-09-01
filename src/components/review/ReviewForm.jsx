import { useState } from "react";
import { createReview } from "../../services/reviewService";

export default function ReviewForm({ productId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await createReview(productId, rating, comment.trim());
      onSubmitted(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-primary-50 border-2 border-primary-100 rounded-xl p-6 mb-6"
    >
      <p className="font-heading text-lg font-semibold text-primary-900 mb-3">
        ★ Write a review
      </p>

      <div className="flex gap-1.5 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-4xl leading-none"
          >
            <span
              className={
                star <= (hoverRating || rating)
                  ? "text-accent-600"
                  : "text-neutral-300"
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product (optional)"
        rows={3}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 mb-3"
      />

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 px-8 rounded-lg bg-primary-900 text-white text-base font-semibold hover:bg-primary-800 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
