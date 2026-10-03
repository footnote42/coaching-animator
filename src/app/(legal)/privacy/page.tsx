export const metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for Coaching Animator, the rugby coaching tool: what data we store, why, and how you can control it.',
};

const P = 'text-text-primary/80 mb-4';
const H2 = 'text-xl font-heading font-semibold text-text-primary mb-4';
const H3 = 'text-lg font-semibold text-text-primary mb-2';
const UL = 'list-disc pl-6 text-text-primary/80 space-y-2 mb-4';

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Privacy Policy</h1>

      <p className="text-text-primary/70 mb-8">Last updated: 3 October 2026</p>

      <section className="mb-8 p-4 bg-blue-50 border-l-4 border-primary">
        <h2 className="text-lg font-heading font-semibold text-text-primary mb-2">No Telemetry, Analytics, or Tracking</h2>
        <p className="text-text-primary/80">
          <strong>We do not collect telemetry data, usage analytics, or advertising tracking.</strong> We do not monitor
          which Practices you create or view, or how long you use the service, and we do not share usage data with anyone.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>1. Who We Are</h2>
        <p className={P}>
          Coaching Animator (<a href="https://coaching-animator.waynetellis.com" className="text-primary hover:underline">coaching-animator.waynetellis.com</a>)
          is a free tool for rugby coaches to draw, animate and share coaching Practices. It is run by Wayne Ellis, an
          individual based in the United Kingdom, who is the data controller for the personal data described here.
          Contact: <a href="mailto:hello@waynetellis.com" className="text-primary hover:underline">hello@waynetellis.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>2. What Personal Data We Collect</h2>
        <p className={P}>We collect only what is needed to run the service.</p>
        <h3 className={H3}>When you create an account</h3>
        <ul className={UL}>
          <li>Email address</li>
          <li>Your name, shown as your display name on Practices you publish (you can change it)</li>
          <li>A password, if you sign up with email (stored only as a secure hash by our authentication provider)</li>
          <li>The date you confirmed you are 18 or over</li>
        </ul>
        <h3 className={H3}>What you create</h3>
        <ul className={UL}>
          <li>The Practices you save, with their titles, descriptions, Tags and Source links</li>
          <li>Reports you make about a Practice, and feedback you send through the feedback form</li>
        </ul>
        <h3 className={H3}>Technical information</h3>
        <ul className={UL}>
          <li>Your IP address, used only to limit request rates and prevent abuse; it is not kept long-term</li>
          <li>Session cookies that keep you signed in (see section 9)</li>
        </ul>
        <p className={P}>
          <strong>What we explicitly do NOT collect:</strong> usage analytics, device or browser fingerprints, behavioural
          tracking, or advertising cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>3. Signing In with Google</h2>
        <p className={P}>
          You can sign in with your Google account instead of an email and password. If you do, Google shares the
          following with us, and only after you agree on Google&apos;s consent screen:
        </p>
        <ul className={UL}>
          <li>Your email address</li>
          <li>Your name</li>
          <li>A link to your Google profile picture</li>
        </ul>
        <p className={P}>
          <strong>How we use it:</strong> your email address identifies your account and lets us contact you about it;
          your name becomes your display name; your profile picture link is stored by our authentication provider with
          your account. We use this data only to sign you in and run your account.
        </p>
        <p className={P}>
          We do not request access to your Gmail, Google Drive, Calendar, Contacts or any other Google data, and we never
          receive your Google password. We do not sell Google user data, use it for advertising, share it with anyone
          except our service providers listed below, or use it to train AI models.
        </p>
        <p className={P}>
          Coaching Animator&apos;s use and transfer of information received from Google APIs adheres to the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="text-primary hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p className={P}>
          You can remove Coaching Animator&apos;s access at any time from your{' '}
          <a href="https://myaccount.google.com/permissions" className="text-primary hover:underline" rel="noopener noreferrer" target="_blank">
            Google account permissions
          </a>
          . Deleting your Coaching Animator account deletes the Google data we hold (see section 7).
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>4. How We Use Your Information</h2>
        <ul className={UL}>
          <li>To create and run your account and keep you signed in</li>
          <li>To save your Practices and show them to you on any device</li>
          <li>To show Practices you choose to publish in the public Gallery, with your display name</li>
          <li>To send emails about your account, such as confirming your address or resetting your password</li>
          <li>To review reports and feedback, enforce our Terms of Service and protect against abuse</li>
        </ul>
        <p className={P}>
          Our lawful bases under UK GDPR are performance of our agreement with you (running your account) and our
          legitimate interest in keeping the service safe.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>5. Data Storage &amp; Residency</h2>
        <p className={P}>
          <strong>Accounts:</strong> your account and Practices are stored by Supabase in the European Union
          (Frankfurt, Germany), encrypted in transit and at rest.
        </p>
        <p className={P}>
          <strong>Guests:</strong> if you use the editor without signing in, your work stays in your browser and is not sent
          to us unless you sign in and save it.
        </p>
        <h3 className={H3}>Service providers</h3>
        <ul className={UL}>
          <li><strong>Supabase</strong>: database and sign-in</li>
          <li><strong>Vercel</strong>: hosts the website</li>
          <li><strong>Cloudflare</strong>: domain and network security</li>
          <li><strong>Resend</strong>: sends account emails (your email address only)</li>
        </ul>
        <p className={P}>Each processes data only to provide its service to us.</p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>6. Data Sharing &amp; Sales</h2>
        <p className={P}>
          <strong>We do not sell, rent, or trade your personal data.</strong> We share it only with the service providers
          above, when required by law, and as public content: Practices you publish are visible to everyone.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>7. Data Retention &amp; Deletion</h2>
        <p className={P}>
          We keep your data while your account is active. You can delete your account from your profile page, or ask us
          to by email. We then delete your personal data, including any data received from Google, within 30 days,
          except where the law requires us to keep it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>8. Your Rights</h2>
        <p className={P}>
          You can access, correct, export or delete your data, and object to or restrict how we use it. Use your profile
          page or email <a href="mailto:hello@waynetellis.com" className="text-primary hover:underline">hello@waynetellis.com</a>.
          You can also complain to the UK Information Commissioner&apos;s Office (ico.org.uk).
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>9. Cookies &amp; Browser Storage</h2>
        <p className={P}>
          We only set cookies and use on-device storage that the Service needs to work. Nothing else is set.
        </p>
        <h3 className={H3}>Cookies set when you sign in</h3>
        <p className={P}>
          Signing in sets Supabase session cookies, whose names start with <code>sb-</code>. They keep you signed in
          between page loads and are removed when you sign out or they expire. They are not set for Guests.
        </p>
        <h3 className={H3}>On-device storage for Guests</h3>
        <p className={P}>
          If you use the editor without signing in, your work is kept in your browser&apos;s localStorage under the key{' '}
          <code>practice.device</code>. It stays on your device and is not sent to us. You can clear it at any time
          from your browser settings.
        </p>
        <h3 className={H3}>No consent banner</h3>
        <p className={P}>
          We do not show a cookie consent banner because we set no non-essential cookies: no analytics, advertising or tracking.
          Strictly necessary cookies are exempt from the consent requirement in the Privacy and Electronic Communications
          Regulations (PECR). If that ever changes, we will ask for your consent first.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>10. Children&apos;s Privacy</h2>
        <p className={P}>
          Accounts are for people aged 18 or over, and we ask you to confirm this when you sign up.
          We do not knowingly collect personal information from anyone under 18. Players under 18 can use the editor as a Guest,
          where their work stays on their own device. If you believe a child has an account, please email{' '}
          <a href="mailto:hello@waynetellis.com" className="text-primary hover:underline">hello@waynetellis.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>11. Changes to This Policy</h2>
        <p className={P}>
          We will update the date above when this policy changes, and tell account holders by email about significant changes.
        </p>
      </section>
    </article>
  );
}
