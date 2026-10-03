export const metadata = {
  title: 'Terms of service',
  description: 'Terms of service for Coaching Animator, the rugby coaching tool: how you may use the site and what to expect from us.',
};

const P = 'text-text-primary/80 mb-4';
const H2 = 'text-xl font-heading font-semibold text-text-primary mb-4';
const H3 = 'text-lg font-semibold text-text-primary mb-3';
const UL = 'list-disc pl-6 text-text-primary/80 space-y-2 mb-4';
const EMAIL = <a href="mailto:hello@waynetellis.com" className="text-primary hover:underline">hello@waynetellis.com</a>;

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Terms of Service</h1>

      <p className="text-text-primary/70 mb-8">Last updated: 3 October 2026</p>

      <section className="mb-8">
        <h2 className={H2}>1. Acceptance of Terms</h2>
        <p className={P}>
          Coaching Animator (&quot;the Service&quot;) is run by Wayne Ellis in the United Kingdom. By using the Service you
          agree to these Terms. If you do not agree, please do not use it. Our{' '}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> explains how we handle your data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>2. Description of Service</h2>
        <p className={P}>
          Coaching Animator is a free web app for rugby coaches to draw, animate and share coaching Practices: players,
          cones and a ball on a pitch or grid, their runs and passes, and Progressions that make the Practice harder step by
          step. A Practice can also be written as a Practice Script, so you can create one with your own AI assistant and
          import it.
        </p>
        <ul className={UL}>
          <li><strong>Guests</strong> can use the editor without an account. Their work stays in their own browser.</li>
          <li><strong>Coaches</strong> (signed-in users) can save Practices to their account, share them by link, and publish them to the public Gallery.</li>
          <li><strong>Viewers</strong> can watch shared and published Practices without an account.</li>
        </ul>
        <p className={P}>The core Service is free, with no adverts and no paid tiers.</p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>3. User Accounts</h2>
        <p className={P}>
          You can sign in with Google or with an email address and password. You are responsible for keeping your sign-in
          details safe and for activity on your account.
        </p>
        <ul className={UL}>
          <li>You must provide accurate information when creating an account</li>
          <li>You must be 18 or over to create an account, and you confirm this when you sign up. Players under 18 can use the editor as a Guest without an account</li>
          <li>One person per account; do not share your account</li>
          <li>Tell us straight away at {EMAIL} if you think someone else has used your account</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className={H2}>4. Content Ownership &amp; Licensing</h2>
        <h3 className={H3}>Your Practices</h3>
        <p className={P}>
          You retain full ownership of the Practices you create. Private Practices are seen only by you. Anyone with the
          link can view a Practice you share by link. You can copy the Practice Script of your own Practices, change or
          delete them at any time.
        </p>
        <h3 className={H3}>Publishing to the Gallery</h3>
        <p className={P}>
          When you publish a Practice to the Gallery, you give everyone permission to view it, and you license it under the{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Creative Commons Attribution-ShareAlike 4.0 licence (CC-BY-SA 4.0)
          </a>
          : other coaches may use and adapt it, as long as they credit you and share their version under the same
          licence. You can unpublish a Practice at any time; copies others have already made under the licence are not
          affected.
        </p>
        <h3 className={H3}>Practices based on someone else&apos;s work</h3>
        <p className={P}>
          You may turn a drill you have seen, for example in a video, into a Practice. Credit the original by adding it as the
          Practice&apos;s Source, and describe the drill in your own words: do not copy someone else&apos;s text, images or video.
        </p>
        <h3 className={H3}>No names or identifying details of players</h3>
        <p className={P}>
          Do not put the names or identifying details of players (for example full names, photos, shirt numbers with a team name,
          ages, schools or locations) in titles, descriptions, Commentary, or anywhere else in a Practice, especially one you publish.
          Use positions or roles such as &quot;scrum-half&quot; or &quot;attacker 1&quot; instead.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>5. Acceptable Use</h2>
        <p className={P}>Use the Service only for lawful purposes and in line with these Terms. Do not:</p>
        <ul className={UL}>
          <li>Try to gain unauthorised access to the Service or other people&apos;s accounts</li>
          <li>Interfere with or overload the Service, including through automated requests beyond normal use</li>
          <li>Impersonate others or misrepresent your affiliation with a club or organisation</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className={H2}>6. Prohibited Content &amp; Activities</h2>
        <p className={P}>The following are not allowed on Coaching Animator:</p>
        <ul className={UL}>
          <li>Illegal, harmful, hateful or offensive content</li>
          <li>Content that infringes someone else&apos;s copyright or other rights</li>
          <li>Advertising, spam or promotional content for commercial products or services</li>
          <li>Misleading or defamatory content</li>
          <li>Content that puts a child or young person at risk or could identify them</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className={H2}>7. Service Limits</h2>
        <p className={P}>
          To keep the Service fast and free, we limit how often you can make some requests (such as saving, reporting or
          sending feedback) and how large a Practice can be (for example the number of players and passes). The editor
          and the Practice Script guide tell you the current limits. We may change limits; we will not delete your saved
          Practices because a limit changed.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>8. Account Deletion &amp; Termination</h2>
        <p className={P}>
          You can delete your account from your profile page, or ask us to by email. We then delete your personal data and
          your Practices within 30 days, except where the law requires us to keep something. Copies others have made of
          Practices you published under CC-BY-SA 4.0 are not affected.
        </p>
        <p className={P}>
          We may hide or delete content, or suspend or close an account, if it breaks these Terms or puts others at risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>9. Limitation of Liability &amp; Disclaimer</h2>
        <p className={P}>
          The Service is provided free and &quot;as is&quot;, without warranties of any kind. We do not guarantee that it
          will be uninterrupted or error-free, so keep your own copy of anything important (you can copy the Practice Script
          of any of your Practices). You are responsible for the safety of any session you run; a Practice is an
          illustration, not a risk assessment. Nothing in these Terms limits liability that cannot be limited by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>10. No Advertising, Analytics, or Data Sales</h2>
        <ul className={UL}>
          <li>No advertisements or sponsored content</li>
          <li>No usage analytics or tracking</li>
          <li>We do not sell your personal data</li>
          <li>We do not use your Practices to train AI models</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className={H2}>11. Reporting Content &amp; Complaints</h2>
        <h3 className={H3}>Reporting content</h3>
        <p className={P}>
          If you see a published Practice that breaks these Terms, use the Report button on it and choose a reason:
          inappropriate, spam, copyright, safeguarding or other. Choose safeguarding if a child or young person
          may be identified or at risk. We review reports and can hide or delete content and suspend accounts.
          If someone is in immediate danger, contact the police on 999 rather than waiting for us.
        </p>
        <h3 className={H3}>Complaints</h3>
        <p className={P}>
          If you disagree with a decision we made about your content or account, or you are unhappy with how we handled a
          report, email {EMAIL} and tell us what happened. We aim to reply within 14 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>12. Changes to These Terms</h2>
        <p className={P}>
          We may update these Terms. We will change the date above and tell account holders by email about significant
          changes. Continuing to use the Service after a change means you accept the new Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>13. Governing Law &amp; Contact</h2>
        <p className={P}>
          These Terms are governed by the law of England and Wales. Questions about them: {EMAIL}.
        </p>
      </section>
    </article>
  );
}
