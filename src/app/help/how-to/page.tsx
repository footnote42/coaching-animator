import Link from 'next/link';

export const metadata = {
  title: 'How to use Coaching Animator',
  description: 'Step-by-step guide to building a rugby animation: place players, add frames, preview the movement, then save and share your play.',
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
          Coaching Animator lets you draw rugby drills and plays, animate movement frame by frame, and share them with your squad via a link. This guide walks you through all the main features.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-heading font-bold mb-4">Five things to try</h2>
          <ol className="space-y-6">
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">1. Draw a drill</h3>
              <p>Go to <strong>Create</strong>. Use the sidebar to add players, a ball, cones, or tackle equipment onto the pitch. Drag them into position. You can also draw arrows and lines to indicate movement or channels.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">2. Add frames and animate</h3>
              <p>Click <strong>Add Frame</strong> in the timeline. Move your entities to their next positions. Repeat for as many steps as your drill requires. Hit <strong>Play</strong> to preview the animation.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">3. Save to the cloud</h3>
              <p>Sign up or sign in (top right), then click <strong>Save to Cloud</strong>. Give your drill a title, add tags, and choose who can see it — Private, Link Only, or Public.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">4. Share a link</h3>
              <p>Once saved, use <strong>Share Animation</strong> in the toolbar to copy a link. The link opens a full-screen view that plays automatically — no account needed for the viewer.</p>
            </li>
            <li>
              <h3 className="text-lg font-heading font-semibold mb-1">5. Add a Progression</h3>
              <p>In <strong>My Playbook</strong>, open a saved drill and choose <strong>Add Progression</strong>. This creates a linked follow-up (e.g., same drill with a defensive variation). Coaches can step through progressions live during a session.</p>
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
            <li><strong>Home</strong> — landing page, public gallery preview</li>
            <li><strong>Gallery</strong> — browse all public drills from the community</li>
            <li><strong>My Playbook</strong> — your saved animations (requires sign-in)</li>
            <li><strong>Create</strong> — the animation editor</li>
            <li><strong>Help</strong> — this section</li>
            <li><strong>Profile</strong> — your profile, display name, club badge (requires sign-in)</li>
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
