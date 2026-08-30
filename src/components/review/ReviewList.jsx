function Stars({ rating }) {
  return (
    <span className="text-accent-600 text-sm">
      {"★".repeat(Math.round(rating))}
      <span className="text-neutral-200">
        {"★".repeat(5 - Math.round(rating))}
      </span>
    </span>
  );
}

export default function ReviewList({ reviews, showProductName = false }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-neutral-400 py-4">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div
          key={r._id}
          className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-neutral-900">
              {r.buyer?.name || "Anonymous"}
            </p>
            <Stars rating={r.rating} />
          </div>
          {showProductName && r.product?.name && (
            <p className="text-xs text-neutral-500 mb-1">on {r.product.name}</p>
          )}
          {r.comment && <p className="text-sm text-neutral-700">{r.comment}</p>}
          <p className="text-[10px] text-neutral-400 mt-1">
            {new Date(r.createdAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
