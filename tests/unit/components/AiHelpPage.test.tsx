// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import AiHelpPage, { metadata } from '@/app/help/ai/page';

// Server pages rely on the automatic JSX runtime; the test transform needs React in scope.
(globalThis as { React?: typeof React }).React = React;

afterEach(cleanup);

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

describe('home page', () => {
  // Comments and the DESIGN_TOKENS identifier are code, not page text.
  const source = read('src/app/page.tsx').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/DESIGN_TOKENS|design-tokens/g, '');

  it('has no MCP, endpoint, token, JSON or repository wording', () => {
    for (const word of [/\bMCP\b/i, /endpoint/i, /token/i, /\bJSON\b/i, /repositor/i, /api\/mcp/i, /github\.com/i]) {
      expect(source).not.toMatch(word);
    }
  });

  it('keeps one plain line linking to /help/ai', () => {
    expect(source).toContain('Prefer to describe a drill?');
    expect(source).toContain('href="/help/ai"');
    expect(source).toContain('Your AI assistant can draw it for you');
  });
});

describe('/help/ai', () => {
  it('has page metadata', () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
  });

  it('carries the material moved off the home page', () => {
    const { container } = render(<AiHelpPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Using an AI assistant');
    expect(container.textContent).toContain('/api/mcp');
    expect(container.textContent).toContain('personal token');
    expect(container.textContent).toContain("can't publish or delete");
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/practice-script/v1/guide');
    expect(hrefs).toContain('/profile');
    expect(hrefs).toContain('https://github.com/footnote42/coaching-animator/tree/main/skill/coaching-animator');
  });

  it('is linked from the Help index and the profile token list', () => {
    expect(read('src/app/help/page.tsx')).toContain('href="/help/ai"');
    expect(read('src/app/profile/PersonalTokensList.tsx')).toContain('href="/help/ai"');
  });
});
