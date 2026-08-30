import { getImageUrl } from "../../utils/getImageUrl";

function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  updating,
}) {
  const product = item.product;
  const image = getImageUrl(product?.images?.[0]);
  const lineTotal = item.priceAtAdd * item.quantity;
  const optionEntries = Object.entries(item.selectedOptions || {});

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-100 last:border-0">
      <div className="w-20 h-20 bg-neutral-50 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
        {image ? (
          <img
            src={image}
            alt={product?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-neutral-400 text-[10px] text-center px-1">
            No image
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 line-clamp-2">
          {product?.name}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {product?.vendor?.storeName}
        </p>
        {optionEntries.length > 0 && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {optionEntries
              .map(([name, value]) => `${name}: ${value}`)
              .join(" · ")}
          </p>
        )}
        <p className="text-sm font-heading font-semibold text-primary-800 mt-1">
          {formatNaira(item.priceAtAdd)}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-neutral-200 rounded-lg">
            <button
              onClick={() =>
                onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))
              }
              disabled={updating}
              className="w-7 h-7 text-neutral-600 hover:bg-neutral-50"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
              disabled={updating || item.quantity >= (product?.stock || 99)}
              className="w-7 h-7 text-neutral-600 hover:bg-neutral-50"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(item._id)}
            disabled={updating}
            className="text-xs text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-neutral-900 shrink-0">
        {formatNaira(lineTotal)}
      </p>
    </div>
  );
}
