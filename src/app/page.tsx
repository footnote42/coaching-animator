import type { ReactNode } from 'react';
import HeroBackground from './_components/HeroBackground';
import HeroPractice from './_components/HeroPractice';
import GalleryTeaser from './_components/GalleryTeaser';
import { heroStep } from './_components/heroScript';
import { PracticeThumbnail } from '@/features/practice/components/PracticeThumbnail';
import { positionsAt } from '@/features/practice/engine';
import { DESIGN_TOKENS } from '@/shared/design-tokens';

export const dynamic = 'force-dynamic';

// Landing page tokens that the theme does not carry: pencil blue for coaching notes, dark ink for the amber button.
const LANDING_VARS = `
.landing { --landing-pencil: #3C5A8C; --landing-amber-ink: #1F1505; --landing-tape: rgba(222, 204, 140, 0.7); }
html[data-theme="dark"] .landing { --landing-pencil: #9DB6E0; --landing-amber-ink: #1A1103; --landing-tape: rgba(200, 186, 130, 0.35); }
`;

const { attack, defense } = DESIGN_TOKENS.colours;
const CHALK = '#F4F2E8';
const AMBER = '#D97706';

const BTN =
  'inline-flex min-h-[44px] items-center justify-center gap-2 border-2 border-border px-5 py-3 font-heading text-lg font-extrabold shadow-[3px_3px_0_var(--line)] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_var(--line)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_var(--line)]';
const BTN_PRIMARY = `${BTN} bg-accent-warm text-[color:var(--landing-amber-ink)]`;
const BTN_PLAIN = `${BTN} bg-surface text-text-primary`;

const EYEBROW = 'font-heading text-sm font-bold uppercase tracking-[0.1em] text-text-primary/70';
const H2 = 'font-heading text-3xl font-extrabold uppercase leading-none text-text-primary md:text-5xl';
const WRAP = 'mx-auto w-full max-w-6xl px-4 md:px-8';
const TAPE =
  "relative border-2 border-border bg-surface p-2.5 before:absolute before:-top-3 before:left-[18px] before:h-6 before:w-[86px] before:-rotate-[4deg] before:bg-[color:var(--landing-tape)] before:content-[''] after:absolute after:-top-3 after:right-[18px] after:h-6 after:w-[86px] after:rotate-[3deg] after:bg-[color:var(--landing-tape)] after:content-['']";

/** Small Area drawing for a How it works step. Marker colours come from the shared design tokens. */
function StepArt({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" className="h-auto w-full max-w-[260px] border-2 border-border bg-primary">
      <rect x="6" y="6" width="108" height="68" fill="none" stroke={CHALK} strokeWidth="1.2" opacity="0.7" />
      {children}
    </svg>
  );
}
const Dot = ({ cx, cy, fill }: { cx: number; cy: number; fill: string }) => (
  <circle cx={cx} cy={cy} r="6" fill={fill} stroke={CHALK} strokeWidth="1.4" />
);

const STEPS = [
  {
    title: 'Place your players',
    body: 'Pick an Area in metres and drop attackers, defenders, cones and the ball on the grid.',
    art: (
      <StepArt>
        <Dot cx={34} cy={56} fill={attack[0]} />
        <Dot cx={60} cy={58} fill={attack[0]} />
        <Dot cx={86} cy={60} fill={attack[0]} />
        <Dot cx={44} cy={24} fill={defense[0]} />
        <Dot cx={72} cy={24} fill={defense[0]} />
      </StepArt>
    ),
  },
  {
    title: 'Build the movement',
    body: 'Draw each run at a walk, jog or sprint. Passes fire when the receiver arrives. Add Progressions to make it harder.',
    art: (
      <StepArt>
        <path d="M34 56 L 34 40" stroke={CHALK} strokeWidth="1.6" strokeDasharray="3 3" fill="none" />
        <path d="M86 60 C 88 46, 92 30, 96 14" stroke={CHALK} strokeWidth="1.6" strokeDasharray="3 3" fill="none" />
        <path d="M36 40 L 84 46" stroke={AMBER} strokeWidth="2" fill="none" />
        <Dot cx={34} cy={40} fill={attack[0]} />
        <Dot cx={96} cy={14} fill={attack[0]} />
        <Dot cx={44} cy={30} fill={defense[0]} />
      </StepArt>
    ),
  },
  {
    title: 'Send the link',
    body: 'Players open it on their phone, full screen, and watch every Step with your coaching points.',
    art: (
      <StepArt>
        <rect x="40" y="14" width="40" height="54" fill="#FBFAF4" stroke="#1C2420" strokeWidth="1.6" />
        <rect x="45" y="20" width="30" height="22" fill="#2C6131" stroke="#1C2420" strokeWidth="0.8" />
        <path d="M54 34 L 60 26 L 66 30" stroke={CHALK} strokeWidth="1.4" fill="none" />
        <rect x="45" y="48" width="30" height="5" fill="#C9C6B8" />
        <rect x="45" y="56" width="20" height="5" fill="#C9C6B8" />
        <path d="M84 30 C 96 26, 100 18, 104 12" stroke={AMBER} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M98 12 L 104 12 L 104 18" stroke={AMBER} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </StepArt>
    ),
  },
];

