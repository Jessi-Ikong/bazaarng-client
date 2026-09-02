export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-neutral-100 rounded-lg p-6 sm:p-8">
      <p className="text-xs text-accent-600 bg-accent-50 rounded-md px-3 py-2 mb-6">
        Draft template — this is placeholder content, not legal advice. Have a lawyer review and
        finalize this before BazaarNG goes live to real customers.
      </p>

      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Privacy Policy</h1>
      <p className="text-xs text-neutral-500 mb-6">Last updated: [date]</p>

      <div className="space-y-5 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">1. Information we collect</h2>
          <p>
            When you create an account, we collect your name, email, phone number, and shipping
            address. When you complete a purchase, payment processing information is handled by
            Paystack — BazaarNG does not store your full card details.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">2. How we use your information</h2>
          <p>
            We use your information to process orders, facilitate communication between buyers
            and vendors, verify vendor accounts, and improve the platform.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">3. Sharing with vendors</h2>
          <p>
            When you place an order, the vendor fulfilling it receives the information needed to
            complete delivery (name, shipping address, order contents).
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">4. Third-party services</h2>
          <p>
            We use Paystack to process payments and MongoDB Atlas to store platform data. Each
            third party handles data according to its own privacy practices.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">5. Your rights</h2>
          <p>[Placeholder — define data access, correction, and deletion rights applicable to your users' jurisdiction(s).]</p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">6. Contact</h2>
          <p>Questions about this policy can be sent to support@bazaarng.com.</p>
        </section>
      </div>
    </div>
  );
}
