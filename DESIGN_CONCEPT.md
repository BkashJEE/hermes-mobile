# Hermes Mobile: your agents, within reach

## Recommendation

Build a mobile workspace for people who already run Hermes and want to talk to a specialist, see what is still running, and respond when their work needs attention. Start with an agent switcher and a focused conversation. Add an attention inbox and explicit task tracking as the supporting workflows.

Mercury is the strongest implementation candidate. Agent Dock provides useful interaction rules and operational behavior to adapt. These are design and source-review findings, not a verified integration or build result.

## Sources reviewed

Read-only repository snapshots:

- [Mercury at a31d71b](https://github.com/unsupportedpastels/mercury/tree/a31d71b77797168afb85aac98178c910cad7ea19): README, Android theme, interaction cards, profile catalog policy, operational overview, gateway methods, and the real chat screenshot.
- [Agent Dock at 41e4434](https://github.com/BkashJEE/hermes-agent-dock/tree/41e443418ad539ae1f34b28ac4550b69f398805f): README, product specification, architecture and limitation notes, frontend routing/control calls, backend capability response, and the sanitized floating-window screenshot.

The Dock architecture document contains a historical baseline, and its roadmap mixes targets with completed work. Current code and the README take precedence when those descriptions differ.

## What to bring across

| Source | Evidence | Design implication |
| --- | --- | --- |
| Mercury | Native Android Compose and iOS SwiftUI over a shared Kotlin core; direct streaming and authenticated host connections | Evaluate reusing the mobile foundation rather than rebuilding transport and session behavior |
| Mercury | Profile discovery, `session.steer`, `approval.respond`, and `session.interrupt` appear in gateway code | Reuse supported operations only after checking the selected host and transport capabilities |
| Mercury | Native attachment, voice, artifact and reconnect flows; teal tokens and restrained chat UI | Keep a familiar conversation surface with progressive disclosure |
| Agent Dock | Separate drafts, sessions and active jobs per configured profile | Make agent switching a first-class mobile interaction; switching must not cancel work |
| Agent Dock | Explicit Assign task; ordinary chat stays conversational | Offer a clear opt-in task action rather than turning every message into a task |
| Agent Dock | Queued/accepted/delivered/applied receipt distinctions; exact live-run binding | Use truthful activity labels and never claim a nudge was applied just because it was accepted |
| Agent Dock | Final responses in launcher mode; no verified Pause/Resume; child direct chat unavailable | Do not depict streaming, pause, or child messaging where the chosen backend cannot provide them |

Both repositories identify an MIT license. Any code reuse still needs the original notices and applicable third-party attribution.

## Product structure

**Agents:** existing configured profiles, their reported state, and the last relevant session. Opening an agent resumes its own conversation. Model choices live in conversation settings, not as a wall of controls on the home screen.

**Inbox:** actionable approval requests, clarification questions and results ready to review. An item opens its original session with the precise request and consequences. No approve-all button. A unified cross-profile inbox is proposed work; its event delivery and ownership still require validation.

**Work:** explicitly assigned tasks, shown as a vertical list on phones. Task detail shows the accountable agent, current state, latest activity and output. Agent finished, awaiting review, and task completed are separate states. A desktop Kanban board should not be squeezed into tiny horizontal columns.

Settings and host selection stay in the header or profile menu. Each screen has one main action.

## First journey

1. Connect to a Hermes host using a supported authentication or pairing flow.
2. Show actual profiles supplied by that host, with an understandable empty state when none are available.
3. Select an agent, send a message, and display the response using the supported transport.
4. Switch agents while a run continues. Keep each agent's draft, transcript and activity separate.
5. Open a pending request or finished result from Inbox and return to the exact session.

For an existing desktop run, explicitly establish whether the phone can observe or control it. Never infer control from a matching profile name. After disconnecting, retain the last observed state with an offline/stale label and reconcile before showing current status. Preserve unsent drafts and avoid automatic duplicate sends.

## Three visual explorations

- **Pocket Dock:** conversation first, dark neutral surfaces, teal accents, thumb-friendly composer and visible profile switching. Recommended starting point because it combines both repositories' strengths with the smallest additional coordination layer.
- **Attention Inbox:** a light, calm home centered on the single decision that needs the user. Strongest for checking work briefly while away from a desk.
- **Mission Trail:** a dark task-detail surface with a vertical progress timeline and direct access to the accountable agent. Strongest once task assignment and cross-agent state are proven.

All mockups use illustrative profiles and activity. They are proposals, not screenshots of a working integration.

## Visual system

The first concepts drew from Mercury's dark/teal palette. The user's subsequent request for more professional placement, fonts and colors is specified in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): compact headers, 16 px body text, 22 px screen titles, minimum 48 px touch targets and measured dark/teal color tokens. That document supersedes the initial visual sizing and palette proposal. Preserve reduced-motion support and text labels for status.

## Implementation boundary and first slice

Mercury's normal client transport and Dock's Desktop plugin/control ledger are not interchangeable. Dock relies on plugin-scoped REST plus the Desktop host gateway for live control. Mercury already supports several corresponding official RPCs, but that does not establish access to Dock jobs, its Kanban mapping, or its application receipts.

First verify connect → discover profiles → open conversation → send/stream → switch profile → return after reconnect on one Android device. Then test approvals with the exact live session identity. Only add Dock-specific job/task integration after documenting the authenticated API and lifecycle contract.

Defer a mandatory plugin bridge, automatic task assignment, cross-channel transcript merging, direct child-agent chat and pause/resume. Voice and notifications should follow verified platform capabilities; do not promise reliable iOS background delivery from a static mockup.

## Selected direction: combine Pocket Dock and Mission Trail

On September 20, 2026, the user selected the first and third displayed concepts. Combine their interaction models into one dark, teal-accented mobile workspace:

- Keep the configured-agent switcher above the active conversation.
- Use distinct role icons instead of letter avatars, per the user's refinement: radar for Researcher, forge hammer for Builder, and shield-check for Reviewer. Keep one consistent geometric icon family, readable labels, graphite inactive circles and a teal selected circle. Icons are presentation only; actual profile IDs remain the routing authority.
- For a conversation linked to an explicitly assigned task, show a compact task summary above its messages. The professional-layout refinement moves the full timeline to task details; ordinary conversations do not need task chrome.
- Open full task details through View task rather than squeezing an entire task dashboard into chat.
- Keep the composer attached to the selected agent and session. Switching agents preserves independent drafts and ongoing work.
- Show artifacts inline and distinguish an agent finishing work from a human reviewing it.

Next design step: review the merged mockup, then prototype connection, agent switching, one conversation and task detail before importing application code.
