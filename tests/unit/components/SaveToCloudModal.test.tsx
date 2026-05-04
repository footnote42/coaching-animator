// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SaveToCloudModal } from '@/shared/components/SaveToCloudModal';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-x" />,
  Loader2: () => <div data-testid="icon-loader" />,
  Cloud: () => <div data-testid="icon-cloud" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
}));

// Mock api-client
vi.mock('@/lib/api-client', () => ({
  postWithRetry: vi.fn(),
  putWithRetry: vi.fn(),
  getWithRetry: vi.fn(() => Promise.resolve({ ok: true, data: { animations: [] } })),
}));

// Mock offline-queue
vi.mock('@/lib/offline-queue', () => ({
  offlineQueue: {
    addItem: vi.fn(),
  },
}));

import { postWithRetry, putWithRetry } from '@/lib/api-client';

describe('SaveToCloudModal', () => {
  const mockProps = {
    projectName: 'Test Project',
    payload: { version: '1.0', frames: [] },
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders overwrite option when isEditMode is true', () => {
    render(<SaveToCloudModal {...mockProps} isEditMode={true} animationId="123" />);
    
    expect(screen.getByText('Overwrite Original')).toBeDefined();
    expect(screen.getByText('Save as New Copy')).toBeDefined();
  });

  it('calls PUT when overwriting original', async () => {
    vi.mocked(putWithRetry).mockResolvedValue({ ok: true, status: 200, data: { id: '123' } });

    render(<SaveToCloudModal {...mockProps} isEditMode={true} animationId="123" />);
    
    const saveBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Save to Cloud'))!;
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(putWithRetry).toHaveBeenCalledWith(
        '/api/animations/123',
        expect.objectContaining({ title: 'Test Project' }),
        expect.any(Object)
      );
    });

    expect(mockProps.onSuccess).toHaveBeenCalledWith('123');
  });

  it('calls POST when saving as new copy in edit mode', async () => {
    vi.mocked(postWithRetry).mockResolvedValue({ ok: true, status: 201, data: { id: 'new-456' } });

    render(<SaveToCloudModal {...mockProps} isEditMode={true} animationId="123" />);
    
    // Select Save as New Copy
    const saveAsNewRadio = screen.getByRole('radio', { name: /Save as New Copy/i });
    fireEvent.click(saveAsNewRadio);

    const saveBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Save to Cloud'))!;
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(postWithRetry).toHaveBeenCalledWith(
        '/api/animations',
        expect.objectContaining({ title: 'Test Project' }),
        expect.not.objectContaining({ method: 'PUT' })
      );
    });

    expect(mockProps.onSuccess).toHaveBeenCalledWith('new-456');
  });
});
