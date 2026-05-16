import Link from 'next/link';

export const metadata = {
  title: 'Progressions',
};

export default function ProgressionsHelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <div className="mb-6">
        <Link href="/help" className="text-primary hover:text-primary/80 font-medium transition-colors">
          ← Back to Help
        </Link>
      </div>

      <h1 className="text-3xl font-heading font-bold mb-4">Progressions</h1>

      <p className="mb-8 text-lg">
        A progression is a sequence of animations that build on each other — the same drill shown in increasing complexity. One animation acts as the <strong>base</strong> (the simplest version), and you attach up to <strong>5 progressions</strong> to it (P1 through P5). Coaches can step through each stage live during a session.
      </p>

      <p className="mb-8 p-4 bg-surface-warm border border-border">
        <strong>Example:</strong> &quot;Lineout – Pod Defence&quot;<br />
        Base → static pod positions &nbsp;·&nbsp;
        P1 → first defender moves &nbsp;·&nbsp;
        P2 → second defender rotates &nbsp;·&nbsp;
        P3 → full pattern with communication calls
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Creating your first progression set</h2>

        <h3 className="text-lg font-semibold mb-2">Step 1 — Save your base animation</h3>
        <p className="mb-4">
          Build the foundational version of your drill in the editor. Click <strong>Save to Cloud</strong>, give it a title, choose your type and visibility, and save. Do <em>not</em> tick &quot;Save as Progression&quot; — this animation is the foundation everything else will attach to.
        </p>

        <h3 className="text-lg font-semibold mb-2">Step 2 — Add the first progression</h3>
        <p className="mb-2">You have two ways to do this:</p>

        <p className="mb-1"><strong>From the editor (fastest):</strong></p>
        <p className="mb-4">
          After saving, the <strong>Progression Panel</strong> appears as a narrow bar above the canvas showing{' '}
          <code className="bg-surface-warm px-1">Base · + Add</code>.
          Click <strong>+ Add</strong>. The editor clones your current animation as P1 and switches to it automatically. Edit the canvas to show the next step of the drill, then save.
        </p>

        <p className="mb-1"><strong>From My Gallery:</strong></p>
        <p className="mb-4">
          Find your base animation card. Click the <strong>+</strong> icon in the bottom-right corner (tooltip: &quot;Add progression&quot;). You land in the editor with the base animation pre-loaded. Edit and save — the foundation is already selected in the save modal.
        </p>

        <h3 className="text-lg font-semibold mb-2">Step 3 — Save each progression</h3>
        <p className="mb-4">
          When the Save to Cloud modal opens on a progression, the title, tags, and animation type are inherited from the base. The title defaults to something like &quot;Pod Defence — Progression 1&quot; — you can change it. Click <strong>Save to Cloud</strong>. The Progression Panel updates to show the new step. Repeat to add P2, P3, and so on (maximum 5).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Attaching an existing animation to a foundation</h2>
        <p className="mb-3">
          If you already have several standalone animations and want to organise them into a progression set after the fact:
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Go to <strong>My Gallery</strong></li>
          <li>Open the <code className="bg-surface-warm px-1">···</code> menu on the animation you want to make a progression</li>
          <li>Click <strong>Link to Foundation</strong></li>
          <li>Select the base animation from the list</li>
          <li>Click <strong>Link Animation</strong></li>
        </ol>
        <p className="p-4 bg-surface-warm border border-border text-sm">
          <strong>Note:</strong> if the animation you are linking already has its own progressions attached to it, those child progressions will be detached. A warning is shown before you confirm.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Navigating progressions in the editor</h2>
        <p className="mb-3">
          When you open a saved base animation, the Progression Panel is visible at the top of the canvas. Click <strong>Base</strong> or any <strong>P1 / P2</strong> pill to load that version. If you have unsaved changes, a dialog will ask whether to discard them before switching.
        </p>
        <p className="mb-3">
          Drag the grip handle (<strong>⠿</strong>) on any progression pill to reorder the steps — the new order saves immediately.
        </p>
        <p className="p-4 bg-surface-warm border border-border text-sm">
          The <strong>+ Add</strong> button is disabled if the animation has not been saved to cloud yet, or if you have already reached the limit of 5 progressions.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Viewing progressions in the gallery</h2>
        <p>
          In both the public gallery and your personal gallery, base animations with progressions display a <strong>progression strip</strong> below the card — a compact row you can click to preview each step without leaving the gallery.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-heading font-bold mb-4">Quick reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold">What you want to do</th>
                <th className="text-left py-2 font-semibold">How</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-4">Start a progression set</td>
                <td className="py-2">Save base animation normally, then use + Add in the editor</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Add another step</td>
                <td className="py-2">Progression Panel → + Add, or My Gallery → + icon on the card</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Attach an existing animation</td>
                <td className="py-2">My Gallery → ··· → Link to Foundation</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Reorder steps</td>
                <td className="py-2">Drag the grip handle in the Progression Panel</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Remove a progression</td>
                <td className="py-2">Delete the animation from My Gallery</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Maximum progressions per base</td>
                <td className="py-2">5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
