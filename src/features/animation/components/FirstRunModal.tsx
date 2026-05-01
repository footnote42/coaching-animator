import React from 'react';

interface FirstRunModalProps {
  open: boolean;
  onDismiss: () => void;
}

export function FirstRunModal({ open, onDismiss }: FirstRunModalProps) {
  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 max-w-xs rounded-none border border-border bg-surface text-text-primary p-4">
      <h2 className="text-lg font-bold mb-2">Welcome to Coaching Animator</h2>
      <ul className="mt-2 space-y-2 text-sm list-disc list-inside mb-4">
        <li>Add players to the pitch — drag from the sidebar</li>
        <li>Move them per frame — click Add Frame to record each position</li>
        <li>Save and share — generate a link your squad can open on their phone</li>
      </ul>
      <button
        onClick={onDismiss}
        className="rounded-none bg-primary text-text-inverse text-sm font-medium w-full py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Got it
      </button>
    </div>
  );
}
