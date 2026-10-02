# Agents may author animations

RAM's Handrail Principle says the system never authors the Session Plan, because writing it is how the coach memorises it. The animator is deliberately exempt: an animation explains an activity to players and co-coaches, it is not the coach's memorisation artefact. Hand-drawing animations is slow and gives uneven results (irregular pace, off-grid positions), which an agent avoids, so agents are allowed to produce finished animations from a natural-language description.

## Consequences

Agent access must be model-agnostic. It starts on the coach's own Claude plan, with an MCP server and bring-your-own-key access added later, so nothing in the format or API may assume one vendor.
