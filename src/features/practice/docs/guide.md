# Practice Script guide, version 1

A Practice Script is the JSON form of a rugby coaching Practice: markers placed on grid cells, moves along waypoints at a Pace, passes that fire when the receiver arrives, and Progressions written as changes over the previous Step. Coaching Animator plays it as an animation.

This guide is written for an AI model (or a person) writing a script from a Coach's description. Follow the rules exactly, then check the script as described in "How to check a script". Any model can do this; nothing here depends on one vendor.

- JSON Schema: {{ORIGIN}}/practice-script/v1/schema.json
- This guide as raw markdown: {{ORIGIN}}/practice-script/v1/guide.md
- Check a script: {{ORIGIN}}/practice

## Output rules

1. Output one JSON object and nothing else: no comments, no trailing commas, no extra fields. Every object is strict; an unknown field is an error.
2. `schemaVersion` is always `1`.
3. Use whole numbers for every cell coordinate, width and length.
4. Declare every marker once in `markers`, then place it in `base.placements` or add it in a Progression.
5. Never give a duration or a time. Timing comes from distance, Pace and the order of passes.
6. Labels are roles or shirt numbers ("9", "SH", "D"), never a player's name.

## Top level

| Field | Required | Meaning |
| --- | --- | --- |
| `schemaVersion` | yes | Always `1`. |
| `title` | no | Short name, at most 120 characters. |
| `area` | yes | The Area the Practice happens in. |
| `direction` | no | Direction of attack: `up` (toward row 0, the top edge, where a pitch template draws its try line), `down`, `left`, `right` or `none`. Set it for directional drills; leave it out or use `none` when there is no try line. |
| `markers` | yes | Every marker used in any Step, declared once. |
| `base` | yes | Step 0: placements, moves, passes, Commentary. |
| `progressions` | no | Progressions in order. Progression i is Step i + 1 and builds on Step i. |

## Area and grid

- `area` has `width` and `length` in whole metres (1 to {{MAX_AREA_SIDE_M}}) and an optional `template`.
- The grid is made of {{CELL_SIZE_M}} m square cells. A cell is `{ "x": column, "y": row }`.
- `x` runs across the width, left to right, from `0` to `width - 1`.
- `y` runs down the length, top to bottom, from `0` to `length - 1`.
- A cell means its centre: a marker on `{ "x": 3, "y": 4 }` stands in the middle of that cell. Every cell used must be inside the Area.

Templates and their starting sizes (width x length, metres):

| `template` | Size | Surface |
| --- | --- | --- |
| `square` | {{SIZE_square}} | open grass |
| `horizontal` | {{SIZE_horizontal}} | open grass |
| `vertical` | {{SIZE_vertical}} | open grass |
| `half-pitch` | {{SIZE_half-pitch}} | pitch markings |
| `full-pitch` | {{SIZE_full-pitch}} | pitch markings |

Leave `template` out for open grass of any size. A grid for a small skill zone is usually 10 to 30 m a side.

Pitch markings, measured from the top edge (`y`) at template size. If you change the width or length, the markings stretch with it.

- `half-pitch` ({{SIZE_half-pitch}}): in-goal from the dead-ball line (top edge, `y = 0`) to the try line at `y = {{PITCH_IN_GOAL_M}}`, the 22 m line at `y = {{HALF_22_Y}}`, the dashed 10 m line at `y = {{HALF_10_Y}}`, and halfway along the bottom edge (`y = {{HALF_PITCH_LENGTH_M}}`). Touch lines are the left and right edges.
- `full-pitch` ({{SIZE_full-pitch}}): dead-ball lines at the top and bottom edges, try lines at `y = {{PITCH_IN_GOAL_M}}` and `y = {{FULL_TRY_2_Y}}`, 22 m lines at `y = {{HALF_22_Y}}` and `y = {{FULL_22_2_Y}}`, dashed 10 m lines at `y = {{HALF_10_Y}}` and `y = {{FULL_10_2_Y}}`, halfway at `y = {{HALF_PITCH_LENGTH_M}}`.

On a half pitch, attack towards the try line at the top: attackers start low on the grid (large `y`) and run to smaller `y`.

## Markers

Each entry in `markers` is `{ "id", "kind", "team"?, "label"? }`.

- `id`: unique, 1 to 32 characters, e.g. `"a1"`, `"d2"`, `"ball"`. Placements, moves and passes refer to markers by id.
- `kind`: one of `attacker`, `defender`, `ball`, `cone`, `tackle-shield`, `coach`.
- `team`: `attack` or `defence`. Defaults to `attack` for attackers and `defence` for defenders; usually leave it out.
- `label`: at most 4 characters, shown on the marker.
- `colour`: cones only: `yellow`, `red`, `amber`, `green`, `white` or `blue`. Defaults to yellow. Use it to mark out zones, for example red, amber and green cones for a traffic-light grid. Any other kind with a `colour` is rejected.
- At most {{MAX_BALLS}} markers of kind `ball` per script (see "More than one ball"), and at most {{MAX_MARKERS}} markers in all.
- Only attackers, defenders and coaches can hold, pass and receive the ball.

