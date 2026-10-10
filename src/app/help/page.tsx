import Link from 'next/link';

export const metadata = {
  title: 'Help',
  description: 'Help for Coaching Animator: drawing a Practice, adding Progressions, and sharing it with players and coaches.',
};

const LINK_CLASS = 'text-primary hover:text-primary/80 font-medium underline transition-colors';

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <h1 className="text-3xl font-heading font-bold mb-8">Help & Documentation</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Core workflow</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Pick an Area</strong>: a square, a rectangle, half a pitch or a full pitch, sized in metres.</li>
          <li><strong>Place markers</strong>: attackers, defenders, a coach, the ball, cones, tackle shields and tackle bags. They snap to the grid.</li>
          <li><strong>Draw runs and passes</strong>: draw each player&apos;s run, choose its Pace, and add passes; each receiver is timed to meet the ball.</li>
          <li><strong>Add Progressions</strong>: each one changes the Step before it. You can say which STEP lever it pulls, or leave it blank.</li>
          <li><strong>Save and share</strong>: sign in to save, add Tags and a Source if you like, then send the link or publish to the Gallery.</li>
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
          <li><strong>Tackle shield</strong>: red equipment marker for contact work.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Tags and Source</h2>
        <p className="mb-2">
          When you save a Practice, pick up to five <strong>Tags</strong> from a fixed list (for example Attack, Support, Tackling or Decision making). Viewers use them to filter the Gallery.
        </p>
        <p>
          If the Practice is based on a video or web page, add it as the <strong>Source</strong>: a link (https only) and an optional title. Viewers see a <strong>Watch the original</strong> link under the Practice.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Sharing</h2>
        <p className="mb-2">
          Save a Practice to your account, then set who can see it: <strong>Private</strong> (only you), <strong>Anyone with the link</strong>, or <strong>Public</strong> (listed in the Gallery). You can change this at any time under My Practices. Please do not name or identify players in a public Practice.
        </p>
        <p className="mb-2">
          The link looks like <code>/p/[id]</code> and opens the share view on a phone in messaging apps like WhatsApp, so players can watch every Step without an account.
        </p>
        <p className="mb-2">
          In <strong>My Practices</strong>, the <strong>Share</strong> button on a link-shared or public Practice shares or copies its link. On a private Practice, tapping <strong>Share</strong> makes it link-shared and copies the link in one go.
        </p>
        <p>
          In the share view, <strong>Play all</strong> runs every Step in order, <strong>Previous Step</strong> and <strong>Next Step</strong> move between them, and <strong>Speed</strong> slows the play down. Open <strong>Commentary</strong> to see the coaching points, and use <strong>Share</strong> to send the link on. Anyone can use <strong>Report</strong> if a Practice should not be there.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Gallery and My Practices</h2>
        <p className="mb-2">
          The <Link href="/gallery" className={LINK_CLASS}>Gallery</Link> lists public Practices. Search by title, filter by Tag, and hover (or tap, on a phone) a card to preview it playing. Open a card to watch the whole Practice.
        </p>
        <p>
          <Link href="/my-practices" className={LINK_CLASS}>My Practices</Link> lists everything you have saved. Open one to edit it, change who can see it, or delete it. You need to be signed in.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Signing in</h2>
        <p>
          You can try the editor without an account; your work stays on your device. To save, share or publish, <Link href="/login" className={LINK_CLASS}>sign in</Link> with Google or an email and password, or <Link href="/register" className={LINK_CLASS}>create an account</Link>. Your device Practice can then be saved to your account.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Progressions</h2>
        <p className="mb-4">
          A Progression makes the previous Step harder by changing Space, Time, Equipment or People. Edits to an earlier Step carry forward to every later one.
        </p>
        <Link href="/help/progressions" className={LINK_CLASS}>
          Read the Progressions guide
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Writing a Practice Script</h2>
        <p className="mb-4">
          A Practice Script is the written form of a Practice. Write one by hand or have any AI assistant write it from your description, then paste it into the editor. The guide has the rules, worked examples and a prompt you can copy.
        </p>
        <Link href="/practice-script/v1/guide" className={LINK_CLASS}>
          Read the Practice Script guide
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Using an AI assistant</h2>
        <p className="mb-4">
          Your AI assistant can draw a drill from your description and save it to your account. The guide explains how to connect it.
        </p>
        <Link href="/help/ai" className={LINK_CLASS}>
          Read the AI assistant guide
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Coaching framework</h2>
        <p className="mb-4">
          Learn how to design effective, engaging sessions using our grassroots-focused approach.
        </p>
        <Link href="/help/coaching" className={LINK_CLASS}>
          Read the APES Coaching Framework guide
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">New to the app?</h2>
        <p className="mb-4">
          A step-by-step guide to the editor, useful if you&apos;re trying it for the first time.
        </p>
        <Link href="/help/how-to" className={LINK_CLASS}>
          Read the How-to guide
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-heading font-bold mb-4">Something not right?</h2>
        <p>
          Tell us on the <Link href="/feedback" className={LINK_CLASS}>Feedback</Link> page.
        </p>
      </section>
    </div>
  );
}
