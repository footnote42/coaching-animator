import Link from 'next/link';

export const metadata = {
  title: 'Progressions',
  description: 'How Progressions build a Practice from a simple base Step to a harder, game-realistic version by pulling one STEP lever at a time.',
};

const LEVERS = [
  { name: 'Space', example: 'Narrow the channel or shorten the Area.' },
  { name: 'Time', example: 'Ask for a quicker release or a faster Pace.' },
  { name: 'Equipment', example: 'Add tackle shields or change the cone layout.' },
  { name: 'People', example: 'Add a defender or take a support player away.' },
];

export default function ProgressionsHelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center min-h-[44px] text-primary hover:text-primary/80 font-medium transition-colors">
          ← Back to Help
        </Link>
      </div>

      <h1 className="text-3xl font-heading font-bold mb-4">Progressions</h1>

      <p className="mb-6 text-lg">
        A Practice is a chain of Steps. Step 0 is the base. Every later Step is a <strong>Progression</strong>: the previous Step plus one change that stretches players further.
      </p>

      <p className="mb-8 p-4 bg-surface-warm border border-border">
        <strong>Example:</strong> a passing square<br />
        Base: a passing pattern &nbsp;·&nbsp;
        Progression 1: crossovers &nbsp;·&nbsp;
        Progression 2: add a defender
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Pick a lever</h2>
        <p className="mb-4">
          Each Progression pulls one STEP lever, with a coaching point saying why the Step is harder.
        </p>
        <ul className="space-y-2">
          {LEVERS.map((lever) => (
            <li key={lever.name}>
              <strong>{lever.name}</strong>: {lever.example}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Edits carry forward</h2>
        <p>
          A Progression stores only its change, so when you fix the base Step every later Step picks up the fix. You never copy a Practice to make a harder version of it.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Using it in a session</h2>
        <p>
          On the shared link, step forwards and backwards through the Progressions, or press <strong>Play all</strong> to run them in order. A match play is simply a Practice with no Progressions.
        </p>
      </section>

      <Link href="/practice" className="inline-block px-5 py-2.5 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors">
        Open the editor
      </Link>
    </div>
  );
}