## Placements and the ball holder

`base.placements` says where each marker starts in Step 0. Each marker is placed at most once.

- Every marker except the ball: `{ "marker": "a1", "cell": { "x": 2, "y": 8 } }`.
- The ball: `{ "marker": "ball", "holder": "a1" }`. The ball has no cell; it rides with its holder. The holder must be an attacker, defender or coach on the Area, and no two balls may start with the same holder.
- Two markers may share a cell (a player standing on a cone, for example).
- A marker left out of `base.placements` is not on the Area in Step 0; a Progression must add it with `addMarker`, or the script is rejected.

## Moves and waypoints

A move is a run by one marker: `{ "marker", "waypoints", "pace"?, "after"? }`.

- At most one move per marker per Step.
- `waypoints` is a list of 1 to {{MAX_WAYPOINTS}} cells. The marker runs from its starting cell through each waypoint in order, in straight lines, without stopping, and rests on the last one.
- The ball never has a move. It travels with its holder or on a pass.
- A move with no `after` starts at time zero.

## Pace

`pace` is `walk`, `jog` or `sprint`; leave it out for `jog`. Every Pace is slower than real time so viewers can follow the idea.

| Pace | Speed |
| --- | --- |
| `walk` | {{PACE_walk}} m/s |
| `jog` (default) | {{PACE_jog}} m/s |
| `sprint` | {{PACE_sprint}} m/s |

A move's duration is the straight-line length of its path (start cell to each waypoint in turn, in metres) divided by the Pace speed. Example: from `(0, 0)` to `(6, 8)` is 10 m, so 5 s at `jog`. Never write a duration.

## Passes

A pass is `{ "id", "from", "to", "ball"?, "at"?, "after"?, "kick"? }`. `base.passes` lists the passes in the order they happen (at most {{MAX_PASSES}}).

- `id` is unique within the Step, e.g. `"p1"`.
- The first pass must come from the ball holder. Each later pass must come from the receiver of the pass before it (of the same ball, if there is more than one).
- `from` and `to` are different attackers, defenders or coaches on the Area.
- Pass i fires once pass i - 1 has been caught (the first pass needs nothing before it) and the receiver has arrived: at waypoint `at` of its move if given, otherwise at the end of its move, or straight away if it has no move. If the pass has `after`, it also waits for that Run to finish.
- The ball flies at {{PASS_SPEED_MPS}} m/s from wherever the passer is (a passer can pass while still running) to the receiver's final cell, or for a catch on the run to the point on the receiver's run where they meet the ball.

### `kick`: kick to a receiver

`"kick": true` makes the pass a kick: the ball flies through the air at {{KICK_SPEED_MPS}} m/s (slower than a pass), drawn as a dashed arc with the ball growing and shrinking. A kick follows the same order, catch (`at`) and `after` rules as a pass, and is never a forward pass. A kick goes to a receiver only; the ball does not land in space. To show one team kicking to the other, set the other team's markers with `"team"` and kick to one of them.

The `direction` belongs to the team holding the ball at the start. A pass whose passer is on the other team (for example the receiver of a kick, who now attacks) is checked in the opposite direction, so with `"direction": "up"` and the kicking team holding the ball first, the receiving team's passes must not travel down.

A Practice with a `direction` checks its passes: a pass caught more than 0.5 m ahead of where it was thrown, measured in that direction, raises a warning ("Pass 2 goes forward"). A warning does not stop the script saving, but it is a mistake to fix: make the pass level or backward, for example by moving the catch waypoint behind the passer or holding the receiver with `after: { "pass": ... }`. The check uses the real throw and catch points, and the ball leads a receiver on the run.

### `at`: catch on the run

In rugby the receiver usually runs onto the ball and keeps going. Give the pass `at`: the index, counted from `0`, of a waypoint in the receiver's move. The pass fires when the receiver reaches that waypoint, the ball is passed in front of them, and they catch it on the run and carry it through the rest of their move. A later pass from that receiver can then fire while they are still running.

```json
{ "id": "p2", "from": "a10", "to": "a12", "at": 0 }
```

