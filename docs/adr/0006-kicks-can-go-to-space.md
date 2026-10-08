# Kicks can go to space and be collected

A Kick had to land on a receiver, so a kick into space for either team to chase could not be drawn. A Kick may now target a cell: the ball lands, rolls a short fixed distance in the kick's direction and lies loose. The Coach names who collects it; that player's Run goes to the ball and the next Pass or Kick of that ball is theirs, firing when they reach it (or when it lands, if they are there first), with receiver timing from ADR 0005 applying. We chose an explicit collector over nearest-player-wins so the script says what happens rather than the engine guessing, and a fixed roll over bounce physics because the picture, not the physics, is the point.

## Consequences

- A loose ball is a new state between a landing and a collect; the engine's ball-holder rules and the forward-pass and early-catch warnings must handle it.
- Either team can collect; when the other team does, it attacks the opposite way, as with a Kick to a player.
