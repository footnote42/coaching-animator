# Illegal content risk assessment (Online Safety Act 2023)

**DRAFT. Pending review and dating by the maintainer. Not yet in force.**

Service: Coaching Animator, a user-to-user service for rugby coaches to draw, animate and optionally publish Practices.
Structured to follow Ofcom's illegal content risk assessment guidance for small, low-risk user-to-user services.

- Responsible person: the maintainer
- Date of assessment: ____________ (maintainer to complete)
- Next review date: ____________ (maintainer to complete)

## 1. What the service is

- Users are Coaches (signed-in, 18+ by declaration, see `docs/adr/0003-accounts-are-18-plus.md`) and Guests (no account, work stays on their device).
- Content is private by default. A Coach publishes a Practice to the Gallery by an explicit action; viewers can see it without an account.
- User-written free text: Practice titles, descriptions, Commentary, display names, club names.
- Not offered: direct messages, comments, live chat, image or video upload by users in Practices (club badge and avatar URLs aside), search of people, recommendations driven by user profiling, livestreaming, file sharing between users.
- Scale: small, a few clubs (Trojans RFC first, Hampshire RFU in view). No advertising, no analytics, no tracking.

## 2. Risk factors

| Factor | Finding | Effect |
|---|---|---|
| User numbers | Very small | Lowers risk |
| Who users are | Adult coaches, self-declared 18+ | Lowers risk to children |
| Contact between users | None: no messaging, comments or following | Lowers risk strongly |
| Anonymity | Accounts need an email address; display name optional | Neutral |
| Content type | Diagrams and short text about rugby practices | Lowers risk |
| Free text | Titles, descriptions, Commentary are published to anyone | Main residual risk |
| Reach | Public Gallery readable by anyone | Raises risk for published content only |
| Children in content | Practices can be about youth teams; players could be named in free text | Safeguarding risk, see section 4 |
| Remix (planned) | Others adapt published Practices | Copies free text; revisit when shipped |

## 3. The 17 priority illegal harm categories

Overall level for the service: **low**. Reasoning common to most rows: no way for users to contact each other, no uploads of images or video, small adult user base, content is rugby diagrams plus short text.

| # | Category | Level | Reason |
|---|---|---|---|
| 1 | Terrorism | Negligible | No contact between users; text only reaches viewers of a published Practice; small adult user base. |
| 2 | Child sexual exploitation and abuse (CSEA), including grooming | Low | No messaging or comments, so no route to groom; accounts 18+; no image upload. Residual risk is identifying details of children in free text, handled under safeguarding below. |
| 3 | CSAM | Negligible | Users cannot upload images or video into Practices. Avatar and badge are URLs only. |
| 4 | Hate | Low | Offensive text could be written in a title or Commentary. Reports and admin hide/delete cover it. |
| 5 | Harassment, stalking, threats, abuse | Low | No messaging or comments. Abusive text about a named person could be published; reportable and removable. |
| 6 | Controlling or coercive behaviour | Negligible | No direct contact between users. |
| 7 | Intimate image abuse | Negligible | No image upload. |
| 8 | Extreme pornography | Negligible | No image or video upload; content is diagrams and text. |
| 9 | Sexual exploitation of adults | Negligible | No contact between users; no payments. |
| 10 | Human trafficking | Negligible | No relevant functionality. |
| 11 | Unlawful immigration | Negligible | No relevant functionality. |
| 12 | Fraud and financial offences | Low | Free text could carry a scam link or message. No payments, no direct contact. Spam reason and removal cover it. |
| 13 | Proceeds of crime | Negligible | No payments or transfers. |
| 14 | Drugs and psychoactive substances | Negligible | Free text only; no marketplace. |
| 15 | Firearms, knives and other weapons | Negligible | Free text only; no marketplace. |
| 16 | Encouraging or assisting suicide or serious self-harm | Low | Free text could in theory contain it; no contact between users. Reportable and removable. |
| 17 | Foreign interference, animal cruelty and other listed offences | Negligible | No relevant functionality. |

## 4. Focus risks

**Safeguarding: players identified in public content.** The most realistic harm. A Coach could publish a Practice that names or identifies young players (names, ages, schools, locations) in a title, description or Commentary. Likelihood low to medium over time; severity high for the child. Controls: terms forbid player names and identifying details, publish reminder not to name players, Report button with a safeguarding reason, admin hide/delete.

**Abuse through free text.** Titles, descriptions and Commentary are the only places users can write words others will read. Likelihood low, severity low to medium. Controls: reports, admin hide/delete/ban, blocklist on moderated fields where configured, rate limits on writes, accounts needed to publish.

**Spam.** Published text used for links or promotion. Likelihood low to medium, severity low. Controls: account needed to publish, rate limits on creating and reporting, spam report reason, admin hide/delete/ban, terms prohibit advertising.

## 5. Controls in place

- Accounts are 18+ by self-declaration, recorded on the profile (`age_confirmed_at`); existing accounts are asked once at next sign-in.
- Content private by default; publishing is an explicit action.
- Publish reminder not to name players.
- Report button on published Practices with reasons: inappropriate, spam, copyright, safeguarding, other.
- Admin console (`/admin`): review reports, hide or delete content, warn or ban users.
- Rate limits on writes and reporting.
- Terms of Service: no player names or identifying details, prohibited content, reporting and complaints sections.
- No messaging, comments, uploads or user search.

## 6. Reporting and complaints

- Reporting: Report button on each published Practice (reason list above); safeguarding reports are the priority.
- Complaints about a decision or about how a report was handled: contact form at `/contact`, as described in the Terms. Target: reply within 14 days (matches the Terms; maintainer to confirm).
- Safeguarding concerns that suggest a child is at risk are passed to the relevant authority or club welfare officer by the maintainer.

## 7. Responsibility and review

- Named responsible person: the maintainer.
- Review at least once a year and whenever a trigger below occurs. Record each review date here.

| Review date | Reviewer | Outcome |
|---|---|---|
| ____________ | the maintainer | |

**Revisit triggers (re-run this assessment before the change ships):**

- Comments (or any user-to-user contact) are designed. This also needs the Children's Code assessment named in ADR 0003.
- Accounts are opened to under-18s.
- User numbers grow, for example roll-out across Hampshire RFU clubs.
- Remix ships, or any image, video or file upload is added.
- A serious incident, or a pattern of reports, shows the levels above are wrong.
