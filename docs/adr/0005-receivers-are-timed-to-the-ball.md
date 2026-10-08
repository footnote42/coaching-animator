# Receivers are timed to the ball

Passes fired when the receiver arrived, and Runs waited on each other's finish, so plays stuttered: a player ran, stopped, and the next one set off only once the previous event ended (the landing page's 3 v 2 was the worst case). We keep the event model from ADR 0002 but have the engine time receivers to the ball: the Coach draws paths and says where the ball is caught, and the engine scales the receiver's whole Run so they reach the catch point as the ball does, slowing it first (never below walk) and delaying the start only for what slowing cannot absorb. Nobody stands and waits; if the receiver would be late even at full Pace, the carrier keeps running and the pass goes when it can be taken. Pace may change per waypoint segment, the engine eases into, between and out of Paces, and every Run tapers to a stop, so durations are still never typed. A carrier can release a pass part way along its own Run and run on.

## Consequences

- Always on, for every Practice including saved ones; no per-Practice switch. The schema stays version 1: per-segment Pace and `release` are optional fields.
- Saved Practices play differently (better) after the change; acceptable while few exist and seeding is paused.
- "Start with another Run" was considered and skipped; revisit if a seeded Practice cannot be drawn without it.
