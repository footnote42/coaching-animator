---
name: coaching-animator
description: Write a valid Coaching Animator Practice Script (animated rugby coaching Practice with Progressions) from a Coach's description of a drill, or from a video or web page link. Use when a Coach asks for a rugby drill, session or play to be drawn, animated or turned into a Practice, gives a drill video or page to convert, or pastes a script to change.
---

# Coaching Animator skill

Coaching Animator turns a Practice Script (JSON) into an animated rugby Practice. Your job: produce a script that loads first time, plus Tags and a Source when they apply, and get it to the Coach.

Words to use: Practice (not drill or exercise), Step, Progression, Lever, Area, Pace, Coach, Source, Tag. Say "Practice" to the Coach.

## How to deliver: MCP first, paste as fallback

- **If the `create_practice` tool (from the coaching-animator MCP server) is available:** write the script, save it with `create_practice` (use `update_practice` to change an existing Practice), then reply with the editor link and a one-line summary of the Practice. Nothing else is needed.
- **Otherwise:** use the paste route (step 5) on https://coaching-animator.waynetellis.com/practice, with the script in one code block, and add one line on how to connect the tools next time (see Install).

Don'ts:

- Don't write the script to a local file unless the Coach asks for one.
- Never mention localhost or a dev server. The app is https://coaching-animator.waynetellis.com.
- Never name buttons, pages or features that are not in the guide or this skill.
- Don't publish. Everything you save is private; the Coach publishes from the editor.

## Live references

- Guide (the rules, limits and prompt): https://coaching-animator.waynetellis.com/practice-script/v1/guide.md
- JSON Schema: https://coaching-animator.waynetellis.com/practice-script/v1/schema.json

On the MCP route, `create_practice` validates the script against the live schema and engine and returns each error with its field path: write from this skill and the examples, then fix what it reports. Read the guide when the drill needs a feature neither covers, or an error message is not enough to fix it. On the paste route nothing checks the script before the Coach sees it, so read the guide first, every time; if you cannot open links, ask the Coach to paste it. The files in `examples/` next to this skill are worked scripts you can copy the style of:

