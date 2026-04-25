export const metadata = {
  title: 'Privacy Policy | Coaching Animator',
  description: 'Privacy Policy for Coaching Animator - Rugby Play Visualization Tool',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Privacy Policy</h1>

      <p className="text-text-primary/70 mb-8">Last updated: April 2026</p>

      <section className="mb-8 p-4 bg-blue-50 border-l-4 border-primary">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-2">No Telemetry, Analytics, or Tracking</h2>
        <p className="text-text-primary/80">
          <strong>We do not collect telemetry data, usage analytics, or advertising tracking.</strong> Your use of Coaching Animator
          is private. We do not monitor which plays you create, how long you use the service, or share your usage data with third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">1. What Personal Data We Collect</h2>
        <p className="text-text-primary/80 mb-4">We collect only the minimum data necessary to provide the Service:</p>

        <h3 className="text-lg font-semibold text-text-primary mb-2">Information you provide:</h3>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Email address (when you create an account)</li>
          <li>Display name (optional; for public gallery attribution)</li>
          <li>Animation content you create and save</li>
        </ul>

        <h3 className="text-lg font-semibold text-text-primary mb-2">Technical information (for service operation only):</h3>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>IP address (for rate limiting and abuse prevention; not logged long-term)</li>
          <li>Session authentication tokens (managed by Supabase, not stored locally by us)</li>
        </ul>

        <p className="text-text-primary/80 mb-4">
          <strong>What we explicitly do NOT collect:</strong>
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Usage analytics (which animations you view, which features you use)</li>
          <li>Device information (browser type, operating system, screen size)</li>
          <li>Behavioral tracking or user journey data</li>
          <li>Cookies for advertising or analytics purposes</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">2. OAuth Authentication</h2>
        <p className="text-text-primary/80 mb-4">
          We offer optional sign-in with Google as an alternative to email/password authentication.
        </p>
        <h3 className="text-lg font-semibold text-text-primary mb-2">What We Receive:</h3>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Your email address</li>
          <li>Your display name</li>
          <li>Your profile picture URL (optional)</li>
        </ul>
        <p className="text-text-primary/80 mb-4">
          We do NOT receive your Google password, calendar, contacts, or any other private data.
          We do NOT share your usage data with Google.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">2. How We Use Your Information</h2>
        <p className="text-text-primary/80 mb-4">We use your information to:</p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Provide and improve the Service</li>
          <li>Save and sync your animations across devices</li>
          <li>Display public content in the gallery</li>
          <li>Send important service updates</li>
          <li>Enforce our Terms of Service</li>
          <li>Protect against fraud and abuse</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">3. Data Storage & Residency</h2>
        <p className="text-text-primary/80 mb-4">
          <strong>Cloud Storage (Registered Users):</strong> Your data is stored on Supabase, which uses PostgreSQL databases
          hosted on cloud infrastructure in the <strong>US (us-east-1 region)</strong>. Data is encrypted in transit (TLS) and at rest.
        </p>
        <p className="text-text-primary/80 mb-4">
          <strong>Browser Storage (Guest Users):</strong> Guest users&apos; (Tier 0) animations are stored entirely in your browser's localStorage.
          This data is not transmitted to our servers unless you explicitly choose to save animations to the cloud by registering an account.
        </p>
        <p className="text-text-primary/80">
          <strong>Data Processors:</strong> Supabase is our primary data processor. We do not share your data with third-party analytics
          or marketing vendors.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">4. Data Sharing & Sales</h2>
        <p className="text-text-primary/80 mb-4">
          <strong>We do not sell, rent, or trade your personal data.</strong> We do not sell your data to advertisers, data brokers, or any third parties.
        </p>
        <p className="text-text-primary/80 mb-4">We may share data only in these limited circumstances:</p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li><strong>Service providers:</strong> Supabase (database and authentication hosting); they are contractually bound not to use your data for their own purposes</li>
          <li><strong>Law enforcement:</strong> Only if required by law, with a valid legal order</li>
          <li><strong>Public content:</strong> Your public gallery animations are visible to all users and licensed under CC-BY-SA 4.0</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">5. Your Rights</h2>
        <p className="text-text-primary/80 mb-4">You have the right to:</p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and associated data</li>
          <li>Export your animation data</li>
          <li>Withdraw consent for data processing</li>
        </ul>
        <p className="text-text-primary/80 mt-4">
          To exercise these rights, visit your account settings or <a href="/contact" className="text-primary hover:underline">contact us</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">6. Data Retention</h2>
        <p className="text-text-primary/80 mb-4">
          We retain your data for as long as your account is active. When you delete your account,
          we will delete your personal data within 30 days, except where we are required to retain
          it for legal purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">7. Cookies & Browser Storage</h2>
        <p className="text-text-primary/80 mb-4">
          <strong>Strictly Necessary Cookies:</strong> We use session cookies and localStorage only for:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Authentication (Supabase session tokens)</li>
          <li>Session recovery (so you remain logged in across page reloads)</li>
          <li>Guest animation storage (Tier 0 users' offline editing)</li>
        </ul>
        <p className="text-text-primary/80 mb-4">
          <strong>No Consent-Required Cookies:</strong> We do not use advertising, analytics, or tracking cookies.
          No banner is displayed because no cookie consent is required — all cookies are strictly necessary for core functionality.
        </p>
        <p className="text-text-primary/80">
          See our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> for details on how your data is stored and managed.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">8. Children&apos;s Privacy</h2>
        <p className="text-text-primary/80 mb-4">
          The Service is not intended for children under 13. We do not knowingly collect
          personal information from children under 13.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">9. Changes to This Policy</h2>
        <p className="text-text-primary/80 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes by email or through the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">10. Contact</h2>
        <p className="text-text-primary/80">
          If you have questions about this Privacy Policy, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
        </p>
      </section>
    </article>
  );
}