- Leave `at` out to fire the pass at the end of the receiver's move (the receiver stops, then catches).
- `at` must name a waypoint of the receiver's move: from `0` to the number of waypoints minus 1. A receiver with no move cannot have `at`.
- A receiver whose move waits (`after`) on this very pass, directly or through other passes and moves, has not set off yet, so `at` is rejected for that pass. See "Receive, pass, run, receive again".

### `after`: pass when a Run finishes (draw and pass)

To show draw and pass, give the pass `"after": { "move": "<marker>" }`: it waits for that marker's Run to finish. The defender's Run ends at the carrier, then the ball goes.

```json
{ "id": "p2", "from": "a2", "to": "a3", "at": 0, "after": { "move": "d2" } }
```

- The pass fires once the previous pass is caught, the receiver is at the catch point (`at`, or the end of its Run) and the named Run has finished.
- The named marker must have a Run in the Step. Waits may not loop, for example a Run that waits on this very pass.
- Only `move` is allowed. A Progression's `setPass` carries `after` too.

### Receive, pass, run, receive again

A player can catch, pass, run somewhere and be passed to again, all in one Step. Give the run `"after": { "pass": "p2" }`, where `p2` is the pass the player makes. A pass to a player whose run has not started, because the run waits on that very pass (directly or through other passes and moves), does not wait for the run: it fires as soon as the ball is free and is caught on the player's starting cell. A pass to a player whose run is not waiting on it works as always and waits for the run to finish (or to reach `at`).

Example, circle passing where each player runs to a cone behind them and back to their spot after their own pass: `p1` goes from `a1` to `a3`, and the move of `a3` is `{ "marker": "a3", "waypoints": [cone, spot], "after": { "pass": "p2" } }`. `p1` is caught on `a3`'s spot at once, `a3` passes `p2` and sets off, and `a3` is back on the spot before the ball comes round to `a3` again.

Moves can still wait on each other in a loop (`a1` after the move of `a2`, `a2` after the move of `a1`); that is rejected.

### More than one ball

A script may declare up to {{MAX_BALLS}} markers of kind `ball`, for example two balls to raise the tempo of circle passing. Each ball has a holder in `base.placements` (or `addMarker` in a Progression) and its own chain of passes.

- Give each pass its `ball`: `{ "id": "p13", "ball": "ball2", "from": "a4", "to": "a2" }`. Leave `ball` out to pass the first ball declared in `markers`, so a script with one ball needs no `ball` anywhere, and adding a second ball later does not change the existing passes.
- Passes stay in one list. A pass fires once the previous pass of the same ball has been caught, so the balls move at the same time.
- A pass must come from the current holder of its ball.
- A player cannot hold two balls at once. Two balls cannot start with the same holder, and a player must pass on the ball they hold before catching another (checked against the timing of the Step).
- A Progression adds a ball with `{ "type": "addMarker", "marker": "ball2", "holder": "a4" }` and its passes with `setPass`, giving each `"ball": "ball2"`.

## `after`: chaining moves

`after` makes a move wait. Give exactly one of:

- `{ "move": "a2" }`: start when the move of marker `a2` has finished. `a2` must have a move in this Step.
- `{ "pass": "p1" }`: start when pass `p1` has been caught. `p1` must exist in this Step.

Waits must not form a loop (A waits for B, which waits for A), counting the waits passes make on their receivers. A Step ends when its last move finishes and its last pass is caught.

## Commentary

`commentary` is `{ "points": [...] }`: up to {{MAX_COACHING_POINTS}} coaching points, each 1 to 200 characters, shown over the Step as it plays. The viewer can toggle it. Write short, plain coaching cues. For a Progression, the first point says why this Step is harder than the last.

## Progressions, Levers and changes

A Progression is a Step that develops the previous Step by pulling one STEP Lever. It stores only its changes; everything else carries forward from the previous Step, so an edit to an earlier Step flows into every later one.

```json
{ "lever": "people", "commentary": { "points": ["..."] }, "changes": [ ... ] }
```

- `lever`: `space`, `time`, `equipment` or `people`. Space changes the Area or distances; Time changes how long players have (timing, crossing runs, Pace); Equipment changes balls, cones or shields; People adds, removes or moves players, such as a defender.
- `changes`: at least one change, applied in order to a copy of the previous Step.
- Progressions are optional: a match play is a Practice with no Progressions. Coaching Practices normally have at least two.

Change types (each is an object with a `type`):

