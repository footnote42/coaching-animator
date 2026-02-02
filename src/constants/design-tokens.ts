/**
 * Design tokens for the Warm Tactical Professionalism aesthetic. (Force reload)
 */

export const DESIGN_TOKENS = {
    colours: {
        primary: '#1A3D1A',           // Pitch Green
        background: '#F8F9FA',        // Tactics White
        surface: '#FFFFFF',
        surfaceWarm: '#F9FAFB',       // Warm surface alternative
        border: '#1A3D1A',
        textPrimary: '#111827',       // Deep charcoal for enhanced contrast
        textInverse: '#F8F9FA',
        accentWarm: '#D97706',        // Warm amber accent

        // Team colours - refined for better contrast on green pitch
        attack: ['#3B82F6', '#22C55E', '#06B6D4', '#8B5CF6'],  // Blue, Green, Cyan, Purple
        defense: ['#EF4444', '#F97316', '#FBBF24', '#EC4899'],  // Red, Orange, Amber, Pink
        neutral: ['#FFFFFF', '#8B4513', '#FACC15', '#F97316'],  // White, Ball Brown, Cone Yellow, Vibrant Orange

        // Annotation colour (tactical yellow - high visibility)
        annotation: '#FACC15',
    },
    // Backwards compatibility property (will remove after fixing refs)
    colors: {
        primary: '#1A3D1A',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        surfaceWarm: '#F9FAFB',
        border: '#1A3D1A',
        textPrimary: '#111827',
        textInverse: '#F8F9FA',
        accentWarm: '#D97706',
        attack: ['#3B82F6', '#22C55E', '#06B6D4', '#8B5CF6'],
        defense: ['#EF4444', '#F97316', '#FBBF24', '#EC4899'],
        neutral: ['#FFFFFF', '#8B4513', '#FACC15', '#F97316'],
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
