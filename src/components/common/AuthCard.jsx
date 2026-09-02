// Shared card shell for Login / Register / RegisterVendor — keeps the
// teal header + white card treatment consistent across all auth pages.
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-sm bg-white rounded-xl border border-neutral-100 overflow-hidden">
        <div className="bg-primary-900 py-5 text-center">
          <p className="font-heading text-lg font-semibold text-white">
            Bazaar<span className="text-accent-200">NG</span>
          </p>
        </div>
        <div className="p-6">
          <h1 className="text-lg font-semibold text-neutral-900 text-center mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-600 text-center mb-5">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
