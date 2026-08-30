import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl';

function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product }) {
  const image = getImageUrl(product.images?.[0]);
  const vendorInitial = product.vendor?.storeName?.[0]?.toUpperCase() || '?';

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-white border border-neutral-100 rounded-lg overflow-hidden hover:shadow-md transition flex flex-col"
    >
      <div className="aspect-square bg-neutral-50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <i className="ti ti-photo text-neutral-300 text-3xl" />
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-heading text-base font-semibold text-primary-800">
          {formatNaira(product.price)}
        </p>
        <h3 className="text-xs text-neutral-600 line-clamp-2 leading-snug">{product.name}</h3>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-4 h-4 rounded-full bg-primary-50 text-primary-800 text-[9px] font-semibold flex items-center justify-center shrink-0">
              {vendorInitial}
            </span>
            <span className="text-[11px] text-neutral-500 truncate">
              {product.vendor?.storeName || 'KoboBuy vendor'}
            </span>
          </div>

          {product.offersEnabled ? (
            <span className="shrink-0 text-[10px] font-medium text-primary-800 border border-primary-200 px-1.5 py-0.5 rounded-md">
              Negotiable
            </span>
          ) : product.ratingCount > 0 ? (
            <span className="shrink-0 flex items-center gap-0.5 text-[11px] text-accent-600">
              <i className="ti ti-star text-[11px]" /> {product.ratingAverage.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
