/**
 * User-friendly error message mapping.
 * Converts technical error codes and messages into helpful text for users.
 */

const ERROR_MAPPINGS: Record<string, string> = {
    // Auth errors
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',

    // Database errors
    '23505': 'This item already exists.', // Unique violation
    'PGRST116': 'The requested item could not be found.', // No rows returned for single()
    '42501': 'You do not have permission to perform this action.', // RLS violation

    // Application errors
    'FRAME_LIMIT_EXCEEDED': 'Animation exceeds the 50-frame limit.',
    'PAYLOAD_TOO_LARGE': 'Animation is too complex to save. Try simplifying it.',
    'RATE_LIMIT_EXCEEDED': 'You are doing that too fast. Please wait a moment.',
    'OFFLINE_SAVE_FAILED': 'Could not save to cloud. Queued for offline sync.',
};

/**
 * Get a user-friendly error message from an error object or string.
 */
export function getFriendlyErrorMessage(error: unknown): string {
    if (!error) return 'An unknown error occurred.';

    // If it's a string, check if it's a key in our mapping
    if (typeof error === 'string') {
        return ERROR_MAPPINGS[error] || error;
    }

    // Handle Error objects
    if (error instanceof Error) {
        // Check for Supabase error codes in the message or properties
        const message = error.message;

        // Check for specific substrings
        if (message.includes('Network request failed')) {
            return 'Please check your internet connection.';
        }

        // Try to match specific error codes if present in message
        for (const [code, userMsg] of Object.entries(ERROR_MAPPINGS)) {
            if (message.includes(code)) return userMsg;
        }

        return message;
    }

    // Handle objects with code/message properties (like Supabase errors)
    const errObj = error as any;
    if (errObj.code && ERROR_MAPPINGS[errObj.code]) {
        return ERROR_MAPPINGS[errObj.code];
    }
    if (errObj.message) {
        return errObj.message;
    }

    return 'An unexpected error occurred.';
}
