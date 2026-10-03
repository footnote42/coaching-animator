export const metadata = {
  title: 'Terms of service',
  description: 'Terms of service for Coaching Animator, the rugby play visualisation tool: how you may use the site and what to expect from us.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Terms of Service</h1>

      <p className="text-text-primary/70 mb-8">Last updated: May 2026</p>

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
          Coaching Animator is a cloud-based platform for rugby coaches to create, save, and share animated play diagrams.
          The Service provides tiered access, allowing users to work offline (Guest tier) or with cloud storage (Registered tiers).
        </p>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Tiered Access Model</h3>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li><strong>Tier 0 (Guest):</strong> Create and edit animations locally in your browser; no cloud storage; limited to 10 frames per animation</li>
          <li><strong>Tier 1 (Registered):</strong> Cloud storage for up to 50 animations; personal gallery; ability to make animations public</li>
          <li><strong>Tier 2 (Public Gallery):</strong> Create animations for display in the shared gallery; all public animations licensed under CC-BY-SA 4.0</li>
          <li><strong>Tier 3 (Admin):</strong> Moderation and content management (operators only)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">3. User Accounts</h2>
        <p className="text-text-primary/80 mb-4">
          To access certain features, you may need to create an account. You are responsible for maintaining the 
          confidentiality of your account credentials and for all activities under your account.
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>You must provide accurate information when creating an account</li>
          {/* REVIEW #51: wording */}
          <li>You must be 18 or over to create an account, and you confirm this when you sign up. Players under 18 can use the editor as a Guest without an account</li>
          <li>You are responsible for all activity on your account</li>
          <li>You must notify us immediately of any unauthorized use</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">4. Content Ownership & Licensing</h2>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Private Animations</h3>
        <p className="text-text-primary/80 mb-4">
          You retain full ownership of animations you create and keep private. You may download, export, or delete your private animations at any time.
        </p>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Public Gallery Animations (CC-BY-SA 4.0)</h3>
        <p className="text-text-primary/80 mb-4">
          When you choose to make an animation public in the Coaching Animator gallery, you agree that the animation is licensed under the
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Creative Commons Attribution-ShareAlike 4.0 License (CC-BY-SA 4.0)
          </a>.
          This means:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Other coaches may view, download, and use your animation</li>
          <li>Others may remix or adapt your animation to create new ones</li>
          <li>Any remix or adaptation must credit you as the original creator</li>
          <li>Any remix must also be shared under CC-BY-SA 4.0 (ShareAlike requirement)</li>
        </ul>
        {/* REVIEW #51: wording */}
        <h3 className="text-lg font-semibold text-text-primary mb-3">Publishing to the Gallery</h3>
        <p className="text-text-primary/80 mb-4">
          When you publish a Practice to the Gallery, you give everyone permission to view it. Once remixing is available,
          you also give other Coaches permission to remix it, as long as they credit you. You can unpublish a Practice at any time;
          copies others have already made under the licence above are not affected.
        </p>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Remixed Animations & Attribution</h3>
        <p className="text-text-primary/80 mb-4">
          If you remix another coach&apos;s animation, you must:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Credit the original creator in your animation&apos;s metadata or description</li>
          <li>Release your remix under CC-BY-SA 4.0</li>
          <li>Understand that others may remix your remix under the same license</li>
        </ul>
        {/* REVIEW #51: wording */}
        <h3 className="text-lg font-semibold text-text-primary mb-3">No names or identifying details of players</h3>
        <p className="text-text-primary/80 mb-4">
          Do not put the names or identifying details of players (for example full names, photos, shirt numbers with a team name,
          ages, schools or locations) in titles, descriptions, Commentary, or anywhere else in a Practice, especially one you publish.
          Use positions or roles such as &quot;scrum-half&quot; or &quot;attacker 1&quot; instead.
        </p>
        <p className="text-text-primary/80 mb-4">You agree not to upload content that:</p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Is illegal, harmful, or offensive</li>
          <li>Infringes on intellectual property rights (unless you own them)</li>
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
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">6. Prohibited Content & Activities</h2>
        <p className="text-text-primary/80 mb-4">
          The following are strictly prohibited on Coaching Animator:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Advertising or promotional content for commercial products/services</li>
          <li>Selling, trading, or bartering user data to third parties</li>
          <li>Paywalled content (all animations must be free to access)</li>
          <li>Misleading or defamatory content</li>
          <li>Content that violates laws or rights of others</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">7. Service Limits & Cloud Storage</h2>
        <p className="text-text-primary/80 mb-4">
          Cloud storage limits are applied per tier:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li><strong>Tier 0 (Guest):</strong> No cloud storage; browser-only editing; limited to 10 frames per animation</li>
          <li><strong>Tier 1 (Registered):</strong> 50 animations maximum in cloud storage</li>
          <li><strong>Tier 2 (Public Gallery):</strong> Same cloud limits as Tier 1; public animations visible to all users</li>
        </ul>
        <p className="text-text-primary/80">
          We reserve the right to modify these limits with 30 days notice. Exceeding limits does not result in automatic deletion;
          you will be notified and given time to manage your content.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">8. Account Termination & Data Deletion</h2>
        <p className="text-text-primary/80 mb-4">
          You may delete your account at any time through your account settings. When you delete your account:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2 mb-4">
          <li>Your personal data (email, name) will be deleted within 30 days</li>
          <li>Your private animations will be permanently deleted</li>
          <li>Your public animations will remain in the gallery under CC-BY-SA 4.0; others may continue to use them per the license</li>
        </ul>
        <p className="text-text-primary/80">
          We may suspend or terminate your account for violation of these Terms or for any other reason.
          Upon termination, access to cloud features will be revoked; you may still download your animations before deletion.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">9. Limitation of Liability & Disclaimer</h2>
        <p className="text-text-primary/80 mb-4">
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service
          will be uninterrupted, secure, or error-free. We are not liable for loss of data, business interruption, or other indirect damages.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">10. Changes to Terms</h2>
        <p className="text-text-primary/80 mb-4">
          We may update these Terms from time to time. We will notify users of significant changes (e.g., new fees, major privacy changes).
          Continued use of the Service after changes constitutes acceptance of the new Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">11. No Advertising, Analytics, or Data Sales</h2>
        <p className="text-text-primary/80 mb-4">
          In keeping with our commitment to coaches and students, Coaching Animator:
        </p>
        <ul className="list-disc pl-6 text-text-primary/80 space-y-2">
          <li>Does not display advertisements or promotional content</li>
          <li>Does not collect or share usage analytics with third parties</li>
          <li>Does not sell your personal data</li>
          <li>Does not use your animations for training AI models without explicit consent</li>
        </ul>
      </section>

      {/* REVIEW #51: wording (whole section, including the response time target) */}
      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">12. Reporting Content & Complaints</h2>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Reporting content</h3>
        <p className="text-text-primary/80 mb-4">
          If you see a published Practice that breaks these Terms, use the Report button on it and choose a reason:
          inappropriate, spam, copyright, safeguarding or other. Choose safeguarding if a child or young person
          may be identified or at risk. We review reports and can hide or delete content and suspend accounts.
          If someone is in immediate danger, contact the police on 999 rather than waiting for us.
        </p>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Complaints</h3>
        <p className="text-text-primary/80 mb-4">
          If you disagree with a decision we made about your content or account, or you are unhappy with how we handled a report,
          use the <a href="/contact" className="text-primary hover:underline">contact form</a> and tell us what happened.
          We aim to reply within 14 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">13. Contact</h2>
        <p className="text-text-primary/80">
          If you have questions about these Terms, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
        </p>
      </section>
    </article>
  );
}
