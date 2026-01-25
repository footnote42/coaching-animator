Below is a Share MVP that:

Solves WhatsApp sharing reliably

Minimises backend work

Preserves offline-first principles (Tier 1) while enabling Tier 2 networked features

Does not require re-thinking your editor or animation engine

**Constitutional Compliance**: This feature implements Constitution Principle V.2 (Optional Networked Features) under the Privacy-First Architecture (v2.0.0). All requirements in V.2, V.3, V.4, and V.5 apply.

**Constitutional Reference**: `.specify/memory/constitution.md` Section V (Privacy-First Architecture)

Share MVP — Definition
One-sentence definition

A Share MVP lets a coach generate a link that opens a read-only, auto-playing replay of a single animation in a mobile browser.

Nothing more. Nothing clever.

What the Share MVP MUST do
1. Generate a shareable link

One click / tap

Link can be pasted into WhatsApp

Link opens on any modern phone

2. Replay the animation accurately

Same timing

Same paths

Same player positions

Loops automatically

3. Work with zero accounts

No login

No coach profiles

No permissions UI

4. Fail gracefully

If offline → show “Connect to view shared drill”

If payload missing → friendly error

What the Share MVP MUST NOT do

This is important.

❌ No MP4 generation

❌ No GIF generation

❌ No editing on replay

❌ No playlists

❌ No comments

❌ No analytics

❌ No expiry UI (auto-expiry implemented server-side per Constitution V.3)

❌ No authentication

Every one of those is a Phase-2 feature.

**Governance Notes**:
- **Data Retention**: 90-day automatic expiration from last access (Constitution V.3)
- **Security Baseline**: Payload size validation, schema validation, CORS headers (Constitution V.4)
- **Privacy Model**: No telemetry, no user identity tracking, UUID obscurity (Constitution V.6)
- **Graceful Degradation**: Offline mode shows "Connect to internet to share" (Constitution V.2 Safeguard #3)

MVP Scope Breakdown
1. Data: “Share Payload” (Minimal Schema)

Only include what replay needs.

MVP rule:

If it doesn’t affect what moves on screen, it doesn’t ship.

Example (intentionally boring):

type SharePayloadV1 = {
  version: 1;
  canvas: {
    width: number;
    height: number;
  };
  entities: Array<{
    id: string;
    type: "player" | "ball";
    team: "attack" | "defence";
    x: number;
    y: number;
  }>;
  frames: Array<{
    t: number; // seconds from start
    updates: Array<{
      id: string;
      x: number;
      y: number;
    }>;
  }>;
};


You already have this implicitly.

2. Frontend: Share Button (MVP Behaviour)
UI

Button label: “Share link”

Location: near existing export controls

Behaviour

Serialize current animation → SharePayloadV1

POST payload to backend

Receive { id: "abc123" }

Copy URL to clipboard:

https://yourapp.dev/replay/abc123


Optional (nice UX, still MVP):

Toast: “Link copied – paste into WhatsApp”

3. Backend: Thin Storage API (MVP)
Required endpoints
POST /api/share
GET  /api/share/:id


That’s it.

POST /api/share

Accept JSON payload

Validate:

JSON size < e.g. 100KB

version === 1

Store payload

Generate opaque ID (UUID / nanoid)

Return ID

GET /api/share/:id

Fetch payload

Return JSON

404 if missing

No auth. No sessions.

4. Replay Page (Critical MVP Piece)
Route
/replay/:id

Behaviour

Fetch payload

Initialize animation engine in replay mode

Autoplay immediately

Loop forever

Disable all editing input

Controls

MVP controls:

▶️ / ⏸️ only (optional)

No scrub bar required.

5. Offline-First Contract (MVP-Safe)
Feature	Offline
Create animation	✅
Play animation locally	✅
Share animation	❌ (network needed)
View shared animation	❌ (network needed)

This is still legitimately “offline-first”.

You are not weakening the core experience.

MVP Engineering Checklist (Concrete)
Frontend

 Add serializeAnimation() function

 Add /replay/:id route

 Add replay mode flag

 Add Share button

 Clipboard copy

Backend

 POST endpoint

 GET endpoint

 Storage (KV / DB / file)

 ID generation

 Basic validation

UX

 Loading spinner on replay

 Friendly error state

 Mobile viewport meta

Time & Complexity Reality Check
Area	Effort
Frontend changes	1–2 days
Backend setup	0.5–1 day
End-to-end test	0.5 day

This is a weekend-sized MVP, not a refactor.

The Litmus Test (Very Important)

Your Share MVP is done when:

A coach can send a WhatsApp message containing only a link, and another coach can tap it and immediately see the drill play.

If that works, you’ve solved the problem.

Everything else is optional.