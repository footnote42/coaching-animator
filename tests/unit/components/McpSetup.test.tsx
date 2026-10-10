// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { McpSetup, MCP_URL, TOKEN_PLACEHOLDER, SKILL_URL } from '@/app/profile/McpSetup';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('McpSetup', () => {
  it('fills the new token and the production URL into the command and JSON config', () => {
    render(<McpSetup token="ca_pat_secret123" />);
    const setup = screen.getByTestId('mcp-setup');
    expect(setup.textContent).toContain(
      `claude mcp add --scope user --transport http coaching-animator ${MCP_URL} --header "Authorization: Bearer ca_pat_secret123"`
    );
    expect(setup.textContent).toContain('"Authorization": "Bearer ca_pat_secret123"');
    expect(setup.textContent).toContain(`"url": "${MCP_URL}"`);
    expect(MCP_URL).toBe('https://coaching-animator.waynetellis.com/api/mcp');
    expect(setup.textContent).not.toContain(TOKEN_PLACEHOLDER);
  });

  it('shows a placeholder instead of the token once the plaintext is gone', () => {
    render(<McpSetup token={null} />);
    const setup = screen.getByTestId('mcp-setup');
    expect(setup.textContent).toContain(`Bearer ${TOKEN_PLACEHOLDER}`);
    expect(setup.textContent).toContain(MCP_URL);
    expect(setup.textContent).not.toContain('ca_pat_secret');
  });

  it('says what the connection allows and links to the skill', () => {
    render(<McpSetup token={null} />);
    expect(screen.getByText(/create, read, update and list your own Practices/)).toBeTruthy();
    expect(screen.getByText(/Nothing is published or deleted/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Get the skill' }).getAttribute('href')).toBe(SKILL_URL);
  });

  it('copies each block with its own Copy button', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<McpSetup token="ca_pat_abc" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    fireEvent.click(buttons[0]);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toMatch(/^claude mcp add .*Bearer ca_pat_abc"$/);

    fireEvent.click(buttons[1]);
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(JSON.parse(writeText.mock.calls[1][0]).mcpServers['coaching-animator'].headers.Authorization).toBe(
      'Bearer ca_pat_abc'
    );
  });
});
