# A Practice is stored as a Practice Script with chained Progressions

The original model stored each animation as raw 0–2000 coordinates per frame and each progression as a full copy of its parent in a separate row, capped at five. Edits to the base never reached the progressions. We replace it: a Practice is one object holding a Practice Script, positions are grid cells, timing comes from distance and Pace (steady and slower than real time by default, passes triggered when the receiver arrives), and each Progression stores only its change over the previous Step, so edits flow forward down the chain. The semantic script is also what agents write (ADR 0001), which gives grid alignment and steady pace for free and keeps stored rows small.

## Consequences

- The database is reset rather than migrated: existing animations are test-grade, and coordinate data cannot be lifted reliably into grid cells.
- The Konva canvas, auth and hosting stay; the payload V1/V2 pipeline, progression rows and collections are deleted.
- The hand editor writes to the same script, snapping drags to grid cells, so hand-made and agent-made Practices are indistinguishable.