| `type` | Fields | Effect and rules |
| --- | --- | --- |
| `addMarker` | `marker`, `cell` or (ball) `holder` | Put a declared marker on the Area. It must not be on the Area in the previous Step. |
| `removeMarker` | `marker` | Take a marker and its move off the Area. It must be on the Area. Remove or change any pass that used it. |
| `placeMarker` | `marker`, `cell` or (ball) `holder` | Change where a marker starts, or who holds the ball. Its move is kept and runs from the new cell. |
| `setMove` | `marker`, `waypoints`, `pace`?, `after`? | Add a move, or replace the marker's existing move. The marker must be on the Area. |
| `removeMove` | `marker` | Remove a marker's move. It must have one. |
| `setPass` | `id`, `from`, `to`, `ball`?, `at`?, `after`?, `kick`? | Replace the pass with this id where it stands in the order, or add it after the existing passes. |
| `removePass` | `id` | Remove a pass. It must exist in the previous Step. |
| `setArea` | `width`, `length`, `template`? | Replace the Area from this Step on. Only allowed when `lever` is `space`. Every cell used from this Step on, including cells carried forward, must fit the new Area. |

When a Space Progression narrows the Area, markers and waypoints carried forward from the previous Step are not moved for you. Re-place every marker that would fall outside the new Area with `placeMarker`, and change or remove any move that runs outside it with `setMove` or `removeMove`, in the same Progression; validation reports each one left outside at the `setArea` change.

After the changes apply, the Step must still follow every rule above: the ball holder, the pass order, `after` references and no loops.

## Limits

- Script size: at most {{MAX_SCRIPT_BYTES}} bytes of JSON.
- Markers: at most {{MAX_MARKERS}}, with at most {{MAX_BALLS}} balls.
- Waypoints: at most {{MAX_WAYPOINTS}} per move.
- Passes: at most {{MAX_PASSES}} per Step.
- Coaching points: at most {{MAX_COACHING_POINTS}} per Step, each at most 200 characters.
- Area sides: 1 to {{MAX_AREA_SIDE_M}} m. Ids: 1 to 32 characters. Labels: at most 4 characters. Title: at most 120 characters.

## How to check a script

Open {{ORIGIN}}/practice, open the Practice Script section, paste the script into its box and press Apply script. A valid script plays straight away, with a Step strip for its Progressions. An invalid one lists every problem with the path to the field at fault, for example `progressions[1].changes[2].from: marker "a2" does not hold the ball when this pass fires; "a1" does`. Fix each listed problem and apply it again.

The Import box and the `create_practice` and `update_practice` tools also report warnings, such as a forward pass. Fix them and apply again.

You can also validate against the JSON Schema above. The schema checks the shape of the script; the Import box also checks the rules that span fields (ids exist, the ball holder, pass order, cells inside the Area, no loops).

## Worked example 1: passing square with two Progressions

A 12 x 12 m open-grass square with a cone at each corner. Step 0: two attackers run up the sides and pass across. Progression 1 (Time): the runners cross. Progression 2 (People): a defender walks in and a second pass is added.

```json
{{example:passing-square-progressions}}
```

## Worked example 2: a half-pitch play

A half pitch, attacking the try line at the top. The 9 passes to the 10; each back outside the 10 sprints onto the ball after the previous pass, and the defenders come up one after another using `after`. The play ends with the 14 catching on the run (`"at": 0`) and carrying on up the touchline.

```json
{{example:half-pitch-play}}
```

## Prompt template for Coaches

Paste this into any AI assistant, then add your description at the end:

```text
Write a Practice Script (version 1) for Coaching Animator.
Read the rules at {{ORIGIN}}/practice-script/v1/guide.md
and the JSON Schema at {{ORIGIN}}/practice-script/v1/schema.json.
Output only the JSON object, with no comments or extra text.
Use whole-number cells inside the Area, a holder for the ball, and Paces
instead of durations. Give each Progression one Lever and a first coaching
point saying why it is harder.

My Practice:
[Describe the Area, the players and equipment, what happens, and how it
should get harder in each Progression.]
```

If the assistant cannot open links, paste this guide in with the prompt.

## Install the Coaching Animator skill

The skill is a short set of instructions that teaches an AI to write a valid Practice Script, turn a video or page into a Practice with its Source credited, and suggest Tags from the fixed list. It points at this guide and the schema, so it stays current. It is one public file:

https://raw.githubusercontent.com/footnote42/coaching-animator/main/skill/coaching-animator/SKILL.md

- **Claude:** download the `skill/coaching-animator` folder from the repository and add it under Settings, Capabilities, Skills (zip the folder first). In Claude Code, put the folder in `~/.claude/skills/`.
- **ChatGPT or any other AI:** start the chat with "Read this skill and follow it: " followed by the link above. If the AI cannot open links, paste the contents of SKILL.md into the chat or into the assistant's custom instructions.
- **Any AI, one-off:** use the prompt template above instead.

Either way, the AI gives you a script to paste into the Practice Script box on {{ORIGIN}}/practice. In the editor, "Ask your AI to change this" copies your current Practice with a ready-made prompt that points at the skill.
