export default function TrustBanner() {
  return (
    <div className="bg-primary-900 rounded-xl px-5 sm:px-8 py-7 sm:py-9 mb-6 text-white text-center">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
        A marketplace built on trust
      </h1>
      <p className="text-primary-100 text-sm sm:text-base mb-4">
        Every vendor is reviewed. Every price can be negotiated.
      </p>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          <i className="ti ti-shield-check text-accent-200" /> Verified vendors
        </span>
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          <i className="ti ti-arrows-exchange text-accent-200" /> Negotiable pricing
        </span>
        <span className="flex items-center gap-1.5 text-xs sm:text-sm">
          <i className="ti ti-lock text-accent-200" /> Secure checkout
        </span>
      </div>
    </div>
  );
}
