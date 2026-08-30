const STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

const STEP_LABELS = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

export default function OrderStatusStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Cancelled
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full ${reached ? 'bg-primary-600' : 'bg-neutral-200'}`}
              />
              <span
                className={`text-[10px] mt-1 whitespace-nowrap ${
                  reached ? 'text-primary-700 font-medium' : 'text-neutral-400'
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <div
                className={`w-6 sm:w-10 h-0.5 mb-4 ${i < currentIndex ? 'bg-primary-600' : 'bg-neutral-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
