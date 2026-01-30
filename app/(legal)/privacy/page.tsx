export const metadata = {
  title: 'Privacy Policy | Coaching Animator',
  description: 'Privacy Policy for Coaching Animator - Rugby Play Visualization Tool',
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Privacy Policy</h1>
      
      <p className="text-text-primary/70 mb-8">Last updated: January 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">1. Information We Collect</h2>
        <p className="text-text-primary/80 mb-4">We collect information in the following ways:</p>
        
        <h3 className="text-lg font-semibold text-text-primary mb-2">Information you provide:</h3>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Email address when you create an account</li>
          <li>Display name (optional)</li>
          <li>Animation content you create and save</li>
          <li>Reports you submit about other content</li>
        </ul>

        <h3 className="text-lg font-semibold text-text-primary mb-2">Information collected automatically:</h3>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Usage data (pages visited, features used)</li>
          <li>Device information (browser type, operating system)</li>
          <li>IP address for rate limiting and security</li>
        </ul>
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
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">3. Data Storage</h2>
        <p className="text-text-primary/80 mb-4">
          Your data is stored securely using Supabase, which provides enterprise-grade security. 
          Animation data is stored in cloud databases with appropriate encryption and access controls.
        </p>
        <p className="text-text-primary/80">
          Guest users&apos; animations are stored locally in browser storage and are not transmitted to our servers 
          unless explicitly shared.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">4. Data Sharing</h2>
        <p className="text-text-primary/80 mb-4">We do not sell your personal information. We may share data with:</p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Service providers who help us operate the Service (e.g., hosting, analytics)</li>
          <li>Law enforcement when required by law</li>
          <li>Other users, when you make content public</li>
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
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">7. Cookies</h2>
        <p className="text-text-primary/80 mb-4">
          We use essential cookies for authentication and session management. We do not use 
          tracking cookies for advertising purposes.
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
