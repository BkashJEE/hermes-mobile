# Hermes Mobile screen plan

Design status: concept mockups only. The user selected combined agent chat and task progress, then requested role icons and the loading, main and supporting pages. This plan does not establish backend capabilities.

## Core flow

Returning user: connect to saved host → restore authenticated session → load profiles → main agent workspace.

First visit: Connect your host → supported sign-in or pairing → connection state → main workspace. Never place a new user on an indefinite loading screen with no configured host.

From the main workspace:

- Select an agent → that agent's conversation and preserved draft.
- View task → task details → Open agent chat returns to the exact linked session.
- Needs you → pending request → review scope → allow or deny → show confirmed response or reconciliation state.
- Tap an output → artifact preview.
- Settings gear → host and app preferences.

## Four initial mockups

| Screen | Purpose | Main interaction |
| --- | --- | --- |
| Loading and connection | Explain what the app is doing while reconnecting to a saved host | Choose another server if necessary |
| Main workspace | Talk to a selected agent while keeping task context nearby | Send a message; switch profiles |
| Task details | Inspect milestones, accountability and available outputs | Open the linked agent conversation |
| Approval detail | Understand the exact pending operation before deciding | Allow this operation or deny it |

Loading steps reflect actual connection/authentication/profile-discovery events; do not advance on a timer or invent percentages. Timeout shows Retry and Choose another server. Credentials stay in native secure storage.

The refined main workspace shows a compact summary only for an explicitly linked task; the full timeline lives in task details. Ordinary chat uses that space for conversation. Profile switching preserves work and never implies a run was stopped. For more than a few profiles, provide an accessible full agent picker instead of shrinking icons indefinitely. See DESIGN_SYSTEM.md for the updated sizing, placement and color proposal.

Task details show only host-reported milestones and outputs. Avoid inventing a plan from generic activity. A task with no structured milestones shows its latest reported activity and outputs instead. Generated, tested, ready for review and complete are separate states.

The approval mockup illustrates a file edit with a proposed diff. Only show a diff if the backend supplies it; otherwise show the exact requested operation and its available scope. An 'Allow this edit' action is appropriate only if the host supports that one-operation scope. Never imply narrower authorization than the backend actually enforces. Match profile, session and request identity, disable expired requests, and reconcile uncertain responses before enabling another submission.

## Other pages to design next

1. **Connect your host:** choose an existing self-hosted server or another supported connection method; explain that Hermes runs on the host. Show only methods verified for the implementation.
2. **Agents and conversations:** find configured agents and resume older sessions; show an empty-state guide when no agents exist.
3. **Needs you inbox:** approvals, clarifications and results ready for review, with explicit agent and session identity. Unified cross-profile delivery remains an integration task.
4. **Artifact preview:** read documents, inspect images, copy or share a selected result using explicit actions.
5. **Settings:** host switching, appearance, notifications, voice permissions and sign-out. Availability reflects device and host capabilities.

Offline, reconnecting, expired sign-in, empty conversations, failed tasks and no configured agents are required states of these screens, not decorative error pages to add at the end.

## Prototype scope

Build the selected main workspace with working profile switching, View task navigation, an illustrative approval flow and a dismissible connection state. Keep prototype fixtures visibly separate from a live backend. Validate actual transport integration in a subsequent engineering slice.
