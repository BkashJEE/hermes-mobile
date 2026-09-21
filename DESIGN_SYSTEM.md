# Hermes Mobile — refined design system

Status: proposed refinement following the user's request for more professional layout, placement, font sizes and color. These are implementation targets; generated images are visual studies and do not guarantee exact pixel measurements.

## What changes

The previous mockups use too much vertical space for the product name, avatar row and task timeline. The new hierarchy prioritizes the user's current conversation or decision. Use a compact header, small role icons, an optional single-row task summary and a stable composer. Put full task progression in Task details or Activity.

Keep the dark teal identity and role icons. Remove decorative glow and gradients. Use one primary accent; typography and spacing carry most of the hierarchy.

## Layout

- Reference viewport: 390 × 844 logical units. Account for actual device safe areas separately; never scale a screenshot to implement UI.
- Outer content padding: 20. Spacing scale: 4, 8, 12, 16, 24, 32.
- Toolbar: 56–64 high, with one title and at most two actions.
- Compact profile strip: 64–72 high; icon artwork 20–24 inside a 32 circle, within a minimum 48 touch area. Text labels remain visible. Use an accessible full picker for longer names or many agents.
- Task summary: 56–64 high with a title, one status line and a details action. No full timeline above every conversation.
- Conversation: flexible scrolling region. Maximum message width around 88%; assistant prose may sit directly on the base surface.
- Composer: minimum 56 high, multiline growth up to 120 before internal scrolling. Anchor above the keyboard/safe area; never cover the final message or pending decision.
- Controls: minimum 48 × 48 interactive area, independently of the visible icon size.
- Corners: 8 for small controls, 12 for inputs/attachments, 16 for message bubbles. Avoid making every object a pill.
- Show a thin rule between meaningful regions, not around every paragraph. Use no nested cards.

## Typography

Use Inter in the prototype and platform-native fonts where appropriate in the native apps. Use regular 400 and semibold 600; limit additional weights.

| Role | Size / line height | Weight |
| --- | --- | --- |
| Screen title | 22 / 28 | 600 |
| Main approval question | 24 / 32 | 600 |
| Section title | 17 / 24 | 600 |
| Chat message and body | 16 / 24 | 400 |
| Buttons | 16 / 20 | 600 |
| Navigation, field and status labels | 14 / 20 | 400 or 600 |
| Supplementary metadata only | 12 / 16 | 400 |
| Code or diff preview | 13 / 20 monospace | 400 |

Use logical scalable text units in native code. Essential instructions and approval scope never use the metadata size. Support system text scaling and wrapping rather than clipping or shrinking labels. Check at 200% text size before making accessibility claims.

## Color tokens

| Token | Hex | Purpose |
| --- | --- | --- |
| Background | `#0C1014` | Main canvas |
| Surface | `#151B22` | Subtle grouped content |
| Raised surface | `#1C252E` | Composer and attachments |
| Divider | `#293440` | Decorative separators |
| Text | `#F2F5F7` | Primary text |
| Secondary text | `#A5B0BD` | Supporting information |
| Accent | `#69D7D2` | Selected state, links, primary action |
| Accent ink | `#092B2D` | Text/icon on a filled teal button |
| Attention | `#F3BD67` | A request needing a decision |
| Success | `#8BCBA0` | Confirmed successful state |
| Error | `#FF9C9C` | Confirmed failure with explanation |

Calculated sRGB contrast for opaque token pairs: primary text on background 17.44:1; primary text on surface 15.83:1; secondary text on surface 7.88:1; secondary text on raised surface 7.05:1; accent on background 11.14:1; accent ink on accent 8.78:1; attention on surface 10.14:1. These calculations do not certify the mockups or a future app. Validate rendered components, states, focus, semantics and dynamic text separately.

Do not rely on the decorative divider color alone to identify an interactive boundary. Use labels, adequate component contrast and visible focus states. Pair all status colors with text or a distinct icon. Avoid putting the whole transcript in accent colors.

## Placement by screen

**Loading:** use a 48–64 emblem, a 20–22 title, a short 14–16 status line and a small event-driven indicator. Do not make a transient loading screen look like a marketing landing page. Keep recovery actions available on failure; avoid artificial delays.

**Main chat:** compact host/header, compact agent picker, optional task summary, then conversation. Keep approval prompts beside the relevant activity or in one compact pending-request row. Full timeline is one tap away.

**Task details:** 22 title, one owner/status row, then timeline and outputs. Keep the main action near the bottom without consuming a large fraction of the viewport. Distinguish work finished from reviewed and complete.

**Approvals:** 24 question, agent/task identity, scope, proposed operation, then decision controls. Keep operation details readable and scrollable; do not hide consequential information behind the fixed action area. Use neutral denial styling and explicit single-operation wording only when supported by the host.

## Three layout studies

- Focused conversation: visible compact agent tabs and a single task summary row. Closest to the previously selected combined direction; recommended default.
- Task-centric conversation: a selected-agent dropdown and Chat / Activity / Files tabs. Better when one task has a long-running thread.
- Workspace overview: agent list, a pending request and recent work on a separate home screen. Better for triage, with an extra tap before chatting.

Select one structural direction before implementing navigation. These are alternatives, not three pages to combine indiscriminately.
