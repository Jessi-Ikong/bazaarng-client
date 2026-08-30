import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../services/orderService';
import Loader from '../components/common/Loader';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'success' | 'failed'

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }

    verifyPayment(reference)
      .then((res) => {
        setStatus(res.data.paid ? 'success' : 'failed');
      })
      .catch(() => setStatus('failed'));
  }, [searchParams]);

  if (status === 'checking') {
    return (
      <div className="text-center py-16">
        <Loader />
        <p className="text-sm text-neutral-500 mt-2">Confirming your payment...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 max-w-sm mx-auto">
      {status === 'success' ? (
        <>
          <p className="text-primary-700 font-heading text-lg font-semibold mb-2">Payment successful!</p>
          <p className="text-sm text-neutral-600 mb-6">Your order has been confirmed.</p>
        </>
      ) : (
        <>
          <p className="text-red-600 font-heading text-lg font-semibold mb-2">Payment not confirmed</p>
          <p className="text-sm text-neutral-600 mb-6">
            If you completed payment, it may still be processing — check your order history in a moment.
          </p>
        </>
      )}
      <button
        onClick={() => navigate('/orders')}
        className="h-10 px-6 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-800"
      >
        View my orders
      </button>
    </div>
  );
}