- `examples/01-passing-line.json`: simple passing Practice, no Progressions.
- `examples/02-pass-and-follow-progressions.json`: a Practice with a Time and a People Progression.
- `examples/03-two-ball-square.json`: two balls, each with its own chain of passes.
- `examples/04-attack-v-defence.json`: attackers against defenders, passes Released on the run (`release`) with the passers running on, catch on the run, draw and pass (`after` on a pass), a winger who jogs wide then sprints onto the ball (`pace` on a waypoint), a Progression adding a defender.
- `examples/05-kick-receipt.json`: one team kicks (`"kick": true` on a pass) to the other, who catch and counter-attack with backward passes.
- `examples/06-shield-to-ruck.json`: a carry into an upright shield, then an Equipment Progression lays it flat as a ruck (`"lying": true` on `placeMarker`) with the ball beneath, and 9 passes away.
- `examples/07-bag-clear-out.json`: a carry into an upright tackle bag (`"kind": "tackle-bag"`), then a People Progression lays the bag flat over the ball as the ruck, 2 clears out and 9 passes away.
- `examples/08-kick-to-space.json`: 10 kicks to space (`"cell"` instead of `"to"` on a kick), the wingers chase as it lands and 14 Collects it where it stops (the next pass comes `"from": "a14"`, whose Run ends on that cell) and passes to 11; then an Equipment Progression starts the ball loose on the ground (`"cell"` instead of `"holder"`) under a Lying shield and 9 Collects it.
- `examples/09-pass-and-support.json`: 1 passes on the run (`"release": 0` on the pass, the waypoint of 1's Run where the ball goes) and runs on in support while 2 catches on the run.
- `examples/10-ruck-and-recycle.json`: a ruck with holds and reach: 1 holds at the contact with the ball until 9 has caught it, 2 and 3 arrive, hold over the ball until the second pass is caught, then walk back; 9's pass waits for 2 to reach the ruck. Progressions add a contesting defender (who holds too) and then sprint the supports.

## 1. Describe a drill, get a Practice Script

1. Ask only for what is missing and matters: the Area size, how many players, equipment, what happens, how it gets harder. If the Coach has given enough, do not ask.
2. Write the script following the guide exactly. The rules most often broken:
   - Output one JSON object, no comments, no extra fields.
   - Whole-number cells inside the Area; the ball has a `holder`, or a `cell` only when it lies loose on the ground with nobody holding it (it then stays put until someone Collects it).
   - Never write durations; use `pace` (`walk`, `jog`, `sprint`). A waypoint can take its own `pace` for the segment arriving at it, to jog into position then sprint onto the ball: `"waypoints": [{ "x": 26, "y": 16 }, { "x": 23, "y": 13, "pace": "sprint" }], "pace": "jog"`.
   - A Kick to space is a kick with `"cell"` instead of `"to"`: `{ "id": "k1", "from": "a10", "cell": { "x": 16, "y": 12 }, "kick": true }`. The ball lands on the cell, rolls 2 m on in the kick's direction to the nearest cell and lies loose. Chasers set off as it lands with `"after": { "pass": "k1" }`. No `at` on it, and it is never a forward pass.
   - Collect a loose ball (kicked to space, or placed with a `cell`): the next pass or kick of that ball comes `"from"` the collector, whose Run must end on the cell where the ball lies (for a Kick to space, where it comes to rest; kicked straight up or down from a standing kicker, the landing cell moved 2 on; the validation error names the cell if you miss). The engine times the collector to the ball and they pick it up on arrival. No `release` on that pass. Either team can Collect; the other team then attacks the other way.
   - To pass part way along the carrier's own Run and run on in support, give the pass `"release"`: the index of a waypoint in the passer's move, mirroring `at` on the receiver's. `{ "id": "p1", "from": "a1", "to": "a2", "at": 0, "release": 0 }`. Only for a passer with a move; leave it out to pass as soon as the pass is ready.
   - A player who must stop mid-Run and wait gets a `hold` on a waypoint: a ruck, a maul, a carrier going to ground, a support who arrives then stays over the ball. `{ "x": 6, "y": 8, "hold": { "pass": "p1" } }` stands on arrival until pass `p1` is caught, then runs the rest. Events only: never a time, so no "wait three seconds".
   - An action triggered by someone arriving somewhere mid-Run uses `reach`: `{ "reach": { "marker": "a2", "waypoint": 0 } }` (waypoints count from 0). Put it in a pass's `after` (the ball goes when the first support reaches the ruck), another move's `after`, or a `hold`. It fires on arrival, before any hold at that waypoint.
   - Every wait (a Run's `after`, a pass's `after`, a waypoint's `hold`) takes exactly one of `move`, `pass` or `reach`, never two, and waits may not loop. `setMove` replaces the whole Run, `after` included, so in a Progression repeat the Run's `after` and holds or they are lost.
   - Labels are roles or shirt numbers, never player names.
   - Cones may carry a `colour` (`yellow` default, `red`, `amber`, `green`, `white`, `blue`); use it to mark zones, e.g. red, amber and green for a traffic-light layout. Only cones take a colour.
   - Kit is `cone`, `tackle-shield` or `tackle-bag` (the tall cylindrical contact bag, bigger than a shield; never "tackle dummy").
   - A tackle shield or tackle bag can be Lying (laid flat, for a ruck or a ball under a pad): add `"lying": true` to its placement, `addMarker` or `placeMarker`. A ball on that cell, loose or with its holder standing there, is drawn beneath it. `placeMarker` replaces the whole start, so give the cell again, and leave `lying` out to stand the kit back up. Only tackle shields and tackle bags take `lying`.
3. Add Progressions (each may pull one Lever: space, time, equipment or people; `lever` is optional, so leave it out if none fits, with a first coaching point saying why it is harder) unless the Practice is a match play.
4. Check it (step 3 below) before you hand it over.

## 2. Turn a video or page into a Practice

Use this when the Coach gives a link to a drill video or page.

1. Open the link. If you cannot read it or watch it (video often cannot be read), say so and ask the Coach to describe the Practice or paste the page text. Never invent what happens in a video you could not see.
2. Describe the Practice in your own words and build the script from that. Do not copy sentences from the page, the video description or its captions into the script, the title or the Commentary. Coaching points are short cues you write yourself.
3. Credit the Source: give the Coach the link (https only) and the title of the video or page, exactly as the source names it, to enter as the Source link and Source title when saving. The Source is not part of the script.
4. Say plainly that the Practice is your reading of the original, and the Coach should watch the original to check it.

## 3. Suggest Tags (optional, from the list only)

Suggest at most 5 Tags, chosen only from this fixed list, written exactly as shown. Never invent a Tag, reword one or add a sixth.

Attack, Defence, Gain possession, Go forward, Support, Continuity, Pressure, Score, Contest possession, Regain possession, Pass / catch, Tackling, Footwork, Agility, Kicking, Body control, Fitness, Attacking shape, Defensive line, Ruck / maul, Scrum, Lineout, Offside, Run forward / pass back, Decision making, Teamwork, Awareness, Self-organising

Pick the ones the Practice mainly trains. Fewer, well chosen, is better than five. Tags are not part of the script either; the Coach picks them when saving.

## 4. Check the script validates

Before replying, check the script against the schema and the guide's rules: every id exists, the first pass comes from the ball holder, each pass comes from the previous receiver (per ball), cells are inside the Area, `after` waits form no loop, and limits are respected. If you can run code, validate against the JSON Schema. If the Coach reports errors, fix every listed problem (each error names the field path) and send the whole corrected script again.

Set `"direction"` at the top level of the script for any directional drill (`"up"` is toward row 0, the top edge; pitch templates draw their try line there, so attackers start at larger y and run toward smaller y). Use `"none"` or leave it out for drills with no try line. With a direction set, the app and the MCP tools warn about any pass caught more than 0.5 m ahead of where it was thrown ("Pass 2 goes forward"). A kick (`"kick": true` on a pass) flies slower and is never a forward pass; the direction belongs to the team holding the ball first, and the other team's passes are checked the opposite way. Treat a warning as something to fix: change the script and save again until there are none.

Then check the rugby yourself too: in any Practice with a try line or a direction of attack, every pass must travel level or backwards. Two traps make passes go forward:

- **The catch is on the waypoint.** With `at`, the receiver reaches waypoint `at` as the ball does and runs on with it. Put the catch waypoint level with or a few metres behind the passer (with `release`, behind the release waypoint).
- **Draw and pass.** To show the defender being drawn, end the defender's Run at the carrier and give the pass `"after": { "move": "<defender>" }`: the ball goes when that Run finishes (as well as the catch point). Keep the pass level or backward.
- **Receivers are timed to the ball.** Let receivers set off at time zero with the line: the engine slows an early receiver's whole Run (no segment below walk), starts it later only if walking is still early, and if the receiver would be late, the carrier runs on and passes when the ball can be taken. Do not hold a receiver with `after: { "pass": ... }` to time its run; that only makes it late. `examples/04-attack-v-defence.json` shows timing with draw and pass.

## 5. Paste route (only when you have no `create_practice` tool)

Reply with, in this order:

1. The Practice Script in one JSON code block.
2. Suggested Tags (up to 5, from the list), if any.
3. The Source link and title, if there is one.
4. These steps, in these words:
   - Open https://coaching-animator.waynetellis.com/practice
   - Open "Practice Script", paste the script into the box and press "Apply script". It plays straight away; if it lists problems, paste them back to me.
   - To keep it, save it, then add the Tags and the Source link and title in the save form.
5. One line: "To let me save Practices straight to your account next time, see the Install section of my skill."

When a Coach gives you a script to change (for example from "Ask your AI to change this"), return the whole changed script, not a patch, and say in one line what you changed.

## 6. Saving over MCP

Tools (from the coaching-animator MCP server):

- `create_practice` `{script, title?, tags?, source?}`: save a new Practice. `source` is `{url, title}` (https only). Returns the id and the editor link.
- `get_practice` `{id}`: read one of the Coach's own Practices, by id or by a link such as `/p/<id>` or `/practice?id=<id>`. Use it before changing a Practice the Coach points you to.
- `update_practice` `{id, script?, title?, tags?, source?}`: change one of their Practices. Send the whole changed script, not a patch.
- `list_my_practices` `{limit?}`: the Coach's Practices, newest first. Use it to find one when the Coach does not give a link.

If a script is not valid, the tool returns the problems, each naming its field path. Fix every one and call again. A saved script can still return `warnings` (for example "Pass 2 goes forward"): fix them with `update_practice` before giving the Coach the link.

Rules: everything you create is private; you cannot publish, share or delete. You only see this Coach's own Practices. After saving, give the editor link from the result and mention any Source and Tags you set.

## Install (the Coach does this once)

**Claude Code skill**, user-level, works from any folder. Bash:

```bash
B=https://raw.githubusercontent.com/footnote42/coaching-animator/main/skill/coaching-animator; D=~/.claude/skills/coaching-animator; mkdir -p "$D/examples" && for f in SKILL.md examples/01-passing-line.json examples/02-pass-and-follow-progressions.json examples/03-two-ball-square.json examples/04-attack-v-defence.json examples/05-kick-receipt.json examples/06-shield-to-ruck.json examples/07-bag-clear-out.json examples/08-kick-to-space.json examples/09-pass-and-support.json examples/10-ruck-and-recycle.json; do curl -fsSL "$B/$f" -o "$D/$f"; done
```

PowerShell:

```powershell
$B='https://raw.githubusercontent.com/footnote42/coaching-animator/main/skill/coaching-animator'; $D="$HOME/.claude/skills/coaching-animator"; New-Item -ItemType Directory -Force "$D/examples" | Out-Null; 'SKILL.md','examples/01-passing-line.json','examples/02-pass-and-follow-progressions.json','examples/03-two-ball-square.json','examples/04-attack-v-defence.json','examples/05-kick-receipt.json','examples/06-shield-to-ruck.json','examples/07-bag-clear-out.json','examples/08-kick-to-space.json','examples/09-pass-and-support.json','examples/10-ruck-and-recycle.json' | ForEach-Object { Invoke-WebRequest "$B/$_" -OutFile "$D/$_" }
```

**MCP tools** (so the AI saves Practices straight to your account). Sign in at https://coaching-animator.waynetellis.com/profile and create a personal token (starts with `ca_pat_`, shown once, revocable there). Then:

```bash
claude mcp add --scope user --transport http coaching-animator https://coaching-animator.waynetellis.com/api/mcp --header "Authorization: Bearer ca_pat_..."
```

Any client that takes a JSON config (remote HTTP server):

```json
{
  "mcpServers": {
    "coaching-animator": {
      "type": "http",
      "url": "https://coaching-animator.waynetellis.com/api/mcp",
      "headers": { "Authorization": "Bearer ca_pat_..." }
    }
  }
}
```

**Other AIs** (ChatGPT, Gemini and so on): upload SKILL.md as project or custom instructions, or paste it into the chat. Without MCP tools they use the paste route.
