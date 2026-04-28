/**
 * getInitials
 * 
 * Derives a 1-2 character initial string from a display name or email.
 * - "Ken Hogan" -> "KH"
 * - "Ken" -> "K"
 * - null name, "ken@test.com" -> "K"
 * - null name, null email -> "?"
 */
export function getInitials(displayName: string | null, email: string | null): string {
  if (displayName && displayName.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (email && email.trim()) {
    return email.trim()[0].toUpperCase();
  }

  return "?";
}
