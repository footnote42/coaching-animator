/**
 * Design tokens for the Warm Tactical Professionalism aesthetic.
 */

export const DESIGN_TOKENS = {
    colors: {
        primary: '#1A3D1A',           // Pitch Green
        background: '#F8F9FA',        // Tactics White
        surface: '#FFFFFF',
        surfaceWarm: '#F9FAFB',       // Warm surface alternative
        border: '#1A3D1A',
        textPrimary: '#111827',       // Deep charcoal for enhanced contrast
        textInverse: '#F8F9FA',
        accentWarm: '#D97706',        // Warm amber accent

        // Team colors - refined for better contrast on green pitch
        attack: ['#3B82F6', '#22C55E', '#06B6D4', '#8B5CF6'],  // Blue, Green, Cyan, Purple
        defense: ['#EF4444', '#F97316', '#FBBF24', '#EC4899'],  // Red, Orange, Amber, Pink
        neutral: ['#FFFFFF', '#92400E', '#FCD34D', '#FB923C'],  // White, Brown (ball), Gold (cone), Orange

        // Annotation color (tactical yellow - high visibility)
        annotation: '#FACC15',
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
