---
name: coaching-animator
description: Write a valid Coaching Animator Practice Script (animated rugby coaching Practice with Progressions) from a Coach's description of a drill, or from a video or web page link. Use when a Coach asks for a rugby drill, session or play to be drawn, animated or turned into a Practice, gives a drill video or page to convert, or pastes a script to change.
---

# Coaching Animator skill

Coaching Animator turns a Practice Script (JSON) into an animated rugby Practice. Your job: give the Coach a script that loads first time, plus Tags and a Source when they apply. You do not run anything in the app; the Coach pastes your output into it.

Words to use: Practice (not drill or exercise), Step, Progression, Lever, Area, Pace, Coach, Source, Tag. Say "Practice" to the Coach.

## Live references: read these first, every time

- Guide (the rules, limits and prompt): https://coaching-animator.waynetellis.com/practice-script/v1/guide.md
- JSON Schema: https://coaching-animator.waynetellis.com/practice-script/v1/schema.json

Do not work from memory or from copies. If you cannot open links, ask the Coach to paste the guide. The files in `examples/` next to this skill are worked scripts you can copy the style of:

- `examples/01-passing-line.json`: simple passing Practice, no Progressions.
- `examples/02-pass-and-follow-progressions.json`: a Practice with a Time and a People Progression.
- `examples/03-two-ball-square.json`: two balls, each with its own chain of passes.
- `examples/04-attack-v-defence.json`: attackers against defenders, catch on the run, a Progression adding a defender.

## 1. Describe a drill, get a Practice Script

1. Ask only for what is missing and matters: the Area size, how many players, equipment, what happens, how it gets harder. If the Coach has given enough, do not ask.
2. Write the script following the guide exactly. The rules most often broken:
   - Output one JSON object, no comments, no extra fields.
   - Whole-number cells inside the Area; the ball has a `holder`, not a cell.
   - Never write durations; use `pace` (`walk`, `jog`, `sprint`).
   - Labels are roles or shirt numbers, never player names.
3. Add Progressions (each pulls one Lever: space, time, equipment or people, with a first coaching point saying why it is harder) unless the Practice is a match play.
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

## 5. Hand it to the Coach

Reply with, in this order:

1. The Practice Script in one JSON code block.
2. Suggested Tags (up to 5, from the list), if any.
3. The Source link and title, if there is one.
4. These steps, in these words:
   - Open https://coaching-animator.waynetellis.com/practice
   - Open "Practice Script", paste the script into the box and press "Apply script". It plays straight away; if it lists problems, paste them back to me.
   - To keep it, save it, then add the Tags and the Source link and title in the save form.

When a Coach gives you a script to change (for example from "Ask your AI to change this"), return the whole changed script, not a patch, and say in one line what you changed.

## 6. Connecting directly over MCP (optional)

If the Coach has connected you to Coaching Animator over MCP (you have the tools below), save the Practice for them instead of asking them to paste. If you do not have these tools, use the paste route in step 5; it always works.

### Setting it up (the Coach does this once)

1. Sign in at https://coaching-animator.waynetellis.com/profile and create a personal token. It starts with `ca_pat_` and is shown once. The Coach can revoke it there at any time.
2. Add the endpoint `https://coaching-animator.waynetellis.com/api/mcp` to the AI, sending the token as a bearer header.

Claude Code:

```
claude mcp add --transport http coaching-animator https://coaching-animator.waynetellis.com/api/mcp --header "Authorization: Bearer ca_pat_..."
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

### The four tools

- `create_practice` `{script, title?, tags?, source?}`: save a new Practice. Use it after you have written the script (steps 1 to 4). `source` is `{url, title}` (https only). Returns the id and the editor link.
- `get_practice` `{id}`: read one of the Coach's own Practices, by id or by a link such as `/p/<id>` or `/practice?id=<id>`. Use it before changing a Practice the Coach points you to.
- `update_practice` `{id, script?, title?, tags?, source?}`: change one of their Practices. Send the whole changed script, not a patch.
- `list_my_practices` `{limit?}`: the Coach's Practices, newest first. Use it to find one when the Coach does not give a link.

If a script is not valid, the tool returns the problems, each naming its field path. Fix every one and call again.

### Rules

- Everything you create is private. You cannot publish, share or delete; the Coach does that from the editor.
- You only see this Coach's own Practices.
- After saving, give the Coach the editor link from the result, and mention any Source and Tags you set.
