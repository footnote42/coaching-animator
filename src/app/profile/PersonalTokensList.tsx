'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Copy } from 'lucide-react';
import { McpSetup } from './McpSetup';

interface Token {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export function PersonalTokensList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  
  // The plaintext token, shown exactly once
  const [newPlaintext, setNewPlaintext] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/user/tokens');
      if (!res.ok) throw new Error('Failed to fetch tokens');
      const data = await res.json();
      setTokens(data.tokens);
    } catch (err) {
      console.error(err);
      setError('Could not load your AI connections.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setNewPlaintext(null);
    setCopied(false);

    try {
      const res = await fetch('/api/user/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create token');
      
      setNewPlaintext(data.plaintext);
      setNewName('');
      await fetchTokens(); // refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokingId) return;
    setError(null);

    try {
      const res = await fetch(`/api/user/tokens/${revokingId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to revoke token');
      }
      setDialogOpen(false);
      setRevokingId(null);
      await fetchTokens(); // refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const copyToClipboard = () => {
    if (newPlaintext) {
      navigator.clipboard.writeText(newPlaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeTokens = tokens.filter(t => !t.revoked_at);
  const revokedTokens = tokens.filter(t => t.revoked_at);

  return (
    <div className="mt-8 bg-surface border border-border p-6">
      <h2 className="text-sm uppercase tracking-widest text-text-primary/60 mb-6">AI Connections</h2>
      <p className="text-sm text-text-primary/80 mb-6">
        Personal tokens let your AI (like Claude or ChatGPT) access your Practices via the MCP endpoint.
      </p>

      {error && (
        <div className="mb-6 p-3 bg-danger-surface border border-danger/40 rounded-none">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {newPlaintext && (
        <div className="mb-8 p-4 border border-success/40 bg-success-surface rounded-none">
          <h3 className="font-semibold text-success mb-2">Token created successfully</h3>
          <p className="text-sm text-success mb-4">
            Copy this token now. <strong>You won&apos;t see it again!</strong>
          </p>
          <div className="flex gap-2 items-center bg-surface p-2 border border-success/40">
            <code className="text-sm text-success break-all flex-1">{newPlaintext}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setNewPlaintext(null)}>
              Done
            </Button>
          </div>
        </div>
      )}

      <McpSetup token={newPlaintext} />

      <form onSubmit={handleCreate} className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label htmlFor="tokenName" className="block text-sm font-medium text-text-primary mb-1">
            New connection name
          </label>
          <input
            id="tokenName"
            type="text"
            required
            maxLength={50}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Claude Desktop"
            className="w-full px-3 py-2 border border-border rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <Button 
          type="submit" 
          disabled={creating || !newName.trim() || activeTokens.length >= 10}
        >
          {creating ? 'Creating...' : 'Create Token'}
        </Button>
      </form>

      {loading ? (
        <div className="text-sm text-text-primary/60">Loading connections...</div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium text-text-primary">Active Connections ({activeTokens.length}/10)</h3>
          {activeTokens.length === 0 ? (
            <p className="text-sm text-text-primary/60">No active AI connections.</p>
          ) : (
            <ul className="space-y-3">
              {activeTokens.map((token) => (
                <li key={token.id} className="flex justify-between items-center p-3 border border-border bg-background">
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-xs text-text-primary/60 mt-1">
                      Created: {new Date(token.created_at).toLocaleDateString()}
                      {' • '}
                      Last used: {token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  
                  <Dialog open={dialogOpen && revokingId === token.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setRevokingId(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-danger hover:bg-danger-surface hover:text-danger"
                        onClick={() => setRevokingId(token.id)}
                      >
                        Revoke
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Revoke AI Connection</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to revoke access for &quot;{token.name}&quot;? This action cannot be undone, and the token will immediately stop working.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button 
                          variant="destructive" 
                          onClick={handleRevoke}
                        >
                          Revoke Token
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </li>
              ))}
            </ul>
          )}

          {revokedTokens.length > 0 && (
            <div className="pt-6 mt-6 border-t border-border">
              <h3 className="font-medium text-text-primary mb-3">Revoked Connections</h3>
              <ul className="space-y-3">
                {revokedTokens.map((token) => (
                  <li key={token.id} className="flex justify-between items-center p-3 border border-border bg-surface-warm opacity-70">
                    <div>
                      <p className="font-medium line-through">{token.name}</p>
                      <p className="text-xs text-text-primary/60 mt-1">
                        Revoked: {new Date(token.revoked_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
