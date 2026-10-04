import Link from 'next/link';

export const metadata = {
  title: 'How to use Coaching Animator',
  description: 'Step-by-step guide to drawing a rugby Practice: pick an Area, place markers, draw runs and passes, add Progressions, then save and share.',
};

export default function HowToPage() {
  return (
    <div className="page-texture-lined min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
        <div className="mb-6">
          <Link href="/help" className="inline-flex items-center min-h-[44px] text-primary hover:text-primary/80 font-medium transition-colors">
            ← Back to Help
          </Link>
        </div>

        <h1 className="text-3xl font-heading font-bold mb-4">How to Use Coaching Animator</h1>

        <p className="mb-8 text-lg">
          Coaching Animator lets you draw a rugby Practice, animate it, build it up with Progressions, and share it with your squad via a link. This guide walks you through the main features.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-heading font-bold mb-4">Five things to try</h2>
          <ol className="space-y-6">
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">1. Draw the base Step</h3>
              <p>Go to <strong>Create</strong>. Choose an <strong>Area</strong> template, then pick a marker (attacker, defender, ball, cone, tackle shield or coach) and tap the Area to place it. Use <strong>Select and drag</strong> to move markers; they snap to the grid. <strong>Undo</strong> and <strong>Redo</strong> are in the toolbar.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">2. Draw runs and passes</h3>
              <p>Use <strong>Draw a run</strong>: tap a player, then tap cells to draw the path. Select the player to set its <strong>Pace</strong> (walk, jog or sprint). Use <strong>Add a pass</strong>: tap the player with the ball, then the receiver, and the pass fires when the receiver arrives. Press Play under the Area to watch it, and turn on <strong>Ghost mode</strong> to see where markers started.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">3. Add a Progression</h3>
              <p>Choose <strong>Add Progression</strong> and pick the STEP lever it pulls: Space, Time, Equipment or People. Then change the Step and add a coaching point saying why it is harder. Edits to an earlier Step carry forward.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">4. Save</h3>
              <p>Sign in, give the Practice a title, pick up to five <strong>Tags</strong> and add a <strong>Source</strong> link if it came from a video or page, then choose <strong>Save</strong>. When you open a saved Practice the button reads <strong>Save changes</strong>. It appears in <strong>My Practices</strong>. Until you sign in, your work is kept on this device.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">5. Share a link</h3>
              <p>Set the Practice to <strong>Anyone with the link</strong> or <strong>Public</strong> and send the link. It opens the share view, with no account needed for the viewer: <strong>Play all</strong> runs every Step, <strong>Previous Step</strong> and <strong>Next Step</strong> move between them, <strong>Speed</strong> slows it down and <strong>Commentary</strong> shows your coaching points. Public Practices also appear in the Gallery, where <strong>Share</strong> sends the link on.</p>
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-heading font-bold mb-4">What to look for</h2>
          <p className="mb-4">
            If you&apos;re testing the app, note anything that:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Doesn&apos;t do what you&apos;d expect</li>
            <li>Looks wrong or is hard to read</li>
            <li>Is missing — something you&apos;d want but can&apos;t find</li>
            <li>Breaks or throws an error</li>
            <li>Works well and should stay exactly as it is</li>
          </ul>
          <p className="mt-4">
            Use the Feedback page to send your observations — no need to write a formal report, just tell us what you noticed.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-heading font-bold mb-4">Where everything lives</h2>
          <ul className="space-y-2">
            <li><strong>Home</strong> — landing page</li>
            <li><strong>Gallery</strong> — browse Practices that Coaches have published, search by title and filter by Tag</li>
            <li><strong>My Practices</strong> — your saved Practices (requires sign-in)</li>
            <li><strong>Create</strong> — the Practice editor</li>
            <li><strong>Help</strong> — this section</li>
            <li><strong>Feedback</strong> — tell us what you noticed</li>
            <li><strong>Profile</strong> — your account and your AI connections (requires sign-in)</li>
          </ul>
        </section>

        <div className="p-4 bg-surface-warm border border-border">
          <p className="font-medium mb-2">Found something to report?</p>
          <Link
            href="/feedback"
            className="inline-block px-5 py-2.5 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Send Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
