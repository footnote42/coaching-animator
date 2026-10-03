/** Raw URL of the public Coaching Animator skill (skill/coaching-animator/SKILL.md). */
export const SKILL_RAW_URL =
  'https://raw.githubusercontent.com/footnote42/coaching-animator/main/skill/coaching-animator/SKILL.md';

/**
 * The text "Ask your AI to change this" copies: a ready-made prompt pointing at
 * the skill, then the current Practice Script. No model runs in the app (ADR 0004).
 */
export function buildAskAiPrompt(scriptJson: string): string {
  return [
    'Change this Coaching Animator Practice for me.',
    `First read the Coaching Animator skill at ${SKILL_RAW_URL} and follow it.`,
    'Return the whole changed Practice Script as one JSON code block, say in one line what you changed, and tell me how to paste it back into Coaching Animator.',
    '',
    'What I want changed:',
    '[Describe the change here]',
    '',
    'My current Practice Script:',
    '```json',
    scriptJson,
    '```',
  ].join('\n');
}
