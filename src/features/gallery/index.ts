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
