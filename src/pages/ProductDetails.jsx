import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getProductById } from "../services/productService";
import { addItemToCart } from "../services/cartService";
import { getWishlist } from "../services/wishlistService";
import { getOrCreateConversation } from "../services/chatService";
import {
  getProductReviews,
  getReviewEligibility,
} from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import Loader from "../components/common/Loader";
import OfferModal from "../components/offer/OfferModal";
import WishlistButton from "../components/product/WishlistButton";
import ReviewList from "../components/review/ReviewList";
import ReviewForm from "../components/review/ReviewForm";
import { getImageUrl } from "../utils/getImageUrl";

function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null); // { eligible, reason } | null

  useDocumentMeta(
    product ? `${product.name} — BazaarNG` : "BazaarNG",
    product
      ? `${product.name} — ${formatNaira(product.price)}. ${product.description?.slice(0, 140) || ""}`
      : undefined,
  );

  useEffect(() => {
    setLoading(true);
    setError("");
    getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError("This product could not be found."))
      .finally(() => setLoading(false));

    // Reset eligibility up front on every product change — otherwise a
    // client-side navigation (no full remount) between products can briefly
    // show the PREVIOUS product's eligibility while this one's fetch is
    // still in flight.
    setEligibility(null);

    if (user) {
      getWishlist()
        .then((res) =>
          setWishlisted(res.data.products.some((p) => p._id === id)),
        )
        .catch(() => {});
      if (user.role === "customer") {
        getReviewEligibility(id)
          .then((res) => setEligibility(res.data))
          .catch(() => setEligibility(null));
      }
    }

    getProductReviews(id)
      .then((res) => setReviews(res.data))
      .catch(() => {});

    setSelectedOptions({});
  }, [id, user]);

  const handleAddToCart = async () => {
    setCartMessage("");
    setAddingToCart(true);
    try {
      await addItemToCart(product._id, 1, selectedOptions);
      setCartMessage("Added to cart.");
      refreshCart();
    } catch (err) {
      setCartMessage(err.response?.data?.message || "Could not add to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleChatWithVendor = async () => {
    const vendorUserId = product.vendor?.user?._id;
    if (!vendorUserId) return;
    const res = await getOrCreateConversation({
      type: "vendor_customer",
      vendorUserId,
      productId: product._id,
    });
    navigate("/messages", { state: { openConversationId: res.data.id } });
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!product) return null;

  const image = getImageUrl(product.images?.[0]);
  const inStock = product.stock > 0 && product.status === "active";
  // If the product has no options at all, there's nothing to require.
  // Otherwise every option group needs a chosen value before "Add to
  // cart" is allowed to fire.
  const allOptionsSelected =
    !product.options ||
    product.options.length === 0 ||
    product.options.every((group) => selectedOptions[group.name]);

  // A variant price applies only once every option group has a selection
  // that exactly matches one of the vendor's stored combinations — partial
  // selections never match, they just keep showing the base price.
  const matchedVariantPrice =
    allOptionsSelected && product.variantPrices?.length > 0
      ? product.variantPrices.find((vp) => {
          const keys = Object.keys(vp.combination);
          return (
            keys.length === Object.keys(selectedOptions).length &&
            keys.every((k) => selectedOptions[k] === vp.combination[k])
          );
        })?.price
      : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="aspect-square bg-neutral-50 rounded-lg overflow-hidden flex items-center justify-center relative">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-neutral-400 text-sm">No image available</span>
        )}
        {user && (
          <WishlistButton
            productId={product._id}
            saved={wishlisted}
            onChange={setWishlisted}
            className="absolute top-3 right-3"
          />
        )}
      </div>

      <div>
        <h1 className="font-heading text-2xl font-semibold text-neutral-900 mb-2">
          {product.name}
        </h1>

        <p className="text-sm text-neutral-500 mb-4">
          Sold by{" "}
          <Link
            to={`/store/${product.vendor?._id}`}
            className="font-medium text-neutral-700 hover:text-primary-700"
          >
            {product.vendor?.storeName}
          </Link>
          {product.vendor?.ratingCount > 0 && (
            <span className="ml-2 text-accent-600">
              ★ {product.vendor.ratingAverage.toFixed(1)} (
              {product.vendor.ratingCount})
            </span>
          )}
        </p>

        <p className="font-heading text-3xl font-semibold text-primary-800 mb-4">
          {formatNaira(matchedVariantPrice ?? product.price)}
        </p>

        <p className="text-sm text-neutral-700 leading-relaxed mb-6 whitespace-pre-line">
          {product.description}
        </p>

        {location.state?.message && (
          <p className="text-sm text-accent-700 bg-accent-50 rounded-lg px-3 py-2 mb-4">
            {location.state.message}
          </p>
        )}

        {product.options?.length > 0 && (
          <div className="mb-4 space-y-3">
            {product.options.map((group) => (
              <div key={group.name}>
                <p className="text-xs text-neutral-600 mb-1.5">{group.name}</p>
                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => {
                    const isSelected = selectedOptions[group.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [group.name]: value,
                          }))
                        }
                        className={`h-9 px-3 rounded-lg border text-sm transition ${
                          isSelected
                            ? "border-primary-600 bg-primary-50 text-primary-800 font-medium"
                            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p
          className={`text-sm mb-4 ${inStock ? "text-primary-600" : "text-red-600"}`}
        >
          {inStock ? `In stock (${product.stock} available)` : "Out of stock"}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock || !user || addingToCart || !allOptionsSelected}
            className="h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-50 transition"
          >
            {addingToCart
              ? "Adding..."
              : matchedVariantPrice != null
                ? `Add to cart at ${formatNaira(matchedVariantPrice)}`
                : "Add to cart"}
          </button>

          {product.offersEnabled && (
            <button
              onClick={() => setShowOfferModal(true)}
              disabled={!user}
              className="h-10 px-6 rounded-lg bg-accent-50 text-accent-600 text-sm font-medium hover:bg-accent-200 disabled:opacity-50 transition"
            >
              Make an offer
            </button>
          )}

          {product.vendor?.user?._id && (
            <button
              onClick={handleChatWithVendor}
              disabled={!user}
              className="h-10 px-6 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <i className="ti ti-message-circle" />
              Chat with vendor
            </button>
          )}
        </div>

        {!user && (
          <p className="text-xs text-neutral-500 mt-2">
            Log in to add items to your cart or make an offer.
          </p>
        )}
        {cartMessage && (
          <p className="text-sm text-primary-700 mt-2">{cartMessage}</p>
        )}
      </div>

      {showOfferModal && (
        <OfferModal
          product={product}
          onClose={() => setShowOfferModal(false)}
        />
      )}

      <div className="md:col-span-2 mt-4">
        <h2 className="font-heading text-lg font-semibold text-neutral-900 mb-3">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {eligibility?.eligible && (
          <ReviewForm
            productId={product._id}
            onSubmitted={(newReview) => {
              setReviews((prev) => [
                { ...newReview, buyer: { name: user.name } },
                ...prev,
              ]);
              setEligibility({ eligible: false, reason: "already_reviewed" });
            }}
          />
        )}
        {eligibility?.reason === "not_delivered" && (
          <p className="text-xs text-neutral-500 mb-4">
            You can review this product once your order for it has been
            delivered and paid for.
          </p>
        )}

        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
