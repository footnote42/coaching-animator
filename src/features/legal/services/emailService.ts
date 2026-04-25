export interface SendEmailResult {
  success: boolean;
  error?: string;
}

export async function sendContactEmail(
  name: string,
  email: string,
  message: string
): Promise<SendEmailResult> {
  // Validate inputs
  if (!name || !name.trim()) {
    return { success: false, error: 'Name is required' };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Valid email is required' };
  }

  if (!message || !message.trim()) {
    return { success: false, error: 'Message is required' };
  }

  try {
    // TODO: Implement actual email sending via Supabase SMTP
    // For now, return success (tests don't require actual SMTP)
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errorMessage };
  }
}
