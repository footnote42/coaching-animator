# Project State: Rugby Animation Tool

**Last Updated**: 2026-01-23
**Authoritative Source of Truth**

This document tracks the current status, architecture, and known issues of the Rugby Animation Tool.

## Project Summary

A browser-based tactical animation tool for rugby coaches. Features include drag-and-drop entity positioning, multi-frame keyframe animation with smooth interpolation, video export (.webm), and offline-first persistence.

## Completion Status

### User Stories (P1 - MVP)
| ID | Title | Status | Notes |
|----|-------|--------|-------|
| US1 | Create Basic Tactical Animation | ✅ COMPLETE | Basic positioning, frames, and playback. |
| US2 | Save and Load Projects | ✅ COMPLETE | JSON file I/O and Auto-save implemented. |
| US3 | Export Animation as Video | ✅ COMPLETE | MediaRecorder integration with progress UI. |

### User Stories (P2 - Enhanced)
| ID | Title | Status | Notes |
|----|-------|--------|-------|
| US4 | Manage Multiple Frames | ✅ COMPLETE | Duration sliders, duplication, and navigation. |
| US5 | Configure Player Tokens | ✅ COMPLETE | Labels, colors, and team toggles. |
| US6 | Select Different Sports Fields | ✅ COMPLETE | Union, League, Soccer, American Football. |

### User Stories (P3 - Polish)
| ID | Title | Status | Notes |
|----|-------|--------|-------|
| US7 | View Previous Frame Positions | ✅ COMPLETE | Ghost Mode (30% opacity previous frame). |
| US8 | Draw Annotations | ✅ COMPLETE | Arrow and Line drawing tools implemented. |
| US9 | Playback Speed and Looping | ✅ COMPLETE | 0.5x, 1x, 2x speeds and looping playback. |

## Technical Architecture

### Core Stack
- **Frontend**: React 18.2.0, TypeScript 5.x
- **Canvas Rendering**: Konva 9.3.22, react-konva 18.2.14
- **State Management**: Zustand 5.0.2 (Project & UI stores)
- **Styling**: Tailwind CSS 4.x (Tactical Clubhouse aesthetic)
- **UI Components**: shadcn/ui (Radix-based)

### System Design
- **Animation**: `useAnimationLoop` hook using `requestAnimationFrame` with linear interpolation (lerp).
- **Export**: `useExport` hook using `MediaRecorder` API to capture Konva Stage.
- **Persistence**: `useAutoSave` hook (30s interval) to LocalStorage; JSON export for long-term storage.

## Known Issues

### High Priority
- **Double-click Reliability**: Inline label editing on player tokens is sometimes difficult to trigger (timing issue). *Workaround: Use context menu 'Edit Label'.*

### Low Priority / Cosmetic
- Export resolution setting exists in the store but is not yet exposed in the UI (hardcoded to 720p).
- Context menu positioning might be slightly off on scrolled pages.

## Design System (Constitution)
- **Color Palette**: Pitch Green (`#1A3D1A`), Tactics White (`#F8F9FA`).
- **Typography**: Monospace for data/timecodes, bold sans-serif for headings.
- **Aesthetic**: Sharp corners, 1px borders, zero drop shadows.
- **Privacy**: No telemetry, no authentication, 100% offline-capable.

## Future Recommendations
- Implement "Ball Possession" logic (parent-relative positioning).
- Enhance annotation editing (resize/rotate).
- Add more entity types (cones, markers, tackle bags).
- Support MP4 export (requires client-side transcoding like ffmpeg.wasm).
