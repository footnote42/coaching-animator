/**
 * Gallery Feature Module
 *
 * Public API for the gallery feature.
 * This module provides components for displaying animation collections
 * in both personal and public gallery views.
 *
 * @module features/gallery
 */

// ============================================================================
// Gallery Components
// ============================================================================

/**
 * AnimationCard - Personal gallery card component
 * Displays an animation in the user's personal gallery with edit/delete controls
 */
export { AnimationCard } from './components/AnimationCard';

/**
 * PublicAnimationCard - Public gallery card component
 * Displays an animation in the public gallery with upvote and share controls
 */
export { PublicAnimationCard } from './components/PublicAnimationCard';

/**
 * SkeletonCard - Loading skeleton component
 * Provides loading state placeholder for gallery cards
 */
export { SkeletonCard } from './components/SkeletonCard';

/**
 * MiniPitchSVG - Inline SVG tactical pitch preview
 * Renders a simplified pitch outline with entity dots from first-frame data
 */
export { MiniPitchSVG } from './components/MiniPitchSVG';

/**
 * EndorsementBadge - Solid stamp badge for endorsed animations
 * Displays the endorser name uppercased in a solid pitch-green stamp
 */
export { EndorsementBadge } from './components/EndorsementBadge';

/**
 * ProgressionStrip - Always-visible horizontal progression strip
 * Shows ordered progression mini-previews beneath a parent gallery card
 */
export { ProgressionStrip } from './components/ProgressionStrip';
