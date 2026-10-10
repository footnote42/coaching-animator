export const metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for Coaching Animator, the rugby coaching tool: what data we store, why, and how you can control it.',
};

const P = 'text-text-primary/80 mb-4';
const H2 = 'text-xl font-heading font-semibold text-text-primary mb-4';
const H3 = 'text-lg font-semibold text-text-primary mb-2';
const UL = 'list-disc pl-6 text-text-primary/80 space-y-2 mb-4';
const EMAIL = <a href="mailto:hello@waynetellis.com" className="text-primary hover:underline">hello@waynetellis.com</a>;

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Privacy Policy</h1>

      <p className="text-text-primary/70 mb-8">Last updated: 10 October 2026</p>

      <section className="mb-8 p-4 bg-surface-warm border-l-4 border-primary">
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
          individual based in the United Kingdom. He is the data controller for the personal data described here.
          Contact: {EMAIL}.
        </p>
        {/* MAINTAINER: confirm you are happy being named as the controller, and whether you need to pay the ICO data protection fee (use the ICO self-assessment; some individuals running a free hobby service may be exempt). */}
      </section>

      <section className="mb-8">
        <h2 className={H2}>2. What Personal Data We Collect</h2>
        <p className={P}>We collect only what we need to run the service.</p>
        <h3 className={H3}>When you create an account</h3>
        <ul className={UL}>
          <li>Your email address</li>
          <li>A display name, if you give one. It is shown on Practices you publish, and you can change it</li>
          <li>A password, if you sign up with email. Our authentication provider stores only a secure hash of it</li>
          <li>The date you confirmed you are 18 or over</li>
        </ul>
        <h3 className={H3}>What you create</h3>
        <ul className={UL}>
          <li>The Practices you save, with their titles, descriptions, Tags and Source links</li>
          <li>Personal tokens, if you make any for AI assistant access. We keep the token&apos;s name, when it was made, when it was last used and whether it is revoked. The token itself is stored only as a hash, so we cannot read it back</li>
          <li>Reports you make about a Practice. We store who made the report, the reason and any details you wrote</li>
          <li>Feedback you send through the feedback form: the message, plus the name and email you give us. If you were signed in, it is linked to your account</li>
        </ul>
        <h3 className={H3}>Technical information</h3>
        <ul className={UL}>
          <li>Rate-limit keys. To stop abuse, we count requests against a key made from your account ID, or from your IP address if you are signed out. These counters are deleted after 2 days, or straight away when you delete your account</li>
          <li>Session cookies that keep you signed in (see section 9)</li>
          <li>Our hosting and security providers keep their own short-term request logs, which include IP addresses (see section 5)</li>
        </ul>
        <p className={P}>
          <strong>What we do not collect:</strong> usage analytics, behavioural tracking, or advertising cookies. We do not
          profile you. Our security provider, Cloudflare, protects the site from attacks and abuse (see section 9). It is
          there for security, and we do not use it to track you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>3. Signing in with Google</h2>
        <p className={P}>
          You can sign in with your Google account instead of an email and password. You do this on Google&apos;s own
          sign-in page. If you do, Google shares the following with us, and only after you agree on Google&apos;s consent screen:
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
          Our sign-in and sign-up pages do not load any Google code. If that ever changes, we will say so here first.
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
        <h2 className={H2}>4. Why We Use Your Information</h2>
        <p className={P}>UK GDPR says we need a lawful basis for each use. These are ours.</p>
        <h3 className={H3}>Contract: running your account</h3>
        <ul className={UL}>
          <li>Creating your account and keeping you signed in</li>
          <li>Saving your Practices and showing them to you on any device</li>
          <li>Showing Practices you choose to publish in the public Gallery, or share by link, with your display name</li>
          <li>Sending emails about your account, such as confirming your address or resetting your password</li>
          <li>Personal tokens you create for AI assistant access</li>
        </ul>
        <h3 className={H3}>Legitimate interests: keeping the service safe</h3>
        <ul className={UL}>
          <li>Rate limiting, by IP address or account ID, to stop abuse and keep the service free for everyone</li>
          <li>Reading reports and feedback, hiding or deleting Practices, and banning accounts under our Terms of Service</li>
          <li>Keeping the date of your 18+ confirmation, so we can show that we ask for it</li>
          <li>Security checks run by Cloudflare and our hosting provider</li>
        </ul>
        <p className={P}>
          We think these uses are fair and low-impact. You can object to them (see section 8).
        </p>
        {/* MAINTAINER: issue #185 item 6. Confirm the mapping of purposes to lawful bases above (especially feedback handling, moderation records and the 18+ record as legitimate interests), and that you are content with a short legitimate interests assessment on file. */}
      </section>

      <section className="mb-8">
        <h2 className={H2}>5. Where Your Data Is Stored and Who Handles It</h2>
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
          <li><strong>Supabase</strong>: database and sign-in. Data is held in the EU</li>
          <li><strong>Vercel</strong>: hosts the website and runs our code. It handles requests, including IP addresses, and keeps short-term request logs. Vercel is a US company and may process data in the US</li>
          <li><strong>Resend</strong>: sends account emails such as confirmations and password resets. It receives your email address. Resend is a US company and may process data in the US</li>
          <li><strong>Cloudflare</strong>: our domain, network and security layer. Requests pass through it, so it sees IP addresses and keeps short-term logs of its own. It operates worldwide, including in the US</li>
        </ul>
        <p className={P}>
          Each processes data only to provide its service to us. Where data goes to a country without a UK adequacy
          decision, the provider relies on standard contractual clauses approved for transfers from the UK, or the UK
          extension to the EU standard contractual clauses.
        </p>
        {/* MAINTAINER: issue #185 items 7 and 8. (a) Confirm the actual transfer safeguard for Vercel, Resend and Cloudflare (standard contractual clauses with the UK extension, or the UK-US data bridge if they are certified) and name it here. (b) Confirm Resend really is the SMTP sender; it is set in the Supabase dashboard, not in the repo. (c) Confirm you have accepted each provider's data processing terms. (d) Add the providers' log retention periods if you want to be specific. */}
      </section>

      <section className="mb-8">
        <h2 className={H2}>6. Data Sharing &amp; Sales</h2>
        <p className={P}>
          <strong>We do not sell, rent, or trade your personal data.</strong> We share it only with the service providers
          above, when the law requires it, and as public content: Practices you publish are visible to everyone, with your
          display name. Other users cannot read your profile. Only your display name is visible, and only next to your
          published Practices.
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>7. How Long We Keep Your Data</h2>
        <ul className={UL}>
          <li><strong>Account data and Practices:</strong> until you delete your account.</li>
          <li><strong>Rate-limit counters:</strong> 2 days. Counters tied to your account are deleted when you delete it.</li>
          <li><strong>Provider request logs</strong> (Vercel, Cloudflare): the short periods those providers set.</li>
        </ul>
        <p className={P}>
          You can delete your account yourself with <strong>Delete my account</strong> on your profile page, or ask us to by
          email. Deletion is immediate in our database. It removes your account, your Practices, your personal tokens and
          your rate-limit counters, including any data received from Google.
        </p>
        <p className={P}>
          Some things stay, with your details removed. Feedback you sent keeps its message but loses your name, email
          and account link. Reports you made keep their reason but lose the details you wrote and your identity.
          This lets us still act on what was reported.
        </p>
        <p className={P}>
          Our database provider keeps backups for a limited time. Your data ages out of them on the provider&apos;s
          schedule. We do not restore deleted accounts from backups. We keep nothing for longer than this unless the law
          requires it.
        </p>
        {/* MAINTAINER: confirm the Supabase backup retention for this project (it depends on the plan; state the number of days here if you want to be exact), and that "immediate" holds for the delete route in production. */}
      </section>

      <section className="mb-8">
        <h2 className={H2}>8. Your Rights</h2>
        <p className={P}>Under UK GDPR you can:</p>
        <ul className={UL}>
          <li><strong>See and take your data.</strong> Use <strong>Download my data</strong> on your profile page. It gives you a file with your account details, Practices, token names and reports. For anything else, such as feedback you sent, email us.</li>
          <li><strong>Delete it.</strong> Use <strong>Delete my account</strong> on your profile page (see section 7).</li>
          <li><strong>Correct it.</strong> Change your display name on your profile page, or email us for anything else.</li>
          <li><strong>Object</strong> to uses based on our legitimate interests, or ask us to restrict how we use your data. Email us.</li>
        </ul>
        <p className={P}>
          Email {EMAIL} for anything you cannot do yourself. We reply within one month.
        </p>
        <p className={P}>
          If you are unhappy with how we handle your data, please tell us first. You can also complain to the UK
          Information Commissioner&apos;s Office at{' '}
          <a href="https://ico.org.uk/make-a-complaint/" className="text-primary hover:underline" rel="noopener noreferrer" target="_blank">
            ico.org.uk/make-a-complaint
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className={H2}>9. Cookies &amp; Browser Storage</h2>
        <p className={P}>
          We only set cookies and use on-device storage that the site needs to work or to stay secure. We set no
          analytics, advertising or tracking cookies.
        </p>
        <h3 className={H3}>Cookies</h3>
        <ul className={UL}>
          <li><strong>Sign-in cookie.</strong> When you sign in, Supabase sets a session cookie whose name starts with <code>sb-</code>. It keeps you signed in between page loads and is removed when you sign out or it expires. It is not set for Guests.</li>
          <li><strong>Cloudflare security.</strong> If Cloudflare sees traffic that looks like an attack, it may show a security check and set its own short-lived security cookie. It is used for security only.</li>
        </ul>
        <h3 className={H3}>Storage on your device</h3>
        <p className={P}>These stay in your browser and are not sent to us. You can clear them from your browser settings.</p>
        <ul className={UL}>
          <li><code>practice.device</code> (localStorage): your work, if you use the editor without signing in.</li>
          <li><code>ca-theme</code> (localStorage): your light or dark theme choice.</li>
          <li><code>nav_mru_v1</code> (localStorage): the order of the navigation tabs, so the ones you use most come first.</li>
          <li><code>ca_share_show_commentary</code> (sessionStorage): whether you chose to show Commentary on a shared Practice. It is cleared when you close the tab.</li>
          <li>The sign-in library may also keep your session in localStorage, under keys starting with <code>sb-</code>.</li>
        </ul>
        <h3 className={H3}>No consent banner</h3>
        <p className={P}>
          We do not show a cookie consent banner because we set no non-essential cookies. Cookies and storage that are
          strictly necessary for the service, or for its security, are exempt from the consent requirement in the Privacy and
          Electronic Communications Regulations (PECR). If that ever changes, we will ask for your consent first.
        </p>
        {/* MAINTAINER: issues #179 and #185 item 1. Check in a real browser which cookie names Cloudflare sets, and name them here. Check the storage key list is complete before each release. Confirm you are content to rely on the PECR "strictly necessary" exemption for the Cloudflare cookie, or turn JS Detections off and delete that bullet. */}
      </section>

      <section className="mb-8">
        <h2 className={H2}>10. Children&apos;s Privacy</h2>
        <p className={P}>
          Accounts are for people aged 18 or over. Every sign-up route, email or Google, asks you to confirm this, and we
          keep the date you did. We do not knowingly collect personal information from anyone under 18. Players under 18
          can use the editor as a Guest, where their work stays on their own device. If you believe a child has an
          account, please email {EMAIL}.
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
