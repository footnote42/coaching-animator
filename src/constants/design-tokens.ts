/**
 * Design tokens for the Tactical Clubhouse aesthetic.
 */

export const DESIGN_TOKENS = {
    colors: {
        primary: '#1A3D1A',       // Pitch Green
        background: '#F8F9FA',    // Tactics White
        surface: '#FFFFFF',
        border: '#1A3D1A',
        textPrimary: '#1A3D1A',
        textInverse: '#F8F9FA',

        // Team colors
        attack: ['#2563EB', '#10B981', '#06B6D4', '#8B5CF6'],
        defense: ['#DC2626', '#EA580C', '#F59E0B', '#EF4444'],
        neutral: ['#FFFFFF', '#8B4513', '#FFD700', '#FF6B35'],  // White, brown leather, gold, orange
    },
    typography: {
        fontMono: "'JetBrains Mono', 'Fira Code', monospace",
        fontHeading: "'Inter', 'Helvetica Neue', sans-serif",
        fontBody: "'Inter', system-ui, sans-serif",
    },
    spacing: {
        unit: 4,
        borderRadius: 0,
        borderWidth: 1,
    },
} as const;
