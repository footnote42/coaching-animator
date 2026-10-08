# Coaching Animator

Animated pitch diagrams that rugby coaches use to explain a Practice to players and co-coaches. Built for Trojans RFC coaches first, with expansion to Hampshire RFU clubs in view. Shared vocabulary with RAM (Rugby Aide Memoire) is owned by RAM's glossary; this file covers only the animator's own terms.

## Language

**Practice**:
A coached activity drawn and animated as one thing: a skill zone, a block practice, or occasionally a match play. Holds an ordered chain of Steps. A match play is simply a Practice with no Progressions.
_Avoid_: drill, exercise, animation, play (as a separate type), progression pack, collection

**Step**:
One stage of a Practice. Step 0 is the base; every later Step is a Progression.
_Avoid_: frame, slide, level

**Progression**:
A Step that develops the previous Step to stretch players further, by pulling a STEP lever (Space, Time, Equipment, People; RAM defines these): a passing pattern, then crossovers, then a defender. Progressions chain: each one is the previous Step plus its change, so an edit to an earlier Step carries forward. Required by the Trojans Coaching Framework for every activity, so a Progression is never optional decoration. Exists only inside its Practice, never on its own.
_Avoid_: variant, version, level, child animation

**Lever**:
The STEP element a Progression changes, recorded with one coaching point saying why the Step is harder.
_Avoid_: modifier, tweak

**Commentary**:
The words shown over a Step as it plays: its Lever and coaching points, and later timed captions at moments in the play. Part of the Practice Script, toggled on and off by the viewer.
_Avoid_: notes, description, caption (a caption is one timed piece of Commentary)

**Practice Script**:
The written form of a Practice that both coaches' hand edits and agents produce: markers placed on grid cells, moves along waypoints at a Pace, passes triggered by arrival, Progressions as changes over the previous Step. It is what is stored and what any AI model writes.
_Avoid_: payload, JSON, export, DSL

**Area**:
The space a Practice happens in, sized in metres and started from a template: square, horizontal rectangle, vertical rectangle, half pitch, full pitch. The first three sit on open grass; the pitch templates show pitch markings. Markers scale with the Area, so they stay in proportion to the space. The Space lever changes it.
_Avoid_: canvas, field, grid (grid is the cells inside an Area)

**Pace**:
How fast a marker moves: slower than real time so viewers can follow the idea, set per Run (walk, jog, sprint) and changeable per waypoint segment, so a player can jog in then sprint onto the ball. The engine eases into, between and out of Paces, and may scale a receiver's Run to meet the ball (ADR 0005). Durations come from distance and Pace, never typed by hand.
_Avoid_: speed, tempo, duration

**Run**:
A marker's path across the Area through waypoints at a Pace. It starts straight away or after another Run or Pass finishes, and tapers to a stop at its end rather than halting dead.
_Avoid_: move (in anything a Coach reads), path, route

**Pass**:
The ball travelling from the marker holding it to another marker. It is thrown once the previous Pass of that ball is caught, and the receiver's Run is timed so they reach the catch point as the ball does (ADR 0005). The ball flies to where the receiver will be when it arrives.
_Avoid_: throw, ball movement

**Kick**:
The ball kicked from the marker holding it, through the air, slower and higher than a Pass, either to a receiver or to space. A Kick is never a forward pass; after a Kick to the other team, that team attacks the opposite way.
_Avoid_: punt, kick pass (as a separate thing)

**Catch on the run**:
A Pass caught at a point part way along the receiver's Run instead of at its end. The receiver carries on running with the ball.
_Avoid_: mid-run pass, early catch

**Release**:
The waypoint part way along the carrier's own Run where a Pass or Kick leaves their hands; the carrier runs on without the ball, and the receiver is timed to meet it. Leave it out and the ball goes as soon as the Pass is ready, from wherever the carrier has run to.
_Avoid_: pass point, throw point

**Kick to space**:
A Kick aimed at a cell rather than a player. The ball lands, rolls a short way and lies loose until someone Collects it (ADR 0006).
_Avoid_: grubber, chip, loose kick (as separate things)

**Loose ball**:
A ball lying on the ground with nobody holding it: after a Kick to space comes to rest, or placed on a cell at the start of a Step. It stays put until someone Collects it; a loose ball on the same cell as Lying kit shows beneath it.
_Avoid_: dead ball, dropped ball

**Collect**:
A named player reaching a loose ball and taking it, after which the next Pass or Kick of that ball is theirs. Either team can Collect.
_Avoid_: pick up, gather, regather

**Lying**:
A tackle shield or tackle bag laid flat on the ground, as in a ruck or a ball placed under a pad; a ball on the same cell shows beneath it. Set per Step, not animated.
_Avoid_: rotated, down, flat

**Tackle bag**:
The tall cylindrical bag used for contact work: bigger than a tackle shield, and like it can be upright or Lying.
_Avoid_: tackle dummy, bag (alone), tackle tube

**Direction of attack**:
The way the attack is going in a Practice: up, down, left or right on the Area, or none for drills without a try line. A Pass is forward when it is caught ahead of where it was thrown, measured in this direction; only a Practice with a direction can have one.
_Avoid_: orientation, attacking end

**Coach**:
A signed-in person who creates and owns Practices. Not the same as a viewer: anyone reading a shared link or browsing the Gallery is a viewer.
_Avoid_: user, author, creator

**Guest**:
Someone trying the editor without signing in. Their work stays on their own device until they sign in.
_Avoid_: anonymous user, trial user

**Gallery**:
The public place where anyone can find Practices their Coaches have chosen to publish.
_Avoid_: library (RAM's term), community, feed

**Source**:
The video or page a Practice is based on, credited and linked so a viewer can watch the original. Optional; a Practice the Coach invented has none.
_Avoid_: reference, origin, inspiration

**Tag**:
A topic a Coach picks for a Practice from a fixed list drawn from the Trojans Player (Skills, Knowledge, Behaviours) and the Principles of Play, so viewers can find Practices in the Gallery. Up to five per Practice; never free text.
_Avoid_: label, category, keyword
