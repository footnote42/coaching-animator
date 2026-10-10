# Holds and the reach wait

Status: Accepted

A player's Run could only wait at its start, so nothing could pause mid-run and a ruck could not be drawn: the carrier could not stay down until the ball was won, nor could supports hold the ruck and then reset. We add a **Hold** on a waypoint and a third wait, **Reach**, and make the wait one shape everywhere. This changes the timing in ADR 0005 and follows ADR 0006's pattern of extending the event model rather than adding real time.

- **Hold on a waypoint.** On arriving at a waypoint with a hold, the player stands until the event, then runs the rest of the move. Any number of holds per Run, one event each.
- **Events only, no timed pauses.** Paces are not real time, so a "wait three seconds" would mean nothing and break the rule that durations are never typed.
- **One wait shape everywhere.** A hold, a move's `after` and a pass's `after` each take exactly one of `move` (that marker's whole Run has ended, holds included), `pass` (that pass has been caught) or `reach` (that marker has arrived at that waypoint index).
- **Reach fires on arrival, before any hold there.** So one player can have several roles in one play: reaching waypoint n triggers one action, reaching n+k another.
- **A carrier can hold with the ball.** Passes behave as now: `release` at a later waypoint, or from where the carrier holds.
- **Receiver slowing** applies only to the segments after the receiver's last hold before the catch point. Earlier segments keep their Pace, because a hold already absorbs the timing; the engine cannot slow a player who is standing.
- **Loops are refused.** `validate` rejects a script whose waits loop, with a plain message, in line with "Waits may not loop". The editor's pickers leave out any choice that would make a loop.
- **Reach is the arrival as played.** A Run timed to a ball is started late and slowed only on the stretch after its last hold before the catch, so a reach on an arrival in that stretch (or later) depends on the ball, and a reach on an earlier arrival does not. A reach waits on that waypoint, never on the marker's whole Run. If a Run waiting on such an arrival is what the ball waits for, timing would loop, so that Run is not timed (it plays at its own Paces); waits themselves are never refused for this.
- **Holds carry through Progressions** like a waypoint's Pace: set, changed or removed per Step and carried forward with the other waypoint edits.
- **Optional fields only.** `schemaVersion` stays 1 and every existing script stays valid and plays unchanged.

## Consequences

- The engine reads a wait in one place (#204), used by validation, loop detection and receiver timing, so adding `reach` is one new branch rather than a change in three.
- Timing is no longer one scale per Run: a Run with holds is timed in runs between holds, and the loop check must follow `reach` and hold edges as well as `move` and `pass`.
- A snapshot of every shipped example guards that old scripts play identically.
- The guide, `schema.json` and the `coaching-animator` skill must document `hold` and `reach` so AI-drafted plays use them.
- The editor shows a small pause badge on a holding waypoint; the share view shows nothing extra, the player just stands.
