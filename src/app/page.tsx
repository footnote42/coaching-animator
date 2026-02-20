import { Play, Users, Share2, Download, Shield, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// COPY VARIANTS — Hero Section (T028)
//
// Alt A — "The Grounded Coach" (ACTIVE — implemented below)
//   Headline:  "Draw your session. Your players will get it."
//   Sub:       "A simple tool for drawing rugby drills and plays. Move players
//               around the pitch, build up the action frame by frame, then
//               share a link with your squad."
//   CTA 1:     "Start drawing — no account needed"
//   CTA 2:     "See what others have shared"
//
// Alt B — "Saturday Coach"
//   Headline:  "Show your team exactly what you mean"
//   Sub:       "Stop describing it. Draw it. Build animated rugby plays in
//               minutes, then send a link to your team before the weekend."
//   CTA 1:     "Try it free — no account needed"
//   CTA 2:     "Browse the playbook"
//
// Alt C — "Grassroots Movement"
//   Headline:  "Rugby tactics, drawn by coaches like you"
//   Sub:       "A free tool for the rugby coaching community. Draw plays,
//               share sessions, and learn from what others have built."
//   CTA 1:     "Start drawing free"
//   CTA 2:     "Browse the community playbook"
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Play,
    title: 'Draw plays in motion',
    description: 'Place players on the pitch, add frames, and show how the play unfolds. Drag, move, repeat until it looks right.',
  },
  {
    icon: Users,
    title: 'Rugby Union, League & Touch',
    description: 'Pick your code and the right field appears — correct markings, correct dimensions. No setup required.',
  },
  {
    icon: Share2,
    title: 'Share a link with your squad',
    description: 'Send a link your players can open on their phones. No app download, no account needed on their end.',
  },
  {
    icon: Download,
    title: 'Export as a GIF',
    description: 'Download an animated GIF to drop in a WhatsApp group, a presentation, or wherever your team communicates.',
  },
  {
    icon: Shield,
    title: 'Works without internet',
    description: 'Use it on the touchline, in a changing room, wherever. No connection needed once the page has loaded.',
  },
  {
    icon: Zap,
    title: 'Free to use',
    description: 'No credit card, no trial period. Start drawing straight away as a guest. Create an account to save your work.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section — Alt A: The Grounded Coach */}
      <section className="bg-primary text-text-inverse">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Draw your session. Your players will get it.
            </h1>
            <p className="text-lg md:text-xl text-text-inverse/80 mb-8 max-w-2xl">
              A simple tool for drawing rugby drills and plays. Move players around the pitch, build up the action frame by frame, then share a link with your squad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent-warm text-white font-semibold text-lg hover:bg-accent-warm/90 transition-colors"
              >
                Start drawing — no account needed
              </a>
              <a
                href="/gallery"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-text-inverse/30 text-text-inverse font-semibold text-lg hover:bg-text-inverse/10 transition-colors"
              >
                See what others have shared
              </a>
            </div>
            <p className="mt-4 text-sm text-text-inverse/60">
              Free to use. Nothing to install.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-surface-warm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              Built by coaches, for coaches
            </h2>
            <p className="text-lg text-text-primary/70 max-w-2xl mx-auto">
              No steep learning curve. If you can drag a player onto a pitch, you can use this.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border p-6 hover:border-primary transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-primary/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
              From blank pitch to shared play in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-text-inverse text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Place your players</h3>
              <p className="text-sm text-text-primary/70">
                Drag attack players, defenders, a ball, and cones onto the pitch where you want them.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-text-inverse text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Build the movement</h3>
              <p className="text-sm text-text-primary/70">
                Add frames and reposition players to show how the play develops. Draw arrows for passing or running lines.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-text-inverse text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">Send the link</h3>
              <p className="text-sm text-text-primary/70">
                Share a link, export a GIF, or post to the gallery so other coaches can learn from it too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-text-inverse">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Give it a go
          </h2>
          <p className="text-lg text-text-inverse/80 mb-8 max-w-2xl mx-auto">
            Free to start. No account needed to try. Create an account when you want to save your work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/app"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-warm text-white font-semibold text-lg hover:bg-accent-warm/90 transition-colors"
            >
              Start drawing
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-text-inverse/30 text-text-inverse font-semibold text-lg hover:bg-text-inverse/10 transition-colors"
            >
              Create free account
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏉</span>
              <span className="font-heading font-semibold text-text-primary">Coaching Animator</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-primary/70">
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
              <a href="/sitemap-page" className="hover:text-primary transition-colors">Site Map</a>
            </div>
            <p className="text-sm text-text-primary/50">
              © {new Date().getFullYear()} Coaching Animator
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
