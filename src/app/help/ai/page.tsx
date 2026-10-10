import Link from 'next/link';

export const metadata = {
  title: 'Using an AI assistant',
  description: 'Connect Claude or another AI assistant to Coaching Animator so it can draw a drill from your description and save it to My Practices.',
};

const LINK_CLASS = 'text-primary hover:text-primary/80 font-medium underline transition-colors';
const SKILL_URL = 'https://github.com/footnote42/coaching-animator/tree/main/skill/coaching-animator';

export default function AiHelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-text-primary">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center min-h-[44px] text-primary hover:text-primary/80 font-medium transition-colors">
          ← Back to Help
        </Link>
      </div>

      <h1 className="text-3xl font-heading font-bold mb-4">Using an AI assistant</h1>

      <p className="mb-8 text-lg">
        Describe a drill, or give your AI assistant a link to a coaching video, and it can draw the Practice and save it to your account. It stays private until you check it and share it yourself.
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">What it can do</h2>
        <p className="mb-4">
          Connect Claude or another AI once. Add the Coaching Animator skill so it knows how to write a Practice, and the MCP server so it can save one to your account. Then ask for what you want, for example:
        </p>
        <p className="mb-4 p-4 bg-surface-warm border border-border">
          Make me a 3 v 2 overlap Practice on 30 by 20 metres. Add a third defender as a Progression.
        </p>
        <p className="mb-4">
          The Practice is saved to <Link href="/my-practices" className={LINK_CLASS}>My Practices</Link> as a private Practice. Open it from there, check it, and share the link.
        </p>
        <p>
          It can create and change your own Practices. It can&apos;t publish or delete anything.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">Set it up</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Create a personal token under AI Connections on your <Link href="/profile" className={LINK_CLASS}>Profile</Link> page. The setup for Claude Code, and for any other MCP client, is shown there with your token already in it, ready to copy.
          </li>
          <li>
            Add the{' '}
            <a href={SKILL_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              Coaching Animator skill
            </a>{' '}
            from the project repository on GitHub, so your AI writes valid Practice Scripts.
          </li>
          <li>Ask your AI to draw a drill.</li>
        </ol>
        <p className="mt-4">
          The MCP endpoint your AI connects to is <code>/api/mcp</code>. Keep your token private: whoever holds it can change your Practices. You can revoke it at any time from your Profile page.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-heading font-bold mb-4">The Practice Script guide</h2>
        <p className="mb-4">
          The Practice Script is the written form of a Practice, in JSON. The guide is what your AI reads to get the format right. It also has worked examples and a prompt you can copy, if you would rather paste a script into the editor yourself.
        </p>
        <Link href="/practice-script/v1/guide" className={LINK_CLASS}>
          Read the Practice Script guide
        </Link>
      </section>

      <Link href="/profile" className="inline-block px-5 py-2.5 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 transition-colors">
        Connect your AI
      </Link>
    </div>
  );
}
