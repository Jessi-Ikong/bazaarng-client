import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrderById, downloadReceipt } from "../services/orderService";
import { getOrCreateConversation, sendMessage } from "../services/chatService";
import { useAuth } from "../hooks/useAuth";
import OrderStatusStepper from "../components/cart/OrderStatusStepper";
import Loader from "../components/common/Loader";
import { getImageUrl } from "../utils/getImageUrl";
import { downloadBlob } from "../utils/downloadBlob";

function formatNaira(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAYMENT_STYLES = {
  paid: "bg-primary-50 text-primary-700",
  unpaid: "bg-accent-50 text-accent-600",
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [reportingProblem, setReportingProblem] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Could not load this order."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    try {
      const res = await downloadReceipt(id);
      downloadBlob(res.data, `bazaarng-receipt-${id.slice(-8)}.pdf`);
    } catch {
      alert("Could not download the receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Opens a support conversation with a pre-filled message identifying
  // this specific order, so support has full context immediately instead
  // of the buyer needing to explain from scratch.
  const handleReportProblem = async () => {
    setReportingProblem(true);
    try {
      const convoRes = await getOrCreateConversation({ type: "support" });
      const conversationId = convoRes.data.id;
      const orderRef = order._id.slice(-8).toUpperCase();
      await sendMessage(
        conversationId,
        `I'd like to report a problem with Order #${orderRef} (${formatNaira(order.totalAmount)}, from ${order.vendor?.storeName}).`,
      );
      navigate("/messages", { state: { openConversationId: conversationId } });
    } catch {
      alert("Could not start a support conversation. Please try again.");
    } finally {
      setReportingProblem(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!order) return null;

  const isVendorOrAdmin = user?.role === "vendor" || user?.role === "admin";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/orders" className="text-xs text-primary-600 hover:underline">
          ← Back to orders
        </Link>
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="h-8 px-3 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 flex items-center gap-1.5"
        >
          <i className="ti ti-download" />
          {downloading ? "Downloading..." : "Download receipt"}
        </button>
      </div>

      <div className="bg-white border border-neutral-100 rounded-lg p-5 mb-4">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="font-heading text-lg font-semibold text-neutral-900">
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-neutral-500">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-md h-fit ${PAYMENT_STYLES[order.paymentStatus]}`}
          >
            {order.paymentStatus}
          </span>
        </div>

        <OrderStatusStepper status={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white border border-neutral-100 rounded-lg p-5 mb-4">
        <p className="font-heading font-semibold text-neutral-900 mb-3">
          Items
        </p>
        <div className="space-y-3">
          {order.items.map((item, i) => {
            const image = getImageUrl(item.product?.images?.[0]);
            const productId = item.product?._id;
            return (
              <div key={i} className="flex items-center gap-3">
                {productId ? (
                  <Link
                    to={`/products/${productId}`}
                    className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-50 shrink-0 flex items-center justify-center hover:opacity-80"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-neutral-300 text-[8px]">
                        No img
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-50 shrink-0 flex items-center justify-center">
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-neutral-300 text-[8px]">
                        No img
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {productId ? (
                    <Link
                      to={`/products/${productId}`}
                      className="text-sm text-neutral-900 truncate hover:text-primary-700 hover:underline block"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-neutral-900 truncate">
                      {item.name}
                    </p>
                  )}
                  {item.selectedOptions &&
                    Object.keys(item.selectedOptions).length > 0 && (
                      <p className="text-xs text-neutral-500">
                        {Object.entries(item.selectedOptions)
                          .map(([name, value]) => `${name}: ${value}`)
                          .join(" · ")}
                      </p>
                    )}
                  <p className="text-xs text-neutral-500">
                    {formatNaira(item.priceAtPurchase)} × {item.quantity}
                  </p>
                  {productId &&
                    order.status === "delivered" &&
                    order.paymentStatus === "paid" && (
                      <Link
                        to={`/products/${productId}`}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Write a review →
                      </Link>
                    )}
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  {formatNaira(item.priceAtPurchase * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="pt-3 mt-3 border-t border-neutral-100 space-y-2">
          <div className="flex justify-between">
            <p className="text-sm text-neutral-600">Delivery fee</p>
            <p className="text-sm text-neutral-900">
              {formatNaira(order.deliveryFee || 0)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm font-medium text-neutral-900">Total</p>
            <p className="font-heading font-semibold text-primary-800">
              {formatNaira(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="bg-white border border-neutral-100 rounded-lg p-5 mb-4">
        <p className="font-heading font-semibold text-neutral-900 mb-3">
          Payment
        </p>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Method</dt>
            <dd className="text-neutral-900">
              {order.paymentMethod === "card"
                ? "Card (via Paystack)"
                : "Pay on delivery"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Status</dt>
            <dd className="text-neutral-900 capitalize">
              {order.paymentStatus}
            </dd>
          </div>
          {order.paidAt && (
            <div className="flex justify-between">
              <dt className="text-neutral-500">Paid on</dt>
              <dd className="text-neutral-900">
                {formatDateTime(order.paidAt)}
              </dd>
            </div>
          )}
          {order.paystackReference && (
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 shrink-0">Reference</dt>
              <dd className="text-neutral-900 text-right break-all font-mono text-xs">
                {order.paystackReference}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Shipping + parties */}
      <div className="bg-white border border-neutral-100 rounded-lg p-5">
        <p className="font-heading font-semibold text-neutral-900 mb-3">
          Shipping
        </p>
        <p className="text-sm text-neutral-700 mb-4">
          {order.shippingAddress?.street}, {order.shippingAddress?.city}
          {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
          {order.shippingAddress?.country &&
            `, ${order.shippingAddress.country}`}
        </p>

        <p className="text-xs text-neutral-500">
          Sold by{" "}
          <span className="font-medium text-neutral-700">
            {order.vendor?.storeName}
          </span>
        </p>
        {isVendorOrAdmin && (
          <p className="text-xs text-neutral-500 mt-1">
            Buyer:{" "}
            <span className="font-medium text-neutral-700">
              {order.buyer?.name}
            </span>{" "}
            ({order.buyer?.email})
          </p>
        )}
      </div>

      {!isVendorOrAdmin && order.status === "delivered" && (
        <div className="mt-4 text-center">
          <button
            onClick={handleReportProblem}
            disabled={reportingProblem}
            className="h-9 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-60"
          >
            {reportingProblem
              ? "Starting conversation..."
              : "Report a problem with this order"}
          </button>
        </div>
      )}
    </div>
  );
}