export default function HomePage() {
  const step = heroStep();
  const finished = step ? positionsAt(step, 0).duration : 0;

  return (
    <main className="landing page-texture-lined text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: LANDING_VARS }} />

      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        <HeroBackground />
        <div className={`${WRAP} relative z-10 grid items-center gap-12 py-10 md:py-16 lg:grid-cols-[1.05fr_1fr]`}>
          <div className="grid min-w-0 gap-6">
            <p className={EYEBROW}>Rugby coaching, drawn and played</p>
            <h1
              id="hero-heading"
              className="font-heading text-5xl font-black uppercase leading-[0.92] tracking-tight text-text-primary sm:text-7xl lg:text-8xl"
            >
              Stop explaining. Start showing.
            </h1>
            <p className="max-w-[34ch] text-lg text-text-primary md:text-xl">
              Draw a Practice on a real-size Area, press play, and send your players the link. They see the move before
              they hit the pitch.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="/practice" className={BTN_PRIMARY}>
                Start drawing
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M3 9h11M10 4l5 5-5 5" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="square" />
                </svg>
              </a>
              <a href="/gallery" className={BTN_PLAIN}>
                Browse the Gallery
              </a>
            </div>
            <p className="text-[15px] text-text-primary/70">Free. No account needed to draw. Sign in to save and share.</p>
          </div>

          {step && (
            <div className="relative min-w-0 pb-4 lg:rotate-[1.2deg] lg:pb-0">
              <div className={TAPE}>
                <HeroPractice step={step} title="3 v 2 overlap" />
              </div>
              <p
                aria-hidden="true"
                className="font-hand mt-4 -rotate-2 text-2xl font-bold leading-tight text-[color:var(--landing-pencil)] lg:absolute lg:-bottom-12 lg:left-0 lg:mt-0 lg:text-[26px]"
              >
                draw the defender, then pass
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t-2 border-border py-14" aria-labelledby="how-heading">
        <div className={WRAP}>
          <div className="mb-8 grid max-w-[60ch] gap-2.5">
            <p className={EYEBROW}>How it works</p>
            <h2 id="how-heading" className={H2}>
              Three steps, one link
            </h2>
          </div>
          <ol className="grid list-none gap-8 p-0 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="grid min-w-0 content-start gap-2.5">
                <span aria-hidden="true" className="font-hand text-5xl leading-[0.8] text-[color:var(--landing-pencil)]">
                  {i + 1}
                </span>
                {s.art}
                <h3 className="font-heading text-xl font-extrabold leading-tight">{s.title}</h3>
                <p className="max-w-[34ch] text-text-primary/80">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI route */}
      <section className="border-t-2 border-border py-14" aria-labelledby="ai-heading">
        <div className={`${WRAP} grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]`}>
          <div className="grid min-w-0 gap-4">
            <p className={EYEBROW}>Or describe it to your AI</p>
            <h2 id="ai-heading" className={H2}>
              Say the drill. It lands in your account.
            </h2>
            <p className="max-w-[46ch]">
              Connect Claude or another AI once. Add the Coaching Animator skill so it knows how to write a Practice, and
              the MCP server so it can save one to your account. Then describe a drill, or give it a link to a coaching
              video, and it saves a private Practice to My Practices for you to check and share.
            </p>
            <ul className="grid max-w-[46ch] gap-1.5 pl-5 text-text-primary/80 [list-style:square]">
              <li>
                The skill is in the project repository under <code className="text-sm">skill/coaching-animator</code>.
              </li>
              <li>
                The MCP endpoint is <code className="text-sm">/api/mcp</code>. Create a personal token on your profile and
                the setup is shown there, ready to copy.
              </li>
              <li>
                The{' '}
                <a href="/practice-script/v1/guide" className="underline underline-offset-2">
                  Practice Script guide
                </a>{' '}
                is what your AI reads to get the format right.
              </li>
            </ul>
            <p className="text-[15px] text-text-primary/70">
              It can create and change your own Practices. It can&apos;t publish or delete anything.
            </p>
            <div>
              <a href="/profile" className={BTN_PLAIN}>
                Connect your AI
              </a>
            </div>
          </div>

          <div className="grid min-w-0 gap-3" role="group" aria-label="Example conversation">
            <div className="max-w-[46ch] justify-self-end border-2 border-border bg-background px-3.5 py-3">
              <span className="mb-1 block font-heading text-xs font-bold uppercase tracking-[0.08em] text-text-primary/70">
                Coach
              </span>
              Make me a 3 v 2 overlap Practice on 30 by 20 metres. Add a third defender as a Progression.
            </div>
            <div className="max-w-[46ch] border-2 border-border bg-surface px-3.5 py-3 shadow-[4px_4px_0_var(--line)]">
              <span className="mb-1 block font-heading text-xs font-bold uppercase tracking-[0.08em] text-text-primary/70">
                Your AI
              </span>
              Saved to My Practices as a private Practice, &ldquo;3 v 2 overlap&rdquo;, with one Progression.
              {step && (
                <div className="mt-2.5 flex items-center gap-2.5 border-t border-dashed border-border/40 pt-2.5 text-[15px]">
                  <PracticeThumbnail
                    step={step}
                    showMoves={false}
                    time={finished}
                    className="h-[50px] w-[74px] flex-none border border-border"
                  />
                  <span>Open it from My Practices, then check it and share the link.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="border-t-2 border-border py-14" aria-labelledby="gallery-heading">
        <div className={WRAP}>
          <div className="mb-8 grid max-w-[60ch] gap-2.5">
            <p className={EYEBROW}>From the Gallery</p>
            <h2 id="gallery-heading" className={H2}>
              Drawn by coaches like you
            </h2>
            <p>
              Every Practice in the Gallery was shared by a coach. Open one, watch every Step, then draw your own version
              for your squad.
            </p>
          </div>
          <GalleryTeaser />
          <div className="mt-6">
            <a href="/gallery" className={BTN_PLAIN}>
              See the whole Gallery
            </a>
          </div>
        </div>
      </section>

      {/* About: what the app is for (needed for Google sign-in verification) */}
      <section className="border-t-2 border-border py-12" aria-labelledby="about-heading">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
          <h2 id="about-heading" className="mb-4 font-heading text-2xl font-extrabold uppercase md:text-3xl">
            What is Coaching Animator?
          </h2>
          <p className="mb-4 text-text-primary/80">
            Coaching Animator is a free web app for rugby coaches. You draw a coaching Practice on a pitch, animate the
            players&apos; runs and passes, and share a link so players and co-coaches can watch it on their phones before
            training. Anyone can use the editor and browse the public Gallery without an account.
          </p>
          <p className="text-text-primary/80">
            You only need an account to save Practices and publish them. You can sign in with Google or with an email and
            password. If you choose Google, we use only your name and email address to create your account, and nothing
            else from your Google account. See our{' '}
            <a href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </a>{' '}
            for details.{' '}
            <a href="/register" className="underline underline-offset-2">
              Create a free account
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
