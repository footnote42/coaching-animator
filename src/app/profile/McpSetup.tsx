'use client';

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { CANONICAL_ORIGIN } from '@/lib/site-origin';

export const MCP_URL = `${CANONICAL_ORIGIN}/api/mcp`;
export const TOKEN_PLACEHOLDER = 'ca_pat_...';
export const SKILL_URL = 'https://github.com/footnote42/coaching-animator/tree/main/skill/coaching-animator';

export function buildClaudeCodeCommand(token: string | null): string {
  return `claude mcp add --scope user --transport http coaching-animator ${MCP_URL} --header "Authorization: Bearer ${token ?? TOKEN_PLACEHOLDER}"`;
}

export function buildJsonConfig(token: string | null): string {
  return JSON.stringify(
    {
      mcpServers: {
        'coaching-animator': {
          type: 'http',
          url: MCP_URL,
          headers: { Authorization: `Bearer ${token ?? TOKEN_PLACEHOLDER}` },
        },
      },
    },
    null,
    2
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <h4 className="text-sm font-medium text-text-primary">{label}</h4>
        <Button type="button" variant="outline" size="sm" onClick={copy} className="flex items-center gap-2">
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
          <span className="sr-only"> {label}</span>
        </Button>
      </div>
      <pre className="p-3 bg-white border border-border text-xs text-text-primary whitespace-pre-wrap break-all">
        <code>{text}</code>
      </pre>
    </div>
  );
}

/** Copy-ready MCP setup. Pass the plaintext token while it is on screen; otherwise a placeholder is shown. */
export function McpSetup({ token }: { token: string | null }) {
  return (
    <div className="mb-8 space-y-4" data-testid="mcp-setup">
      <h3 className="font-medium text-text-primary">Connect your AI</h3>
      <p className="text-sm text-text-primary/80">
        {token
          ? 'Your new token is filled in below. Copy one and you are connected.'
          : `Replace ${TOKEN_PLACEHOLDER} with a token you create above (it is shown only once).`}
      </p>
      <CopyBlock label="Claude Code command" text={buildClaudeCodeCommand(token)} />
      <CopyBlock label="JSON config for other MCP clients" text={buildJsonConfig(token)} />
      <p className="text-sm text-text-primary/80">
        This connection can create, read, update and list your own Practices. Nothing is published or deleted.{' '}
        <a href={SKILL_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          Get the skill
        </a>
        .
      </p>
    </div>
  );
}
