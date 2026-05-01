import Link from 'next/link';

export const metadata = {
  title: 'Coaching Framework',
};

export default function CoachingFrameworkPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <div className="mb-6">
        <Link href="/help" className="text-primary hover:text-primary/80 font-medium transition-colors">
          ← Back to Help
        </Link>
      </div>

      <h1 className="text-3xl font-heading font-bold mb-6">The APES Framework</h1>
      
      <p className="mb-8 text-lg">
        APES stands for Active, Purposeful, Enjoyable, and Safe. It&apos;s the minimum standard for grassroots rugby coaching. When you&apos;re running a session, keeping your players moving, learning, and smiling while staying safe is everything. Here is how to apply the APES framework when designing your drills in Coaching Animator.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-heading font-bold mb-3">Active</h2>
        <p className="mb-2">
          Keep players moving. Minimise standing around waiting in lines. If a drill has too much downtime, break it into smaller groups or add more stations.
        </p>
        <p className="p-4 bg-surface-warm border border-border">
          <strong>In the Animator:</strong> Set up multiple identical stations side-by-side using the grid. Show how two groups can run the same handling drill simultaneously to maximize reps.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-heading font-bold mb-3">Purposeful</h2>
        <p className="mb-2">
          Every drill needs a clear goal. Don&apos;t just run drills for the sake of it. Make sure players know what skill they are practicing and how it applies to a game situation.
        </p>
        <p className="p-4 bg-surface-warm border border-border">
          <strong>In the Animator:</strong> Use the text annotation tool to label the key coaching points. For example, add a note saying &quot;Square hips before passing&quot; right where the player catches the ball.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-heading font-bold mb-3">Enjoyable</h2>
        <p className="mb-2">
          Rugby is a game, so make it fun. Include game-like scenarios, small-sided games, or friendly competitions to keep engagement high.
        </p>
        <p className="p-4 bg-surface-warm border border-border">
          <strong>In the Animator:</strong> Design game-based scenarios rather than unopposed line-running. Add a defender or two to a handling drill to force decision-making and make it a realistic challenge.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-3">Safe</h2>
        <p className="mb-2">
          Physical safety is non-negotiable. Ensure correct technique, especially in contact, and match players appropriately by size and skill level.
        </p>
        <p className="p-4 bg-surface-warm border border-border">
          <strong>In the Animator:</strong> Use tackle bags and shields for contact progressions. Map out safe spacing between groups to prevent accidental collisions during high-intensity drills.
        </p>
      </section>

      <div className="pt-6 border-t border-border">
        <Link 
          href="/gallery" 
          className="inline-block px-6 py-3 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
        >
          Browse the gallery for APES-aligned drills
        </Link>
      </div>
    </div>
  );
}
