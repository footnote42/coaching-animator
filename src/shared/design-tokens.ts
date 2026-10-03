/**
 * Design tokens for the Warm Tactical Professionalism aesthetic.
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

/**
 * Theme colours. Light is the default; dark applies under html[data-theme="dark"].
 * The values are applied through CSS variables in src/app/globals.css (keep the two in step).
 * Area / pitch colours are deliberately not here: they are the same in both themes.
 */
export const THEME_TOKENS = {
    light: {
        paper: '#F1EFE6',
        card: '#FBFAF4',
        cardWarm: '#EDE9DA',
        ink: '#1C2420',
        line: '#1C2420',
        pitch: '#1A3D1A',
        onPitch: '#F8F9FA',
        amber: '#D97706',
        inkSoft: '#4A524C',
        danger: '#B42318',
        dangerBg: '#FDECEA',
        success: '#1F6B36',
        successBg: '#E6F2E3',
        navCover: '#18120A',
    },
    dark: {
        paper: '#131A15',
        card: '#1B241E',
        cardWarm: '#222D26',
        ink: '#E9E6D8',
        line: '#8C9888',
        pitch: '#9CC795',
        onPitch: '#131A15',
        amber: '#F0A030',
        inkSoft: '#AEB2A4',
        danger: '#F28B82',
        dangerBg: '#3A1C1C',
        success: '#8FD19E',
        successBg: '#1C3324',
        navCover: '#0A0D0B',
    },
} as const;
