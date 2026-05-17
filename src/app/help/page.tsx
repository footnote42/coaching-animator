import Link from 'next/link';

export const metadata = {
  title: 'Help',
};

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <h1 className="text-3xl font-heading font-bold mb-8">Help & Documentation</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Core workflow</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Add entities</strong>: Drag players and equipment onto the pitch from the sidebar.</li>
          <li><strong>Set positions per frame</strong>: Move items to their starting positions, then click &quot;Add Frame&quot; to record each subsequent step of the drill or play.</li>
          <li><strong>Save</strong>: Ensure your work is saved to your account.</li>
          <li><strong>Share the link</strong>: Generate a link to share the animation with others.</li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">What&apos;s on the pitch</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Attacker</strong>: Red player tokens.</li>
          <li><strong>Defender</strong>: Blue player tokens.</li>
          <li><strong>Ball</strong>: White oval token.</li>
          <li><strong>Cone</strong>: High-vis yellow marker.</li>
          <li><strong>Tackle shield</strong>: Equipment for contact drills.</li>
          <li><strong>Tackle bag</strong>: Equipment for tackling practice.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Sharing</h2>
        <p className="mb-2">
          To share an animation, you must first save it to your account. Once saved, click the &quot;Share&quot; button to copy the unique link (e.g., <code>/share/[id]</code>).
        </p>
        <p>
          This link works perfectly in messaging apps like WhatsApp, allowing players to view the animation on their mobile devices without needing an account.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Progressions</h2>
        <p className="mb-4">
          Learn how to build multi-stage drills by linking animations into a progression set that coaches can step through live.
        </p>
        <Link href="/help/progressions" className="text-primary hover:text-primary/80 font-medium underline transition-colors">
          Read the Progressions guide
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Coaching framework</h2>
        <p className="mb-4">
          Learn how to design effective, engaging sessions using our grassroots-focused approach.
        </p>
        <Link href="/help/coaching" className="text-primary hover:text-primary/80 font-medium underline transition-colors">
          Read the APES Coaching Framework guide
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-heading font-bold mb-4">New to the app?</h2>
        <p className="mb-4">
          A step-by-step guide to all the main features — useful if you&apos;re testing the app for the first time.
        </p>
        <Link href="/help/how-to" className="text-primary hover:text-primary/80 font-medium underline transition-colors">
          Read the How-to guide
        </Link>
      </section>
    </div>
  );
}
