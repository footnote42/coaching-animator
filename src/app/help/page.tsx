import Link from 'next/link';

export const metadata = {
  title: 'Help',
  description: 'Help for Coaching Animator: drawing a Practice, adding Progressions, and sharing it with players and coaches.',
};

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <h1 className="text-3xl font-heading font-bold mb-8">Help & Documentation</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Core workflow</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Pick an Area</strong>: a square, a rectangle, half a pitch or a full pitch, sized in metres.</li>
          <li><strong>Place markers</strong>: attackers, defenders, a coach, the ball, cones and tackle shields. They snap to the grid.</li>
          <li><strong>Draw runs and passes</strong>: draw each player&apos;s run, choose its Pace, and add passes that fire when the receiver arrives.</li>
          <li><strong>Add Progressions</strong>: each one changes the Step before it by pulling one STEP lever.</li>
          <li><strong>Save and share</strong>: sign in to save, then send the link or publish to the Gallery.</li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">What&apos;s on the pitch</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Attacker</strong>: blue player marker.</li>
          <li><strong>Defender</strong>: red player marker.</li>
          <li><strong>Coach</strong>: amber marker.</li>
          <li><strong>Ball</strong>: white oval, carried by a player.</li>
          <li><strong>Cone</strong>: high-vis yellow marker.</li>
          <li><strong>Tackle shield</strong>: equipment for contact work.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Sharing</h2>
        <p className="mb-2">
          Save a Practice to your account, then set who can see it: only you, anyone with the link, or everyone in the Gallery. The link looks like <code>/p/[id]</code>.
        </p>
        <p>
          The link opens on a phone in messaging apps like WhatsApp, so players can watch every Step without an account.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Progressions</h2>
        <p className="mb-4">
          A Progression makes the previous Step harder by changing Space, Time, Equipment or People. Edits to an earlier Step carry forward to every later one.
        </p>
        <Link href="/help/progressions" className="text-primary hover:text-primary/80 font-medium underline transition-colors">
          Read the Progressions guide
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Writing a Practice Script</h2>
        <p className="mb-4">
          A Practice Script is the written form of a Practice. Write one by hand or have any AI assistant write it from your description, then paste it into the editor. The guide has the rules, worked examples and a prompt you can copy.
        </p>
        <Link href="/practice-script/v1/guide" className="text-primary hover:text-primary/80 font-medium underline transition-colors">
          Read the Practice Script guide
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
          A step-by-step guide to the editor, useful if you&apos;re trying it for the first time.
        </p>
        <Link href="/help/how-to" className="text-primary hover:text-primary/80 font-medium underline transition-colors">
          Read the How-to guide
        </Link>
      </section>
    </div>
  );
}
