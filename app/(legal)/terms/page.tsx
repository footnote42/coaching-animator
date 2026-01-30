export const metadata = {
  title: 'Terms of Service | Coaching Animator',
  description: 'Terms of Service for Coaching Animator - Rugby Play Visualization Tool',
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Terms of Service</h1>
      
      <p className="text-text-primary/70 mb-8">Last updated: January 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">1. Acceptance of Terms</h2>
        <p className="text-text-primary/80 mb-4">
          By accessing or using Coaching Animator (&quot;the Service&quot;), you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">2. Description of Service</h2>
        <p className="text-text-primary/80 mb-4">
          Coaching Animator is a web-based tool that allows users to create, save, and share animated rugby play diagrams. 
          The Service includes both free and registered user features.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">3. User Accounts</h2>
        <p className="text-text-primary/80 mb-4">
          To access certain features, you may need to create an account. You are responsible for maintaining the 
          confidentiality of your account credentials and for all activities under your account.
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>You must provide accurate information when creating an account</li>
          <li>You must be at least 13 years old to create an account</li>
          <li>You are responsible for all activity on your account</li>
          <li>You must notify us immediately of any unauthorized use</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">4. User Content</h2>
        <p className="text-text-primary/80 mb-4">
          You retain ownership of content you create. By making content public, you grant us a non-exclusive, 
          worldwide license to display and distribute that content through the Service.
        </p>
        <p className="text-text-primary/80 mb-4">You agree not to upload content that:</p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Is illegal, harmful, or offensive</li>
          <li>Infringes on intellectual property rights</li>
          <li>Contains spam or malicious content</li>
          <li>Violates the privacy of others</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">5. Acceptable Use</h2>
        <p className="text-text-primary/80 mb-4">
          You agree to use the Service only for lawful purposes and in accordance with these Terms. 
          You agree not to:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Attempt to gain unauthorized access to the Service</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Use the Service to send spam or unsolicited messages</li>
          <li>Impersonate others or misrepresent your affiliation</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">6. Service Limits</h2>
        <p className="text-text-primary/80 mb-4">
          Free registered accounts are limited to 50 saved animations. Guest users are limited to 10 frames per animation 
          and cannot save to the cloud. We reserve the right to modify these limits at any time.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">7. Termination</h2>
        <p className="text-text-primary/80 mb-4">
          We may suspend or terminate your account at any time for violation of these Terms or for any other reason. 
          You may delete your account at any time through your account settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">8. Disclaimer</h2>
        <p className="text-text-primary/80 mb-4">
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service 
          will be uninterrupted, secure, or error-free.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">9. Changes to Terms</h2>
        <p className="text-text-primary/80 mb-4">
          We may update these Terms from time to time. We will notify users of significant changes. 
          Continued use of the Service after changes constitutes acceptance of the new Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">10. Contact</h2>
        <p className="text-text-primary/80">
          If you have questions about these Terms, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
        </p>
      </section>
    </article>
  );
}
