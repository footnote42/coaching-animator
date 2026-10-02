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
How fast a marker moves: steady by default, slower than real time so viewers can follow the idea, and changed per move (walk, jog, sprint) when the Practice needs it. Durations come from distance and Pace, never typed by hand.
_Avoid_: speed, tempo, duration

**Coach**:
A signed-in person who creates and owns Practices. Not the same as a viewer: anyone reading a shared link or browsing the Gallery is a viewer.
_Avoid_: user, author, creator

**Guest**:
Someone trying the editor without signing in. Their work stays on their own device until they sign in.
_Avoid_: anonymous user, trial user

**Gallery**:
The public place where anyone can find Practices their Coaches have chosen to publish.
_Avoid_: library (RAM's term), community, feed
