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

        // Team colours - refined for better contrast on green pitch (Standardized to vibrant sports tones)
        attack: ['#2563EB', '#16A34A', '#0891B2', '#7C3AED'],  // Vibrant Blue, Green, Cyan, Purple
        defense: ['#DC2626', '#EA580C', '#D97706', '#DB2777'], // Vibrant Red, Safety Orange, Amber, Pink
        neutral: ['#FFFFFF', '#78350F', '#E6EA0C', '#FB923C'], // White, Deep Brown (Ball), High-Vis Yellow (Cone), Bright Orange

        // Annotation colour (tactical yellow - high visibility)
        annotation: '#E6EA0C',
    },
    // Backwards compatibility property
    colors: {
        primary: '#1A3D1A',
        background: '#F8F9FA',
        surface: '#FFFFFF',
        surfaceWarm: '#F9FAFB',
        border: '#1A3D1A',
        textPrimary: '#111827',
        textInverse: '#F8F9FA',
        accentWarm: '#D97706',
        attack: ['#2563EB', '#16A34A', '#0891B2', '#7C3AED'],
        defense: ['#DC2626', '#EA580C', '#D97706', '#DB2777'],
        neutral: ['#FFFFFF', '#78350F', '#E6EA0C', '#FB923C'],
        annotation: '#E6EA0C',
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
