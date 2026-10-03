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
- At most one `ball` per script, and at most {{MAX_MARKERS}} markers in all.
- Only attackers, defenders and coaches can hold, pass and receive the ball.

## Placements and the ball holder

`base.placements` says where each marker starts in Step 0. Each marker is placed at most once.

- Every marker except the ball: `{ "marker": "a1", "cell": { "x": 2, "y": 8 } }`.
- The ball: `{ "marker": "ball", "holder": "a1" }`. The ball has no cell; it rides with its holder. The holder must be an attacker, defender or coach on the Area.
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

A pass is `{ "id", "from", "to", "at"? }`. `base.passes` lists the passes in the order they happen (at most {{MAX_PASSES}}).

- `id` is unique within the Step, e.g. `"p1"`.
- The first pass must come from the ball holder. Each later pass must come from the receiver of the pass before it.
- `from` and `to` are different attackers, defenders or coaches on the Area.
- Pass i fires once pass i - 1 has been caught (the first pass needs nothing before it) and the receiver has arrived: at waypoint `at` of its move if given, otherwise at the end of its move, or straight away if it has no move.
- The ball flies at {{PASS_SPEED_MPS}} m/s from wherever the passer is (a passer can pass while still running) to the receiver's final cell, or for a catch on the run to the point on the receiver's run where they meet the ball.

### `at`: catch on the run

In rugby the receiver usually runs onto the ball and keeps going. Give the pass `at`: the index, counted from `0`, of a waypoint in the receiver's move. The pass fires when the receiver reaches that waypoint, the ball is passed in front of them, and they catch it on the run and carry it through the rest of their move. A later pass from that receiver can then fire while they are still running.

```json
{ "id": "p2", "from": "a10", "to": "a12", "at": 0 }
```

- Leave `at` out to fire the pass at the end of the receiver's move (the receiver stops, then catches).
- `at` must name a waypoint of the receiver's move: from `0` to the number of waypoints minus 1. A receiver with no move cannot have `at`.
- The receiver's move must not wait for the pass to its own marker: that is a loop and is rejected. To show a catch followed by a run, put both in one move and use `at`.

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
| `setPass` | `id`, `from`, `to`, `at`? | Replace the pass with this id where it stands in the order, or add it after the existing passes. |
| `removePass` | `id` | Remove a pass. It must exist in the previous Step. |
| `setArea` | `width`, `length`, `template`? | Replace the Area from this Step on. Only allowed when `lever` is `space`. Every cell used from this Step on, including cells carried forward, must fit the new Area. |

When a Space Progression narrows the Area, markers and waypoints carried forward from the previous Step are not moved for you. Re-place every marker that would fall outside the new Area with `placeMarker`, and change or remove any move that runs outside it with `setMove` or `removeMove`, in the same Progression; validation reports each one left outside at the `setArea` change.

After the changes apply, the Step must still follow every rule above: the ball holder, the pass order, `after` references and no loops.

## Limits

- Script size: at most {{MAX_SCRIPT_BYTES}} bytes of JSON.
- Markers: at most {{MAX_MARKERS}}, with at most one ball.
- Waypoints: at most {{MAX_WAYPOINTS}} per move.
- Passes: at most {{MAX_PASSES}} per Step.
- Coaching points: at most {{MAX_COACHING_POINTS}} per Step, each at most 200 characters.
- Area sides: 1 to {{MAX_AREA_SIDE_M}} m. Ids: 1 to 32 characters. Labels: at most 4 characters. Title: at most 120 characters.

## How to check a script

Open {{ORIGIN}}/practice, paste the script into the Import script box and press Load. A valid script plays straight away, with a Step strip for its Progressions. An invalid one lists every problem with the path to the field at fault, for example `progressions[1].changes[2].from: marker "a2" does not hold the ball when this pass fires; "a1" does`. Fix each listed problem and load again.

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
