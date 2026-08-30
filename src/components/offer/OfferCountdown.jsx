import { useEffect, useState } from 'react';

function formatRemaining(ms) {
  if (ms <= 0) return 'Expired';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m left`;
}

export default function OfferCountdown({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() => new Date(expiresAt) - new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = new Date(expiresAt) - new Date();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 30000); // update every 30s — a countdown doesn't need per-second precision here

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const urgent = remaining < 60 * 60 * 1000; // under 1 hour left

  return (
    <span className={`text-xs font-medium ${urgent ? 'text-red-600' : 'text-accent-600'}`}>
      {formatRemaining(remaining)}
    </span>
  );
}
