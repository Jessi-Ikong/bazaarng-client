export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-neutral-100 rounded-lg p-6 sm:p-8">
      <p className="text-xs text-accent-600 bg-accent-50 rounded-md px-3 py-2 mb-6">
        Draft template — this is placeholder content, not legal advice. Have a lawyer review and
        finalize this before KoboBuy goes live to real customers.
      </p>

      <h1 className="font-heading text-xl font-semibold text-neutral-900 mb-4">Terms of Service</h1>
      <p className="text-xs text-neutral-500 mb-6">Last updated: [date]</p>

      <div className="space-y-5 text-sm text-neutral-700 leading-relaxed">
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">1. About KoboBuy</h2>
          <p>
            KoboBuy is a multi-vendor online marketplace that connects buyers with independent
            vendors. KoboBuy facilitates listings, negotiation, orders, and payments, but each
            product is sold by the vendor listing it, not by KoboBuy directly.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">2. Accounts</h2>
          <p>
            You must provide accurate information when creating a customer or vendor account.
            You are responsible for activity under your account and for keeping your login
            credentials secure.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">3. Vendors</h2>
          <p>
            Vendor accounts require admin approval before listing products. Vendors are
            responsible for the accuracy of their listings, fulfilling orders, and complying
            with applicable consumer protection and product safety laws.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">4. Offers and pricing</h2>
          <p>
            KoboBuy allows buyers to submit price offers on eligible products. An offer becomes
            binding once a vendor accepts it (or a buyer accepts a vendor's counter-offer) and
            remains valid for a limited time window, after which it expires.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">5. Payments</h2>
          <p>
            Payments are processed through Paystack. KoboBuy does not store your full card
            details. Orders may be paid at checkout or, where offered, at the point of delivery
            — all payments are made through the KoboBuy platform.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">6. Returns and disputes</h2>
          <p>[Placeholder — define your return window, refund process, and dispute resolution steps here.]</p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">7. Limitation of liability</h2>
          <p>[Placeholder — standard liability limitation language goes here, reviewed by counsel.]</p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-neutral-900 mb-1">8. Contact</h2>
          <p>Questions about these terms can be sent to support@kobobuy.com.</p>
        </section>
      </div>
    </div>
  );
}
